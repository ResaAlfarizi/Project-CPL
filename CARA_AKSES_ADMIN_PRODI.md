# 🚀 Cara Akses Dashboard Admin Prodi

## ❌ Masalah yang Anda Alami

Error: `GET http://localhost:3001/admin 404 (Not Found)`

**Penyebab:**
1. ❌ URL salah: `/admin` → seharusnya `/admin-prodi`
2. ❌ Port salah: `3001` → seharusnya `3000`
3. ❌ Development server belum restart
4. ❌ Role user di database mungkin tidak sesuai

## ✅ Solusi Lengkap

### **Step 1: Stop Development Server**

Di terminal yang menjalankan `npm run dev`, tekan:
```
Ctrl + C
```

### **Step 2: Clear Next.js Cache**

```bash
cd apps/web/module2
rm -rf .next
# Atau di Windows PowerShell:
Remove-Item -Recurse -Force .next
```

### **Step 3: Restart Development Server**

```bash
npm run dev
```

Pastikan server berjalan di **port 3000** (bukan 3001):
```
✓ Ready on http://localhost:3000
```

### **Step 4: Tambah User Admin Prodi ke Database**

**Opsi A: Jalankan SQL Script**
```bash
# Di terminal PostgreSQL
psql -U postgres -d nama_database

# Kemudian jalankan:
\i ADD_ADMIN_PRODI_USER.sql
```

**Opsi B: Manual via pgAdmin**
1. Buka pgAdmin
2. Connect ke database
3. Klik kanan database → Query Tool
4. Copy-paste SQL ini:

```sql
DO $$
DECLARE
    role_admin_prodi_id UUID;
    prodi_ti_id UUID;
BEGIN
    -- Ambil role Admin Prodi
    SELECT id INTO role_admin_prodi_id FROM roles WHERE nama_role = 'Admin Prodi';
    
    -- Ambil prodi pertama
    SELECT id INTO prodi_ti_id FROM program_studi LIMIT 1;

    -- Insert user Admin Prodi
    INSERT INTO users (email, password_hash, role_id, entity_type, prodi_id, is_active) 
    VALUES (
        'adminprodi@example.com',
        '$2b$10$rZ5qH8QqJ5YvK5xK5xK5xOqJ5YvK5xK5xK5xK5xK5xK5xK5xK5xK5',
        role_admin_prodi_id,
        'admin',
        prodi_ti_id,
        true
    )
    ON CONFLICT (email) DO UPDATE 
    SET 
        password_hash = EXCLUDED.password_hash,
        role_id = EXCLUDED.role_id,
        prodi_id = EXCLUDED.prodi_id,
        is_active = true;

    RAISE NOTICE 'User Admin Prodi berhasil ditambahkan!';
END $$;
```

5. Execute (F5)

### **Step 5: Verifikasi User di Database**

Jalankan query ini untuk memastikan user ada:

```sql
SELECT 
    u.email,
    r.nama_role,
    ps.nama_prodi,
    u.is_active
FROM users u
JOIN roles r ON u.role_id = r.id
LEFT JOIN program_studi ps ON u.prodi_id = ps.id
WHERE u.email = 'adminprodi@example.com';
```

**Expected Result:**
```
email                    | nama_role   | nama_prodi          | is_active
-------------------------|-------------|---------------------|----------
adminprodi@example.com   | Admin Prodi | Teknik Informatika  | true
```

### **Step 6: Clear Browser Cache**

**Chrome/Edge:**
```
Ctrl + Shift + Delete
→ Pilih "Cached images and files"
→ Clear data
```

**Atau buka Incognito/Private Window:**
```
Ctrl + Shift + N
```

### **Step 7: Login dengan Benar**

1. **Buka URL yang BENAR:**
   ```
   http://localhost:3000/login
   ```
   ⚠️ **BUKAN** `localhost:3001` atau `/admin`

2. **Login dengan credentials:**
   - **Email**: `adminprodi@example.com`
   - **Password**: `admin123`

3. **Setelah login, akan redirect ke:**
   ```
   http://localhost:3000/admin-prodi
   ```

### **Step 8: Verifikasi Dashboard Muncul**

Anda seharusnya melihat:
- ✅ Header dengan user dropdown
- ✅ Sidebar dengan menu
- ✅ 4 stats cards (CPL, CPMK, Dosen, Mahasiswa)
- ✅ 7 access rights cards dengan badge
- ✅ Info banner kuning

## 🔍 Troubleshooting

### **Masalah 1: Masih redirect ke `/admin`**

