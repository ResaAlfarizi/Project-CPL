# 🚀 MULAI DISINI - Portal Mahasiswa CPL

## ⚡ QUICK START (5 Menit)

### 1️⃣ Setup Database (2 menit)

**A. Buka pgAdmin**
- Klik icon pgAdmin di desktop atau Start Menu
- Login dengan password PostgreSQL Anda

**B. Buat Database (jika belum ada)**
- Klik kanan "Databases"
- Pilih "Create" → "Database"
- Nama: `projectcpl`
- Owner: `postgres`
- Klik "Save"

**C. Insert Dummy Data**
- Klik database `projectcpl`
- Klik kanan → "Query Tool"
- Buka file: `database/06_dummy_data_lengkap.sql`
- Copy SEMUA isi file (Ctrl+A, Ctrl+C)
- Paste di Query Tool (Ctrl+V)
- Klik tombol ▶ Execute (atau tekan F5)
- Tunggu sampai muncul "Query returned successfully"

### 2️⃣ Setup Backend (1 menit)

**A. Install Dependencies (jika belum)**
```bash
cd "c:\Users\audina firdaus\OneDrive\Documents\pemweb\UAS CPL\Project-CPL\apps\backend"
npm install express cors dotenv pg bcrypt jsonwebtoken
```

Atau double-click file: `apps/backend/install-dependencies.bat`

**B. Test Koneksi Database**
```bash
cd "c:\Users\audina firdaus\OneDrive\Documents\pemweb\UAS CPL\Project-CPL\apps\backend"
node test-db-connection.js
```

Harus muncul: ✅ DATABASE CONNECTION TEST PASSED

**C. Jalankan Backend**
```bash
cd "c:\Users\audina firdaus\OneDrive\Documents\pemweb\UAS CPL\Project-CPL\apps\backend"
node app.js
```

Harus muncul: `Backend Modul 1 dan Modul 2 aktif di port 3000`

**JANGAN TUTUP TERMINAL INI!**

### 3️⃣ Setup Frontend (1 menit)

**Buka terminal BARU** (Command Prompt atau PowerShell baru)

```bash
cd "c:\Users\audina firdaus\OneDrive\Documents\pemweb\UAS CPL\Project-CPL\apps\web\module2"
npm run dev
```

Harus muncul: `Local: http://localhost:3001`

**JANGAN TUTUP TERMINAL INI!**

### 4️⃣ Test Aplikasi (1 menit)

**A. Buka Browser**
- URL: `http://localhost:3001/login`

**B. Login**
- Email: `mhs1@if.ac.id`
- Password: `password123`
- Klik "Masuk"

**C. Cek Hasil**
- Harus redirect ke `/mahasiswa`
- Dashboard mahasiswa muncul
- Sidebar dengan menu terlihat
- Tidak ada error

### 5️⃣ Test Fitur

Klik menu di sidebar:
- ✅ Dashboard
- ✅ Program Studi & CPL
- ✅ Mata Kuliah
- ✅ Sub-CPMK
- ✅ Capaian Mahasiswa (harus ada data dengan progress bar)
- ✅ Profil Saya

---

## 🐛 JIKA ADA ERROR

### Error: "Unexpected token <!DOCTYPE"
➡️ Buka file: `PERBAIKAN_CEPAT.md`

### Error: "Cannot connect to database"
```bash
cd apps/backend
node test-db-connection.js
```
Ikuti instruksi yang muncul.

### Error: "Token tidak ada"
1. Buka DevTools (F12) → Console
2. Ketik: `localStorage.clear()`
3. Refresh (F5)
4. Login ulang

### Error: "Port already in use"
- Backend: Tutup terminal backend lama, jalankan ulang
- Frontend: Tutup terminal frontend lama, jalankan ulang

---

## 📁 FILE PENTING

| File | Fungsi |
|------|--------|
| `MULAI_DISINI.md` | 👈 Anda di sini - Panduan utama |
| `PERBAIKAN_CEPAT.md` | Solusi error umum |
| `CARA_MENJALANKAN.md` | Panduan lengkap detail |
| `CHECKLIST_LENGKAP.md` | Checklist verifikasi semua fitur |
| `VERIFIKASI_DATABASE.sql` | Query cek database |
| `apps/backend/test-db-connection.js` | Test koneksi database |
| `apps/backend/test-api.js` | Test backend API |

---

## 🎯 KREDENSIAL LOGIN

### Mahasiswa
- **Email**: mhs1@if.ac.id
- **Password**: password123
- **Nama**: Rizky Kurniawan
- **NIM**: 23010001
- **Prodi**: Teknik Lingkungan

### Mahasiswa Lain (untuk testing)
- mhs2@if.ac.id / password123 (Siti Aminah)
- mhs3@if.ac.id / password123 (Budi Prasetyo)
- mhs4@if.ac.id / password123 (Dewi Sartika - Teknik Mesin)
- mhs5@if.ac.id / password123 (Andi Wijaya - Teknik Mesin)

---

## 📊 FITUR YANG TERSEDIA

### ✅ Untuk Mahasiswa (Read-Only)
1. **Dashboard** - Ringkasan data
2. **Program Studi & CPL** - Lihat prodi dan CPL
3. **Mata Kuliah** - Lihat daftar mata kuliah
4. **Sub-CPMK** - Lihat sub-CPMK
5. **Capaian Mahasiswa** - Lihat capaian CPL diri sendiri dengan progress bar
6. **Profil Saya** - Lihat data profil mahasiswa

### 🎨 UI Features
- Dark sidebar (#1a1a1a)
- Yellow accent (#FFF063)
- Pastel colors (Alice Blue, Honeydew)
- Urbanist font
- Sidebar toggle (hamburger menu)
- Profile dropdown (top-right)
- Badge "R" untuk read-only menu
- Progress bar untuk capaian
- Responsive design

---

## 🆘 BUTUH BANTUAN?

### 1. Cek Terminal Backend
Harus ada tulisan: `Backend Modul 1 dan Modul 2 aktif di port 3000`

Jika ada error, screenshot dan kirim.

### 2. Cek Terminal Frontend
Harus ada tulisan: `Local: http://localhost:3001`

Jika ada error, screenshot dan kirim.

### 3. Cek Browser Console
Tekan F12 → Tab "Console"

Jika ada error merah, screenshot dan kirim.

### 4. Cek Network
Tekan F12 → Tab "Network" → Filter "Fetch/XHR"

Klik menu Capaian, lihat request:
- URL: `/api/v1/m2/capaian/mahasiswa/my-capaian`
- Status: harus 200 (hijau)
- Response: harus JSON array

Jika status 401/404/500, screenshot dan kirim.

---

## ✅ SELESAI!

Jika semua langkah di atas berhasil, aplikasi sudah berjalan dengan baik!

**Selamat menggunakan Portal Mahasiswa CPL! 🎉**

---

## 📞 Support

Jika masih ada masalah:
1. Screenshot error
2. Screenshot terminal backend
3. Screenshot terminal frontend
4. Screenshot browser console (F12)
5. Kirim semua screenshot untuk analisis
