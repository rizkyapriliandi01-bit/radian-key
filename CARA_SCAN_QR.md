# 📸 Cara Scan QR Code - 3 Metode

## ✅ SOLUSI LENGKAP untuk Scan QR

Sekarang ada **3 cara scan QR code** di halaman Kasir:

### 1. 📁 UPLOAD FOTO QR (RECOMMENDED untuk HTTP)

**Cara pakai:**
1. Buka `http://192.168.1.13:5173/kasir`
2. Tab "📱 Scan QR"
3. Klik tombol "📁 Upload"
4. Klik tombol besar "📸 Ambil/Upload Foto QR"
5. **Di HP**: Akan buka kamera → ambil foto QR code
6. **Di komputer**: Pilih file foto QR dari disk
7. Sistem auto-scan QR dari foto
8. Customer data langsung muncul

**Keuntungan:**
- ✅ Jalan di HTTP (tidak perlu HTTPS)
- ✅ Bisa ambil foto langsung dari HP
- ✅ Bisa upload foto lama dari galeri
- ✅ Auto-detect QR code dari foto
- ✅ Tidak ada popup permission

---

### 2. 📷 CAMERA LIVE SCAN (Hanya di HTTPS)

**Status**: Akan blank/error di HTTP karena browser security

**Cara buat jalan:**
Perlu setup HTTPS dengan SSL certificate:

```bash
# Install mkcert untuk local SSL
sudo apt install mkcert
mkcert -install
mkcert 192.168.1.13 localhost

# Konfigurasi Vite dengan HTTPS
# Edit vite.config.js tambahkan:
server: {
  https: {
    key: './192.168.1.13-key.pem',
    cert: './192.168.1.13.pem',
  }
}
```

Setelah HTTPS, camera akan jalan perfect.

---

### 3. ⌨️ MANUAL INPUT

Copy-paste QR code text:
```
RADIAN-xxxx-xxxx-xxxx-xxxx
```

---

## 🎯 Workflow untuk Kasir

### Customer Baru:
1. Tab "✍️ Daftar Baru"
2. Isi nama + HP
3. QR code muncul (gambar + text)
4. **PRINT QR** untuk gantungan kunci customer
5. Customer bawa pulang gantungan QR

### Customer Belanja:
1. Customer tunjukkan gantungan QR
2. Kasir klik "📁 Upload"
3. Foto QR pakai HP kasir
4. Auto-scan → data customer muncul
5. Klik "➕ Tambah Stamp"
6. Stamp bertambah 1
7. Saat 8 stamp → voucher Rp15K aktif otomatis
8. Tanya: "Mau pakai voucher sekarang?"
9. Jika ya: Klik "🎟️ Gunakan Voucher"
10. Diskon Rp15,000 applied, stamp reset ke 0

---

## 🧪 Test Upload Feature Sekarang

**Dari HP:**

1. Buka: `http://192.168.1.13:5173/kasir`

2. Klik tab: "📱 Scan QR"

3. Klik tombol: "📁 Upload" (default sudah active)

4. Klik: "📸 Ambil/Upload Foto QR"

5. HP akan buka kamera → foto QR code ini:
   (Generate QR dulu dengan daftar customer baru)

6. Setelah foto, sistem auto-scan

7. Customer data muncul!

---

## 💡 Tips

**QR code tidak terdeteksi?**
- Pastikan foto jelas (tidak blur)
- QR code harus terlihat penuh dalam frame
- Coba foto lebih dekat
- Pastikan cahaya cukup (tidak gelap)

**Upload tidak jalan?**
- Refresh browser (Ctrl+Shift+R)
- Cek network (WiFi sama)
- Clear browser cache

---

## 🚀 Status Fitur

✅ Upload QR (foto → auto-scan) → **READY**  
⚠️ Camera live scan → Perlu HTTPS  
✅ Manual input → **READY**

**REKOMENDASI**: Pakai **Upload** untuk sekarang (paling praktis di HTTP)
