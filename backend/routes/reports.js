const express = require('express');
const router = express.Router();
const db = require('../database');

// Daily report
router.get('/daily', (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];

  // Get all transactions for this date
  db.all('SELECT * FROM transactions WHERE DATE(created_at) = ?', [date], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    const report = {
      date,
      transactions: rows,
      total_transactions: rows.length,
      stamps_added: rows.filter(r => r.type === 'ADD_STAMP').length,
      vouchers_used: rows.filter(r => r.type === 'USE_VOUCHER').length,
      new_registrations: rows.filter(r => r.type === 'REGISTER').length
    };
    report.vouchers_revenue = report.vouchers_used * 15000;

    res.json(report);
  });
});

// Weekly report
router.get('/weekly', (req, res) => {
  const startDate = req.query.start || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const endDate = req.query.end || new Date().toISOString().split('T')[0];

  const report = {};

  // Stamps added
  db.get(
    `SELECT COUNT(*) as count, SUM(stamps_after - stamps_before) as total 
     FROM transactions 
     WHERE type = 'ADD_STAMP' AND DATE(created_at) BETWEEN ? AND ?`,
    [startDate, endDate],
    (err, row) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      report.stampsAdded = { count: row.count, total: row.total || 0 };

      // Vouchers used
      db.get(
        `SELECT COUNT(*) as count FROM transactions 
         WHERE type = 'USE_VOUCHER' AND DATE(created_at) BETWEEN ? AND ?`,
        [startDate, endDate],
        (err, row) => {
          if (err) return res.status(500).json({ error: 'Database error' });
          report.vouchersUsed = row.count;

          // New registrations
          db.get(
            `SELECT COUNT(*) as count FROM customers 
             WHERE DATE(created_at) BETWEEN ? AND ?`,
            [startDate, endDate],
            (err, row) => {
              if (err) return res.status(500).json({ error: 'Database error' });
              report.newCustomers = row.count;

              // Daily breakdown
              db.all(
                `SELECT DATE(created_at) as date, 
                  COUNT(*) as transactions 
                 FROM transactions 
                 WHERE DATE(created_at) BETWEEN ? AND ?
                 GROUP BY DATE(created_at)
                 ORDER BY date DESC`,
                [startDate, endDate],
                (err, rows) => {
                  if (err) return res.status(500).json({ error: 'Database error' });
                  report.dailyBreakdown = rows;
                  report.startDate = startDate;
                  report.endDate = endDate;

                  res.json(report);
                }
              );
            }
          );
        }
      );
    }
  );
});

// Export customers to CSV
router.get('/export/customers', (req, res) => {
  db.all('SELECT * FROM customers ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Generate CSV
    const headers = ['ID', 'Nama', 'HP', 'QR Code', 'Stamps', 'Voucher Aktif', 'Terdaftar', 'Update Terakhir'];
    const csv = [
      headers.join(','),
      ...rows.map(r => [
        r.id,
        `"${r.name}"`,
        r.phone,
        r.qr_code,
        r.stamps,
        r.voucher_active ? 'Ya' : 'Tidak',
        r.created_at,
        r.updated_at
      ].join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=customers-${Date.now()}.csv`);
    res.send(csv);
  });
});

// Export transactions to CSV
router.get('/export/transactions', (req, res) => {
  db.all(
    `SELECT t.*, c.name, c.phone 
     FROM transactions t 
     JOIN customers c ON t.customer_id = c.id 
     ORDER BY t.created_at DESC`,
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      const headers = ['ID', 'Customer', 'HP', 'Tipe', 'Stamp Sebelum', 'Stamp Sesudah', 'Voucher Used', 'Notes', 'Waktu'];
      const csv = [
        headers.join(','),
        ...rows.map(r => [
          r.id,
          `"${r.name}"`,
          r.phone,
          r.type,
          r.stamps_before,
          r.stamps_after,
          r.voucher_used ? 'Ya' : 'Tidak',
          `"${r.notes || ''}"`,
          r.created_at
        ].join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=transactions-${Date.now()}.csv`);
      res.send(csv);
    }
  );
});

module.exports = router;
