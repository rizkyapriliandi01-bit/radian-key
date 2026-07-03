import { useState } from 'react';
import { api } from '../api';

function PrintQRPage() {
  const [search, setSearch] = useState('');
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) {
      setError('Masukkan nama, HP, atau QR code');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await api.getAdminCustomers(1, 50, search);
      const customers = data.customers;
      if (customers.length === 0) {
        setError('Customer tidak ditemukan');
        setCustomer(null);
      } else if (customers.length === 1) {
        const custData = await api.getCustomerByQR(customers[0].qr_code);
        setCustomer(custData);
      } else {
        setError(`Ditemukan ${customers.length} customer, perlu lebih spesifik`);
        setCustomer(null);
      }
    } catch (err) {
      setError('Gagal mencari customer');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    setCustomer(null);
    setSearch('');
    setError('');
  };

  return (
    <div className="print-qr-page">
      <div className="no-print">
        <h2>🖨️ Cetak QR Code</h2>
        <p className="subtitle">Cari customer untuk cetak QR gantungan kunci</p>

        {error && <div className="alert error">{error}</div>}
        {loading && <div className="alert info">Mencari...</div>}

        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Nama, HP, atau QR code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn-search">
            🔍 Cari
          </button>
        </form>

        {customer && (
          <div className="action-buttons">
            <button onClick={handlePrint} className="btn-print">
              🖨️ Print
            </button>
            <button onClick={handleReset} className="btn-reset">
              ← Cari Lain
            </button>
          </div>
        )}
      </div>

      {/* Printable Area */}
      {customer && (
        <div className="print-area">
          {/* Card 1 - Front Side */}
          <div className="qr-card-print front">
            <div className="card-header-print">
              <h1>🔑 Radian Key</h1>
              <p className="tagline">Loyalty Card</p>
            </div>
            
            <div className="qr-image-print">
              <img src={customer.qr_image} alt="QR Code" />
            </div>

            <div className="customer-info-print">
              <h2>{customer.name}</h2>
              <p>{customer.phone}</p>
            </div>

            <div className="card-footer-print">
              <p>🎁 Kumpulkan 8 stamp → Voucher Rp15.000</p>
            </div>
          </div>

          {/* Page Break */}
          <div className="page-break"></div>

          {/* Card 2 - Back Side Info */}
          <div className="qr-card-print back">
            <h2>Cara Pakai:</h2>
            <div className="instructions">
              <div className="instruction-item">
                <span className="step">1</span>
                <p>Tunjukkan QR ini ke kasir saat belanja</p>
              </div>
              <div className="instruction-item">
                <span className="step">2</span>
                <p>Dapatkan 1 stamp setiap transaksi</p>
              </div>
              <div className="instruction-item">
                <span className="step">3</span>
                <p>Kumpulkan 8 stamp</p>
              </div>
              <div className="instruction-item">
                <span className="step">4</span>
                <p>Tukar voucher Rp15.000</p>
              </div>
            </div>

            <div className="contact-info">
              <h3>📍 Radian Studio</h3>
              <p>Stationery • Print • 3D Printing</p>
              <p className="qr-code-text">{customer.qr_code}</p>
            </div>
          </div>

          {/* Additional QR Labels (Small Format) */}
          <div className="page-break"></div>
          
          <div className="qr-labels-sheet">
            <h3 className="no-print">Label Tambahan (Potong Sesuai Garis)</h3>
            
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="qr-label-small">
                <div className="label-content">
                  <div className="label-header">
                    <strong>🔑 Radian Key</strong>
                  </div>
                  <img src={customer.qr_image} alt="QR" className="qr-small" />
                  <div className="label-info">
                    <p className="name">{customer.name}</p>
                    <p className="code">{customer.qr_code.substring(7, 19)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-before: always;
          }
          
          /* Card Print Styles */
          .qr-card-print {
            width: 85mm;
            height: 55mm;
            border: 2px solid #333;
            border-radius: 8mm;
            padding: 5mm;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            background: white;
            page-break-inside: avoid;
          }
          
          .qr-card-print.front {
            text-align: center;
          }
          
          .card-header-print h1 {
            font-size: 24pt;
            margin: 0 0 2mm 0;
          }
          
          .card-header-print .tagline {
            font-size: 10pt;
            margin: 0;
          }
          
          .qr-image-print {
            margin: 2mm 0;
          }
          
          .qr-image-print img {
            width: 30mm;
            height: 30mm;
          }
          
          .customer-info-print h2 {
            font-size: 14pt;
            margin: 2mm 0 1mm 0;
          }
          
          .customer-info-print p {
            font-size: 10pt;
            margin: 0;
          }
          
          .card-footer-print {
            border-top: 1px dashed #666;
            padding-top: 2mm;
          }
          
          .card-footer-print p {
            font-size: 9pt;
            margin: 0;
          }
          
          /* Back Side */
          .qr-card-print.back h2 {
            font-size: 14pt;
            margin: 0 0 3mm 0;
            text-align: center;
          }
          
          .instructions {
            flex: 1;
          }
          
          .instruction-item {
            display: flex;
            align-items: center;
            margin-bottom: 2mm;
          }
          
          .instruction-item .step {
            width: 6mm;
            height: 6mm;
            border-radius: 50%;
            background: #333;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 10pt;
            margin-right: 3mm;
            flex-shrink: 0;
          }
          
          .instruction-item p {
            font-size: 9pt;
            margin: 0;
          }
          
          .contact-info {
            border-top: 1px solid #333;
            padding-top: 2mm;
            text-align: center;
          }
          
          .contact-info h3 {
            font-size: 11pt;
            margin: 0 0 1mm 0;
          }
          
          .contact-info p {
            font-size: 8pt;
            margin: 0.5mm 0;
          }
          
          .contact-info .qr-code-text {
            font-family: monospace;
            font-size: 7pt;
          }
          
          /* Small Labels */
          .qr-labels-sheet {
            width: 100%;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 5mm;
            padding: 5mm;
          }
          
          .qr-label-small {
            width: 60mm;
            height: 40mm;
            border: 1px dashed #999;
            padding: 3mm;
            box-sizing: border-box;
          }
          
          .label-content {
            border: 1px solid #333;
            border-radius: 3mm;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 2mm;
          }
          
          .label-header {
            font-size: 9pt;
            margin-bottom: 1mm;
          }
          
          .qr-small {
            width: 20mm;
            height: 20mm;
            margin: 1mm 0;
          }
          
          .label-info .name {
            font-size: 8pt;
            font-weight: bold;
            margin: 1mm 0 0.5mm 0;
          }
          
          .label-info .code {
            font-size: 6pt;
            font-family: monospace;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default PrintQRPage;
