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

        <form onSubmit={handleSearch} className="modern-search-form">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Cari nama, HP, atau ID QR Code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="modern-search-input"
            />
            {search && (
              <button 
                type="button" 
                className="clear-search-btn"
                onClick={() => setSearch('')}
              >
                ✕
              </button>
            )}
          </div>
          <button type="submit" className="btn-primary">
            Cari
          </button>
        </form>

        {customer && (
          <div className="action-buttons">
            <button onClick={handlePrint} className="btn-primary">
              🖨️ Cetak ID Card
            </button>
            <button onClick={handleReset} className="btn-secondary">
              ← Cari Lain
            </button>
          </div>
        )}
      </div>

      {/* Printable Area */}
      {customer && (
        <div className="print-area">
          <div className="card-preview no-print">
            <h3>Preview ID Card</h3>
          </div>

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
        /* Web Preview Styling (non-print mode) */
        .print-area {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 2px dashed #cbd5e1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        .card-preview h3 {
          text-align: center;
          color: #64748b;
          margin-bottom: 1rem;
        }

        .qr-card-print {
          width: 320px;
          height: 200px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.5rem;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: white;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
        
        .qr-card-print.front {
          text-align: center;
        }
        
        .card-header-print h1 {
          font-size: 1.5rem;
          color: #1e293b;
          margin: 0 0 0.25rem 0;
        }
        
        .card-header-print .tagline {
          font-size: 0.8rem;
          color: #64748b;
          margin: 0;
        }
        
        .qr-image-print {
          display: flex;
          justify-content: center;
          margin: 0.5rem 0;
        }
        
        .qr-image-print img {
          width: 90px;
          height: 90px;
          border-radius: 8px;
        }
        
        .customer-info-print h2 {
          font-size: 1.1rem;
          margin: 0.25rem 0 0.15rem 0;
          color: #0f172a;
        }
        
        .customer-info-print p {
          font-size: 0.8rem;
          color: #64748b;
          margin: 0;
        }
        
        .card-footer-print {
          border-top: 1px dashed #cbd5e1;
          padding-top: 0.5rem;
          margin-top: 0.5rem;
        }
        
        .card-footer-print p {
          font-size: 0.75rem;
          color: #4f46e5;
          font-weight: 600;
          margin: 0;
        }
        
        /* Back Side Web Preview */
        .qr-card-print.back h2 {
          font-size: 1.1rem;
          margin: 0 0 0.5rem 0;
          text-align: center;
          color: #0f172a;
        }
        
        .instructions {
          flex: 1;
        }
        
        .instruction-item {
          display: flex;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        
        .instruction-item .step {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #4f46e5;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 0.75rem;
          margin-right: 0.5rem;
          flex-shrink: 0;
        }
        
        .instruction-item p {
          font-size: 0.8rem;
          color: #334155;
          margin: 0;
        }
        
        .contact-info {
          border-top: 1px solid #e2e8f0;
          padding-top: 0.5rem;
          text-align: center;
        }
        
        .contact-info h3 {
          font-size: 0.9rem;
          color: #1e293b;
          margin: 0 0 0.25rem 0;
        }
        
        .contact-info p {
          font-size: 0.7rem;
          color: #64748b;
          margin: 0.15rem 0;
        }
        
        .contact-info .qr-code-text {
          font-family: monospace;
          font-size: 0.65rem;
          color: #94a3b8;
        }

        .qr-labels-sheet {
          display: none; /* Hide sticker sheet in web preview */
        }

        /* ACTUAL PRINTING STYLES (A4 format) */
        @media print {
          body * {
            visibility: hidden;
            box-shadow: none !important;
          }
          
          .print-area, .print-area * {
            visibility: visible;
          }
          
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            border: none;
            display: block; /* Override flex */
          }
          
          .no-print {
            display: none !important;
          }
          
          .page-break {
            page-break-before: always;
          }
          
          /* Card Print Styles - CR-80 Standard Size (85.6mm x 53.98mm) */
          .qr-card-print {
            width: 85.6mm;
            height: 54mm;
            border: 1px solid #999; /* Fine border for cutting guide */
            border-radius: 3mm;
            padding: 4mm;
            margin-bottom: 5mm;
            box-sizing: border-box;
            background: white !important;
            -webkit-print-color-adjust: exact;
            page-break-inside: avoid;
            box-shadow: none;
          }
          
          .qr-card-print.front {
            text-align: center;
          }
          
          .card-header-print h1 {
            font-size: 16pt;
            margin: 0 0 1mm 0;
            color: black;
          }
          
          .card-header-print .tagline {
            font-size: 8pt;
            color: #444;
          }
          
          .qr-image-print {
            margin: 1.5mm auto;
          }
          
          .qr-image-print img {
            width: 22mm;
            height: 22mm;
          }
          
          .customer-info-print h2 {
            font-size: 12pt;
            margin: 1mm 0 0.5mm 0;
            color: black;
          }
          
          .customer-info-print p {
            font-size: 9pt;
            color: #333;
          }
          
          .card-footer-print {
            border-top: 1px dashed #ccc;
            padding-top: 1.5mm;
            margin-top: 1mm;
          }
          
          .card-footer-print p {
            font-size: 7.5pt;
            color: black;
            font-weight: bold;
          }
          
          /* Back Side Print */
          .qr-card-print.back h2 {
            font-size: 12pt;
            margin: 0 0 2mm 0;
            text-align: center;
          }
          
          .instructions {
            flex: 1;
          }
          
          .instruction-item {
            margin-bottom: 1.5mm;
          }
          
          .instruction-item .step {
            width: 5mm;
            height: 5mm;
            background: #222 !important;
            font-size: 8pt;
            margin-right: 2mm;
          }
          
          .instruction-item p {
            font-size: 8pt;
            color: black;
          }
          
          .contact-info {
            border-top: 1px solid #ccc;
            padding-top: 1.5mm;
          }
          
          .contact-info h3 {
            font-size: 9pt;
            color: black;
          }
          
          .contact-info p {
            font-size: 7pt;
            color: #333;
          }
          
          .contact-info .qr-code-text {
            font-size: 6pt;
            color: #666;
          }
          
          /* Sticker Sheet format for printing */
          .qr-labels-sheet {
            display: grid !important;
            width: 100%;
            grid-template-columns: repeat(3, 1fr);
            gap: 3mm;
            padding: 0;
          }
          
          .qr-label-small {
            width: 65mm;
            height: 40mm;
            border: 1px dashed #999;
            padding: 2mm;
            box-sizing: border-box;
            page-break-inside: avoid;
          }
          
          .label-content {
            border: 1px solid #ccc;
            border-radius: 2mm;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 2mm;
            text-align: center;
          }
          
          .label-header {
            font-size: 8pt;
            margin-bottom: 1mm;
            font-weight: bold;
          }
          
          .qr-small {
            width: 18mm;
            height: 18mm;
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
          }
        }
      `}</style>
    </div>
  );
}

export default PrintQRPage;