**Cek role di token:**
```javascript
// Buka Console Browser (F12)
const token = localStorage.getItem('auth_token');
if (token) {
  const decoded = JSON.parse(atob(token.split('.')[1]));
  console.log('Role:', decoded.role);
}
```

**Role harus salah satu dari:**
- `"Admin Prodi"` (dengan spasi)
- `"admin_prodi"` (dengan underscore)

**Jika role berbeda, update di database:**
```sql
UPDATE users 
SET role_id = (SELECT id FROM roles WHERE nama_role = 'Admin Prodi')
WHERE email = 'adminprodi@example.com';
```

### **Masalah 2: Port 3001 instead of 3000**

**Cek package.json:**
```json
{
  "scripts": {
    "dev": "next dev -p 3000"  // Pastikan port 3000
  }
}
```

**Atau kill process di port 3001:**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Kemudian start ulang di port 3000
npm run dev
```

### **Masalah 3: 404 Not Found**

**Verifikasi file ada:**
```bash
# Cek apakah file-file ini ada:
ls apps/web/module2/app/admin-prodi/
# Harus ada: layout.tsx, page.tsx

ls apps/web/module2/components/admin-prodi/
# Harus ada: AdminProdiSidebar.tsx, AdminProdiHeader.tsx
```

**Jika file tidak ada, berarti belum dibuat. Hubungi saya untuk membuat ulang.**

### **Masalah 4: Compile Error**

**Cek terminal server untuk error:**
```
✓ Compiled successfully
```

**Jika ada error, restart server:**
```bash
Ctrl + C
npm run dev
```

## 📝 Checklist Lengkap

Pastikan semua ini sudah dilakukan:

- [ ] Development server berjalan di **port 3000**
- [ ] File `admin-prodi/page.tsx` ada
- [ ] File `admin-prodi/layout.tsx` ada
- [ ] User Admin Prodi sudah ada di database
- [ ] Role user = "Admin Prodi" atau "admin_prodi"
- [ ] Browser cache sudah dihapus
- [ ] Login di `http://localhost:3000/login` (bukan 3001)
- [ ] Menggunakan credentials yang benar
- [ ] Tidak ada error di console browser
- [ ] Tidak ada error di terminal server

## 🎯 URL yang BENAR

| Halaman | URL yang BENAR | ❌ URL yang SALAH |
|---------|----------------|-------------------|
| Login | `http://localhost:3000/login` | ~~localhost:3001/login~~ |
| Admin Prodi | `http://localhost:3000/admin-prodi` | ~~localhost:3001/admin~~ |
| Superadmin | `http://localhost:3000/superadmin` | ~~localhost:3001/superadmin~~ |

## 📧 Test Credentials

### **Admin Prodi (Baru)**
```
Email:    adminprodi@example.com
Password: admin123
URL:      http://localhost:3000/admin-prodi
```

### **Admin Prodi (Existing - jika ada)**
```
Email:    admin.ti@cpl.ac.id
Password: admin123
URL:      http://localhost:3000/admin-prodi
```

### **Superadmin (Untuk Perbandingan)**
```
Email:    superadmin@example.com
Password: superadmin123
URL:      http://localhost:3000/superadmin
```

## 🎬 Video Tutorial (Step by Step)

### **1. Stop & Restart Server**
```bash
# Terminal 1
Ctrl + C
cd apps/web/module2
rm -rf .next
npm run dev
```

### **2. Tambah User (pgAdmin)**
```
1. Buka pgAdmin
2. Connect ke database
3. Query Tool
4. Paste SQL dari ADD_ADMIN_PRODI_USER.sql
5. Execute (F5)
```

### **3. Login**
```
1. Buka: http://localhost:3000/login
2. Email: adminprodi@example.com
3. Password: admin123
4. Click "Masuk"
5. Redirect ke: http://localhost:3000/admin-prodi
```

## 🆘 Jika Masih Bermasalah

**Kirim screenshot dari:**
1. Terminal server (npm run dev output)
2. Browser console (F12 → Console tab)
3. Browser network tab (F12 → Network tab)
4. URL bar (pastikan URL yang benar)

**Dan jalankan query ini:**
```sql
-- Cek user
SELECT u.email, r.nama_role, u.is_active 
FROM users u 
JOIN roles r ON u.role_id = r.id 
WHERE u.email = 'adminprodi@example.com';

-- Cek role
SELECT * FROM roles WHERE nama_role LIKE '%Admin%';

-- Cek prodi
SELECT * FROM program_studi LIMIT 5;
```

---

**Last Updated:** May 28, 2026  
**Status:** ✅ Ready to Use
