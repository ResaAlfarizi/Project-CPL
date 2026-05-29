# 🔧 LANGKAH PERBAIKAN LENGKAP

## ✅ MASALAH YANG SUDAH DIPERBAIKI

### 1. **Syntax Error Backend** ✅
- **Masalah**: Error di `apps/backend/module2/src/routes/index.js` line 18
- **Status**: **SUDAH DIPERBAIKI**
- **Detail**: Syntax error `require("../profileRoutes;` sudah diperbaiki

### 2. **Dropdown Dosen Kosong** ✅
- **Masalah**: Dropdown dosen tidak muncul saat tambah kelas
- **Status**: **KODE SUDAH DIPERBAIKI**
- **Detail**: Filter sudah diubah untuk menampilkan semua dosen (NULL prodi_id atau matching prodi_id)

### 3. **Mata Kuliah Tidak Muncul di Tabel** ✅
- **Masalah**: Mata kuliah yang ditambah tidak muncul di tabel
- **Status**: **SUDAH DIJELASKAN**
- **Detail**: Mata kuliah TIDAK muncul di tabel. Tabel hanya menampilkan **KELAS**. Mata kuliah muncul di **dropdown** saat tambah kelas.

---

## 🚨 LANGKAH WAJIB YANG HARUS DILAKUKAN

### **LANGKAH 1: RESTART BACKEND** ⚠️
Backend HARUS di-restart agar perubahan kode berlaku!

```bash
# 1. Stop backend (tekan Ctrl+C di terminal backend)
# 2. Start ulang backend
cd apps/backend
node app.js
```

**PENTING**: Tanpa restart backend, semua perubahan tidak akan berlaku!

---

### **LANGKAH 2: TAMBAH DATA DOSEN KE DATABASE** 📊

Dropdown dosen kosong karena **TIDAK ADA DATA DOSEN** di database.

#### **A. Cek Dosen yang Ada**
Jalankan SQL ini di database:

```sql
-- File: CHECK_DOSEN.sql
SELECT 
    d.id,
    d.nidn,
    d.nama,
    d.prodi_id,
    ps.nama_prodi,
    u.email
FROM dosen d
LEFT JOIN program_studi ps ON d.prodi_id = ps.id
LEFT JOIN users u ON d.user_id = u.id
ORDER BY d.nama;
```

#### **B. Jika Kosong, Tambah Dosen Test**
Jalankan SQL ini untuk menambah 2 dosen test:

```sql
-- File: ADD_DOSEN_TEST.sql
-- (Jalankan seluruh file ADD_DOSEN_TEST.sql)
```

Dosen yang akan ditambahkan:
- **Dosen 1**: Dr. Ahmad Wijaya (NIDN: 0123456789)
- **Dosen 2**: Dr. Budi Santoso (NIDN: 0987654321)
- **Email**: dosen1@university.ac.id, dosen2@university.ac.id
- **Password**: admin123

---

### **LANGKAH 3: VERIFIKASI ADMIN PRODI USER** 👤

Profile masih menampilkan `admin@example.com` (dummy data) karena user Admin Prodi belum ada atau tidak terhubung dengan prodi.

#### **A. Cek User Admin Prodi**
```sql
-- File: CHECK_ADMIN_PRODI_USER.sql
SELECT 
    u.id,
    u.email,
    r.nama_role,
    u.prodi_id,
    ps.nama_prodi
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
LEFT JOIN program_studi ps ON u.prodi_id = ps.id
WHERE r.nama_role = 'Admin Prodi';
```

#### **B. Jika Tidak Ada, Tambah User Admin Prodi**
```sql
-- File: FIX_ADMIN_PRODI_USER.sql
-- (Jalankan seluruh file FIX_ADMIN_PRODI_USER.sql)
```

User yang akan ditambahkan:
- **Email**: admin.if@university.ac.id
- **Password**: admin123
- **Role**: Admin Prodi
- **Prodi**: Teknik Informatika

---

### **LANGKAH 4: LOGOUT DAN LOGIN ULANG** 🔄

Setelah menambah user Admin Prodi:

1. **Logout** dari aplikasi
2. **Login** dengan kredensial baru:
   - Email: `admin.if@university.ac.id`
   - Password: `admin123`

---

## 🧪 CARA TESTING

### **1. Test Dropdown Dosen**
1. Restart backend ✅
2. Jalankan `ADD_DOSEN_TEST.sql` ✅
3. Buka halaman **Mata Kuliah dan Pemetaan**
4. Klik **Tambah Kelas**
5. Buka dropdown **Dosen Pengampu**
6. **HARUS MUNCUL**: Dr. Ahmad Wijaya dan Dr. Budi Santoso

### **2. Test Profile Page**
1. Restart backend ✅
2. Jalankan `FIX_ADMIN_PRODI_USER.sql` ✅
3. Logout dan login dengan `admin.if@university.ac.id` ✅
4. Buka halaman **Profile**
5. **HARUS MUNCUL**:
   - Email: admin.if@university.ac.id
   - Nama: admin.if
   - Role: Admin Prodi
   - Prodi: Teknik Informatika

### **3. Test Greeting**
1. Setelah login dengan user Admin Prodi
2. Lihat header dan dashboard
3. **HARUS MUNCUL**:
   - Line 1: "Selamat datang, admin.if"
   - Line 2: "Admin Prodi Teknik Informatika"

