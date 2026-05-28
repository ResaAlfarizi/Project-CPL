# 🎯 Panduan Lengkap - Dashboard Admin Prodi

## ⚙️ Arsitektur Sistem

```
Frontend (Next.js)  →  Port 3001  →  http://localhost:3001
Backend (Express)   →  Port 3000  →  http://localhost:3000
Database (PostgreSQL)  →  Port 5432
```

## 📋 Yang Sudah Dibuat (Frontend Only)

### ✅ File Structure
```
apps/web/module2/
├── app/
│   └── admin-prodi/              ← BARU DIBUAT
│       ├── layout.tsx            ← Layout dengan auth & sidebar
│       ├── page.tsx              ← Dashboard utama
│       └── README.md             ← Dokumentasi
│
├── components/
│   └── admin-prodi/              ← BARU DIBUAT
│       ├── AdminProdiSidebar.tsx ← Sidebar navigasi
│       └── AdminProdiHeader.tsx  ← Header dengan dropdown
│
└── contexts/
    └── AuthContext.tsx           ← SUDAH DIPERBAIKI (redirect)
```

### ✅ Fitur Dashboard
- 4 Stats Cards (CPL, CPMK, Dosen, Mahasiswa)
- 7 Access Rights Cards dengan badge R/W atau R
- Sidebar dengan 8 menu items
- Header dengan user dropdown
- Responsive design
- Smooth animations

## 🔐 Database (TIDAK DIUBAH)

### Role yang Sudah Ada
```sql
SELECT * FROM roles;
```
| nama_role   | deskripsi                      |
|-------------|--------------------------------|
| Superadmin  | Akses penuh seluruh sistem     |
| Admin Prodi | Kelola data satu program studi |
| Dosen       | Input nilai kelas sendiri      |
| Mahasiswa   | Lihat capaian CPL diri sendiri |

### User Admin Prodi (Perlu Ditambahkan)

**Cek apakah sudah ada:**
```sql
-- Jalankan file: CHECK_ADMIN_PRODI_USER.sql
\i CHECK_ADMIN_PRODI_USER.sql
```

**Jika belum ada, tambahkan:**
```sql
-- Jalankan file: INSERT_ADMIN_PRODI_USER.sql
\i INSERT_ADMIN_PRODI_USER.sql
```

**Credentials:**
- Email: `adminprodi@if.ac.id`
- Password: `admin123`
- Role: `Admin Prodi` (dengan spasi)
- Prodi: Teknik Lingkungan (TL)

## 🚀 Cara Menggunakan

### **Step 1: Cek/Tambah User Admin Prodi**

**Opsi A - Via psql:**
```bash
psql -U postgres -d nama_database
\i CHECK_ADMIN_PRODI_USER.sql
# Jika tidak ada user, jalankan:
\i INSERT_ADMIN_PRODI_USER.sql
```

**Opsi B - Via pgAdmin:**
1. Buka pgAdmin
2. Connect ke database
3. Query Tool
4. Copy-paste isi file `INSERT_ADMIN_PRODI_USER.sql`
5. Execute (F5)

### **Step 2: Restart Frontend Server**

```bash
# Stop server (Ctrl+C)
cd apps/web/module2

# Clear cache
rm -rf .next
# Atau di Windows:
Remove-Item -Recurse -Force .next

# Start server
npm run dev
```

**Pastikan server berjalan di port 3001:**
```
✓ Ready on http://localhost:3001
```

### **Step 3: Clear Browser Cache**

```
Ctrl + Shift + Delete
→ Clear "Cached images and files"
→ Clear data
```

Atau buka **Incognito** (Ctrl + Shift + N)

### **Step 4: Login**

1. **Buka:** `http://localhost:3001/login`
2. **Login dengan:**
   - Email: `adminprodi@if.ac.id`
   - Password: `admin123`
3. **Akan redirect ke:** `http://localhost:3001/admin-prodi`

## ✅ Expected Result

Setelah login, Anda akan melihat:

### **Header**
- Toggle sidebar button
- Welcome message
- Notification button (dengan badge merah)
- User profile dropdown

### **Sidebar**
- Logo Admin Prodi 👨‍💼
- 8 Menu items dengan badge:
  - Dashboard
  - Kelola CPL [R/W]
  - Kelola CPMK [R/W]
  - Kelola Sub-CPMK [R/W]
  - Capaian Mahasiswa [R]
  - Mata Kuliah [R/W]
  - Kelola Dosen [R/W]
  - Data Mahasiswa [R]

### **Dashboard Content**
- **4 Stats Cards:**
  - Total CPL (Vanilla gradient 🟡)
  - Total CPMK (Honeydew gradient 🟢)
  - Total Dosen (Alice Blue gradient 🔵)
  - Total Mahasiswa (Ghost White gradient ⚪)

- **7 Access Rights Cards:**
  - Kelola CPL → R/W (Full Access) 🟢
  - Kelola CPMK → R/W (Full Access) 🟢
  - Kelola Sub-CPMK → R/W (Full Access) 🟢
  - Lihat Capaian → R (Read Only) 🔵
  - Kelola Mata Kuliah → R/W (Full Access) 🟢
  - Kelola Dosen → R/W (prodi sendiri) 🟢
  - Lihat Mahasiswa → R (prodi sendiri) 🔵

- **Info Banner** (Vanilla gradient)

## 🔍 Troubleshooting

### **Masalah 1: Masih redirect ke `/admin` bukan `/admin-prodi`**

**Cek role di token:**
```javascript
// Buka Console Browser (F12)
const token = localStorage.getItem('auth_token');
if (token) {
  const decoded = JSON.parse(atob(token.split('.')[1]));
  console.log('Role:', decoded.role);
  console.log('Email:', decoded.email);
}
```

