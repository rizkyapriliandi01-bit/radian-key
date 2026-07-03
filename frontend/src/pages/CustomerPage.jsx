import { useState } from 'react';
import { api } from '../api';

function CustomerPage() {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phone, setPhone] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return;
    
    setLoading(true);
    setError('');
    try {
      const data = await api.getCustomerByPhone(phone.trim());
      setCustomer(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Customer tidak ditemukan');
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCustomer(null);
    setError('');
    setPhone('');
  };

  return (
    <div className="customer-page">
      <h2>🔑 Radian Key</h2>
      <p className="subtitle">Cek stamp loyalty kamu</p>

      {error && <div className="alert error">{error}</div>}

      {/* Search by phone */}
      {!customer && (
        <div className="customer-search-section">
          <form onSubmit={handleSearch} className="phone-search-form">
            <div className="form-group">
              <label>Masukkan Nomor HP</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08xxxxxxxxxx"
                autoFocus
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Mencari...' : '🔍 Cek Stamp'}
            </button>
          </form>
        </div>
      )}

      {/* Customer Stamp Card */}
      {customer && (
        <div className="customer-card">
          <div className="card-header">
            <h3>Halo, {customer.name}! 👋</h3>
            <button onClick={handleReset} className="btn-reset">
              ← Kembali
            </button>
          </div>

          {/* Stamp Display */}
          <div className="stamp-display">
            <div className="stamp-counter-big">
              <span className="count">{customer.stamps}</span>
              <span className="total">/ 8</span>
            </div>
            <p className="stamp-label">Stamp Terkumpul</p>

            <div className="stamp-grid-big">
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i} 
                  className={`stamp-item ${i < customer.stamps ? 'filled' : ''}`}
                >
                  <div className="stamp-circle">
                    {i < customer.stamps ? '✓' : i + 1}
                  </div>
                </div>
              ))}
            </div>

            {customer.stamps < 8 && (
              <p className="remaining">
                Tinggal <strong>{8 - customer.stamps}</strong> stamp lagi untuk voucher Rp15,000!
              </p>
            )}
          </div>

          {/* Voucher Display */}
          {customer.voucher_active && (
            <div className="voucher-card">
              <div className="voucher-icon">🎉</div>
              <h4>Selamat!</h4>
              <p>Voucher Anda Aktif</p>
              <div className="voucher-value">Rp 15,000</div>
              <p className="voucher-note">
                Tunjukkan ke kasir untuk menggunakan voucher
              </p>
            </div>
          )}

          {/* Info */}
          <div className="info-card">
            <div className="info-item">
              <span className="icon">📱</span>
              <span className="text">{customer.phone}</span>
            </div>
            <div className="info-item">
              <span className="icon">📅</span>
              <span className="text">
                Bergabung {new Date(customer.created_at).toLocaleDateString('id-ID')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerPage;
