const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all customers with pagination
router.get('/customers', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';

  let query = 'SELECT * FROM customers';
  let countQuery = 'SELECT COUNT(*) as total FROM customers';
  let params = [];

  if (search) {
    query += ' WHERE name LIKE ? OR phone LIKE ?';
    countQuery += ' WHERE name LIKE ? OR phone LIKE ?';
    params = [`%${search}%`, `%${search}%`];
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';

  db.get(countQuery, params, (err, countRow) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    db.all(query, [...params, limit, offset], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({
        customers: rows,
        pagination: {
          page,
          limit,
          total: countRow.total,
          totalPages: Math.ceil(countRow.total / limit)
        }
      });
    });
  });
});

// Get dashboard stats
router.get('/stats', (req, res) => {
  const stats = {};

  // Total customers
  db.get('SELECT COUNT(*) as total FROM customers', (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    stats.totalCustomers = row.total;

    // Active vouchers
    db.get('SELECT COUNT(*) as total FROM customers WHERE voucher_active = 1', (err, row) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      stats.activeVouchers = row.total;

      // Total stamps distributed
      db.get('SELECT SUM(stamps) as total FROM customers', (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        stats.totalStamps = row.total || 0;

        // Vouchers used today
        db.get(
          `SELECT COUNT(*) as total FROM transactions 
           WHERE type = 'USE_VOUCHER' AND DATE(created_at) = DATE('now')`,
          (err, row) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            stats.vouchersUsedToday = row.total;

            // Stamps added today
            db.get(
              `SELECT COUNT(*) as total FROM transactions 
               WHERE type = 'ADD_STAMP' AND DATE(created_at) = DATE('now')`,
              (err, row) => {
                if (err) return res.status(500).json({ error: 'Database error' });
                stats.stampsAddedToday = row.total;

                // New customers this week
                db.get(
                  `SELECT COUNT(*) as total FROM customers 
                   WHERE DATE(created_at) >= DATE('now', '-7 days')`,
                  (err, row) => {
                    if (err) return res.status(500).json({ error: 'Database error' });
                    stats.newCustomersThisWeek = row.total;

                    res.json(stats);
                  }
                );
              }
            );
          }
        );
      });
    });
  });
});

// Get customer detail with history
router.get('/customers/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM customers WHERE id = ?', [id], (err, customer) => {
    if (err || !customer) {
      return res.status(404).json({ error: 'Customer tidak ditemukan' });
    }

    db.all(
      'SELECT * FROM transactions WHERE customer_id = ? ORDER BY created_at DESC',
      [id],
      (err, transactions) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        res.json({
          customer,
          transactions
        });
      }
    );
  });
});

// Delete customer (soft delete - just mark)
router.delete('/customers/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM customers WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Gagal menghapus customer' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Customer tidak ditemukan' });
    }

    res.json({ success: true, message: 'Customer berhasil dihapus' });
  });
});

module.exports = router;
