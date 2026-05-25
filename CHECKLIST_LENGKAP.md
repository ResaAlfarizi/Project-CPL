# ✅ CHECKLIST LENGKAP - Portal Mahasiswa CPL

## 📦 1. PERSIAPAN DATABASE

### ☐ PostgreSQL Running
```bash
# Cek di pgAdmin atau Services
# PostgreSQL harus status "Running"
```

### ☐ Database Exists
```sql
-- Di pgAdmin, cek database "cpl_db" ada
-- Jika belum, buat dengan:
CREATE DATABASE cpl_db;
```

### ☐ Schema Created
```sql
-- Jalankan file DDL (schema) terlebih dahulu
-- File: database/01_ddl.sql atau sejenisnya
-- Pastikan semua tabel sudah dibuat
```

### ☐ Dummy Data Inserted
```sql
-- Jalankan file: database/06_dummy_data_lengkap.sql
-- Di pgAdmin Query Tool:
-- 1. Copy semua isi file
-- 2. Paste di Query Tool
-- 3. Klik Execute (F5)
-- 4. Pastikan tidak ada error
```

### ☐ Verify Data
```sql
-- Jalankan file: VERIFIKASI_DATABASE.sql
-- Pastikan semua query mengembalikan data yang benar
-- Khususnya cek user mhs1@if.ac.id ada dan password_hash valid
```

---

## 🔧 2. KONFIGURASI BACKEND

### ☐ File .env Exists
```bash
# Lokasi: apps/backend/.env
# Pastikan file ini ada
```

### ☐ .env Configuration
```env
# Isi file .env harus seperti ini:
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_actual_password
DB_NAME=cpl_db
JWT_SECRET=your_secret_key_minimum_32_characters
PORT=3000
```

### ☐ Dependencies Installed
```bash
cd apps/backend
npm install
# Atau jika belum ada package.json, pastikan node_modules ada
```

### ☐ Backend Can Start
```bash
cd apps/backend
node app.js
# Harus muncul: "Backend Modul 1 dan Modul 2 aktif di port 3000"
# Jangan tutup terminal ini!
```

### ☐ Test Backend API
```bash
# Buka terminal BARU
cd apps/backend
node test-api.js
# Semua test harus ✅ Success
```

---

## 🎨 3. KONFIGURASI FRONTEND

### ☐ File .env.local Exists
```bash
# Lokasi: apps/web/module2/.env.local
# Pastikan file ini ada
```

