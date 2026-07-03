import { useState, useRef } from 'react';
import jsQR from 'jsqr';

function QRUpload({ onScan }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Gagal memuat gambar'));
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      URL.revokeObjectURL(img.src);

      if (code) {
        onScan(code.data);
      } else {
        setError('QR code tidak terdeteksi. Coba foto lebih jelas.');
      }
    } catch (err) {
      setError(err.message || 'Gagal membaca gambar');
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="qr-upload">
      {error && <div className="alert error">{error}</div>}
      <label className="upload-btn">
        {loading ? '⏳ Memproses...' : '📁 Pilih Foto QR Code'}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFile}
          style={{ display: 'none' }}
          disabled={loading}
        />
      </label>
      <p className="scan-hint">Ambil foto atau pilih dari galeri</p>
    </div>
  );
}

export default QRUpload;
