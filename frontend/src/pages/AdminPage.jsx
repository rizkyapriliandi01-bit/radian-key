import { useState, useEffect } from 'react';
import { api } from '../api';

function AdminPage() {
  const [mode, setMode] = useState('dashboard'); // 'dashboard' | 'register'
  const [stats, setStats] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [success, setSuccess] = useState('');
  
  // Register form
  const [formData, setFormData] = useState({ name: '', phone: '' });

  useEffect(() => {
    loadStats();
    loadCustomers();
  }, [page, search]);

  const loadStats = async () => {
    try {
      const data = await api.getAdminStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const loadCustomers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getAdminCustomers(page, 20, search);
      setCustomers(data.customers);
      setPagination(data.pagination);
    } catch (err) {
      setError('Gagal memuat data customer');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadCustomers();
  };

  const handleViewCustomer = async (id) => {
    try {
      const data = await api.getCustomerDetail(id);
      setSelectedCustomer(data);
    } catch (err) {
      setError('Gagal memuat detail customer');
    }
  };

  const handleDeleteCustomer = async (id, name) => {
    if (!window.confirm(`Hapus customer "${name}"? Data tidak bisa dikembalikan!`)) {
      return;
    }
    try {
      await api.deleteCustomer(id);
      loadCustomers();
      loadStats();
      setSelectedCustomer(null);
      alert('Customer berhasil dihapus');
    } catch (err) {
      setError('Gagal menghapus customer');
    }
  };
  
  // Handle register (Moved from Kasir)
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      setError('Nama dan nomor HP wajib diisi');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.registerCustomer(formData.name, formData.phone);
      setSuccess('Customer berhasil didaftarkan!');
      setFormData({ name: '', phone: '' });
      loadStats();
      loadCustomers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal mendaftar customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <h2>👨‍💼 Admin Panel</h2>
      
      {/* Mode Toggle */}
      <div className="mode-toggle">
        <button 
          className={mode === 'dashboard' ? 'active' : ''}
          onClick={() => setMode('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={mode === 'register' ? 'active' : ''}
          onClick={() => setMode('register')}
        >
          ✍️ Daftar Baru
        </button>
      </div>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}
      
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

      {/* Dashboard Mode */}
      {mode === 'dashboard' && stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-value">{stats.totalCustomers}</div>
            <div className="stat-label">Total Customer</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎟️</div>
            <div className="stat-value">{stats.activeVouchers}</div>
            <div className="stat-label">Voucher Aktif</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-value">{stats.totalStamps}</div>
            <div className="stat-label">Total Stamp</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-value">{stats.stampsAddedToday}</div>
            <div className="stat-label">Stamp Hari Ini</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-value">{stats.vouchersUsedToday}</div>
            <div className="stat-label">Voucher Hari Ini</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-value">{stats.newCustomersThisWeek}</div>
            <div className="stat-label">Baru Minggu Ini</div>
          </div>
        </div>
      )}
      
      {mode === 'dashboard' && (
        <div className="search-section">
          <form onSubmit={handleSearch} className="modern-search-form">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Cari nama atau HP..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="modern-search-input"
              />
              {search && (
                <button 
                  type="button" 
                  onClick={() => { setSearch(''); setPage(1); }}
                  className="clear-search-btn"
                >
                  ✕
                </button>
              )}
            </div>
            <button type="submit" className="btn-primary">Cari</button>
          </form>
        </div>
      )}

      {mode === 'dashboard' && (
        <div className="customer-list">
          <h3>Daftar Customer</h3>
          {loading ? (
            <div className="loading">Memuat...</div>
          ) : customers.length === 0 ? (
            <div className="empty">Tidak ada customer</div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="customer-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nama</th>
                      <th>HP</th>
                      <th>Stamp</th>
                      <th>Voucher</th>
                      <th>Terdaftar</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map(c => (
                      <tr key={c.id}>
                        <td>{c.id}</td>
                        <td>{c.name}</td>
                        <td>{c.phone}</td>
                        <td>
                          <span className="stamp-badge">{c.stamps}/8</span>
                        </td>
                        <td>
                          {c.voucher_active ? (
                            <span className="voucher-badge active">✓ Aktif</span>
                          ) : (
                            <span className="voucher-badge">-</span>
                          )}
                        </td>
                        <td>{new Date(c.created_at).toLocaleDateString('id-ID')}</td>
                        <td>
                          <button 
                            onClick={() => handleViewCustomer(c.id)}
                            className="btn-view"
                          >
                            👁️
                          </button>
                          <button 
                            onClick={() => handleDeleteCustomer(c.id, c.name)}
                            className="btn-delete"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {pagination && pagination.totalPages > 1 && (
                <div className="pagination">
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-page"
                  >
                    ← Prev
                  </button>
                  <span className="page-info">
                    Halaman {page} dari {pagination.totalPages}
                  </span>
                  <button 
                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                    className="btn-page"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {selectedCustomer && (
        <div className="modal-overlay" onClick={() => setSelectedCustomer(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detail Customer</h3>
              <button onClick={() => setSelectedCustomer(null)} className="btn-close">✕</button>
            </div>
            <div className="modal-body">
              <div className="customer-info">
                <p><strong>Nama:</strong> {selectedCustomer.customer.name}</p>
                <p><strong>HP:</strong> {selectedCustomer.customer.phone}</p>
                <p><strong>QR Code:</strong> {selectedCustomer.customer.qr_code}</p>
                <p><strong>Stamp:</strong> {selectedCustomer.customer.stamps}/8</p>
                <p><strong>Voucher:</strong> {selectedCustomer.customer.voucher_active ? 'Aktif' : 'Tidak Aktif'}</p>
              </div>
              <h4>Riwayat Transaksi</h4>
              <div className="transaction-list">
                {selectedCustomer.transactions.length === 0 ? (
                  <p className="empty">Belum ada transaksi</p>
                ) : (
                  selectedCustomer.transactions.map(t => (
                    <div key={t.id} className="transaction-item">
                      <div className="transaction-type">
                        {t.type === 'ADD_STAMP' && '➕ Tambah Stamp'}
                        {t.type === 'USE_VOUCHER' && '💰 Gunakan Voucher'}
                        {t.type === 'REGISTER' && '✍️ Pendaftaran'}
                      </div>
                      <div className="transaction-details">
                        {t.stamps_before !== null && (
                          <span>{t.stamps_before} → {t.stamps_after} stamp</span>
                        )}
                        {t.notes && <span className="notes">{t.notes}</span>}
                      </div>
                      <div className="transaction-date">
                        {new Date(t.created_at).toLocaleString('id-ID')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;
