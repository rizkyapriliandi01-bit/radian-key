# 🔑 Radian Key - Loyalty Stamp System

Aplikasi web untuk sistem loyalty stamp dengan QR code. Customer dapat stamp untuk mendapatkan voucher diskon Rp15,000.

## 📋 Fitur

### Mode Kasir
- ✅ Daftar customer baru (nama + HP)
- 📱 Scan QR code customer
- ➕ Tambah stamp otomatis
- 🎉 Aktivasi voucher saat 8 stamp terpenuhi
- 💳 Gunakan voucher discount Rp15,000
- 🖨️ Generate QR code untuk dicetak

### Mode Customer
- 📱 Scan QR code sendiri
- 👀 Lihat jumlah stamp terkumpul (X/8)
- 🎁 Status voucher (aktif/tidak)
- 📅 Info member

## 🛠️ Tech Stack

- **Frontend**: React + Vite, React Router, html5-qrcode, Axios
- **Backend**: Node.js + Express
- **Database**: SQLite
- **QR Code**: qrcode library

## 📦 Installation

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Environment Setup

Backend `.env` sudah dibuat di `backend/.env`:
```
PORT=3001
NODE_ENV=development
```

Frontend `.env` sudah dibuat di `frontend/.env`:
```
VITE_API_URL=http://localhost:3001/api
```

## 🚀 Running the App

### Terminal 1 - Backend
```bash
cd backend
node server.js
```
Backend berjalan di: http://localhost:3001

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```
Frontend berjalan di: http://localhost:5173

## 📱 Cara Pakai

### Skenario 1: Customer Baru
1. Buka http://localhost:5173/kasir
2. Klik tab **"✍️ Daftar Baru"**
3. Isi nama dan nomor HP
4. Klik **"✅ Daftar"**
5. QR code akan muncul (bisa dicetak untuk gantungan kunci 3D print)
6. Sistem otomatis tambah 0 stamp

### Skenario 2: Customer Belanja (Tambah Stamp)
1. Buka http://localhost:5173/kasir
2. Klik tab **"📱 Scan QR"**
3. Scan QR code customer (atau gunakan mode customer untuk generate QR test)
4. Info customer muncul dengan stamp saat ini
5. Klik **"➕ Tambah Stamp"**
6. Stamp bertambah 1

### Skenario 3: Voucher Aktif (8 Stamp)
1. Setelah stamp ke-8, voucher otomatis aktif
2. Muncul notifikasi: **"🎉 Voucher Rp15,000 AKTIF! 🎉"**
3. Tanya customer: "Pakai sekarang?"
   - **Ya**: Klik **"💳 Gunakan Voucher"** → Stamp reset ke 0
   - **Tidak**: Biarkan, voucher tetap tersimpan untuk transaksi berikutnya

### Skenario 4: Customer Cek Sendiri
1. Customer buka http://localhost:5173/customer di HP
2. Scan QR code sendiri
3. Lihat:
   - Jumlah stamp terkumpul
   - Status voucher
   - QR code (untuk tunjukkan ke kasir)

## 🗄️ Database Schema

### Table: customers
```sql
id              INTEGER PRIMARY KEY
name            TEXT NOT NULL
phone           TEXT NOT NULL UNIQUE
qr_code         TEXT NOT NULL UNIQUE
stamps          INTEGER DEFAULT 0
voucher_active  INTEGER DEFAULT 0
created_at      DATETIME
updated_at      DATETIME
```

### Table: transactions
```sql
id              INTEGER PRIMARY KEY
customer_id     INTEGER (FK)
type            TEXT (REGISTER|ADD_STAMP|USE_VOUCHER)
stamps_before   INTEGER
stamps_after    INTEGER
voucher_used    INTEGER DEFAULT 0
notes           TEXT
created_at      DATETIME
```

## 🔌 API Endpoints

### POST /api/customers/register
Daftar customer baru
```json
Request: { "name": "John Doe", "phone": "08123456789" }
Response: { "customer": {...}, "qr_image": "data:image/png;base64,..." }
```

### GET /api/customers/qr/:qrCode
Ambil data customer by QR code

### POST /api/customers/:id/add-stamp
Tambah 1 stamp

### POST /api/customers/:id/use-voucher
Gunakan voucher Rp15,000

### GET /api/customers/:id/history
Riwayat transaksi customer

## 🖨️ Print QR Code untuk Gantungan Kunci

1. Setelah daftar customer baru, QR code muncul di layar
2. Klik kanan pada gambar QR → Save Image
3. Print QR code (ukuran 3x3 cm recommended)
4. 3D print gantungan kunci dengan holder QR code
5. Pasang QR code ke gantungan

## 📱 Mobile Responsive

Aplikasi sudah responsive, bisa diakses dari:
- Desktop (kasir)
- Tablet (kasir)
- Mobile (customer self-check)

## 🔒 Security Notes

- Database lokal (SQLite) di `backend/radian_key.db`
- Tidak ada authentication (untuk internal use)
- Nomor HP harus unique
- QR code unique per customer

## 🐛 Troubleshooting

### Backend tidak jalan
```bash
# Cek port 3001 sedang dipakai
lsof -i :3001
# Kill process jika ada
kill -9 <PID>
```

### Frontend tidak connect ke backend
- Pastikan backend jalan di port 3001
- Cek `frontend/.env` → VITE_API_URL benar

### QR Scanner tidak muncul
- Buka browser dengan HTTPS atau localhost
- Allow camera permission
- Gunakan browser modern (Chrome/Firefox/Safari)

## 📄 License

ISC License - Radian Studio

---

**Dibuat oleh**: Radian Studio  
**Untuk**: Sistem Loyalty Customer Radian Key
