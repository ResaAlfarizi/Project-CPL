# 🚀 Quick Start - Matrix Hak Akses per Role

## 📦 File yang Dibuat

```
apps/web/module2/
├── app/superadmin/
│   ├── layout.tsx                          # ✅ Layout dengan sidebar & header
│   ├── page.tsx                            # ✅ Dashboard superadmin
│   └── access-matrix/
│       └── page.tsx                        # ✅ Halaman Matrix Hak Akses
├── components/
│   ├── AccessMatrix.tsx                    # ✅ Komponen standalone
│   └── superadmin/
│       ├── SuperadminSidebar.tsx           # ✅ Sidebar navigasi
│       ├── SuperadminHeader.tsx            # ✅ Header dengan user info
│       └── AccessMatrixContent.tsx         # ✅ Konten matrix
├── public/
│   └── access-matrix-demo.html             # ✅ Demo HTML standalone
└── SUPERADMIN_ACCESS_MATRIX.md             # ✅ Dokumentasi lengkap
```

## 🎯 Cara Menggunakan

### Option 1: Preview HTML Demo (Tanpa Server)

1. Buka file HTML demo di browser:
```
apps/web/module2/public/access-matrix-demo.html
```

2. Double-click file tersebut atau drag ke browser
3. Lihat preview Matrix Hak Akses dengan styling lengkap

### Option 2: Jalankan di Next.js (Dengan Server)

1. **Pastikan server development berjalan:**
```bash
cd apps/web/module2
npm run dev
```

2. **Buka browser dan akses:**
```
http://localhost:3000/superadmin/access-matrix
```

3. **Login sebagai SUPERADMIN** (jika belum login)

## 🎨 Fitur yang Sudah Dibuat

### ✅ UI Components
- [x] Tabel Matrix Hak Akses dengan dark theme
- [x] Badge R/W/D dengan styling pill-shaped
- [x] Hover effects pada baris tabel
- [x] Legend untuk penjelasan badge
- [x] Responsive design (mobile, tablet, desktop)
- [x] Smooth animations (fade-in, slide-up)

### ✅ Layout & Navigation
- [x] Superadmin Sidebar dengan menu navigasi
- [x] Superadmin Header dengan user info & logout
- [x] Protected route (hanya SUPERADMIN)
- [x] Dashboard superadmin dengan quick links

### ✅ Data & State
- [x] Mock data untuk 7 resource
- [x] Interface TypeScript untuk type safety
- [x] State management dengan React hooks

## 📊 Data yang Ditampilkan

| Resource | Superadmin |
|----------|------------|
| Program Studi & CPL | R/W/D |
| Mata Kuliah & Pemetaan | R/W/D |
| Sub-CPMK | R/W/D |
| Input Nilai Sub-CPMK | R/W/D |
| Capaian CPL Mahasiswa | R/W/D |
| Manajemen User | R/W/D |
| Audit Log | R |

**Legend:**
- **R** = Read (Baca)
- **W** = Write (Tulis)
- **D** = Delete (Hapus)

## 🎨 Design System

### Colors
```css
--eerie-black: #212121      /* Background utama */
--ghost-white: #F6F5FA      /* Teks utama */
--alice-blue: #D8DFE9       /* Teks sekunder */
--vanilla: #EFFDA3          /* Badge highlight */
--honeydew: #CFDECA         /* Aksen hijau */
```

### Typography
```css
font-family: 'Urbanist', sans-serif;
```

### Spacing
```css
--radius-sm: 8px
--radius-md: 12px
--radius-lg: 16px
--radius-xl: 24px
```

## 🔧 Kustomisasi Cepat

### 1. Tambah Resource Baru

Edit `components/superadmin/AccessMatrixContent.tsx`:

```tsx
const mockAccessData: ResourceAccess[] = [
  // ... existing data
  {
    resource: 'Resource Baru Anda',
    superadmin: { read: true, write: true, delete: false }
  }
];
```

### 2. Ubah Warna Badge

Edit style di `AccessBadge` component:

```tsx
backgroundColor: 'rgba(239, 253, 163, 0.15)',  // Ubah warna background
color: '#EFFDA3',                               // Ubah warna teks
```

### 3. Tambah Menu Sidebar

Edit `components/superadmin/SuperadminSidebar.tsx`:

```tsx
const menuItems = [
  // ... existing items
  {
    icon: YourIcon,
    label: 'Menu Baru',
    href: '/superadmin/menu-baru',
  }
];
```

## 📱 Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 768px) {
  /* Sidebar sebagai overlay */
  /* Tabel scrollable horizontal */
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1023px) {
  /* Sidebar collapsed */
  /* Tabel full width */
}

/* Desktop */
@media (min-width: 1024px) {
  /* Sidebar terbuka */
  /* Layout optimal */
}
```

## 🔒 Security & Access Control

### Protected Route
```tsx
// Hanya SUPERADMIN yang bisa akses
if (user.role?.toLowerCase() !== 'superadmin') {
  router.push('/unauthorized');
}
```

### Role Check
- ✅ Middleware authentication
- ✅ Layout-level role verification
- ✅ Redirect ke login jika belum auth
- ✅ Redirect ke unauthorized jika bukan superadmin

## 🚧 Next Steps (Opsional)

### 1. Integrasi Backend
```tsx
// Fetch data dari API
useEffect(() => {
  fetch('/api/access-matrix')
    .then(res => res.json())
    .then(data => setAccessData(data));
}, []);
```

### 2. Tambah Role Lain
- Tambah kolom Admin, Dosen, Mahasiswa
- Buat comparison view antar role
- Filter berdasarkan role

### 3. CRUD Operations
- Edit hak akses inline
- Save changes ke database
- Audit trail untuk perubahan

### 4. Export Features
- Export to PDF
- Export to Excel
- Print-friendly view

## 📝 Testing Checklist

- [ ] Buka HTML demo di browser
- [ ] Verifikasi styling sesuai design system
- [ ] Test hover effects pada tabel
- [ ] Test responsive di mobile view
- [ ] Login sebagai SUPERADMIN di Next.js app
- [ ] Akses `/superadmin/access-matrix`
- [ ] Verifikasi sidebar navigation
- [ ] Test logout functionality
- [ ] Verifikasi protected route (coba akses dengan role lain)

## 💡 Tips

1. **Preview Cepat**: Gunakan HTML demo untuk melihat styling tanpa setup server
2. **Development**: Gunakan Next.js app untuk testing dengan authentication
3. **Kustomisasi**: Semua warna dan spacing sudah didefinisikan di CSS variables
4. **Responsive**: Test di berbagai ukuran layar menggunakan browser DevTools

## 📞 Troubleshooting

### Issue: Halaman tidak muncul
**Solusi**: Pastikan sudah login sebagai SUPERADMIN

### Issue: Styling tidak sesuai
**Solusi**: Clear browser cache dan reload

### Issue: Sidebar tidak muncul
**Solusi**: Check console untuk error, pastikan komponen sudah di-import dengan benar

### Issue: Protected route tidak bekerja
**Solusi**: Verifikasi AuthContext dan middleware sudah setup dengan benar

## 🎉 Selesai!

Komponen Matrix Hak Akses per Role sudah siap digunakan! 

Untuk dokumentasi lengkap, lihat: `SUPERADMIN_ACCESS_MATRIX.md`

---

**Happy Coding! 🚀**
