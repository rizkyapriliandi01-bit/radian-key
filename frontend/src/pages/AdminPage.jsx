import { useState, useEffect, useRef } from 'react';
import QRScanner from '../components/QRScanner';
import { api } from '../api';

function AdminPage() {
  const [stats, setStats] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [cardToClaim, setCardToClaim] = useState(null);
  const [claimForm, setClaimForm] = useState({ name: '', phone: '' });
  const [claimLoading, setClaimLoading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => { loadStats(); loadCustomers(); }, [page, search]);

  const loadStats = async () => {
    try { const d = await api.getAdminStats(); setStats(d); } catch {}
  };

  const loadCustomers = async () => {
    setLoading(true); setError('');
    try {
      const d = await api.getAdminCustomers(page, 20, search);
      setCustomers(d.customers); setPagination(d.pagination);
    } catch {
      setError('Gagal memuat data');
    } finally { setLoading(false); }
  };

  const handleSearch = (e) => { e.preventDefault(); setPage(1); loadCustomers(); };
  const handleViewCustomer = async (id) => {
    try { setSelectedCustomer(await api.getCustomerDetail(id)); } catch { setError('Gagal'); }
  };
  const handleDeleteCustomer = async (id, name) => {
    if (!window.confirm(`Hapus "${name}"?`)) return;
    try { await api.deleteCustomer(id); loadCustomers(); loadStats(); setSelectedCustomer(null); } catch { setError('Gagal'); }
  };

  // Claim flow
  const handleScanClaim = async (idCard) => {
    if (!idCard) return; setError('');
    try {
      const data = await api.getCustomerByIDCard(idCard);
      data.status === 'printed' ? setCardToClaim(idCard) : setError('ID Card sudah terdaftar');
    } catch { setError('ID Card tidak valid'); }
  };

  const handleClaim = async (e) => {
    e.preventDefault();
    if (!claimForm.name || !claimForm.phone) { setError('Isi nama & HP'); return; }
    setClaimLoading(true); setError('');
    try {
      await api.claimIDCard(cardToClaim, claimForm.name, claimForm.phone);
      setSuccess('Aktifasi berhasil!'); setCardToClaim(null); setClaimForm({ name: '', phone: '' });
      loadStats(); loadCustomers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError(err.response?.data?.error || 'Gagal'); }
    finally { setClaimLoading(false); }
  };

  // Direct file upload for QR
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const jsQR = (await import('jsqr')).default;
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        URL.revokeObjectURL(img.src);
        code ? handleScanClaim(code.data) : setError('QR tidak terdeteksi');
      }; img.src = ev.target.result;
    }; reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="admin-page">
      <h2>👨‍💼 Admin Panel</h2>
      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}
      <div style={{ margin: '1rem 0' }}>
        <button className={showRegister ? 'btn-secondary' : 'btn-primary'} onClick={() => setShowRegister(!showRegister)}>
          {showRegister ? '📊 Dashboard' : '✍️ Daftar Baru'}
        </button>
      </div>

      {/* Register: scan QR claim */}
      {showRegister && (
        <div className="register-section" style={{ marginBottom: '1.5rem' }}>
          <h3>Daftar Customer Baru</h3>
          {!cardToClaim ? (
            <>
              <p className="text-muted">Scan ID Card cetak untuk aktivasi</p>
              <QRScanner onScan={handleScanClaim} />
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
              <button className="btn-secondary" style={{ marginTop: 10 }} onClick={() => fileRef.current?.click()}>
                📁 Upload Foto QR
              </button>
            </>
          ) : (
            <form onSubmit={handleClaim}>
              <p className="alert success">✅ ID Card: {cardToClaim}</p>
              <div className="form-group"><label>Nama Lengkap</label>
                <input type="text" value={claimForm.name} onChange={(e) => setClaimForm({ ...claimForm, name: e.target.value })} placeholder="Nama customer" required autoFocus />
              </div>
              <div className="form-group"><label>Nomor HP</label>
                <input type="tel" value={claimForm.phone} onChange={(e) => setClaimForm({ ...claimForm, phone: e.target.value })} placeholder="08xxxxxxxxxx" required />
              </div>
              <button type="submit" className="btn-primary" disabled={claimLoading}>
                {claimLoading ? 'Mengaktifkan...' : '✅ Aktifkan'}
              </button>
              <button type="button" onClick={() => { setCardToClaim(null); setClaimForm({ name: '', phone: '' }); }} className="btn-secondary" style={{ marginTop: 8 }}>
                ← Scan Lagi
              </button>
            </form>
          )}
        </div>
      )}

      {/* Dashboard */}
      {!showRegister && stats && (
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-icon">👥</div><div className="stat-value">{stats.totalCustomers}</div><div className="stat-label">Total</div></div>
          <div className="stat-card"><div className="stat-icon">🎟️</div><div className="stat-value">{stats.activeVouchers}</div><div className="stat-label">Voucher</div></div>
          <div className="stat-card"><div className="stat-icon">⭐</div><div className="stat-value">{stats.totalStamps}</div><div className="stat-label">Stamp</div></div>
          <div className="stat-card"><div className="stat-icon">📈</div><div className="stat-value">{stats.stampsAddedToday}</div><div className="stat-label">Hari Ini</div></div>
          <div className="stat-card"><div className="stat-icon">💰</div><div className="stat-value">{stats.vouchersUsedToday}</div><div className="stat-label">Voucher Hari Ini</div></div>
          <div className="stat-card"><div className="stat-icon">🆕</div><div className="stat-value">{stats.newCustomersThisWeek}</div><div className="stat-label">Minggu Ini</div></div>
        </div>
      )}

      {/* Customer cards */}
      {!showRegister && (
        <>
          <div className="search-section" style={{ margin: '1rem 0' }}>
            <form onSubmit={handleSearch} className="modern-search-form">
              <div className="search-input-wrapper">
                <span className="search-icon">🔍</span>
                <input type="text" placeholder="Cari nama, HP, atau ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="modern-search-input" />
                {search && <button type="button" onClick={() => { setSearch(''); setPage(1); }} className="clear-search-btn">✕</button>}
              </div>
              <button type="submit" className="btn-primary">Cari</button>
            </form>
          </div>
          <div className="customer-cards">
            {loading ? <div className="loading">Memuat...</div> :
             customers.length === 0 ? <div className="empty">Tidak ada customer</div> :
             customers.map(c => (
               <div key={c.id} className="customer-card" onClick={() => handleViewCustomer(c.id)}>
                 <div className="card-top">
                   <strong>{c.name || '(kosong)'}</strong>
                   <span className="stamp-badge">{c.stamps}/8</span>
                 </div>
                 <div className="card-detail">{c.phone}</div>
                 <div className="card-detail id-card">{c.id_card || '-'}</div>
                 <div className="card-footer">
                   <span className={c.voucher_active ? 'badge-voucher badge-on' : 'badge-voucher'}>
                     {c.voucher_active ? '🎟️ Aktif' : '-'}
                   </span>
                   <small>{new Date(c.created_at).toLocaleDateString('id-ID')}</small>
                 </div>
               </div>
             ))}
          </div>
          {pagination?.totalPages > 1 && (
            <div className="pagination">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-page">←</button>
              <span className="page-info">{page}/{pagination.totalPages}</span>
              <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages} className="btn-page">→</button>
            </div>
          )}
        </>
      )}

      {/* Detail modal */}
      {selectedCustomer && (
        <div className="modal-overlay" onClick={() => setSelectedCustomer(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedCustomer.customer.name}</h3>
              <button onClick={() => setSelectedCustomer(null)} className="btn-close">✕</button>
            </div>
            <div className="modal-body">
              <p><strong>HP:</strong> {selectedCustomer.customer.phone}</p>
              <p><strong>ID Card:</strong> {selectedCustomer.customer.id_card || '-'}</p>
              <p><strong>Stamp:</strong> {selectedCustomer.customer.stamps}/8</p>
              <p><strong>Voucher:</strong> {selectedCustomer.customer.voucher_active ? 'Aktif' : 'Tidak'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;
