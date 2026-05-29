# ⚡ QUICK FIX CHECKLIST

## 🚨 LAKUKAN INI SEKARANG!

### 1️⃣ RESTART BACKEND (WAJIB!)
```bash
# Stop backend (Ctrl+C)
cd apps/backend
node app.js
```

### 2️⃣ TAMBAH DATA USER (DOSEN & MAHASISWA)
```sql
-- Jalankan di database PostgreSQL
-- File: ADD_USERS_TEST.sql
-- Akan menambah: 2 Dosen + 3 Mahasiswa
```

### 3️⃣ TAMBAH USER ADMIN PRODI
```sql
-- Jalankan di database PostgreSQL
-- File: FIX_ADMIN_PRODI_USER.sql
```

### 4️⃣ LOGOUT & LOGIN ULANG
- Email: `admin.if@university.ac.id`
- Password: `admin123`

---

## ✅ HASIL YANG DIHARAPKAN

### Dropdown Dosen
- ✅ Muncul: Dr. Ahmad Wijaya
- ✅ Muncul: Dr. Budi Santoso

### Manajemen User
- ✅ Tampil 2 Dosen (Dr. Ahmad Wijaya, Dr. Budi Santoso)
- ✅ Tampil 3 Mahasiswa (Andi Pratama, Budi Setiawan, Citra Dewi)

### Profile Page
- ✅ Email: admin.if@university.ac.id
- ✅ Role: Admin Prodi
- ✅ Prodi: Teknik Informatika

### Greeting
- ✅ "Selamat datang, admin.if"
- ✅ "Admin Prodi Teknik Informatika"

### Tambah Mata Kuliah
- ✅ Mata kuliah TIDAK muncul di tabel (ini normal!)
- ✅ Mata kuliah muncul di dropdown "Tambah Kelas"

---

## 🐛 MASIH ERROR?

### Dropdown Dosen Kosong?
1. Buka Console (F12)
2. Lihat log: `All Dosen`, `Filtered Dosen`
3. Cek database: Jalankan `CHECK_USERS.sql`

### Manajemen User Kosong?
1. Buka Console (F12)
2. Lihat log: `All users from API`, `Final filtered users`
3. Cek database: Jalankan `CHECK_USERS.sql`
4. Pastikan ada user dengan role "Dosen" atau "Mahasiswa"

### Profile "Akses Ditolak"?
1. Cek backend console - ada error?
2. Cek token: `localStorage.getItem('auth_token')`
3. Cek database: Jalankan `CHECK_ADMIN_PRODI_USER.sql`

### Greeting Masih "admin"?
1. Logout dan login ulang
2. Buka Network Tab (F12)
3. Cek response `/api/v1/m2/profile/me`

---

## 📁 FILE SQL YANG PERLU DIJALANKAN

1. ✅ `CHECK_USERS.sql` - Cek user Dosen & Mahasiswa yang ada
2. ✅ `ADD_USERS_TEST.sql` - Tambah 2 dosen + 3 mahasiswa test
3. ✅ `CHECK_ADMIN_PRODI_USER.sql` - Cek user Admin Prodi
4. ✅ `FIX_ADMIN_PRODI_USER.sql` - Tambah user Admin Prodi

---

## 💡 PENTING!

**MATA KULIAH vs KELAS**
- Mata Kuliah = Master data (IF101 - Pemrograman Web)
- Kelas = Instance (IF101 Kelas A, Semester 3, 2024/2025)
- **Tabel hanya tampilkan KELAS**
- **Mata kuliah muncul di DROPDOWN**

**TANPA RESTART BACKEND = TIDAK ADA PERUBAHAN!**

---

Baca detail lengkap di: `LANGKAH_PERBAIKAN_LENGKAP.md`
