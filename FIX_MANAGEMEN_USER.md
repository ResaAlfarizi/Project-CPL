# 🔧 FIX MANAJEMEN USER KOSONG

## 🎯 MASALAH
Halaman **Manajemen User** menampilkan tabel kosong padahal seharusnya ada data Dosen dan Mahasiswa.

## 🔍 PENYEBAB
Tabel kosong karena **TIDAK ADA DATA USER** dengan role **Dosen** atau **Mahasiswa** di database.

Halaman Manajemen User hanya menampilkan user dengan role:
- ✅ **Dosen**
- ✅ **Mahasiswa**

Tidak menampilkan:
- ❌ Superadmin
- ❌ Admin Prodi

## ✅ SOLUSI

### **LANGKAH 1: CEK DATA USER YANG ADA**

Jalankan SQL ini untuk cek user Dosen dan Mahasiswa:

```sql
-- File: CHECK_USERS.sql
SELECT 
    u.id,
    u.email,
    r.nama_role,
    ps.nama_prodi,
    u.is_active
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
LEFT JOIN program_studi ps ON u.prodi_id = ps.id
WHERE r.nama_role IN ('Dosen', 'Mahasiswa')
ORDER BY r.nama_role, u.email;
```

**Hasil yang diharapkan:**
- Jika ada data, akan muncul list user Dosen dan Mahasiswa
- Jika kosong (0 rows), lanjut ke Langkah 2

---

### **LANGKAH 2: TAMBAH DATA USER TEST**

Jalankan SQL ini untuk menambah data test:

```sql
-- File: ADD_USERS_TEST.sql
-- (Jalankan seluruh file)
```

**Data yang akan ditambahkan:**

#### **DOSEN (2 orang)**
1. **Dr. Ahmad Wijaya, S.Kom., M.Kom.**
   - Email: `dosen1@university.ac.id`
   - Password: `admin123`
   - NIDN: `0123456789`

2. **Dr. Budi Santoso, S.T., M.T.**
   - Email: `dosen2@university.ac.id`
   - Password: `admin123`
   - NIDN: `0987654321`

#### **MAHASISWA (3 orang)**
1. **Andi Pratama**
   - Email: `andi.pratama@student.ac.id`
   - Password: `admin123`
   - NIM: `2021001`
   - Angkatan: `2021`

2. **Budi Setiawan**
   - Email: `budi.setiawan@student.ac.id`
   - Password: `admin123`
   - NIM: `2021002`
   - Angkatan: `2021`

3. **Citra Dewi**
   - Email: `citra.dewi@student.ac.id`
   - Password: `admin123`
   - NIM: `2022001`
   - Angkatan: `2022`

---

### **LANGKAH 3: VERIFIKASI DATA**

Setelah menjalankan `ADD_USERS_TEST.sql`, verifikasi dengan query ini:

```sql
-- Hitung jumlah user per role
SELECT 
    r.nama_role,
    COUNT(u.id) as jumlah_user
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
WHERE r.nama_role IN ('Dosen', 'Mahasiswa')
GROUP BY r.nama_role;
```

**Hasil yang diharapkan:**
```
nama_role   | jumlah_user
------------|------------
Dosen       | 2
Mahasiswa   | 3
```

---

### **LANGKAH 4: REFRESH HALAMAN MANAJEMEN USER**

1. Buka halaman **Manajemen User** di aplikasi
2. Tekan **F5** atau **Ctrl+R** untuk refresh
3. Buka **Console Browser** (F12) untuk lihat log

**Console log yang diharapkan:**
```
All users from API: [5 users...]
After role filter: [5 users...]
Final filtered users: [5 users...]
```

---

## 🧪 TESTING

### **Test 1: Lihat Tabel User**
1. Buka halaman **Manajemen User**
2. **HARUS MUNCUL**:
   - 2 Dosen (Dr. Ahmad Wijaya, Dr. Budi Santoso)
   - 3 Mahasiswa (Andi Pratama, Budi Setiawan, Citra Dewi)

