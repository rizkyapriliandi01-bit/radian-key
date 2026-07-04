const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const db = require('./database');

const app = express();

app.use(cors());
app.use(express.json());

// Import route modules
const adminRoutes = require('./routes/admin');
const reportsRoutes = require('./routes/reports');
const settingsRoutes = require('./routes/settings');

app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/settings', settingsRoutes);

// Generate next ID Card number
function nextIdCard(cb) {
  db.get(`SELECT id_card FROM customers WHERE id_card LIKE 'RSN-%' ORDER BY id DESC LIMIT 1`, (err, row) => {
    if (err) return cb(err);
    let num = 1;
    if (row && row.id_card) {
      const parts = row.id_card.split('-');
      num = parseInt(parts[1]) + 1;
    }
    cb(null, `RSN-${String(num).padStart(4, '0')}`);
  });
}

// 1. Register new customer
app.post('/api/customers/register', (req, res) => {
  const { name, phone, id_card } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Nama dan nomor HP wajib diisi' });
  }

  // Check phone uniqueness
  db.get('SELECT * FROM customers WHERE phone = ?', [phone], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (row) return res.status(409).json({ error: 'Nomor HP sudah terdaftar' });

    // If manual id_card provided, check uniqueness
    if (id_card) {
      db.get('SELECT * FROM customers WHERE id_card = ?', [id_card], (err, dup) => {
        if (dup) return res.status(409).json({ error: 'ID Card sudah terdaftar' });
        doRegister(name, phone, id_card, res);
      });
    } else {
      // Auto-generate ID Card
      nextIdCard((err, card) => {
        if (err) return res.status(500).json({ error: 'Gagal generate ID' });
        doRegister(name, phone, card, res);
      });
    }
  });
});

function doRegister(name, phone, idCard, res) {
  QRCode.toDataURL(idCard, { width: 300, margin: 2 })
    .then(qrImage => {
      db.run(
        'INSERT INTO customers (name, phone, id_card, qr_code, stamps, voucher_active) VALUES (?, ?, ?, ?, 0, 0)',
        [name, phone, idCard, idCard],
        function(err) {
          if (err) return res.status(500).json({ error: 'Gagal membuat akun' });

          db.run('INSERT INTO transactions (customer_id, type, stamps_before, stamps_after, notes) VALUES (?, ?, ?, ?, ?)',
            [this.lastID, 'REGISTER', 0, 0, 'Pendaftaran baru']);

          res.json({
            success: true,
            customer: {
              id: this.lastID,
              name,
              phone,
              id_card: idCard,
              qr_image: qrImage,
              stamps: 0,
              voucher_active: false
            }
          });
        }
      );
    })
    .catch(() => res.status(500).json({ error: 'Gagal generate QR' }));
}

// 2. Batch generate blank ID cards
app.post('/api/customers/batch-generate', (req, res) => {
  const count = Math.min(parseInt(req.body.count) || 10, 200);
  const cards = [];

  // Get the last number first
  db.get(`SELECT id_card FROM customers WHERE id_card LIKE 'RSN-%' ORDER BY id DESC LIMIT 1`, (err, row) => {
    let num = 1;
    if (row && row.id_card) {
      const parts = row.id_card.split('-');
      num = parseInt(parts[1]) + 1;
    }

    let done = 0;
    for (let i = 0; i < count; i++) {
      const card = `RSN-${String(num + i).padStart(4, '0')}`;
      cards.push(card);
      db.run(
        'INSERT INTO customers (id_card, name, phone, qr_code, stamps, voucher_active, status) VALUES (?, ?, ?, ?, 0, 0, ?)',
        [card, '', uuidv4(), card, 'printed'],
        (err) => {
          done++;
          if (err) console.error('Batch insert error:', err.message);
          if (done === count) {
            // Generate QR images for all
            Promise.all(
              cards.map(c => QRCode.toDataURL(c, { width: 400, margin: 2 }))
            ).then(qrImages => {
              res.json({
                success: true,
                count: cards.length,
                codes: cards.map((card, i) => ({
                  qr_code: card,
                  qr_image: qrImages[i]
                })),
                note: 'QR siap cetak. Scan untuk aktivasi.'
              });
            }).catch(() => res.status(500).json({ error: 'Gagal generate QR' }));
          }
        }
      );
    }
  });
});

