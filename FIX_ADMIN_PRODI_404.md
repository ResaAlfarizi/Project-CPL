# 🔧 Fix: Admin Prodi 404 Error

## 🐛 Masalah
- Halaman `/admin-prodi` return 404 Not Found
- User Admin Prodi belum ada di database
- Redirect di AuthContext salah

## ✅ Solusi (Sudah Diperbaiki)

### 1. **AuthContext Redirect** ✅
File: `apps/web/module2/contexts/AuthContext.tsx`

**Sebelum:**
```typescript
else if (decoded?.role?.toLowerCase() === 'admin' || decoded?.role?.toLowerCase() === 'admin_prodi') {
  router.push('/admin');  // ❌ Salah
}
```

**Sesudah:**
```typescript
else if (decoded?.role?.toLowerCase() === 'admin prodi' || decoded?.role?.toLowerCase() === 'admin_prodi') {
  router.push('/admin-prodi');  // ✅ Benar
}
```

### 2. **Tambah User Admin Prodi ke Database**

Jalankan SQL script ini di database Anda:

```bash
# Masuk ke PostgreSQL
psql -U postgres -d nama_database

# Atau jika menggunakan pgAdmin, copy-paste SQL di bawah
```

**SQL Script:**
```sql
-- File: ADD_ADMIN_PRODI_USER.sql
-- Sudah dibuat di root project

-- Jalankan dengan:
\i ADD_ADMIN_PRODI_USER.sql

-- Atau copy-paste isi file tersebut
```

**Credentials:**
- Email: `adminprodi@example.com`
- Password: `admin123`
- Role: `Admin Prodi`

## 🚀 Langkah-Langkah Testing

### Step 1: Restart Development Server

```bash
# Stop server (Ctrl+C)
# Kemudian start ulang:
cd apps/web/module2
npm run dev
```

### Step 2: Tambah User Admin Prodi

**Opsi A: Menggunakan SQL Script**
```bash
# Di terminal PostgreSQL
psql -U postgres -d cpl_database
\i ADD_ADMIN_PRODI_USER.sql
```

**Opsi B: Manual via pgAdmin**
1. Buka pgAdmin
2. Connect ke database
3. Klik kanan pada database → Query Tool
4. Copy-paste isi file `ADD_ADMIN_PRODI_USER.sql`
5. Execute (F5)

**Opsi C: Menggunakan Existing User**
Jika sudah ada user dengan email `admin.ti@cpl.ac.id`:
- Email: `admin.ti@cpl.ac.id`
- Password: `admin123`
- Role: `Admin Prodi`

### Step 3: Clear Browser Cache

```bash
# Chrome/Edge
Ctrl + Shift + Delete
# Pilih "Cached images and files"
# Clear data

# Atau buka Incognito/Private window
Ctrl + Shift + N
```

### Step 4: Login

1. Buka: `http://localhost:3000/login`
2. Login dengan:
   - Email: `adminprodi@example.com`
   - Password: `admin123`
3. Seharusnya redirect ke: `http://localhost:3000/admin-prodi`

### Step 5: Verifikasi

Cek di console browser (F12):
- Tidak ada error 404
- Tidak ada error JavaScript
- Dashboard muncul dengan benar

## 🔍 Troubleshooting

### Masalah 1: Masih 404 setelah restart
**Solusi:**
```bash
# Clear Next.js cache
cd apps/web/module2
rm -rf .next
npm run dev
```

### Masalah 2: User tidak bisa login
**Cek di database:**
```sql
-- Verifikasi user ada
SELECT u.email, r.nama_role, u.is_active 
FROM users u 
JOIN roles r ON u.role_id = r.id 
WHERE u.email = 'adminprodi@example.com';

-- Pastikan:
-- 1. User ada
-- 2. is_active = true
-- 3. role = 'Admin Prodi'
```

