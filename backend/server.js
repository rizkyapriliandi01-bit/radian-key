const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Import route modules
const adminRoutes = require('./routes/admin');
const reportsRoutes = require('./routes/reports');
const settingsRoutes = require('./routes/settings');

// Mount routes
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/settings', settingsRoutes);

// API Routes

// 1. Register new customer
app.post('/api/customers/register', async (req, res) => {
  const { name, phone } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Nama dan nomor HP wajib diisi' });
  }

  // Check if phone already exists
  db.get('SELECT * FROM customers WHERE phone = ?', [phone], async (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (row) {
      return res.status(409).json({ error: 'Nomor HP sudah terdaftar' });
    }

    // Generate unique QR code
    const qrCode = `RADIAN-${uuidv4()}`;

    // Generate QR image as data URL
    try {
      const qrImage = await QRCode.toDataURL(qrCode, {
        width: 300,
        margin: 2
      });

      // Insert new customer
      db.run(
        'INSERT INTO customers (name, phone, qr_code, stamps, voucher_active) VALUES (?, ?, ?, 0, 0)',
        [name, phone, qrCode],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Gagal membuat akun' });
          }

          // Log transaction
          db.run(
            'INSERT INTO transactions (customer_id, type, stamps_before, stamps_after, notes) VALUES (?, ?, ?, ?, ?)',
            [this.lastID, 'REGISTER', 0, 0, 'Pendaftaran baru']
          );

          res.json({
            success: true,
            customer: {
              id: this.lastID,
              name,
              phone,
              qr_code: qrCode,
              qr_image: qrImage,
              stamps: 0,
              voucher_active: false
            }
          });
        }
      );
    } catch (error) {
      res.status(500).json({ error: 'Gagal generate QR code' });
    }
  });
});

// 2. Get customer by QR code
app.get('/api/customers/qr/:qrCode', (req, res) => {
  const { qrCode } = req.params;

  db.get('SELECT * FROM customers WHERE qr_code = ?', [qrCode], async (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'QR code tidak ditemukan' });
    }

    // Generate QR image
    const qrImage = await QRCode.toDataURL(row.qr_code, { width: 300, margin: 2 });

    res.json({
      id: row.id,
      name: row.name,
      phone: row.phone,
      qr_code: row.qr_code,
      qr_image: qrImage,
      stamps: row.stamps,
      voucher_active: row.voucher_active === 1,
      created_at: row.created_at
    });
  });
});

// 3. Add stamp
app.post('/api/customers/:id/add-stamp', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM customers WHERE id = ?', [id], (err, customer) => {
    if (err || !customer) {
      return res.status(404).json({ error: 'Customer tidak ditemukan' });
    }

    const oldStamps = customer.stamps;
    let newStamps = oldStamps + 1;
    let voucherActivated = false;

    // Check if reached 8 stamps
    if (newStamps >= 8) {
      voucherActivated = true;
    }

    db.run(
      'UPDATE customers SET stamps = ?, voucher_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newStamps, voucherActivated ? 1 : customer.voucher_active, id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Gagal menambah stamp' });
        }

        // Log transaction
        db.run(
          'INSERT INTO transactions (customer_id, type, stamps_before, stamps_after, notes) VALUES (?, ?, ?, ?, ?)',
          [id, 'ADD_STAMP', oldStamps, newStamps, voucherActivated ? 'Voucher aktif!' : 'Tambah stamp']
        );

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
    if (err || !customer) {
      return res.status(404).json({ error: 'Customer tidak ditemukan' });
    }

    if (customer.voucher_active !== 1) {
      return res.status(400).json({ error: 'Tidak ada voucher aktif' });
    }

    const oldStamps = customer.stamps;

    db.run(
      'UPDATE customers SET stamps = 0, voucher_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Gagal menggunakan voucher' });
        }

        // Log transaction
        db.run(
          'INSERT INTO transactions (customer_id, type, stamps_before, stamps_after, voucher_used, notes) VALUES (?, ?, ?, ?, ?, ?)',
          [id, 'USE_VOUCHER', oldStamps, 0, 1, 'Voucher Rp15,000 digunakan']
        );

        res.json({
          success: true,
          message: 'Voucher Rp15,000 berhasil digunakan',
          stamps: 0,
          voucher_active: false
        });
      }
    );
  });
});

// 5. Get customer history
app.get('/api/customers/:id/history', (req, res) => {
  const { id } = req.params;

  db.all(
    'SELECT * FROM transactions WHERE customer_id = ? ORDER BY created_at DESC LIMIT 20',
    [id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(rows);
    }
  );
});

// 12. Get customer by phone (for CustomerPage)
app.get('/api/customers/phone/:phone', (req, res) => {
  const { phone } = req.params;

  db.get('SELECT * FROM customers WHERE phone = ?', [phone], async (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Customer tidak ditemukan' });
    }

    res.json({
      id: row.id,
      name: row.name,
      phone: row.phone,
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

// Load SSL certificates
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, '..', '192.168.1.13+3-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '..', '192.168.1.13+3.pem'))
};

// Create HTTPS server
const server = https.createServer(sslOptions, app);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on https://0.0.0.0:${PORT}`);
  console.log(`   Local:   https://localhost:${PORT}`);
  console.log(`   Network: https://192.168.1.13:${PORT}`);
});
