# 🚀 Cara Menjalankan Portal Mahasiswa - Mobile Module 2

## ✅ Prerequisites

Pastikan sudah terinstall:
- ✅ Node.js (v16 atau lebih baru)
- ✅ Expo CLI (`npm install -g expo-cli`)
- ✅ Expo Go app di smartphone (download dari Play Store/App Store)
- ✅ Backend module 2 sudah running di `http://172.30.100.119:3000`

## 📱 Langkah-Langkah

### 1. Install Dependencies

```bash
cd apps/mobile/module2
npm install
```

### 2. Konfigurasi API Base URL

Buka file `services/api.js` dan pastikan `API_BASE` sesuai dengan IP backend Anda:

```javascript
const API_BASE = 'http://172.30.100.119:3000/api/v1/m2';
```

**Catatan:** Ganti `172.30.100.119` dengan IP komputer yang menjalankan backend jika berbeda.

### 3. Jalankan Aplikasi

```bash
npm start
# atau
expo start
```

### 4. Scan QR Code

- **Android:** Buka Expo Go app → Scan QR code
- **iOS:** Buka Camera app → Scan QR code → Tap notifikasi

### 5. Login sebagai Mahasiswa

Gunakan kredensial mahasiswa yang sudah ada di database:

**Contoh kredensial:**
```
Email: mahasiswa@example.com
Password: password123
```

**Atau buat user mahasiswa baru di database:**
```sql
-- Jalankan di database backend
INSERT INTO users (email, password, role, entity_type, entity_id, nama) 
VALUES (
  'mahasiswa@uinsa.ac.id', 
  '$2b$10$hashedpassword', -- hash password dengan bcrypt
  'mahasiswa',
  'mahasiswa',
  1, -- ID mahasiswa di tabel mahasiswa
  'Nama Mahasiswa'
);
```

## 🎯 Testing Fitur

Setelah login sebagai mahasiswa, test fitur berikut:

### ✅ Dashboard
- [x] Greeting dengan nama mahasiswa
- [x] Quick access menu (4 cards)
- [x] Preview program studi (3 teratas)
- [x] Navigasi ke halaman lain

### ✅ Program Studi & CPL
- [x] Search program studi
- [x] List program studi dengan badge
- [x] Toggle untuk melihat CPL
- [x] Detail CPL per prodi

### ✅ Mata Kuliah
- [x] Search mata kuliah
- [x] Filter berdasarkan semester
- [x] Card list dengan info lengkap
- [x] Summary total MK dan SKS

### ✅ Sub-CPMK
- [x] Search Sub-CPMK
- [x] Card list dengan badge
- [x] Expand/collapse deskripsi
- [x] Summary total Sub-CPMK

### ✅ Capaian CPL
- [x] Ringkasan capaian per CPL
- [x] Progress bar dengan target
- [x] Status badge (Tercapai/Belum)
- [x] Detail capaian per MK
- [x] Nilai dan persentase

**Note:** Capaian menggunakan dummy data karena endpoint backend belum ada.

### ✅ Profil Mahasiswa
- [x] Avatar dengan initial
- [x] Informasi pribadi (nama, NIM, email)
- [x] Informasi akademik (prodi, jenjang, angkatan)
- [x] Statistik akademik (total kelas, nilai)
- [x] Tombol logout

**Note:** Profil menggunakan fallback data jika endpoint backend belum ada.

## 🔧 Troubleshooting

### Problem: "Network request failed"

**Solusi:**
1. Pastikan backend sudah running
2. Pastikan smartphone dan komputer dalam jaringan yang sama
3. Cek IP address di `services/api.js` sudah benar
4. Coba restart Expo server

### Problem: "Unable to resolve module"

**Solusi:**
```bash
# Clear cache dan reinstall
rm -rf node_modules
npm install
expo start -c
```

### Problem: "Login failed" atau "401 Unauthorized"

**Solusi:**
1. Pastikan kredensial benar
2. Cek database apakah user mahasiswa sudah ada
3. Pastikan role di database adalah `'mahasiswa'` (lowercase)
4. Cek JWT token di backend sudah include role

### Problem: "Sidebar menu tidak muncul untuk mahasiswa"

**Solusi:**
1. Logout dan login ulang
2. Pastikan JWT token memiliki `role: 'mahasiswa'`
3. Cek console log di Expo untuk error

