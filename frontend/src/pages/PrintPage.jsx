import { useState, useEffect } from 'react';
import { api } from '../api';

function PrintPage() {
  const [mode, setMode] = useState('search'); // 'search' | 'batch'
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [selectedCustomers, setSelectedCustomers] = useState(new Set());

  // Batch generate
  const [batchCount, setBatchCount] = useState(50);
  const [batchResult, setBatchResult] = useState(null);
  const [batchLoading, setBatchLoading] = useState(false);

  const loadCustomers = async (query, pg) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getAdminCustomers(pg || 1, 50, query || search);
      setCustomers(data.customers);
      setPagination(data.pagination);
    } catch (err) {
      setError('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === 'search') loadCustomers();
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadCustomers();
  };

  const toggleSelect = (id) => {
    setSelectedCustomers(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedCustomers.size === customers.length) {
      setSelectedCustomers(new Set());
    } else {
      setSelectedCustomers(new Set(customers.map(c => c.id)));
    }
  };

  const handlePrintID = async (customer) => {
    // Open print dialog with ID card layout
    const printWin = window.open('', '_blank', 'width=400,height=600');
    printWin.document.write(`
      <html><head><title>Cetak ID - ${customer.name}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 1rem; text-align: center; }
        .id-card { width: 320px; margin: 2rem auto; border: 2px solid #333; border-radius: 12px; padding: 1rem; }
        .shop-name { font-size: 1.5rem; font-weight: bold; color: #4f46e5; margin-bottom: 0.5rem; }
        .customer-name { font-size: 1.2rem; font-weight: 600; margin: 0.5rem 0; }
        .customer-phone { color: #666; margin-bottom: 0.5rem; }
        .qr-img { width: 200px; height: 200px; margin: 0.5rem 0; }
        .id-card-note { font-size: 0.75rem; color: #999; margin-top: 0.5rem; }
        @media print { body { margin: 0; padding: 0.5rem; } .id-card { page-break-inside: avoid; } }
      </style></head><body>
        <div class="id-card">
          <div class="shop-name">Radian Studio</div>
          <div class="customer-name">${customer.name}</div>
          <div class="customer-phone">${customer.phone}</div>
          <img class="qr-img" src="/api/customers/id/${customer.id_card}/image" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><rect width=%22200%22 height=%22200%22 fill=%22%23eee%22/><text x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22>QR</text></svg>'" />
          <div style="font-size:0.65rem;color:#999;word-break:break-all">${customer.id_card}</div>
          <div class="id-card-note">Tunjukkan saat transaksi untuk mengumpulkan stamp</div>
        </div>
        <script>window.onload=function(){setTimeout(function(){window.print()},500)}</script>
      </body></html>
    `);
    printWin.document.close();
  };

  const handlePrintSelected = () => {
    if (selectedCustomers.size === 0) {
      setError('Pilih customer dulu');
      return;
    }
    const selected = customers.filter(c => selectedCustomers.has(c.id));
    const printWin = window.open('', '_blank', 'width=400,height=600');
    printWin.document.write(`
      <html><head><title>Cetak ID Card</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0.5rem; }
        .id-card { width: 320px; margin: 1rem auto; border: 2px solid #333; border-radius: 12px; padding: 1rem; text-align: center; page-break-inside: avoid; }
        .shop-name { font-size: 1.5rem; font-weight: bold; color: #4f46e5; margin-bottom: 0.5rem; }
        .customer-name { font-size: 1.2rem; font-weight: 600; margin: 0.5rem 0; }
        .customer-phone { color: #666; margin-bottom: 0.5rem; }
        .id-num { font-size: 0.85rem; color: #333; margin-bottom: 0.5rem; }
        .qr-img { width: 180px; height: 180px; margin: 0.5rem 0; }
        .id-card-note { font-size: 0.7rem; color: #999; margin-top: 0.5rem; }
        @media print { body { margin: 0; } }
      </style></head><body>
        ${selected.map(c => `
          <div class="id-card">
            <div class="shop-name">Radian Studio</div>
            <div class="id-num">ID: ${c.id_card || '-'}</div>
            <div class="customer-name">${c.name}</div>
            <div class="customer-phone">${c.phone}</div>
            <img class="qr-img" src="/api/customers/id/${c.id_card}/image" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22180%22 height=%22180%22><rect width=%22180%22 height=%22180%22 fill=%22%23eee%22/><text x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22>QR</text></svg>'" />
            <div style="font-size:0.65rem;color:#999;word-break:break-all">${c.id_card}</div>
            <div class="id-card-note">Tunjukkan saat transaksi</div>
          </div>
        `).join('')}
        <script>window.onload=function(){setTimeout(function(){window.print()},500)}</script>
      </body></html>
    `);
    printWin.document.close();
  };

  return (
    <div className="print-page">
      <h2>🖨️ Cetak ID Card</h2>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      <div className="mode-toggle">
        <button className={mode === 'search' ? 'active' : ''} onClick={() => { setMode('search'); setBatchResult(null); }}>
          🔍 Cari & Cetak ID
        </button>
        <button className={mode === 'batch' ? 'active' : ''} onClick={() => { setMode('batch'); }}>
          🏷️ Cetak QR Kosong
        </button>
      </div>

      {/* SEARCH + PRINT ID */}
      {mode === 'search' && (
        <>
          <div className="search-section" style={{ margin: '1rem 0' }}>
            <form onSubmit={handleSearch} className="modern-search-form">
              <div className="search-input-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Cari nama, HP, atau ID Card..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="modern-search-input"
                />
                {search && (
                  <button type="button" onClick={() => { setSearch(''); setPage(1); }} className="clear-search-btn">✕</button>
                )}
              </div>
              <button type="submit" className="btn-primary">Cari</button>
            </form>
          </div>

          {selectedCustomers.size > 0 && (
            <div className="bulk-actions" style={{ margin: '0.5rem 0', display: 'flex', gap: '0.5rem' }}>
              <button onClick={handlePrintSelected} className="btn-primary">
                🖨️ Cetak {selectedCustomers.size} ID Card
              </button>
              <button onClick={() => setSelectedCustomers(new Set())} className="btn-secondary">
                ✕ Batal
              </button>
            </div>
          )}

          <div className="customer-list">
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
                        <th><input type="checkbox" checked={selectedCustomers.size === customers.length && customers.length > 0} onChange={selectAll} /></th>
                        <th>Nama</th>
                        <th>HP</th>
                        <th>ID Card</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map(c => (
                        <tr key={c.id}>
                          <td><input type="checkbox" checked={selectedCustomers.has(c.id)} onChange={() => toggleSelect(c.id)} /></td>
                          <td>{c.name}</td>
                          <td>{c.phone}</td>
                          <td>{c.id_card || '-'}</td>
                          <td>
                            <button onClick={() => handlePrintID(c)} className="btn-view" title="Cetak ID Card">🖨️</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {pagination && pagination.totalPages > 1 && (
                  <div className="pagination">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-page">←</button>
                    <span className="page-info">{page}/{pagination.totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages} className="btn-page">→</button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* BATCH GENERATE QR */}
      {mode === 'batch' && (
        <div className="batch-section">
          <h3>🏷️ Generate QR Code Kosong</h3>
          <p className="text-muted">Buat QR code batch, cetak, tempel di gantungan kunci/id card. Pelanggan scan + isi data untuk aktivasi.</p>

          {!batchResult ? (
            <>
              <div className="form-group">
                <label>Jumlah Kartu</label>
                <input type="number" value={batchCount} onChange={(e) => setBatchCount(Math.min(200, Math.max(1, parseInt(e.target.value) || 1)))} min="1" max="200" />
                <small className="text-muted">Maks 200</small>
              </div>
              <button onClick={async () => {
                setBatchLoading(true); setError('');
                try {
                  const res = await api.batchGenerateID(batchCount);
                  setBatchResult(res);
                } catch (err) { setError(err.response?.data?.error || 'Gagal'); }
                finally { setBatchLoading(false); }
              }} className="btn-primary" disabled={batchLoading}>
                {batchLoading ? '⏳ Generate...' : `🏷️ Generate ${batchCount} ID`}
              </button>
            </>
          ) : (
            <div className="batch-result">
              <div className="alert success">✅ {batchResult.count} ID Card siap!</div>
              <div className="grid grid-2 qr-card-grid">
                {batchResult.codes.map((item, i) => (
                  <div key={i} className="qr-list-item qr-card-item">
                    <img src={item.qr_image} alt={`ID ${i+1}`} className="qr-thumb" />
                    <span className="qr-code-text">{item.qr_code}</span>
                  </div>
                ))}
              </div>
              <div className="batch-actions" style={{ marginTop: '1rem' }}>
                <button onClick={() => {
                  navigator.clipboard?.writeText(batchResult.codes.map(c => c.qr_code).join('\n'));
                  setSuccess('✅ ID Card dicopy!');
                  setTimeout(() => setSuccess(''), 3000);
                }} className="btn-secondary">📋 Copy All</button>
                <button onClick={() => { setBatchResult(null); setError(''); }} className="btn-secondary">🔄 Lagi</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PrintPage;
