# Camera QR Scanner - Debug Guide

## Status: ✅ HTTPS READY + ENHANCED PERMISSION HANDLING

Aplikasi sekarang sudah pakai HTTPS dan QRScanner sudah di-upgrade dengan:
- Permission check sebelum init scanner
- Debug logging ke browser console
- Error messages yang jelas
- Status indicator (checking/granted/denied)

## Cara Test Camera dari HP

### 1. Akses via HTTPS
Buka browser di HP, ketik:
```
https://192.168.1.13:5173/kasir
```

### 2. Bypass Certificate Warning
Browser akan warning "Not Secure" karena self-signed certificate:
- **Chrome/Edge**: Klik "Advanced" > "Proceed to 192.168.1.13"
- **Firefox**: Klik "Advanced" > "Accept the Risk"
- **Safari**: Klik "Show Details" > "visit this website"

### 3. Pilih Mode "📷 Camera"
Di halaman Kasir, klik tab "📷 Camera"

### 4. Allow Camera Permission
Browser akan popup "Allow camera?" → **KLIK ALLOW/IZINKAN**

### 5. Check Status
Perhatikan pesan di layar:
- **"🔍 Checking camera permission..."** → sedang cek
- **"Arahkan camera ke QR code"** → ✅ BERHASIL! Scanner aktif
- **"❌ Camera permission denied"** → user tidak izinkan camera
- **"❌ Browser tidak support camera"** → browser tidak compatible

## Debug via Browser Console

Buka Developer Tools di browser HP (Chrome: chrome://inspect):

### Console Logs yang Normal (Sukses)
```
🎥 QRScanner mounting...
Protocol: https:
Host: 192.168.1.13:5173
✅ getUserMedia API available
✅ Camera permission granted
📷 Initializing Html5QrcodeScanner...
✅ Scanner initialized
```

### Console Logs Kalau Error
```
🎥 QRScanner mounting...
Protocol: https:
Host: 192.168.1.13:5173
✅ getUserMedia API available
❌ Camera permission denied: NotAllowedError - Permission denied
```

## Troubleshooting

### Camera Tidak Muncul (Blank Screen)

**1. Pastikan HTTPS**
```bash
# Cek di browser address bar, harus "https://" bukan "http://"
https://192.168.1.13:5173  ✅
http://192.168.1.13:5173   ❌
```

**2. Pastikan Permission Diberikan**
- Browser akan popup "Allow camera"
- Kalau sudah pernah di-block, reset permission di browser settings
- Chrome: Settings > Site Settings > Camera > cari 192.168.1.13 > Allow

**3. Camera Dipakai App Lain**
- Close apps yang pakai camera (Instagram, Zoom, dll)
- Restart browser

**4. Browser Tidak Compatible**
Browsers yang support:
- ✅ Chrome/Edge (Android/iOS)
- ✅ Safari (iOS 14+)
- ✅ Firefox (Android)
- ❌ WebView apps (Facebook in-app browser, Instagram in-app)

Solusi WebView: Tap menu > "Open in Chrome/Safari"

### NotAllowedError
Browser memblok camera permission. Fix:
1. Reload page (F5)
2. Ketika popup "Allow camera" muncul → KLIK ALLOW
3. Kalau popup tidak muncul → reset site permissions di browser settings

### NotFoundError
Device tidak punya camera atau camera tidak terdeteksi:
- Pastikan HP punya camera belakang
- Restart browser
- Restart HP

### NotReadableError
Camera sedang dipakai app lain:
- Close semua apps yang bisa akses camera
- Restart browser

## Alternative Mode Kalau Camera Gagal

Pakai mode lain di tab Kasir:

### 📁 Upload Mode
- User upload foto QR code dari gallery
- Tidak butuh camera permission real-time
- Always works di semua browser

### ⌨️ Manual Mode
- User ketik QR code manual (RADIAN-xxxx-xxxx...)
- Fallback kalau camera sama sekali tidak bisa

## Technical Details

### QRScanner Component Changes
- Added `permissionStatus` state: checking/granted/denied/unsupported
- Added explicit `getUserMedia()` call before init scanner
- Added debug console.log untuk tracking
- Added error display dengan hints
- Stream test diberhentikan setelah permission check (avoid resource leak)

### Html5QrcodeScanner Config
```javascript
{
  fps: 10,
  qrbox: { width: 250, height: 250 },
  aspectRatio: 1.0,
  rememberLastUsedCamera: true,
  showTorchButtonIfSupported: true  // Flashlight kalau device support
}
```

## Verifikasi HTTPS Status

```bash
# Check backend HTTPS
curl -k https://192.168.1.13:3001/api/health

# Check frontend HTTPS
curl -k https://192.168.1.13:5173

# Check ports
ss -tlnp | grep -E ':(3001|5173)'
```

## Next Steps Kalau Masih Gagal

1. Check browser console logs (kirim screenshot console logs)
2. Check status message yang muncul di UI
3. Test dengan browser berbeda (Chrome vs Safari)
4. Test dengan device berbeda (HP lain)
5. Pakai Upload/Manual mode sebagai workaround sementara