### Problem: "Data tidak muncul"

**Solusi:**
1. Cek network tab di Expo DevTools
2. Pastikan backend endpoint sudah ada dan return data
3. Untuk Capaian & Profil, dummy data akan otomatis muncul jika endpoint belum ada

## 📊 Data Flow

```
Login → JWT Token → Decode Role → 
  ↓
Role = 'mahasiswa' → 
  ↓
Sidebar Menu Mahasiswa → 
  ↓
Screen Mahasiswa → 
  ↓
API Call → Backend/Dummy Data → 
  ↓
Display Data
```

## 🔐 JWT Token Structure

Token harus memiliki struktur:
```json
{
  "id": "user_id",
  "nama": "Nama Mahasiswa",
  "email": "mahasiswa@example.com",
  "role": "mahasiswa",
  "entity_id": "mahasiswa_id",
  "entity_type": "mahasiswa",
  "exp": 1234567890
}
```

## 📡 API Endpoints yang Digunakan

### Existing Endpoints (Sudah Ada di Backend)
- ✅ `POST /api/v1/m2/auth/login` - Login
- ✅ `GET /api/v1/m2/prodi` - Daftar program studi
- ✅ `GET /api/v1/m2/cpl` - Daftar CPL
- ✅ `GET /api/v1/m2/cpl/prodi/:prodiId` - CPL per prodi
- ✅ `GET /api/v1/m2/kelas` - Daftar kelas
- ✅ `GET /api/v1/m2/sub-cpmk` - Daftar Sub-CPMK

### Fallback Endpoints (Menggunakan Dummy Data)
- ⚠️ `GET /api/v1/m2/profile/me` - Profil (fallback ke dummy)
- ⚠️ `GET /api/v1/m2/mahasiswa/capaian/me` - Capaian (dummy data)
- ⚠️ `GET /api/v1/m2/mahasiswa/capaian/me/detail` - Detail capaian (dummy data)

## 🎨 Design Preview

### Dashboard
```
┌─────────────────────────────────┐
│  Selamat Datang 👋              │
│  Nama Mahasiswa                 │
│  Berikut ringkasan aktivitas... │
└─────────────────────────────────┘

┌──────────┐ ┌──────────┐
│ Capaian  │ │ Mata     │
│ CPL      │ │ Kuliah   │
└──────────┘ └──────────┘
┌──────────┐ ┌──────────┐
│ Program  │ │ Sub-     │
│ Studi    │ │ CPMK     │
└──────────┘ └──────────┘

Program Studi
┌─────────────────────────────────┐
│ S1 Informatika                  │
│ [IF] [S1]          [Lihat CPL]  │
└─────────────────────────────────┘
```

### Capaian CPL
```
┌─────────────────────────────────┐
│ CPL-01 [Tercapai]               │
│ Mampu menerapkan pemikiran...   │
│                          85.5%  │
│ ████████████████░░░░░░░░        │
│ Nilai: 85.50                    │
└─────────────────────────────────┘
```

## 💡 Tips

1. **Gunakan Expo Go** untuk testing cepat tanpa build
2. **Hot Reload** otomatis aktif saat edit code
3. **Shake device** untuk buka developer menu
4. **Console.log** akan muncul di terminal Expo
5. **Network tab** di Expo DevTools untuk debug API

## 📝 Notes

- ✅ Aplikasi sudah siap dijalankan tanpa perlu ubah backend
- ✅ Dummy data otomatis digunakan untuk endpoint yang belum ada
- ✅ Semua fitur sudah terintegrasi dengan baik
- ✅ Design konsisten dengan portal dosen
- ⚠️ Untuk production, implementasikan endpoint backend yang sebenarnya

## 🆘 Need Help?

Jika ada masalah:
1. Cek console log di terminal Expo
2. Cek Expo DevTools di browser
3. Restart Expo server dengan `expo start -c`
4. Reinstall dependencies dengan `npm install`

---

**Happy Testing! 🎉**

Jika semua berjalan lancar, Anda akan melihat:
- ✅ Login screen
- ✅ Dashboard mahasiswa dengan quick access
- ✅ Sidebar menu dengan 5 menu mahasiswa
- ✅ Semua screen berfungsi dengan baik
- ✅ Data tampil (dari backend atau dummy)
