# 🚀 Quick Start - Admin Prodi Dashboard

## ✅ User Sudah Ada di Database

```
Email:    admin@if.ac.id
Password: (password yang sudah ada)
Role:     Admin Prodi
```

## 📝 Langkah Cepat (3 Steps)

### **Step 1: Restart Frontend Server**

```bash
# Stop server (Ctrl+C di terminal)

# Clear cache
cd apps/web/module2
rm -rf .next

# Start server
npm run dev
```

**Pastikan server di port 3001:**
```
✓ Ready on http://localhost:3001
```

### **Step 2: Clear Browser Cache**

```
Ctrl + Shift + Delete
→ Clear "Cached images and files"
→ Clear data
```

Atau buka **Incognito** (Ctrl + Shift + N)

### **Step 3: Login**

1. **Buka:** `http://localhost:3001/login`
2. **Login dengan:**
   - Email: `admin@if.ac.id`
   - Password: (password yang sudah Anda gunakan)
3. **Akan redirect ke:** `http://localhost:3001/admin-prodi`

## ✅ Expected Result

Setelah login, Anda akan melihat:

### **Dashboard Admin Prodi**
- ✅ Header dengan user dropdown
- ✅ Sidebar dengan 8 menu items
- ✅ 4 Stats Cards (CPL, CPMK, Dosen, Mahasiswa)
- ✅ 7 Access Rights Cards dengan badge R/W atau R
- ✅ Info banner kuning
- ✅ Responsive design

## 🔍 Jika Masih Error

### **Cek Role di Database**

Jalankan query ini untuk memastikan role sudah benar:

```sql
SELECT 
    u.email,
    r.nama_role,
    ps.kode_prodi,
    u.is_active
FROM users u
JOIN roles r ON u.role_id = r.id
LEFT JOIN program_studi ps ON u.prodi_id = ps.id
WHERE u.email = 'admin@if.ac.id';
```

**Expected Result:**
```
email           | nama_role   | kode_prodi | is_active
----------------|-------------|------------|----------
admin@if.ac.id  | Admin Prodi | TL         | true
```

**Jika role bukan "Admin Prodi", update dengan:**
```sql
UPDATE users 
SET role_id = (SELECT id FROM roles WHERE nama_role = 'Admin Prodi')
WHERE email = 'admin@if.ac.id';
```

### **Cek Console Browser**

Buka Console (F12) dan paste ini:

```javascript
const token = localStorage.getItem('auth_token');
if (token) {
  const decoded = JSON.parse(atob(token.split('.')[1]));
  console.log('Email:', decoded.email);
  console.log('Role:', decoded.role);
}
```

**Role harus:** `"Admin Prodi"` (dengan spasi)

### **Jika Masih 404**

```bash
# Kill all node processes
taskkill /F /IM node.exe

# Clear cache
cd apps/web/module2
rm -rf .next

# Start ulang
npm run dev
```

## 📁 File yang Sudah Dibuat

```
✅ apps/web/module2/app/admin-prodi/
   ├── layout.tsx          (Layout dengan auth)
   ├── page.tsx            (Dashboard utama)
   └── README.md           (Dokumentasi)

✅ apps/web/module2/components/admin-prodi/
   ├── AdminProdiSidebar.tsx   (Sidebar navigasi)
   └── AdminProdiHeader.tsx    (Header dengan dropdown)

✅ apps/web/module2/contexts/AuthContext.tsx (diperbaiki redirect)
```

## 🎯 URL yang Benar

| Halaman | URL |
|---------|-----|
| Login | `http://localhost:3001/login` |
| Admin Prodi | `http://localhost:3001/admin-prodi` |
| Superadmin | `http://localhost:3001/superadmin` |

## 📧 Credentials

```
Email:    admin@if.ac.id
Password: (password yang sudah ada di database)
Role:     Admin Prodi
URL:      http://localhost:3001/admin-prodi
```

## ✅ Checklist

- [ ] Frontend server berjalan di port **3001**
- [ ] Backend server berjalan di port **3000**
- [ ] File `admin-prodi/page.tsx` ada
- [ ] File `admin-prodi/layout.tsx` ada
- [ ] Browser cache sudah dihapus
- [ ] Login di `localhost:3001/login`
- [ ] User `admin@if.ac.id` memiliki role "Admin Prodi"

---

**Status:** ✅ Ready  
**User:** Sudah ada di database  
**Action:** Restart server & login