### ☐ .env.local Configuration
```env
# Isi file .env.local:
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### ☐ Dependencies Installed
```bash
cd apps/web/module2
npm install
# Tunggu sampai selesai
```

### ☐ Frontend Can Start
```bash
cd apps/web/module2
npm run dev
# Harus muncul: "Local: http://localhost:3001"
# Jangan tutup terminal ini!
```

---

## 🧪 4. TESTING APLIKASI

### ☐ Open Browser
```
URL: http://localhost:3001/login
```

### ☐ Login Page Loads
- [ ] Halaman login muncul dengan baik
- [ ] Form email dan password terlihat
- [ ] Tombol "Masuk" ada
- [ ] Tidak ada error di console (F12)

### ☐ Login Success
- [ ] Email: `mhs1@if.ac.id`
- [ ] Password: `password123`
- [ ] Klik "Masuk"
- [ ] Tidak ada error "Email atau password salah"
- [ ] Redirect ke `/mahasiswa`

### ☐ Dashboard Loads
- [ ] Halaman dashboard mahasiswa muncul
- [ ] Sidebar terlihat dengan menu:
  - Dashboard
  - Program Studi & CPL (badge R)
  - Mata Kuliah (badge R)
  - Sub-CPMK (badge R)
  - Capaian Mahasiswa
  - Profil Saya
- [ ] Header dengan nama mahasiswa dan foto profil
- [ ] Tidak ada error di console

### ☐ Sidebar Toggle Works
- [ ] Klik hamburger menu (☰)
- [ ] Sidebar collapse/expand
- [ ] Icon-only mode di desktop
- [ ] Overlay mode di mobile

### ☐ Profile Dropdown Works
- [ ] Klik foto profil di top-right
- [ ] Dropdown muncul dengan:
  - Lihat Profil
  - Logout
- [ ] Klik "Lihat Profil" → redirect ke `/mahasiswa/profil`
- [ ] Klik "Logout" → redirect ke `/login`

---

## 📊 5. TESTING FITUR

### ☐ Program Studi & CPL
- [ ] Klik menu "Program Studi & CPL"
- [ ] Tabel program studi muncul (4 prodi)
- [ ] Search box berfungsi
- [ ] Klik "Lihat CPL" pada salah satu prodi
- [ ] Daftar CPL muncul
- [ ] Tidak ada error di console

### ☐ Mata Kuliah
- [ ] Klik menu "Mata Kuliah"
- [ ] Tabel mata kuliah muncul (15 MK)
- [ ] Search box berfungsi
- [ ] Data terlihat lengkap (kode, nama, SKS, semester)
- [ ] Tidak ada error di console

### ☐ Sub-CPMK
- [ ] Klik menu "Sub-CPMK"
- [ ] Tabel sub-CPMK muncul
- [ ] Search box berfungsi
- [ ] Data terlihat lengkap
- [ ] Tidak ada error di console

### ☐ Capaian Mahasiswa ⭐ (PENTING)
- [ ] Klik menu "Capaian Mahasiswa"
- [ ] Card capaian CPL muncul (5 CPL untuk TL)
- [ ] Setiap CPL menampilkan:
  - Kode CPL (CPL-TL-01, dst)
  - Nama CPL
  - Persentase (~86-87%)
  - Progress bar dengan warna
  - Status (Tercapai/Belum Tercapai)
- [ ] Klik "Lihat Detail"
- [ ] Tabel detail per mata kuliah muncul
- [ ] Tidak ada error "Token tidak ada"
- [ ] Tidak ada error di console

### ☐ Profil Saya
- [ ] Klik menu "Profil Saya" atau dropdown → "Lihat Profil"
- [ ] Data profil muncul:
  - NIM: 23010001
  - Nama: Rizky Kurniawan
  - Email: mhs1@if.ac.id
  - Program Studi: Teknik Lingkungan
  - Angkatan: 2023
- [ ] Tidak ada error di console

---

## 🐛 6. ERROR CHECKING

### ☐ No Console Errors
```
Buka DevTools (F12) → Console
Pastikan tidak ada error merah
```

### ☐ No Network Errors
```
Buka DevTools (F12) → Network
Filter: Fetch/XHR
Pastikan semua request status 200 (hijau)
Tidak ada 401, 404, atau 500
```

### ☐ Token Persists
```
1. Login
2. Buka DevTools → Application → Local Storage
3. Cek ada key "auth_token" dengan value panjang
4. Refresh halaman (F5)
5. Token masih ada
6. Tidak redirect ke login
```

### ☐ API Calls Work
```
Buka DevTools → Network → Fetch/XHR
Klik menu Capaian
Cek request ke: /api/v1/m2/capaian/mahasiswa/my-capaian
Status: 200
Response: Array of capaian data
```

---

## ✅ 7. FINAL VERIFICATION

### ☐ All Features Work
- [ ] Login/Logout berfungsi
- [ ] Semua menu dapat diklik
- [ ] Semua halaman menampilkan data
- [ ] Tidak ada error di console
- [ ] Tidak ada error di network
- [ ] Token tersimpan dengan baik
- [ ] Redirect berfungsi dengan benar

### ☐ Performance Check
- [ ] Halaman load cepat (< 3 detik)
- [ ] Tidak ada lag saat navigasi
- [ ] Animasi smooth
- [ ] Responsive di berbagai ukuran layar

### ☐ UI/UX Check
- [ ] Font Urbanist terload
- [ ] Warna sesuai (dark sidebar #1a1a1a, yellow #FFF063)
- [ ] Badge "R" muncul di menu read-only
- [ ] Progress bar terlihat bagus
- [ ] Spacing dan padding konsisten

---

## 📝 8. DOKUMENTASI

### ☐ Files Created
- [x] CARA_MENJALANKAN.md
- [x] VERIFIKASI_DATABASE.sql
- [x] test-api.js
- [x] CHECKLIST_LENGKAP.md (this file)
- [x] TOKEN_DEBUG_GUIDE.md

### ☐ Code Clean
- [x] Removed excessive logging
- [x] Code formatted properly
- [x] No commented-out code
- [x] Consistent naming conventions

---

## 🎉 SELESAI!

Jika semua checklist di atas ✅, maka aplikasi Portal Mahasiswa CPL sudah berjalan dengan sempurna!

### Kredensial Login:
- **Email**: mhs1@if.ac.id
- **Password**: password123

### URLs:
- **Frontend**: http://localhost:3001
- **Backend**: http://localhost:3000
- **Login**: http://localhost:3001/login
- **Dashboard**: http://localhost:3001/mahasiswa

### Troubleshooting:
Jika ada masalah, lihat file:
- `CARA_MENJALANKAN.md` - Panduan lengkap
- `TOKEN_DEBUG_GUIDE.md` - Debug token issues
- `VERIFIKASI_DATABASE.sql` - Cek database

### Test Backend:
```bash
cd apps/backend
node test-api.js
```

### Test Database:
```sql
-- Di pgAdmin, jalankan:
-- File: VERIFIKASI_DATABASE.sql
```