### **Test 2: Tambah User Baru**
1. Klik tombol **Tambah User**
2. Isi form:
   - Email: `test.dosen@university.ac.id`
   - Password: `test123`
   - Role: `Dosen`
3. Klik **Simpan**
4. **HARUS MUNCUL**: User baru di tabel

### **Test 3: Edit User**
1. Klik tombol **Edit** pada salah satu user
2. Ubah email atau role
3. Klik **Simpan**
4. **HARUS BERUBAH**: Data user di tabel

### **Test 4: Hapus User**
1. Klik tombol **Hapus** pada salah satu user
2. Konfirmasi hapus
3. **HARUS HILANG**: User dari tabel

---

## 🐛 DEBUGGING

### **Jika Tabel Masih Kosong Setelah Tambah Data**

#### **1. Cek Console Browser (F12)**
Buka Console dan lihat log:

```javascript
All users from API: [...]
After role filter: [...]
Final filtered users: [...]
```

**Analisis:**
- Jika `All users from API` kosong → Backend tidak return data
- Jika `After role filter` kosong → Tidak ada user dengan role Dosen/Mahasiswa
- Jika `Final filtered users` kosong → Ada masalah di filter

#### **2. Cek Backend Console**
Lihat terminal backend, apakah ada error saat hit endpoint `/api/v1/m2/users`?

#### **3. Cek Database**
Jalankan query manual:

```sql
-- Cek user dengan role Dosen/Mahasiswa
SELECT 
    u.id,
    u.email,
    r.nama_role
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
WHERE r.nama_role IN ('Dosen', 'Mahasiswa');
```

Jika query ini return data tapi tabel masih kosong, berarti masalah di backend atau frontend.

#### **4. Cek Backend Route**
Pastikan endpoint `/api/v1/m2/users` terdaftar dan bisa diakses:

```bash
# Test dengan curl atau Postman
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/v1/m2/users
```

---

## 📋 CHECKLIST

- [ ] **Jalankan `CHECK_USERS.sql`** - Cek user yang ada
- [ ] **Jalankan `ADD_USERS_TEST.sql`** - Tambah 2 dosen + 3 mahasiswa
- [ ] **Verifikasi database** - Pastikan data masuk
- [ ] **Refresh halaman** - Tekan F5
- [ ] **Cek console log** - Lihat data yang di-fetch
- [ ] **Test tabel** - Harus muncul 5 user (2 dosen + 3 mahasiswa)

---

## 💡 CATATAN PENTING

### **Tentang Filter User**
- Halaman Manajemen User **TIDAK filter by prodi_id** lagi
- Menampilkan **SEMUA** user dengan role Dosen dan Mahasiswa
- Admin Prodi bisa melihat semua, tapi hanya bisa mengelola yang di prodi-nya

### **Tentang Role**
- Admin Prodi hanya bisa menambah user dengan role: **Dosen** atau **Mahasiswa**
- Tidak bisa menambah: Superadmin atau Admin Prodi lain

### **Tentang Data Test**
- Semua user test menggunakan password: `admin123`
- User test terhubung dengan prodi **Teknik Informatika** (kode: IF)
- Jika prodi Anda berbeda, sesuaikan query di `ADD_USERS_TEST.sql`

---

## 🔗 FILE TERKAIT

1. **`CHECK_USERS.sql`** - Cek user Dosen & Mahasiswa
2. **`ADD_USERS_TEST.sql`** - Tambah data test (2 dosen + 3 mahasiswa)
3. **`apps/web/module2/app/admin-prodi/users/page.tsx`** - Halaman Manajemen User
4. **`apps/web/module2/lib/api.ts`** - API untuk fetch user

---

## 🎯 RINGKASAN

**Masalah**: Tabel Manajemen User kosong  
**Penyebab**: Tidak ada user dengan role Dosen/Mahasiswa di database  
**Solusi**: Jalankan `ADD_USERS_TEST.sql` untuk tambah data test  
**Hasil**: Tabel menampilkan 2 dosen + 3 mahasiswa  

---

**Dibuat**: 2026-05-29  
**Versi**: 1.0
