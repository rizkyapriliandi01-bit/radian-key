import { useState } from 'react';
import QRScanner from '../components/QRScanner';
import QRUpload from '../components/QRUpload';
import { api } from '../api';

function KasirPage() {
  const [mode, setMode] = useState('scan'); // 'scan' | 'register'
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [scanMode, setScanMode] = useState('upload'); // 'camera' | 'upload' | 'manual'
  const [manualQR, setManualQR] = useState('');
  
  // Register form
  const [formData, setFormData] = useState({ name: '', phone: '' });

  // Handle QR scan
  const handleScan = async (qrCode) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getCustomerByQR(qrCode);
      setCustomer(data);
      setSuccess('Customer berhasil dimuat!');
      setManualQR('');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'QR code tidak ditemukan');
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle manual QR input
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualQR.trim()) {
      setError('QR code tidak boleh kosong');
      return;
    }
    handleScan(manualQR.trim());
  };

  // Handle register
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      setError('Nama dan nomor HP wajib diisi');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await api.registerCustomer(formData.name, formData.phone);
      setCustomer(data.customer);
      setSuccess('Customer berhasil didaftarkan!');
      setFormData({ name: '', phone: '' });
      setMode('scan');
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal mendaftar customer');
    } finally {
      setLoading(false);
    }
  };

  // Add stamp
  const handleAddStamp = async () => {
    if (!customer) return;
    
    setLoading(true);
    setError('');
    try {
      const data = await api.addStamp(customer.id);
      setCustomer({ ...customer, stamps: data.stamps, voucher_active: data.voucher_active });
      
      if (data.voucher_activated) {
        setSuccess('🎉 Voucher Rp15,000 AKTIF! 🎉');
      } else {
        setSuccess('✅ Stamp berhasil ditambahkan!');
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal menambah stamp');
    } finally {
      setLoading(false);
    }
  };

  // Use voucher
  const handleUseVoucher = async () => {
    if (!customer || !customer.voucher_active) return;

    if (!window.confirm('Gunakan voucher Rp15,000 sekarang?')) return;

    setLoading(true);
    setError('');
    try {
      const data = await api.useVoucher(customer.id);
      setCustomer({ ...customer, stamps: 0, voucher_active: false });
      setSuccess('✅ Voucher Rp15,000 berhasil digunakan!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal menggunakan voucher');
    } finally {
      setLoading(false);
    }
  };

  // Reset
  const handleReset = () => {
    setCustomer(null);
    setError('');
    setSuccess('');
  };

  return (
    <div className="kasir-page">
      <h2>👨‍💼 Mode Kasir</h2>

      {/* Mode Toggle */}
      <div className="mode-toggle">
        <button 
          className={mode === 'scan' ? 'active' : ''}
          onClick={() => setMode('scan')}
        >
          📱 Scan QR
        </button>
        <button 
          className={mode === 'register' ? 'active' : ''}
          onClick={() => setMode('register')}
        >
          ✍️ Daftar Baru
        </button>
      </div>

      {/* Messages */}
      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      {/* Scan Mode */}
      {mode === 'scan' && !customer && (
        <div className="scan-section">
          <h3>Scan Radian Key Customer</h3>
          
          {/* Scan Mode Toggle */}
          <div className="scan-mode-toggle">
            <button 
              className={scanMode === 'camera' ? 'active' : ''}
              onClick={() => setScanMode('camera')}
            >
              📷 Camera
            </button>
            <button 
              className={scanMode === 'upload' ? 'active' : ''}
              onClick={() => setScanMode('upload')}
            >
              📁 Upload
            </button>
            <button 
              className={scanMode === 'manual' ? 'active' : ''}
              onClick={() => setScanMode('manual')}
            >
              ⌨️ Manual
            </button>
          </div>

          {scanMode === 'camera' ? (
            <>
              <QRScanner onScan={handleScan} />
              <p className="scan-hint camera-warning">
                ⚠️ Camera hanya jalan di HTTPS. Gunakan "Upload" atau "Manual" jika blank.
              </p>
            </>
          ) : scanMode === 'upload' ? (
            <QRUpload onScan={handleScan} />
          ) : (
            <form onSubmit={handleManualSubmit} className="manual-qr-form">
              <div className="form-group">
                <label>QR Code Customer</label>
                <input
                  type="text"
                  value={manualQR}
                  onChange={(e) => setManualQR(e.target.value)}
                  placeholder="RADIAN-xxxx-xxxx-xxxx..."
                  autoFocus
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Mencari...' : '🔍 Cari Customer'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Register Mode */}
      {mode === 'register' && (
        <div className="register-section">
          <h3>Daftar Customer Baru</h3>
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Nama Lengkap</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nama customer"
                required
              />
            </div>
            <div className="form-group">
              <label>Nomor HP</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="08xxxxxxxxxx"
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Membuat...' : '✅ Daftar'}
            </button>
          </form>
        </div>
      )}

      {/* Customer Display */}
      {customer && (
        <div className="customer-display">
          <div className="customer-header">
            <h3>✅ Customer Terdeteksi</h3>
            <button onClick={handleReset} className="btn-secondary">
              Baru
            </button>
          </div>

          <div className="customer-info">
            <div className="info-row">
              <span className="label">Nama:</span>
              <span className="value">{customer.name}</span>
            </div>
            <div className="info-row">
              <span className="label">HP:</span>
              <span className="value">{customer.phone}</span>
            </div>
          </div>

          {/* Stamp Progress */}
          <div className="stamp-section">
            <h4>Stamp Progress</h4>
            <div className="stamp-counter">
              <span className="stamp-number">{customer.stamps}</span>
              <span className="stamp-total">/ 8</span>
            </div>
            <div className="stamp-grid">
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i} 
                  className={`stamp ${i < customer.stamps ? 'filled' : ''}`}
                >
                  {i < customer.stamps ? '✓' : '○'}
                </div>
              ))}
            </div>
          </div>

          {/* Voucher Status */}
          {customer.voucher_active && (
            <div className="voucher-active">
              <h4>🎉 Voucher Aktif!</h4>
              <p className="voucher-amount">Rp 15,000</p>
              <button 
                onClick={handleUseVoucher} 
                className="btn-voucher"
                disabled={loading}
              >
                💳 Gunakan Voucher
              </button>
            </div>
          )}

          {/* Action Button */}
          {!customer.voucher_active && (
            <button 
              onClick={handleAddStamp} 
              className="btn-add-stamp"
              disabled={loading}
            >
              ➕ Tambah Stamp
            </button>
          )}

          {/* QR Code Display */}
          {customer.qr_image && (
            <div className="qr-display">
              <h4>QR Code Customer</h4>
              <img src={customer.qr_image} alt="QR Code" />
              <p className="qr-code-text">{customer.qr_code}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default KasirPage;