### **4. Test Tambah Mata Kuliah**
1. Buka halaman **Mata Kuliah dan Pemetaan**
2. Klik **Tambah Mata Kuliah**
3. Isi form:
   - Kode MK: IF101
   - Nama MK: Pemrograman Web
   - SKS: 3
   - Semester: 3 (opsional)
4. Klik **Simpan**
5. **MATA KULIAH TIDAK MUNCUL DI TABEL** (ini normal!)
6. Klik **Tambah Kelas**
7. Buka dropdown **Mata Kuliah**
8. **HARUS MUNCUL**: IF101 - Pemrograman Web (3 SKS)

---

## 🐛 DEBUGGING

### **Jika Dropdown Dosen Masih Kosong**

1. **Buka Console Browser** (F12)
2. **Lihat Console Log**:
   ```
   All Dosen: [...]
   Filtered Dosen: [...]
   User prodi_id: ...
   ```
3. **Cek**:
   - Apakah `All Dosen` ada isinya?
   - Apakah `Filtered Dosen` ada isinya?
   - Apakah `User prodi_id` terdeteksi?

### **Jika Profile Masih "Akses Ditolak"**

1. **Cek Backend Console**:
   - Apakah ada error saat hit `/api/v1/m2/profile/me`?
2. **Cek Token**:
   - Buka Console Browser (F12)
   - Ketik: `localStorage.getItem('auth_token')`
   - Apakah token ada?
3. **Cek Database**:
   - Jalankan `CHECK_ADMIN_PRODI_USER.sql`
   - Apakah user Admin Prodi ada?

### **Jika Greeting Masih "admin"**

1. **Logout dan Login Ulang**
2. **Cek Profile API**:
   - Buka Network Tab (F12)
   - Refresh halaman
   - Cek request ke `/api/v1/m2/profile/me`
   - Apakah response berisi data prodi?

---

## 📋 CHECKLIST LENGKAP

Centang setiap langkah yang sudah dilakukan:

- [ ] **Backend sudah di-restart**
- [ ] **Jalankan `CHECK_DOSEN.sql`** - Cek apakah ada dosen
- [ ] **Jalankan `ADD_DOSEN_TEST.sql`** - Tambah dosen test (jika kosong)
- [ ] **Jalankan `CHECK_ADMIN_PRODI_USER.sql`** - Cek user Admin Prodi
- [ ] **Jalankan `FIX_ADMIN_PRODI_USER.sql`** - Tambah user Admin Prodi (jika tidak ada)
- [ ] **Logout dari aplikasi**
- [ ] **Login dengan `admin.if@university.ac.id`**
- [ ] **Test dropdown dosen** - Harus muncul 2 dosen
- [ ] **Test profile page** - Harus tampil data lengkap
- [ ] **Test greeting** - Harus tampil "Admin Prodi Teknik Informatika"
- [ ] **Test tambah mata kuliah** - Harus muncul di dropdown kelas

---

## 🎯 RINGKASAN

### **Masalah Utama**
1. ❌ Backend belum di-restart
2. ❌ Database kosong (tidak ada dosen)
3. ❌ User Admin Prodi belum ada atau tidak terhubung dengan prodi

### **Solusi**
1. ✅ Restart backend
2. ✅ Jalankan SQL scripts untuk tambah data test
3. ✅ Logout dan login dengan user yang benar

### **File SQL yang Perlu Dijalankan**
1. `CHECK_DOSEN.sql` - Cek dosen
2. `ADD_DOSEN_TEST.sql` - Tambah dosen test
3. `CHECK_ADMIN_PRODI_USER.sql` - Cek user Admin Prodi
4. `FIX_ADMIN_PRODI_USER.sql` - Tambah user Admin Prodi

---

## 💡 CATATAN PENTING

### **Tentang Mata Kuliah vs Kelas**
- **Mata Kuliah** = Master data (IF101 - Pemrograman Web)
- **Kelas** = Instance dari mata kuliah (IF101 Kelas A, Semester 3, 2024/2025)
- **Tabel hanya menampilkan KELAS**, bukan mata kuliah
- **Mata kuliah muncul di dropdown** saat tambah kelas

### **Tentang Dropdown Dosen**
- Dropdown menampilkan dosen dengan `prodi_id = NULL` ATAU `prodi_id = prodi Admin Prodi`
- Jika database kosong, dropdown akan kosong
- Jalankan `ADD_DOSEN_TEST.sql` untuk tambah dosen test

### **Tentang Profile**
- Profile menggunakan endpoint universal: `/api/v1/m2/profile/me`
- Endpoint ini membaca dari tabel `users`, `roles`, dan `program_studi`
- Jika user tidak terhubung dengan prodi, profile akan error
- Pastikan user Admin Prodi memiliki `prodi_id` yang valid

---

## 📞 JIKA MASIH ERROR

Jika setelah mengikuti semua langkah masih error:

1. **Screenshot error message**
2. **Screenshot console browser (F12)**
3. **Screenshot backend console**
4. **Kirim hasil query SQL**:
   - `CHECK_DOSEN.sql`
   - `CHECK_ADMIN_PRODI_USER.sql`

---

**Dibuat**: 2026-05-29
**Versi**: 1.0
