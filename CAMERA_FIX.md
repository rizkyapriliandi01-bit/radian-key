# CAMERA PERMISSION DENIED - TROUBLESHOOTING

## ⚠️ Issue: "Camera permission denied" padahal sudah allow

Ini terjadi karena:
1. Permission di-block sebelumnya dan browser ingat pilihan itu
2. Popup permission tidak benar-benar muncul
3. Browser cache masih pakai session permission lama

## 🔧 FIX - Step by Step

### STEP 1: Reset Permission di Browser

#### Chrome/Edge (Android)
1. Tap **🔒 gembok** di address bar (kiri atas)
2. Tap **"Permissions"** atau **"Site settings"**
3. Cari **"Camera"**
4. Ubah dari **"Blocked/Ask"** ke **"Allow"**
5. **Refresh page** (pull down atau F5)

#### Safari (iOS)
1. Buka **Settings HP** > **Safari**
2. Scroll ke **"Camera"** (bagian Privacy & Security)
3. Ubah dari **"Deny"** ke **"Ask"** atau **"Allow"**
4. Kembali ke Safari, **refresh page**

#### Firefox (Android)
1. Tap **⋮** (3 dots) di browser
2. **Settings** > **Site permissions** > **Camera**
3. Cari **"192.168.1.13"**
4. Toggle **ON**
5. **Refresh page**

### STEP 2: Hard Reload (Clear Cache)
1. **Close tab** yang lama
2. **Buka tab baru**
3. Ketik ulang: `https://192.168.1.13:5173/kasir`
4. Atau force refresh: **Ctrl+Shift+R** / **Cmd+Shift+R**

### STEP 3: Cek System Permission HP

Kadang browser sudah allow, tapi HP system block:

#### Android
1. **Settings** > **Apps** > **Chrome/Firefox**
2. **Permissions** > **Camera**
3. Pastikan **Allow/Enabled**

#### iOS
1. **Settings** > **Safari** (atau **Chrome**)
2. **Camera**
3. Pastikan **ON/Allow**

### STEP 4: Test Permission Manual via Console

Buka browser console (F12 atau chrome://inspect), run:

```javascript
navigator.mediaDevices.getUserMedia({video: true})
  .then(stream => {
    console.log('✅ CAMERA WORKS!');
    stream.getTracks().forEach(t => t.stop());
  })
  .catch(err => {
    console.error('❌ ERROR:', err.name, err.message);
  });
```

**Expected Results:**
- ✅ `CAMERA WORKS!` = Permission OK, app bisa jalan
- ❌ `NotAllowedError` = Permission benar-benar blocked
- ❌ `NotFoundError` = Camera tidak terdeteksi
- ❌ `NotReadableError` = Camera dipakai app lain (close Instagram/TikTok/Zoom)

