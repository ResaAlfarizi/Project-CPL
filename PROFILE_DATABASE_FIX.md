# Fix Profile - Database Connection Issue

## Masalah
1. Email menampilkan `admin@example.com` (dummy data)
2. Role menampilkan "Admin Prodi" tanpa nama prodi
3. Profile page masih "Akses ditolak"

## Penyebab
1. **Backend query salah** - Query ke tabel `prodi` padahal database pakai `program_studi`
2. **Backend query salah** - Query field `role` (string) padahal database pakai `role_id` (foreign key)
3. **Backend belum di-restart** setelah perubahan

## Solusi

### 1. ✅ Perbaiki Backend Query

**File**: `apps/backend/module2/src/routes/profileRoutes.js`

**Query Lama** (SALAH):
```sql
SELECT u.id, u.email, u.role, u.prodi_id, p.nama_prodi
FROM users u
LEFT JOIN prodi p ON u.prodi_id = p.id  -- ❌ Tabel salah
WHERE u.id = $1
```

**Query Baru** (BENAR):
```sql
SELECT 
  u.id, u.email, u.role_id, u.prodi_id,
  r.nama_role as role,
  ps.nama_prodi, ps.kode_prodi, ps.jenjang
FROM users u
LEFT JOIN roles r ON u.role_id = r.id           -- ✅ Join ke tabel roles
LEFT JOIN program_studi ps ON u.prodi_id = ps.id -- ✅ Tabel program_studi
WHERE u.id = $1
```

### 2. ✅ Struktur Database yang Benar

**Tabel `users`**:
```
- id (uuid)
- email (string)
- password (string)
- role_id (uuid) → foreign key ke tabel roles
- prodi_id (uuid) → foreign key ke tabel program_studi
- entity_id (uuid)
- is_active (boolean)
```

**Tabel `roles`**:
```
- id (uuid)
- nama_role (string) → "Admin Prodi", "Dosen", "Mahasiswa", "Superadmin"
```

**Tabel `program_studi`**:
```
- id (uuid)
- kode_prodi (string) → "IF", "SI", "TI"
- nama_prodi (string) → "Teknik Informatika"
- jenjang (string) → "S1", "S2", "S3"
```

### 3. ⚠️ Cek User Admin Prodi di Database

**Jalankan SQL**:
```sql
-- Cek user Admin Prodi
SELECT 
    u.id, u.email,
    r.nama_role,
    ps.nama_prodi
FROM users u
JOIN roles r ON u.role_id = r.id
LEFT JOIN program_studi ps ON u.prodi_id = ps.id
WHERE r.nama_role = 'Admin Prodi';
```

**Jika Kosong**, jalankan script: `FIX_ADMIN_PRODI_USER.sql`

## Langkah Testing

### 1. Jalankan SQL Check
```sql
-- File: CHECK_ADMIN_PRODI_USER.sql
-- Cek apakah ada user Admin Prodi
```

### 2. Jika Tidak Ada User, Tambahkan
```sql
-- File: FIX_ADMIN_PRODI_USER.sql
-- Tambah user Admin Prodi untuk Teknik Informatika
-- Email: admin.if@university.ac.id
-- Password: admin123
```

### 3. Restart Backend
```bash
cd apps/backend/module2
node app.js
```

**Pastikan muncul**:
```
Server running on port 3000
Database connected
```

### 4. Test Login
1. Logout dari aplikasi
2. Login dengan:
   - Email: `admin.if@university.ac.id`
   - Password: `admin123`

### 5. Test Profile
1. Klik "Profil Saya"
2. Seharusnya muncul:
   - Email: admin.if@university.ac.id
   - Role: Admin Prodi
   - Prodi: Teknik Informatika

### 6. Test Header & Dashboard
1. Header seharusnya menampilkan:
   ```
   Admin - Admin Prodi Teknik Informatika
   ```

2. Dashboard greeting:
   ```
   Selamat datang, admin.if
   Admin Prodi Teknik Informatika
   ```

## Troubleshooting

### Email Masih `admin@example.com`

**Penyebab**: Backend belum di-restart atau masih pakai data fallback

**Solusi**:
1. Restart backend
2. Clear browser cache (Ctrl + Shift + Delete)
3. Logout dan login lagi

### Profile Masih "Akses Ditolak"

**Penyebab**: Route belum terdaftar atau backend belum restart

**Solusi**:
1. Cek file `apps/backend/module2/src/routes/index.js`
2. Pastikan ada: `router.use("/profile", profileRoutes);`
3. Restart backend
4. Cek log backend untuk error

### Nama Prodi Tidak Muncul

**Penyebab**: User tidak punya `prodi_id` atau prodi tidak ada di database

**Solusi**:
```sql
-- Cek prodi_id user
SELECT u.email, u.prodi_id, ps.nama_prodi
FROM users u
LEFT JOIN program_studi ps ON u.prodi_id = ps.id
WHERE u.email = 'admin.if@university.ac.id';

-- Jika prodi_id NULL, update:
UPDATE users
SET prodi_id = (SELECT id FROM program_studi WHERE kode_prodi = 'IF' LIMIT 1)
WHERE email = 'admin.if@university.ac.id';
```

## File yang Diubah

1. ✅ `apps/backend/module2/src/routes/profileRoutes.js`
   - Query diperbaiki untuk join ke `roles` dan `program_studi`

2. ✅ `FIX_ADMIN_PRODI_USER.sql` (NEW)
   - Script untuk tambah user Admin Prodi

3. ✅ `CHECK_ADMIN_PRODI_USER.sql` (EXISTING)
   - Script untuk cek user Admin Prodi

## Expected Result

**Header Dropdown**:
```
┌─────────────────────────────────┐
│ admin.if@university.ac.id       │
│ Admin Prodi Teknik Informatika  │
├─────────────────────────────────┤
│ 👤 Profil Saya                  │
├─────────────────────────────────┤
│ 🚪 Keluar                       │
└─────────────────────────────────┘
```

**Dashboard**:
```
Dashboard Admin Prodi
Selamat datang, admin.if
Admin Prodi Teknik Informatika
```

**Profile Page**:
```
Profil Saya

👨‍💼 admin.if
    Teknik Informatika

Role: Admin Prodi
Status: ✓ Aktif

Informasi Detail:
- Nama: admin.if
- Email: admin.if@university.ac.id
- Program Studi: Teknik Informatika
- Role: Admin Prodi
```

## Status
✅ Backend query diperbaiki
⚠️ Perlu restart backend
⚠️ Perlu cek/tambah user Admin Prodi di database

---

**LANGKAH SELANJUTNYA**:
1. Jalankan `CHECK_ADMIN_PRODI_USER.sql` di database
2. Jika tidak ada user, jalankan `FIX_ADMIN_PRODI_USER.sql`
3. Restart backend
4. Logout dan login lagi dengan user baru
5. Test profile page
