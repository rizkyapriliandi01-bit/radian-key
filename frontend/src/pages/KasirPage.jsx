import { useState, useRef } from 'react';
import QRScanner from '../components/QRScanner';
import { api } from '../api';

function KasirPage() {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileRef = useRef(null);
  const [manualID, setManualID] = useState('');
  const [claimCard, setClaimCard] = useState('');
  const [claimForm, setClaimForm] = useState({ name: '', phone: '' });

  const handleScan = async (idCard) => {
    setLoading(true); setError('');
    try {
      const data = await api.getCustomerByIDCard(idCard);
      if (data.status === 'printed') {
        setClaimCard(idCard); setCustomer(null);
        setSuccess('Kartu baru. Isi nama & HP.');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setCustomer(data); setClaimCard('');
        setSuccess('Customer ditemukan!'); setManualID('');
        setTimeout(() => setSuccess(''), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'ID Card tidak ditemukan');
      setCustomer(null);
    } finally { setLoading(false); }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualID.trim()) { setError('Masukkan ID Card'); return; }
    handleScan(manualID.trim());
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const jsQR = (await import('jsqr')).default;
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        code ? handleScan(code.data) : setError('QR tidak terdeteksi');
      }; img.src = ev.target.result;
    }; reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleClaim = async (e) => {
    e.preventDefault();
    if (!claimForm.name || !claimForm.phone) { setError('Nama & HP wajib'); return; }
    setLoading(true); setError('');
    try {
      const data = await api.claimIDCard(claimCard, claimForm.name, claimForm.phone);
      setCustomer(data.customer); setClaimCard(''); setClaimForm({ name: '', phone: '' });
      setSuccess('✅ Aktivasi berhasil!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError(err.response?.data?.error || 'Gagal'); }
    finally { setLoading(false); }
  };

  const handleAddStamp = async () => {
    if (!customer) return; setLoading(true); setError('');
    try {
      const data = await api.addStamp(customer.id);
      setCustomer({ ...customer, stamps: data.stamps, voucher_active: data.voucher_active });
      data.voucher_activated ? setSuccess('🎉 Voucher Rp15,000 AKTIF!') : setSuccess('✅ Stamp ditambah!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError(err.response?.data?.error || 'Gagal'); }
    finally { setLoading(false); }
  };

  const handleUseVoucher = async () => {
    if (!customer?.voucher_active) return;
    if (!window.confirm('Gunakan voucher Rp15,000?')) return;
    setLoading(true); setError('');
    try {
      await api.useVoucher(customer.id);
      setCustomer({ ...customer, stamps: 0, voucher_active: false });
      setSuccess('✅ Voucher digunakan!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError(err.response?.data?.error || 'Gagal'); }
    finally { setLoading(false); }
  };

  const handleReset = () => {
    setCustomer(null); setClaimCard(''); setClaimForm({ name: '', phone: '' }); setError(''); setSuccess('');
  };

  return (
    <div className="kasir-page">
      <h2>👨‍💼 Mode Kasir</h2>
      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      {claimCard && !customer && (
        <div className="scan-section">
          <h3>📋 Kartu Baru — Aktivasi</h3>
          <p className="text-muted">ID Card: {claimCard}</p>
          <form onSubmit={handleClaim} className="claim-form">
            <div className="form-group"><label>Nama</label>
              <input type="text" value={claimForm.name} onChange={(e) => setClaimForm({ ...claimForm, name: e.target.value })} placeholder="Nama lengkap" autoFocus />
            </div>
            <div className="form-group"><label>Nomor HP</label>
              <input type="tel" value={claimForm.phone} onChange={(e) => setClaimForm({ ...claimForm, phone: e.target.value })} placeholder="08123456789" />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Memproses...' : '✅ Aktivasi'}</button>
            <button type="button" onClick={() => { setClaimCard(''); setClaimForm({ name: '', phone: '' }); }} className="btn-secondary" style={{marginTop:8}}>← Kembali</button>
          </form>
        </div>
      )}

      {!customer && !claimCard && (
        <div className="scan-section">
          <h3>Scan ID Card</h3>
          <QRScanner onScan={handleScan} />
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
          <div className="scan-actions">
            <button className="btn-secondary" onClick={() => fileRef.current?.click()}>📁 Upload Foto</button>
            <form onSubmit={handleManualSubmit} className="manual-qr-form">
              <input type="text" value={manualID} onChange={(e) => setManualID(e.target.value)} placeholder="RSN-0001" />
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? '...' : '🔍'}</button>
            </form>
          </div>
        </div>
      )}

      {customer && (
        <div className="customer-display">
          <div className="customer-header">
            <h3>✅ {customer.name}</h3>
            <button onClick={handleReset} className="btn-secondary">Baru</button>
          </div>
          <div className="customer-info">
            <div className="info-row"><span className="label">ID:</span><span className="value">{customer.id_card}</span></div>
            <div className="info-row"><span className="label">HP:</span><span className="value">{customer.phone}</span></div>
          </div>
          {customer.stamps !== undefined && (
            <>
              <div className="stamp-section">
                <div className="stamp-counter"><span className="stamp-number">{customer.stamps}</span><span className="stamp-total">/ 8</span></div>
                <div className="stamp-grid">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className={`stamp ${i < customer.stamps ? 'filled' : ''}`}>{i < customer.stamps ? '✓' : '○'}</div>
                  ))}
                </div>
              </div>
              {customer.voucher_active ? (
                <div className="voucher-active"><h4>🎉 Voucher Rp15,000 Aktif!</h4><button onClick={handleUseVoucher} className="btn-voucher" disabled={loading}>💳 Gunakan</button></div>
              ) : (
                <button onClick={handleAddStamp} className="btn-add-stamp" disabled={loading}>➕ Tambah Stamp</button>
              )}
            </>
          )}
          {customer.qr_image && (
            <div className="qr-display"><h4>QR ID Card</h4><img src={customer.qr_image} alt="QR" /><p className="qr-code-text">{customer.id_card}</p></div>
          )}
        </div>
      )}
    </div>
  );
}

export default KasirPage;
