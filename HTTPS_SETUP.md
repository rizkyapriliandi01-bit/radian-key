# HTTPS Setup - Radian Key App

## Status: ✅ AKTIF

Aplikasi Radian Key sekarang berjalan dengan HTTPS (SSL/TLS encryption) untuk keamanan komunikasi.

## URL Akses

### Backend API (HTTPS)
- Local: `https://localhost:3001/api`
- Network: `https://192.168.1.13:3001/api`

### Frontend Web (HTTPS)
- Local: `https://localhost:5173`
- Network: `https://192.168.1.13:5173`

## Cara Akses dari HP

1. Buka browser di HP (Chrome/Safari/Firefox)
2. Ketik: `https://192.168.1.13:5173`
3. Browser akan tampilkan warning "Not Secure" atau "Certificate Error"
4. **Klik "Advanced" > "Proceed to 192.168.1.13"** (atau "Lanjutkan")
5. App akan terbuka dengan HTTPS

### Mengapa Ada Warning?

Certificate yang digunakan adalah **self-signed certificate** (dibuat sendiri dengan mkcert), bukan dari Certificate Authority resmi seperti Let's Encrypt. Ini **AMAN untuk development/local network**, tapi browser akan tetap warning karena certificate tidak dikenal secara global.

## File Certificate

Certificate tersimpan di root project:
- `localhost+3.pem` (certificate)
- `localhost+3-key.pem` (private key)

Valid untuk:
- localhost
- 127.0.0.1
- 192.168.1.13
- ::1 (IPv6)

Expired: **3 Oktober 2028**

## Cara Menjalankan

### Manual
```bash
# Backend
cd ~/radian-key-app/backend
node server.js

# Frontend (terminal baru)
cd ~/radian-key-app/frontend
npm run dev
```

### Auto (pakai start.sh yang lama masih jalan)
```bash
cd ~/radian-key-app
./start.sh
```

## Keuntungan HTTPS

1. ✅ **Enkripsi data** - Data transaksi customer tidak bisa disadap di jaringan
2. ✅ **Browser modern requirement** - Fitur seperti camera/QR scanner butuh HTTPS
3. ✅ **Professional** - Lebih aman dan proper untuk production-like setup

## Technical Details

### Backend Changes
- Menggunakan `https` module Node.js
- Load certificate dari `localhost+3.pem` dan `localhost+3-key.pem`
- Port tetap 3001

### Frontend Changes
- Vite config: serve dengan HTTPS
- API endpoint: update ke `https://192.168.1.13:3001/api`
- Port tetap 5173

## Troubleshooting

### Browser terus block akses
- **Chrome/Edge**: Ketik `thisisunsafe` di halaman warning (tanpa input field, langsung ketik)
- **Firefox**: Klik "Advanced" > "Accept the Risk and Continue"
- **Safari**: Klik "Show Details" > "visit this website"

### Certificate expired (2028+)
Generate ulang certificate:
```bash
cd ~/radian-key-app
mkcert localhost 127.0.0.1 192.168.1.13 ::1
```

### Port already in use
Kill proses lama:
```bash
lsof -ti:3001 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```
