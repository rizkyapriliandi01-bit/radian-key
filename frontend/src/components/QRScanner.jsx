import { useEffect, useRef, useState, useCallback } from 'react';
import jsQR from 'jsqr';

function QRScanner({ onScan }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState('initializing');
  const [error, setError] = useState('');

  const stopCamera = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startScanning = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext('2d');

    const scan = () => {
      if (video.readyState >= video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code) {
          console.log('✅ QR detected:', code.data);
          stopCamera();
          setStatus('detected');
          onScan(code.data);
          return;
        }
      }
      animationRef.current = requestAnimationFrame(scan);
    };
    scan();
  }, [onScan, stopCamera]);

  useEffect(() => {
    let cancelled = false;

    const startCamera = async () => {
      setStatus('requesting');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
        });

        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;

        video.srcObject = stream;

        // Wait for video to be ready
        video.onloadeddata = () => {
          if (cancelled) return;
          video.play().then(() => {
            if (cancelled) return;
            setStatus('scanning');
            startScanning();
          }).catch(() => {});
        };

      } catch (err) {
        if (cancelled) return;
        setStatus('error');
        let msg = 'Tidak dapat mengakses camera';
        
        // Cek jika HTTP non-localhost (browser memblokir WebRTC getUserMedia)
        const isSecure = window.isSecureContext;
        if (!isSecure) {
          msg = '⚠️ Akses camera diblokir browser karena menggunakan HTTP biasa. Silahkan gunakan HTTPS atau koneksi localhost.';
          alert(msg);
        } else if (err.name === 'NotAllowedError') {
          msg = 'Izin camera ditolak. Klik icon 🔒 di address bar.';
        } else if (err.name === 'NotFoundError') {
          msg = 'Camera tidak ditemukan.';
        } else if (err.name === 'NotReadableError') {
          msg = 'Camera dipakai app lain.';
        } else {
          msg = `${err.name}: ${err.message}`;
        }
        
        setError(msg);
      }
    };

    startCamera();
    return () => { cancelled = true; stopCamera(); };
  }, [startScanning, stopCamera]);

  return (
    <div className="qr-scanner-custom">
      {/* Video ALWAYS rendered, hidden when not scanning */}
      <div className="scanner-active" style={{ display: status === 'scanning' ? 'block' : 'none' }}>
        <div className="video-container">
          <video ref={videoRef} className="scanner-video" playsInline muted autoPlay />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <div className="scan-overlay">
            <div className="scan-box">
              <div className="corner top-left"></div>
              <div className="corner top-right"></div>
              <div className="corner bottom-left"></div>
              <div className="corner bottom-right"></div>
            </div>
          </div>
        </div>
        <p className="scan-instruction">📱 Arahkan camera ke QR code</p>
      </div>

      {(status === 'initializing' || status === 'requesting') && (
        <div className="scanner-status">
          <div className="spinner"></div>
          <p>{status === 'initializing' ? 'Memulai camera...' : '🔐 Meminta izin camera...'}</p>
        </div>
      )}

      {status === 'error' && (
        <div className="scanner-error">
          <h3>❌ Camera Error</h3>
          <p className="error-message">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-retry">
            🔄 Refresh & Coba Lagi
          </button>
        </div>
      )}

      {status === 'detected' && (
        <div className="scanner-success">
          <div className="success-icon">✅</div>
          <p>QR Code terdeteksi!</p>
        </div>
      )}
    </div>
  );
}

export default QRScanner;
