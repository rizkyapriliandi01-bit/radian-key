const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const { dbHelpers } = require('../database');

// Register new customer
router.post('/register', async (req, res) => {
  try {
    const { name, phone } = req.body;

    // Validate input
    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Nama dan nomor telepon wajib diisi'
      });
    }

    // Check if phone already exists
    const existingCustomer = await dbHelpers.getCustomerByPhone(phone);
    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        error: 'Nomor telepon sudah terdaftar'
      });
    }

    // Generate unique QR code
    const qrCode = `RK-${uuidv4()}`;

    // Create customer
    const customer = await dbHelpers.createCustomer(name, phone, qrCode);

    // Generate QR code image (base64)
    const qrCodeImage = await QRCode.toDataURL(qrCode, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 2
    });

    res.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        qr_code: customer.qr_code,
        stamps: customer.stamps,
        voucher_active: customer.voucher_active
      },
      qrCodeImage
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal mendaftarkan pelanggan'
    });
  }
});

// Get customer by QR code
router.post('/scan', async (req, res) => {
  try {
    const { qr_code } = req.body;

    if (!qr_code) {
      return res.status(400).json({
        success: false,
        error: 'QR code tidak valid'
      });
    }

    const customer = await dbHelpers.getCustomerByQR(qr_code);

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Pelanggan tidak ditemukan'
      });
    }

    res.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        stamps: customer.stamps,
        voucher_active: customer.voucher_active === 1
      }
    });
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal memindai QR code'
    });
  }
});

// Add stamp to customer
router.post('/add-stamp', async (req, res) => {
  try {
    const { customer_id } = req.body;

    if (!customer_id) {
      return res.status(400).json({
        success: false,
        error: 'ID pelanggan tidak valid'
      });
    }

    const result = await dbHelpers.addStamp(customer_id);

    res.json({
      success: true,
      stamps: result.stamps,
      voucher_active: result.voucher_active === 1,
      message: result.voucher_active === 1
        ? 'Stempel ditambahkan! Voucher Rp15.000 aktif!'
        : 'Stempel ditambahkan!'
    });
  } catch (error) {
    console.error('Add stamp error:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal menambahkan stempel'
    });
  }
});

// Use voucher
router.post('/use-voucher', async (req, res) => {
  try {
    const { customer_id } = req.body;

    if (!customer_id) {
      return res.status(400).json({
        success: false,
        error: 'ID pelanggan tidak valid'
      });
    }

    const result = await dbHelpers.useVoucher(customer_id);

    res.json({
      success: true,
      stamps: result.stamps,
      voucher_active: result.voucher_active === 1,
      message: 'Voucher Rp15.000 berhasil digunakan!'
    });
  } catch (error) {
    console.error('Use voucher error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Gagal menggunakan voucher'
    });
  }
});

// Get all customers (for admin/testing)
router.get('/all', async (req, res) => {
  try {
    const customers = await dbHelpers.getAllCustomers();

    res.json({
      success: true,
      customers: customers.map(c => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        stamps: c.stamps,
        voucher_active: c.voucher_active === 1,
        created_at: c.created_at
      }))
    });
  } catch (error) {
    console.error('Get all customers error:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal mengambil data pelanggan'
    });
  }
});

// Get customer transactions
router.get('/transactions/:customer_id', async (req, res) => {
  try {
    const { customer_id } = req.params;
    const transactions = await dbHelpers.getCustomerTransactions(customer_id);

    res.json({
      success: true,
      transactions
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal mengambil riwayat transaksi'
    });
  }
});

// Regenerate QR code for existing customer
router.post('/regenerate-qr', async (req, res) => {
  try {
    const { customer_id } = req.body;

    if (!customer_id) {
      return res.status(400).json({
        success: false,
        error: 'ID pelanggan tidak valid'
      });
    }

    const customer = await dbHelpers.getCustomerByQR(customer_id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Pelanggan tidak ditemukan'
      });
    }

    // Generate QR code image from existing code
    const qrCodeImage = await QRCode.toDataURL(customer.qr_code, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 2
    });

    res.json({
      success: true,
      qrCodeImage,
      customer: {
        name: customer.name,
        phone: customer.phone
      }
    });
  } catch (error) {
    console.error('Regenerate QR error:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal membuat QR code'
    });
  }
});

module.exports = router;
