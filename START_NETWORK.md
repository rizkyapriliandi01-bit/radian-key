# Radian Key - Network Access Setup

## ✅ Servers Configured for LAN Access

Both servers now listen on `0.0.0.0` (all network interfaces).

### Access URLs

**From any device on your LAN:**
- **Kasir**: http://192.168.1.13:5173/kasir
- **Customer**: http://192.168.1.13:5173/customer
- **API**: http://192.168.1.13:3001/api/health

**From this machine (localhost):**
- **Kasir**: http://localhost:5173/kasir
- **Customer**: http://localhost:5173/customer

## 🚀 Start Servers

```bash
cd /home/k/radian-key-app

# Terminal 1 - Backend
cd backend && node server.js

# Terminal 2 - Frontend
cd frontend && npm run dev
```

Both should show:
```
Backend:  🚀 Server running on http://0.0.0.0:3001
Frontend: Local: http://localhost:5173/
          Network: http://192.168.1.13:5173/
```

## 🔧 Troubleshooting

### Jika tidak bisa diakses dari HP/device lain:

1. **Cek firewall**:
   ```bash
   sudo ufw allow 3001
   sudo ufw allow 5173
   ```

2. **Cek server berjalan**:
   ```bash
   ps aux | grep -E "(node|vite)"
   netstat -tlnp | grep -E ":(3001|5173)"
   ```

3. **Test dari terminal**:
   ```bash
   curl http://192.168.1.13:3001/api/health
   curl http://192.168.1.13:5173/kasir
   ```

4. **Clear browser cache** di HP/device

5. **Pastikan di network yang sama** (WiFi yang sama)

### Jika blank page / tidak load:

- Buka browser console (F12) untuk lihat error
- Pastikan JavaScript enabled
- Coba hard refresh (Ctrl+Shift+R)
- Cek API URL di `.env` benar: `http://192.168.1.13:3001/api`

## 📱 Testing

1. Buka http://192.168.1.13:5173/kasir di browser
2. Klik tab "✍️ Daftar Baru"
3. Isi nama + HP
4. Jika QR code muncul → ✅ Working!

## Current Status

- ✅ Backend: Running on 0.0.0.0:3001
- ✅ Frontend: Running on 0.0.0.0:5173
- ✅ API configured: 192.168.1.13:3001
- ✅ Both servers tested: HTTP 200
