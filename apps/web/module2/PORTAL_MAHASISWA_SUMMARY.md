# Portal Mahasiswa - Summary

## ✅ Status: COMPLETED

Portal Mahasiswa untuk Sistem CPL telah selesai dibuat dengan 5 halaman lengkap.

---

## 📋 Halaman yang Tersedia

### 1. **Dashboard** (`/mahasiswa`)
- Menampilkan daftar Program Studi
- Tabel dengan search functionality
- Tombol "Lihat CPL" untuk setiap prodi
- **Hak Akses**: Read-only (R)

### 2. **Program Studi & CPL** (`/mahasiswa/program-studi`)
- Daftar lengkap Program Studi dengan filter search
- Tabel dengan kolom: NO, Kode Prodi, Nama, Jenjang, Aksi
- Klik "Lihat CPL" untuk melihat detail CPL per prodi
- Section detail CPL dengan card layout
- **Hak Akses**: Read-only (R)

### 3. **Mata Kuliah** (`/mahasiswa/mata-kuliah`)
- Daftar mata kuliah/kelas yang tersedia
- Filter: Search + Dropdown Semester
- Tabel dengan kolom: NO, Kode MK, Nama MK, Kelas, SKS, Semester, Dosen
- Summary total mata kuliah dan total SKS
- **Hak Akses**: Read-only (R)

### 4. **Sub-CPMK** (`/mahasiswa/sub-cpmk`)
- Daftar Sub-CPMK dengan card layout
- Search functionality
- Expandable description (klik arrow untuk lihat detail)
- Badge: Kode Sub-CPMK, Mata Kuliah, Bobot
- Summary jumlah Sub-CPMK
- **Hak Akses**: Read-only (R)

### 5. **Capaian Mahasiswa** (`/mahasiswa/capaian`)
- Capaian CPL mahasiswa (data pribadi)
- Progress bar dengan color-coded status:
  - Hijau (≥80%): Tercapai
  - Kuning (60-79%): Dalam Progress
  - Merah (<60%): Belum Tercapai
- Tombol "Lihat Detail" untuk rincian per mata kuliah
- Detail table dengan nilai per MK
- **Hak Akses**: Read-only (R) - hanya data sendiri

---

## 🎨 Design System

### Warna
- **Background**: `#F8F8FB` (Ghost White)
- **Sidebar**: `#33323` (Nearly Black)
- **Accent Yellow**: `#FFF063`
- **Alice Blue**: `#E8F3FF` (untuk badge biru)
- **Honeydew**: `#CFECCA` (untuk badge hijau)
- **White Cards**: `#FFFFFF` dengan `rounded-xl`

### Font
- **Urbanist** (Google Fonts)
- Font weights: 400, 500, 600, 700

### Components
- **Cards**: White background, rounded-xl, border-gray-100
- **Badges**: Rounded-full, small padding, color-coded
- **Tables**: Clean design, hover effects, proper spacing
- **Buttons**: Rounded-lg, hover opacity, color-coded
- **Progress Bars**: Rounded-full, animated, color-coded

---

## 🔐 Authentication & Authorization

### Login Credentials (Testing)
```
Email: ahmad.fauzi@student.cpl.ac.id
Password: admin123
```

### Role-Based Redirect
- **Mahasiswa** → `/mahasiswa` ✅
- **Dosen/Admin** → `/dashboard` atau `/unauthorized`

### Middleware Protection
- Semua route `/mahasiswa/*` dilindungi middleware
- Token disimpan di localStorage DAN cookies
- Auto-redirect ke `/login` jika tidak authenticated
- Auto-redirect ke `/unauthorized` jika bukan role Mahasiswa

---

## 🔌 API Integration

