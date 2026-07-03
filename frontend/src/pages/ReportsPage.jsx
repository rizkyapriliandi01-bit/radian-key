import { useState, useEffect } from 'react';
import { api } from '../api';

function ReportsPage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getDailyReport(date);
      setReport(data);
    } catch (err) {
      setError('Gagal memuat laporan');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  const handleLoadReport = () => {
    loadReport();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="reports-page">
      <h2>📈 Laporan Harian</h2>
      <p className="subtitle">Lihat aktivitas loyalty program per hari</p>

      {error && <div className="alert error">{error}</div>}
      {loading && <div className="alert info">Memuat laporan...</div>}

      <div className="date-selector">
        <label>Pilih Tanggal:</label>
        <input
          type="date"
          value={date}
          onChange={handleDateChange}
          className="date-input"
        />
        <button onClick={handleLoadReport} className="btn-load">
          📊 Tampilkan Laporan
        </button>
      </div>

      {report && (
        <div className="report-content">
          <h3>Laporan: {new Date(report.date).toLocaleDateString('id-ID', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</h3>

          {/* Summary Cards */}
          <div className="report-summary">
            <div className="summary-card">
              <div className="summary-icon">📝</div>
              <div className="summary-data">
                <div className="summary-value">{report.total_transactions}</div>
                <div className="summary-label">Total Transaksi</div>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">✅</div>
              <div className="summary-data">
                <div className="summary-value">{report.stamps_added}</div>
                <div className="summary-label">Stamp Ditambahkan</div>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">🎟️</div>
              <div className="summary-data">
                <div className="summary-value">{report.vouchers_used}</div>
                <div className="summary-label">Voucher Digunakan</div>
              </div>
            </div>

            <div className="summary-card highlight">
              <div className="summary-icon">💰</div>
              <div className="summary-data">
                <div className="summary-value">{formatCurrency(report.vouchers_revenue)}</div>
                <div className="summary-label">Revenue dari Voucher</div>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">👥</div>
              <div className="summary-data">
                <div className="summary-value">{report.new_registrations}</div>
                <div className="summary-label">Registrasi Baru</div>
              </div>
            </div>
          </div>

          {/* Transactions Detail */}
          <div className="transactions-detail">
            <h4>Detail Transaksi ({report.transactions.length})</h4>
            
            {report.transactions.length === 0 ? (
              <div className="alert info">Tidak ada transaksi pada tanggal ini</div>
            ) : (
              <div className="transactions-table">
                <table>
                  <thead>
                    <tr>
                      <th>Waktu</th>
                      <th>Customer ID</th>
                      <th>Tipe</th>
                      <th>Stamps</th>
                      <th>Voucher</th>
                      <th>Catatan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.transactions.map((t) => (
                      <tr key={t.id}>
                        <td>{new Date(t.created_at).toLocaleTimeString('id-ID')}</td>
                        <td>#{t.customer_id}</td>
                        <td>
                          <span className={`type-badge ${t.type.toLowerCase()}`}>
                            {t.type === 'ADD_STAMP' && '✅ Stamp'}
                            {t.type === 'USE_VOUCHER' && '🎟️ Voucher'}
                            {t.type === 'REGISTER' && '👤 Register'}
                          </span>
                        </td>
                        <td>
                          {t.stamps_before} → {t.stamps_after}
                        </td>
                        <td>
                          {t.voucher_used ? '✓' : '-'}
                        </td>
                        <td className="notes">{t.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Export Button */}
          <div className="report-actions">
            <button onClick={() => window.print()} className="btn-print">
              🖨️ Print Laporan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportsPage;
