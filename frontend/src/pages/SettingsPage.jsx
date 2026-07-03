import { useState, useEffect } from 'react';
import { api } from '../api';

function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getSettings();
      // DB stores values as strings; coerce numeric ones
      setSettings({
        stamps_required: parseInt(data.stamps_required) || 8,
        voucher_amount: parseInt(data.voucher_amount) || 15000,
        currency: data.currency || 'Rp'
      });
    } catch (err) {
      setError('Gagal memuat settings');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-page">
        <div className="alert info">Memuat settings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="settings-page">
        <div className="alert error">{error}</div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <h2>⚙️ Settings</h2>
      <p className="subtitle">Konfigurasi sistem loyalty</p>

      {settings && (
        <div className="settings-content">
          <div className="settings-section">
            <h3>🎁 Reward Configuration</h3>
            
            <div className="setting-item">
              <div className="setting-label">
                <span className="icon">✅</span>
                <span className="label">Jumlah Stamp Required</span>
              </div>
              <div className="setting-value">
                <span className="value-display">{settings.stamps_required}</span>
                <span className="unit">stamps</span>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-label">
                <span className="icon">💰</span>
                <span className="label">Nilai Voucher</span>
              </div>
              <div className="setting-value">
                <span className="value-display">
                  {settings.currency} {settings.voucher_amount.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h3>📋 Sistem Info</h3>
            
            <div className="setting-item">
              <div className="setting-label">
                <span className="icon">🔑</span>
                <span className="label">QR Code Format</span>
              </div>
              <div className="setting-value">
                <span className="value-display">RADIAN-[UUID]</span>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-label">
                <span className="icon">📱</span>
                <span className="label">Platform</span>
              </div>
              <div className="setting-value">
                <span className="value-display">Web + Mobile</span>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-label">
                <span className="icon">🗄️</span>
                <span className="label">Database</span>
              </div>
              <div className="setting-value">
                <span className="value-display">SQLite</span>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h3>ℹ️ Cara Kerja</h3>
            <div className="info-box">
              <p><strong>Reward System:</strong></p>
              <ul>
                <li>Customer belanja → kasir scan QR → +1 stamp</li>
                <li>Kumpulkan {settings.stamps_required} stamps → voucher otomatis aktif</li>
                <li>Voucher worth {settings.currency}{settings.voucher_amount.toLocaleString('id-ID')}</li>
                <li>Gunakan voucher → stamps reset ke 0, mulai kumpul lagi</li>
              </ul>
            </div>
          </div>

          <div className="alert info" style={{marginTop: '20px'}}>
            <strong>ℹ️ Note:</strong> Settings saat ini read-only. 
            Untuk ubah nilai voucher atau jumlah stamp, edit di backend code.
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsPage;