// 3. Claim blank ID card
app.post('/api/customers/claim', (req, res) => {
  const { id_card, name, phone } = req.body;

  if (!id_card || !name || !phone) {
    return res.status(400).json({ error: 'ID Card, nama, dan nomor HP wajib diisi' });
  }

  db.get('SELECT * FROM customers WHERE id_card = ?', [id_card], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!row) return res.status(404).json({ error: 'ID Card tidak valid' });

    if (row.status === 'active' && row.name) {
      return res.status(409).json({ error: 'ID Card sudah terdaftar' });
    }

    db.get('SELECT * FROM customers WHERE phone = ? AND id != ? AND status = ?', [phone, row.id, 'active'], (err, dup) => {
      if (dup) return res.status(409).json({ error: 'Nomor HP sudah terdaftar' });

      db.run(
        'UPDATE customers SET name = ?, phone = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name, phone, 'active', row.id],
        function(err) {
          if (err) return res.status(500).json({ error: 'Gagal aktivasi' });

          db.run('INSERT INTO transactions (customer_id, type, stamps_before, stamps_after, notes) VALUES (?, ?, ?, ?, ?)',
            [row.id, 'REGISTER', 0, 0, 'Aktivasi dari kartu cetak']);

          QRCode.toDataURL(id_card, { width: 300, margin: 2 }).then(qrImage => {
            res.json({
              success: true,
              customer: {
                id: row.id, name, phone, id_card,
                qr_image: qrImage,
                stamps: 0, voucher_active: false
              }
            });
          }).catch(() => {
            res.json({
              success: true,
              customer: { id: row.id, name, phone, id_card, stamps: 0, voucher_active: false }
            });
          });
        }
      );
    });
  });
});

// 4. Get customer by ID Card (scan)
app.get('/api/customers/id/:idCard', (req, res) => {
  const { idCard } = req.params;

  db.get('SELECT id, name, phone, id_card, stamps, voucher_active, status, created_at FROM customers WHERE id_card = ?', [idCard], async (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!row) return res.status(404).json({ error: 'ID Card tidak ditemukan' });

    const qrImage = await QRCode.toDataURL(row.id_card, { width: 300, margin: 2 });

    res.json({
      id: row.id,
      name: row.name,
      phone: row.phone,
      id_card: row.id_card,
      qr_image: qrImage,
      stamps: row.stamps,
      voucher_active: row.voucher_active === 1,
      status: row.status,
      created_at: row.created_at
    });
  });
});

// 4a. Get QR image directly (for printing)
app.get('/api/customers/id/:idCard/image', async (req, res) => {
  const { idCard } = req.params;
  try {
    const qrBuffer = await QRCode.toBuffer(idCard, { width: 400, margin: 2 });
    res.type('image/png');
    res.send(qrBuffer);
  } catch (err) {
    res.status(500).json({ error: 'Gagal generate QR' });
  }
});

// 3. Add stamp
app.post('/api/customers/:id/add-stamp', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM customers WHERE id = ?', [id], (err, customer) => {
    if (err || !customer) return res.status(404).json({ error: 'Customer tidak ditemukan' });

    const oldStamps = customer.stamps;
    let newStamps = oldStamps + 1;
    let voucherActivated = newStamps >= 8;

    db.run(
      'UPDATE customers SET stamps = ?, voucher_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newStamps, voucherActivated ? 1 : customer.voucher_active, id],
      function(err) {
        if (err) return res.status(500).json({ error: 'Gagal menambah stamp' });

        db.run('INSERT INTO transactions (customer_id, type, stamps_before, stamps_after, notes) VALUES (?, ?, ?, ?, ?)',
          [id, 'ADD_STAMP', oldStamps, newStamps, voucherActivated ? 'Voucher aktif!' : 'Tambah stamp']);

        res.json({
          success: true,
          stamps: newStamps,
          voucher_active: voucherActivated || customer.voucher_active === 1,
          voucher_activated: voucherActivated
        });
      }
    );
  });
});

// 4. Use voucher
app.post('/api/customers/:id/use-voucher', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM customers WHERE id = ?', [id], (err, customer) => {
    if (err || !customer) return res.status(404).json({ error: 'Customer tidak ditemukan' });
    if (customer.voucher_active !== 1) return res.status(400).json({ error: 'Tidak ada voucher aktif' });

    const oldStamps = customer.stamps;
    db.run(
      'UPDATE customers SET stamps = 0, voucher_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id],
      function(err) {
        if (err) return res.status(500).json({ error: 'Gagal menggunakan voucher' });

        db.run('INSERT INTO transactions (customer_id, type, stamps_before, stamps_after, voucher_used, notes) VALUES (?, ?, ?, ?, ?, ?)',
          [id, 'USE_VOUCHER', oldStamps, 0, 1, 'Voucher Rp15,000 digunakan']);

        res.json({ success: true, message: 'Voucher berhasil digunakan', stamps: 0, voucher_active: false });
      }
    );
  });
});

// 5. Get customer history
app.get('/api/customers/:id/history', (req, res) => {
  const { id } = req.params;
  db.all('SELECT * FROM transactions WHERE customer_id = ? ORDER BY created_at DESC LIMIT 20', [id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(rows);
    }
  );
});

// 6. Get customer by phone
app.get('/api/customers/phone/:phone', (req, res) => {
  const { phone } = req.params;
  db.get('SELECT id, name, phone, id_card, stamps, voucher_active, status, created_at FROM customers WHERE phone = ?', [phone], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!row) return res.status(404).json({ error: 'Customer tidak ditemukan' });

    res.json({
      id: row.id, name: row.name, phone: row.phone,
      id_card: row.id_card,
      stamps: row.stamps,
      voucher_active: row.voucher_active === 1,
      created_at: row.created_at
    });
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Radian Key API Running' });
});

module.exports = app;