**Role harus:** `"Admin Prodi"` (dengan spasi)

**Jika role berbeda, update di database:**
```sql
UPDATE users 
SET role_id = (SELECT id FROM roles WHERE nama_role = 'Admin Prodi')
WHERE email = 'adminprodi@if.ac.id';
```

### **Masalah 2: 404 Not Found**

**Cek apakah file ada:**
```bash
# Di terminal
ls apps/web/module2/app/admin-prodi/
# Harus ada: layout.tsx, page.tsx

ls apps/web/module2/components/admin-prodi/
# Harus ada: AdminProdiSidebar.tsx, AdminProdiHeader.tsx
```

**Jika file tidak ada, berarti belum dibuat. Hubungi saya.**

### **Masalah 3: Server di port salah**

**Frontend harus di port 3001:**
```bash
# Cek package.json
cat apps/web/module2/package.json | grep "dev"

# Seharusnya:
"dev": "next dev -p 3001"
```

**Backend harus di port 3000:**
```bash
# Cek .env atau app.js
cat apps/backend/.env | grep PORT
# Atau
cat apps/backend/app.js | grep listen
```

### **Masalah 4: Compile Error**

**Cek terminal untuk error:**
```
✓ Compiled successfully
```

**Jika ada error:**
```bash
Ctrl + C
rm -rf .next
npm run dev
```

## 📝 Checklist

Pastikan semua ini sudah dilakukan:

- [ ] User Admin Prodi sudah ada di database
- [ ] Role user = "Admin Prodi" (dengan spasi)
- [ ] Frontend server berjalan di **port 3001**
- [ ] Backend server berjalan di **port 3000**
- [ ] File `admin-prodi/page.tsx` ada
- [ ] File `admin-prodi/layout.tsx` ada
- [ ] File `components/admin-prodi/AdminProdiSidebar.tsx` ada
- [ ] File `components/admin-prodi/AdminProdiHeader.tsx` ada
- [ ] AuthContext sudah diperbaiki
- [ ] Browser cache sudah dihapus
- [ ] Login di `http://localhost:3001/login`
- [ ] Tidak ada error di console browser
- [ ] Tidak ada error di terminal server

## 🎯 URL yang BENAR

| Halaman | URL | Port |
|---------|-----|------|
| Login | `http://localhost:3001/login` | 3001 (Frontend) |
| Admin Prodi | `http://localhost:3001/admin-prodi` | 3001 (Frontend) |
| Superadmin | `http://localhost:3001/superadmin` | 3001 (Frontend) |
| API Backend | `http://localhost:3000/api/...` | 3000 (Backend) |

## 📧 Test Credentials

### **Admin Prodi (Baru)**
```
Email:    adminprodi@if.ac.id
Password: admin123
Role:     Admin Prodi
Prodi:    Teknik Lingkungan (TL)
URL:      http://localhost:3001/admin-prodi
```

### **Superadmin (Untuk Perbandingan)**
```
Email:    superadmin@example.com
Password: superadmin123
Role:     Superadmin
URL:      http://localhost:3001/superadmin
```

### **Mahasiswa (Existing)**
```
Email:    mhs1@if.ac.id
Password: admin123
Role:     Mahasiswa
URL:      http://localhost:3001/mahasiswa
```

### **Dosen (Existing)**
```
Email:    dosen1@if.ac.id
Password: admin123
Role:     Dosen
URL:      http://localhost:3001/dosen
```

## 🎨 Design System

### **Color Palette**
- Eerie Black: `#232321` (Teks gelap)
- Ghost White: `#F7F5FA` (Background)
- Alice Blue: `#E4EAEF` (Card secondary)
- Honeydew: `#CFE3CA` (Aksen hijau)
- Vanilla: `#EFFDA3` (Aksen kuning)

### **Font**
- Urbanist (Regular, Medium, Bold, Extra Bold)

### **Badge Colors**
- **R/W (Full Access)**: Hijau soft (#D1FAE5 → #A7F3D0)
- **R (Read Only)**: Biru soft (#DBEAFE → #BFDBFE)

## 🆘 Jika Masih Bermasalah

**Kirim screenshot dari:**
1. Terminal frontend (npm run dev output)
2. Browser console (F12 → Console tab)
3. Browser network tab (F12 → Network tab)
4. URL bar

**Dan jalankan query ini:**
```sql
-- Cek user
SELECT u.email, r.nama_role, ps.kode_prodi, u.is_active 
FROM users u 
JOIN roles r ON u.role_id = r.id 
LEFT JOIN program_studi ps ON u.prodi_id = ps.id
WHERE u.email = 'adminprodi@if.ac.id';

-- Cek role
SELECT * FROM roles WHERE nama_role = 'Admin Prodi';

-- Cek prodi
SELECT * FROM program_studi ORDER BY kode_prodi;
```

## 📚 File SQL yang Tersedia

```
✅ CHECK_ADMIN_PRODI_USER.sql    - Cek user Admin Prodi yang sudah ada
✅ INSERT_ADMIN_PRODI_USER.sql   - Tambah user Admin Prodi baru
```

## 🎉 Summary

- ✅ **Frontend**: Dashboard Admin Prodi sudah dibuat lengkap
- ✅ **Backend**: TIDAK DIUBAH (sesuai request)
- ✅ **Database**: TIDAK DIUBAH (hanya tambah user)
- ✅ **Port**: Frontend 3001, Backend 3000
- ✅ **Design**: Sesuai palette warna Urbanist
- ✅ **Responsive**: Desktop, tablet, mobile
- ✅ **Dokumentasi**: Lengkap dengan troubleshooting

---

**Last Updated:** May 28, 2026  
**Status:** ✅ Ready to Use  
**Frontend Only:** ✅ Yes (Backend & Database tidak diubah)
