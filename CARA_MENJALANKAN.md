# 🚀 Cara Menjalankan Aplikasi CPL

## 📋 Persiapan

### 1. Pastikan Database Sudah Terisi
Buka **pgAdmin** dan jalankan file dummy data:
```sql
-- File: database/06_dummy_data_lengkap.sql
-- Copy semua isi file dan paste di pgAdmin Query Tool
-- Klik Execute (F5)
```

### 2. Cek Koneksi Database
File `.env` di `apps/backend/.env` harus berisi:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=cpl_db
JWT_SECRET=your_secret_key_here
PORT=3000
```

## 🎯 Menjalankan Aplikasi

### Terminal 1: Backend
```bash
cd "c:\Users\audina firdaus\OneDrive\Documents\pemweb\UAS CPL\Project-CPL\apps\backend"
node app.js
```

**Output yang benar:**
```
Backend Modul 1 dan Modul 2 aktif di port 3000
```

### Terminal 2: Frontend
```bash
cd "c:\Users\audina firdaus\OneDrive\Documents\pemweb\UAS CPL\Project-CPL\apps\web\module2"
npm run dev
```

**Output yang benar:**
```
▲ Next.js 14.x.x
- Local:        http://localhost:3001
```

## 🔐 Login Mahasiswa

1. Buka browser: `http://localhost:3001/login`
2. Masukkan kredensial:
   - **Email**: `mhs1@if.ac.id`
   - **Password**: `password123`
3. Klik "Masuk"
4. Akan redirect ke `/mahasiswa` (Dashboard Mahasiswa)

## ✅ Fitur yang Tersedia

### 1. Dashboard
- Menampilkan ringkasan data mahasiswa

### 2. Program Studi & CPL
- Lihat daftar program studi
- Lihat CPL per program studi
- **Status**: Read-only (badge R)

### 3. Mata Kuliah
- Lihat daftar mata kuliah
- **Status**: Read-only (badge R)

### 4. Sub-CPMK
- Lihat daftar Sub-CPMK
- **Status**: Read-only (badge R)

### 5. Capaian Mahasiswa
- Lihat capaian CPL diri sendiri
- Progress bar dengan persentase
- Status tercapai/belum tercapai
- Detail capaian per mata kuliah

### 6. Profil Saya
- Lihat data profil mahasiswa
- NIM, Nama, Email, Prodi, Angkatan
- **Status**: Read-only

## 🐛 Troubleshooting

### Error: "Token tidak ada"
**Penyebab**: Token tidak tersimpan di localStorage

**Solusi**:
1. Buka DevTools (F12) → Console
2. Ketik: `localStorage.clear()`
3. Refresh halaman (F5)
4. Login ulang

### Error: "Cannot connect to database"
**Penyebab**: PostgreSQL tidak jalan atau koneksi salah

**Solusi**:
1. Buka pgAdmin
2. Pastikan server PostgreSQL running
3. Cek kredensial di `.env` file
4. Restart backend

### Error: "Port 3000 already in use"
**Penyebab**: Backend sudah jalan di terminal lain

**Solusi**:
1. Tutup terminal backend yang lama
2. Atau kill process: `taskkill /F /IM node.exe`
3. Jalankan ulang backend

### Error: "Port 3001 already in use"
**Penyebab**: Frontend sudah jalan di terminal lain

**Solusi**:
1. Tutup terminal frontend yang lama
2. Atau kill process di Task Manager
3. Jalankan ulang frontend

### Halaman Blank / Error 404
**Penyebab**: Frontend belum selesai compile

**Solusi**:
1. Tunggu sampai muncul "compiled successfully"
2. Refresh browser (F5)

### Data Tidak Muncul
**Penyebab**: Dummy data belum diinsert atau token expired

**Solusi**:
1. Cek database di pgAdmin:
   ```sql
   SELECT * FROM mahasiswa;
   SELECT * FROM users WHERE email = 'mhs1@if.ac.id';
   ```
2. Jika kosong, jalankan ulang `06_dummy_data_lengkap.sql`
3. Logout dan login ulang

## 📊 Data Dummy yang Tersedia

### Mahasiswa (10 orang)
- **mhs1@if.ac.id** - Rizky Kurniawan (Teknik Lingkungan 2023)
- **mhs2@if.ac.id** - Siti Aminah (Teknik Lingkungan 2023)
- **mhs3@if.ac.id** - Budi Prasetyo (Teknik Lingkungan 2023)
- **mhs4@if.ac.id** - Dewi Sartika (Teknik Mesin 2023)
- **mhs5@if.ac.id** - Andi Wijaya (Teknik Mesin 2023)

**Password semua mahasiswa**: `password123`

### Program Studi (4 prodi)
- Teknik Lingkungan (TL)
- Teknik Mesin (TM)
- Hukum (HK)
- Desain Komunikasi Visual (DKV)

### CPL (15 CPL)
- 5 CPL untuk Teknik Lingkungan
- 4 CPL untuk Teknik Mesin
- 3 CPL untuk Hukum
- 3 CPL untuk DKV

### Capaian
- Mahasiswa Rizky (mhs1) memiliki 5 CPL dengan nilai ~86-87%
- Data lengkap tersedia untuk testing

## 🔍 Verifikasi Backend

Test backend dengan curl atau Postman:

### 1. Health Check
```bash
curl http://localhost:3000/
```
**Response**: `{"success":true,"message":"Backend Modul 1 & 2 aktif"}`

### 2. Login
```bash
curl -X POST http://localhost:3000/api/v1/m2/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"mhs1@if.ac.id\",\"password\":\"password123\"}"
```
**Response**: `{"message":"Login berhasil","token":"eyJhbGc..."}`

### 3. Get Capaian (dengan token)
```bash
curl http://localhost:3000/api/v1/m2/capaian/mahasiswa/my-capaian \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
**Response**: Array of capaian CPL

## 📞 Bantuan

Jika masih ada error:
1. Screenshot error di console browser (F12)
2. Screenshot error di terminal backend
3. Screenshot error di terminal frontend
4. Kirim semua screenshot untuk analisis
