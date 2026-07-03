# Cara Menggunakan Radian Key - Input Manual QR

## ✅ FITUR BARU: Input Manual QR Code

Karena camera scan tidak bisa di HTTP (hanya HTTPS/localhost), saya sudah tambahkan **Input Manual**.

## 📱 Cara Pakai dari HP

### 1. Buka Halaman Kasir
```
http://192.168.1.13:5173/kasir
```

### 2. Di Tab "📱 Scan QR", ada 2 tombol:
- **📷 Camera** (tidak akan jalan karena HTTP)
- **⌨️ Input Manual** ← PAKAI INI

### 3. Klik "⌨️ Input Manual"
Akan muncul form input dengan placeholder:
```
RADIAN-xxxx-xxxx-xxxx...
```

### 4. Cara Mendapatkan QR Code Customer

**Opsi A: Daftar Customer Baru**
1. Klik tab "✍️ Daftar Baru"
2. Isi nama + HP
3. QR code akan muncul, contoh:
   ```
   RADIAN-61aa1833-67fd-4f0e-81c4-61b587f9be28
   ```
4. COPY text QR code ini (long press → copy)

**Opsi B: Customer Lama**
- Customer sudah punya QR di gantungan kunci
- Ketik manual atau scan foto QR code

### 5. Test Manual Input
1. Klik "⌨️ Input Manual"
2. Paste QR code: `RADIAN-61aa1833-67fd-4f0e-81c4-61b587f9be28`
3. Klik "🔍 Cari Customer"
4. Data customer akan muncul dengan stamp count

### 6. Tambah Stamp
- Klik tombol "➕ Tambah Stamp"
- Stamp akan bertambah 1
- Saat 8 stamp → voucher aktif otomatis

## 🔧 Troubleshooting

**QR code tidak ditemukan?**
- Pastikan copy full QR code (format: RADIAN-xxxx-xxxx-xxxx-xxxx)
- Cek tidak ada spasi di depan/belakang
- Case sensitive (huruf besar RADIAN)

**Halaman tidak update?**
- Hard refresh browser (Ctrl+Shift+R di desktop)
- Di HP: Clear cache atau force refresh

## 🧪 Test QR Code yang Sudah Ada

Customer test yang bisa dicoba:
```
RADIAN-61aa1833-67fd-4f0e-81c4-61b587f9be28
(Manual Test User, 08999888777)
```

Coba input QR ini untuk test fitur manual input!

## 📸 Solusi QR Scan untuk Production

Jika mau pakai camera scan nanti:

**Opsi 1: Setup HTTPS**
- Butuh SSL certificate (Let's Encrypt gratis)
- Browser hanya allow camera di HTTPS

**Opsi 2: Install sebagai PWA**
- Tambahkan manifest.json
- Install di HP sebagai app
- PWA bisa akses camera

Untuk sekarang, **Input Manual sudah cukup praktis** untuk operasional harian.