### Masalah 3: Redirect ke halaman lain
**Cek role di token:**
```javascript
// Di browser console (F12)
const token = localStorage.getItem('auth_token');
const decoded = JSON.parse(atob(token.split('.')[1]));
console.log('Role:', decoded.role);

// Pastikan role = "Admin Prodi" atau "admin_prodi"
```

### Masalah 4: Layout tidak muncul
**Cek file structure:**
```bash
# Pastikan file-file ini ada:
apps/web/module2/app/admin-prodi/
├── layout.tsx          ✅
├── page.tsx            ✅
└── README.md           ✅

apps/web/module2/components/admin-prodi/
├── AdminProdiSidebar.tsx   ✅
└── AdminProdiHeader.tsx    ✅
```

## 📝 Verifikasi Database

### Cek Role Admin Prodi
```sql
SELECT * FROM roles WHERE nama_role = 'Admin Prodi';
-- Harus return 1 row
```

### Cek Program Studi
```sql
SELECT * FROM program_studi LIMIT 5;
-- Harus ada minimal 1 prodi
```

### Cek User Admin Prodi
```sql
SELECT 
    u.email,
    r.nama_role,
    ps.nama_prodi,
    u.is_active
FROM users u
JOIN roles r ON u.role_id = r.id
LEFT JOIN program_studi ps ON u.prodi_id = ps.id
WHERE r.nama_role = 'Admin Prodi';
-- Harus return minimal 1 user
```

## 🎯 Quick Fix Commands

```bash
# 1. Stop server
Ctrl + C

# 2. Clear cache
cd apps/web/module2
rm -rf .next

# 3. Restart server
npm run dev

# 4. Clear browser cache
Ctrl + Shift + Delete

# 5. Login ulang
# Buka: http://localhost:3000/login
```

## 📧 Test Credentials

### Admin Prodi (Baru)
- Email: `adminprodi@example.com`
- Password: `admin123`
- URL: `http://localhost:3000/admin-prodi`

### Admin Prodi (Existing - jika ada)
- Email: `admin.ti@cpl.ac.id`
- Password: `admin123`
- URL: `http://localhost:3000/admin-prodi`

### Superadmin (Untuk Testing)
- Email: `superadmin@example.com`
- Password: `superadmin123`
- URL: `http://localhost:3000/superadmin`

## ✅ Checklist

Pastikan semua ini sudah dilakukan:

- [ ] File `admin-prodi/page.tsx` ada
- [ ] File `admin-prodi/layout.tsx` ada
- [ ] File `components/admin-prodi/AdminProdiSidebar.tsx` ada
- [ ] File `components/admin-prodi/AdminProdiHeader.tsx` ada
- [ ] AuthContext sudah diperbaiki (redirect ke `/admin-prodi`)
- [ ] User Admin Prodi sudah ditambahkan ke database
- [ ] Development server sudah direstart
- [ ] Browser cache sudah dihapus
- [ ] Login dengan credentials yang benar

## 🎉 Expected Result

Setelah semua langkah di atas:

1. ✅ Login berhasil
2. ✅ Redirect ke `/admin-prodi`
3. ✅ Dashboard muncul dengan:
   - Header dengan user dropdown
   - Sidebar dengan menu
   - 4 stats cards
   - 7 access rights cards
   - Info banner
4. ✅ Tidak ada error di console
5. ✅ Responsive di mobile/tablet

## 📞 Jika Masih Bermasalah

1. **Cek Console Browser (F12)**
   - Lihat error apa yang muncul
   - Screenshot dan kirim

2. **Cek Network Tab**
   - Lihat request apa yang 404
   - Cek response body

3. **Cek Terminal Server**
   - Lihat error di terminal
   - Pastikan tidak ada compile error

4. **Restart Semua**
   ```bash
   # Stop server
   Ctrl + C
   
   # Kill all node processes
   taskkill /F /IM node.exe
   
   # Start ulang
   npm run dev
   ```

---

**Last Updated:** May 28, 2026  
**Status:** ✅ Fixed