### Endpoints yang Digunakan
```typescript
// Program Studi
mahasiswaApi.getAllProdi()
mahasiswaApi.getProdiById(id)

// CPL
mahasiswaApi.getAllCPL()
mahasiswaApi.getCPLByProdi(prodiId)

// Mata Kuliah/Kelas
mahasiswaApi.getAllKelas()
mahasiswaApi.getKelasById(id)

// Sub-CPMK
mahasiswaApi.getAllSubCpmk()
mahasiswaApi.getSubCpmkByMK(mkId)

// Capaian (Own Data)
mahasiswaApi.getMyCapaian()
mahasiswaApi.getMyCapaianDetail()
```

### Base URL
```
Backend: http://localhost:3000
API Base: http://localhost:3000/api/v1/m2
Frontend: http://localhost:3001
```

---

## 📁 File Structure

```
apps/web/module2/
├── app/
│   ├── mahasiswa/
│   │   ├── layout.tsx          # Sidebar + Layout
│   │   ├── page.tsx            # Dashboard
│   │   ├── program-studi/
│   │   │   └── page.tsx        # Program Studi & CPL
│   │   ├── mata-kuliah/
│   │   │   └── page.tsx        # Mata Kuliah
│   │   ├── sub-cpmk/
│   │   │   └── page.tsx        # Sub-CPMK
│   │   └── capaian/
│   │       └── page.tsx        # Capaian Mahasiswa
│   ├── layout.tsx              # Root layout (Urbanist font)
│   └── globals.css             # Global styles + color variables
├── lib/
│   └── api.ts                  # API functions (mahasiswaApi)
├── contexts/
│   └── AuthContext.tsx         # Auth context + redirect logic
└── middleware.ts               # Route protection
```

---

## 🚀 Cara Menjalankan

### 1. Start Backend (Module 2)
```bash
cd apps/backend/module2
npm install
npm start
# Backend running at http://localhost:3000
```

### 2. Start Frontend (Module 2)
```bash
cd apps/web/module2
npm install
npm run dev
# Frontend running at http://localhost:3001
```

### 3. Login
- Buka browser: `http://localhost:3001/login`
- Login dengan credentials mahasiswa
- Otomatis redirect ke `/mahasiswa`

---

## 🎯 Features Implemented

✅ **Authentication**
- Login dengan email & password
- JWT token storage (localStorage + cookies)
- Role-based redirect
- Protected routes dengan middleware

✅ **UI/UX**
- Responsive design (mobile + desktop)
- Dark sidebar dengan yellow accent
- Search & filter functionality
- Loading states
- Empty states
- Hover effects & transitions
- Color-coded badges & status

✅ **Data Display**
- Tables dengan proper formatting
- Cards dengan expandable content
- Progress bars dengan color coding
- Summary statistics
- Badge system untuk status

✅ **Read-Only Access**
- Semua halaman read-only sesuai hak akses
- Tidak ada tombol edit/delete
- Hanya menampilkan data
- Capaian hanya menampilkan data sendiri

---

## 🔧 Troubleshooting

### Jika masih ada error "merah semua":
1. **Restart TypeScript Server**
   - Ctrl+Shift+P → "TypeScript: Restart TS Server"

2. **Restart Dev Server**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

3. **Clear Browser Cache**
   - Ctrl+Shift+Delete
   - Clear localStorage
   - Hard refresh (Ctrl+F5)

### Jika login tidak redirect:
1. Check backend running di port 3000
2. Check `.env.local` file:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```
3. Check browser console untuk error
4. Verify token di localStorage & cookies

---

## 📝 Notes

- **Backend Module 2** harus running untuk API calls
- **Database** harus sudah di-setup dengan test users
- **Port 3000** untuk backend, **Port 3001** untuk frontend
- Semua halaman sudah **fully functional** dengan real API integration
- Design sudah sesuai dengan **referensi yang diberikan**
- Hak akses sudah sesuai dengan **role matrix Mahasiswa**

---

## ✨ Next Steps (Optional)

Jika ingin menambahkan fitur:
- [ ] Export data ke PDF/Excel
- [ ] Print functionality
- [ ] Dark mode toggle
- [ ] Notification system
- [ ] Profile page
- [ ] Change password

---

**Status**: ✅ READY TO USE
**Last Updated**: May 20, 2026
