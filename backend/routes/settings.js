const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all settings
router.get('/', (req, res) => {
  db.all('SELECT * FROM settings', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Convert to object format
    const settings = {};
    rows.forEach(row => {
      settings[row.key] = row.value;
    });

    res.json(settings);
  });
});

// Update setting
router.put('/:key', (req, res) => {
  const { key } = req.params;
  const { value } = req.body;

  if (!value && value !== '0' && value !== '') {
    return res.status(400).json({ error: 'Value is required' });
  }

  db.run(
    'UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?',
    [value, key],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Gagal update setting' });
      }

      if (this.changes === 0) {
        // Insert if not exists
        db.run(
          'INSERT INTO settings (key, value) VALUES (?, ?)',
          [key, value],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Gagal insert setting' });
            }
            res.json({ success: true, key, value });
          }
        );
      } else {
        res.json({ success: true, key, value });
      }
    }
  );
});

// Bulk update settings
router.post('/bulk', (req, res) => {
  const settings = req.body;

  if (!settings || typeof settings !== 'object') {
    return res.status(400).json({ error: 'Invalid settings object' });
  }

  const promises = Object.entries(settings).map(([key, value]) => {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?',
        [value, key],
        function(err) {
          if (err) return reject(err);
          if (this.changes === 0) {
            db.run('INSERT INTO settings (key, value) VALUES (?, ?)', [key, value], (err) => {
              if (err) return reject(err);
              resolve();
            });
          } else {
            resolve();
          }
        }
      );
    });
  });

  Promise.all(promises)
    .then(() => res.json({ success: true, message: 'Settings updated' }))
    .catch(() => res.status(500).json({ error: 'Failed to update settings' }));
});

module.exports = router;
