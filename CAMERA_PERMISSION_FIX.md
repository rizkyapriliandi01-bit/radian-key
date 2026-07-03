# 🔴 CAMERA PERMISSION DENIED - ROOT CAUSE & FIX

## Root Cause: HTTP → HTTPS Permission Reset

Ketika ganti dari HTTP ke HTTPS, browser treats them as **2 DIFFERENT SITES**:
- `http://192.168.1.13:5173` = Site A
- `https://192.168.1.13:5173` = Site B (different origin!)

Permission camera yang sudah di-allow di HTTP **TIDAK carry over** ke HTTPS.
Harus grant permission ulang di HTTPS site.

## ✅ SOLUTION - Step by Step

### STEP 1: Clear Old HTTP Site Data

#### Chrome/Edge (Android)
1. Tap **⋮** (3 dots) di browser
2. **Settings** > **Privacy and security** > **Site settings**
3. Cari **"192.168.1.13"** (yang HTTP)
4. Tap **"Clear & reset"**
5. Close semua tab 192.168.1.13

#### Safari (iOS)  
1. **Settings** > **Safari**
2. **Advanced** > **Website Data**
3. Cari **"192.168.1.13"**
4. Swipe left > **Delete**
5. Close Safari tabs

### STEP 2: Fresh Access via HTTPS

1. **Close ALL tabs** 192.168.1.13 yang lama
2. **Buka tab baru**
3. Ketik: `https://192.168.1.13:5173/kasir` (pastikan **https://**)
4. Bypass certificate warning (Advanced > Proceed)
5. Klik tab **"📷 Camera"**

### STEP 3: Grant Permission (Watch Carefully!)

**WAJIB muncul popup dari browser:**
- Chrome: "Allow 192.168.1.13 to use your camera?"
- Safari: "Would you like to allow Camera access?"

**Klik ALLOW/IZINKAN**

**Kalau popup TIDAK muncul:**
- Berarti permission masih cached dari session lama
- Atau sudah di-block permanen
- Lanjut ke Step 4

### STEP 4: Manual Permission Reset (Kalau Popup Tidak Muncul)

#### Chrome/Edge
1. Tap **🔒** (gembok dicoret merah) di address bar
2. Tap **"Permissions"**
3. Cari **"Camera"**
4. Kalau **"Blocked"**: Ubah ke **"Ask"** atau **"Allow"**
5. **Refresh page** (pull down)
6. Popup akan muncul ulang

#### Safari
1. Tap **aA** di address bar
2. **"Website Settings"**
3. **Camera** > ubah ke **"Ask"** atau **"Allow"**
4. **Refresh**

### STEP 5: Verify Console Logs

Buka browser console (chrome://inspect dari PC, connect HP via USB):

Expected logs kalau sukses:
```
🎥 QRScanner mounting...
Protocol: https:
✅ getUserMedia API available
✅ Camera permission granted
📷 Initializing Html5QrcodeScanner...
✅ Scanner initialized
```

Expected logs kalau gagal:
```
🎥 QRScanner mounting...
Protocol: https:
✅ getUserMedia API available
❌ Camera permission denied: NotAllowedError - Permission denied
```

Kalau masih error, screenshot console logs dan kirim.

## 🔍 Additional Checks

### Check 1: Verify HTTPS Protocol
Di address bar, pastikan:
- ✅ `https://192.168.1.13:5173` (gembok dicoret merah = OK)
- ❌ `http://192.168.1.13:5173` (no HTTPS = camera tidak jalan)

### Check 2: System Permission HP

#### Android
**Settings** > **Apps** > **Chrome/Firefox** > **Permissions** > **Camera** = **Allow**

#### iOS  
**Settings** > **Safari** > **Camera** = **Allow**

### Check 3: Camera Not Used by Other App
Close apps yang mungkin pakai camera:
- Instagram, TikTok, Snapchat
- Zoom, WhatsApp video call
- Camera app

Restart browser setelah close apps tersebut.

## 🚨 Common Mistakes

### ❌ Akses via HTTP (bukan HTTPS)
```
http://192.168.1.13:5173  ← SALAH, camera tidak jalan
https://192.168.1.13:5173 ← BENAR
```

### ❌ Tidak Clear Old Site Data
Browser masih ingat permission decision dari HTTP site lama.

### ❌ Popup Permission Tidak Diperhatikan
Kadang popup muncul sekilas di background/notif. 
Kalau accidental tap "Block", permission akan permanen blocked.

### ❌ Certificate Warning Di-skip Salah
Harus klik "Advanced" > "Proceed" dulu sebelum allow camera.

## 🛠️ Emergency Workaround

Kalau camera tetap tidak jalan setelah semua step:

### Option 1: Upload Mode
Di halaman Kasir, klik tab **"📁 Upload"**
- User foto QR code pakai Camera app
- Upload foto dari gallery
- Always works, no permission issue

### Option 2: Manual Mode  
Klik tab **"⌨️ Manual"**
- Kasir ketik QR code manual
- Format: `RADIAN-xxxx-xxxx-xxxx...`
- Fallback untuk troubleshooting

## ✅ Success Indicators

Camera berhasil jalan kalau:
1. ✅ Message: "Arahkan camera ke QR code Radian Key"
2. ✅ Video preview muncul di layar
3. ✅ Ada button untuk switch camera (front/back) kalau device support
4. ✅ Console logs: "✅ Scanner initialized"

## 📞 Next Steps Kalau Masih Gagal

Kirim info berikut:
1. Screenshot page (tampilan error)
2. Screenshot browser console logs (F12)
3. Browser name & version (Chrome 120, Safari iOS 17, dll)
4. Device model (Samsung A52, iPhone 13, dll)
5. Apakah popup permission sempat muncul atau tidak

Dengan info ini bisa diagnose lebih detail.
