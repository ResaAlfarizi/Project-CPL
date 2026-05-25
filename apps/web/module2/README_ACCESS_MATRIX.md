# 🔐 Matrix Hak Akses per Role - SUPERADMIN

> Komponen UI Frontend untuk menampilkan dan mengelola hak akses per role dalam sistem CPL

[![Status](https://img.shields.io/badge/Status-Ready-success)]()
[![Version](https://img.shields.io/badge/Version-1.0.0-blue)]()
[![Framework](https://img.shields.io/badge/Framework-Next.js_14-black)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)]()

---

## 📸 Preview

```
┌─────────────────────────────────────────────────────────────┐
│  Matrix Hak Akses per Role                                  │
│  Kelola dan pantau hak akses untuk setiap role dalam sistem│
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ RESOURCE              │ SUPERADMIN                 │    │
│  ├────────────────────────────────────────────────────┤    │
│  │ Program Studi & CPL   │ [R] [W] [D]               │    │
│  │ Mata Kuliah & Pemetaan│ [R] [W] [D]               │    │
│  │ Sub-CPMK              │ [R] [W] [D]               │    │
│  │ Input Nilai Sub-CPMK  │ [R] [W] [D]               │    │
│  │ Capaian CPL Mahasiswa │ [R] [W] [D]               │    │
│  │ Manajemen User        │ [R] [W] [D]               │    │
│  │ Audit Log             │ [R]                       │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Legend: [R] Read  [W] Write  [D] Delete                    │
└─────────────────────────────────────────────────────────────┘
```

---

## ✨ Fitur Utama

- ✅ **Dark Theme** - Background gelap (#212121) dengan kontras tinggi
- ✅ **Responsive Design** - Optimal di desktop, tablet, dan mobile
- ✅ **Interactive Table** - Hover effects dan smooth animations
- ✅ **Badge System** - Pill-shaped badges untuk R/W/D permissions
- ✅ **Protected Route** - Hanya accessible oleh SUPERADMIN
- ✅ **Modern UI** - Menggunakan Urbanist font dan design system
- ✅ **TypeScript** - Type-safe dengan interfaces
- ✅ **Mock Data** - Ready to use dengan sample data

---

## 🚀 Quick Start

### Option 1: HTML Demo (Tanpa Server)

```bash
# Buka file HTML di browser
open apps/web/module2/public/access-matrix-demo.html
```

### Option 2: Next.js App (Dengan Server)

```bash
# 1. Install dependencies (jika belum)
cd apps/web/module2
npm install

# 2. Jalankan development server
npm run dev

# 3. Buka browser
# http://localhost:3000/superadmin/access-matrix
```

**Note**: Login sebagai SUPERADMIN untuk mengakses halaman ini.

---

## 📁 Struktur File

```
apps/web/module2/
├── app/superadmin/
│   ├── layout.tsx                    # Layout dengan sidebar & header
│   ├── page.tsx                      # Dashboard superadmin
│   └── access-matrix/
│       └── page.tsx                  # Halaman Matrix Hak Akses
│
├── components/
│   ├── AccessMatrix.tsx              # Komponen standalone
│   └── superadmin/
│       ├── SuperadminSidebar.tsx     # Sidebar navigasi
│       ├── SuperadminHeader.tsx      # Header dengan user info
│       └── AccessMatrixContent.tsx   # Konten matrix
│
├── public/
│   └── access-matrix-demo.html       # Demo HTML standalone
│
└── Documentation/
    ├── INDEX_ACCESS_MATRIX.md        # Index dokumentasi
    ├── QUICK_START_ACCESS_MATRIX.md  # Panduan quick start
    ├── SUMMARY_ACCESS_MATRIX.md      # Ringkasan lengkap
    ├── SUPERADMIN_ACCESS_MATRIX.md   # Dokumentasi lengkap
    └── VISUAL_GUIDE_ACCESS_MATRIX.md # Panduan visual
```

---

## 🎨 Design System

### Color Palette
```css
--eerie-black: #212121    /* Background utama */
--ghost-white: #F6F5FA    /* Teks utama */
--alice-blue: #D8DFE9     /* Teks sekunder */
--vanilla: #EFFDA3        /* Badge highlight */
--honeydew: #CFDECA       /* Aksen hijau */
```

### Typography
```css
font-family: 'Urbanist', sans-serif;
font-weights: 400 (Regular), 500 (Medium), 600 (Semi-bold), 700 (Bold)
```

### Components
- **Table**: Rounded corners (16px), dark background, subtle borders
- **Badges**: Pill-shaped, semi-transparent, hover effects
- **Sidebar**: Fixed, collapsible, smooth transitions
- **Header**: Sticky, user info, logout button

---

## 📊 Data Structure

```typescript
interface AccessRight {
  read: boolean;
  write: boolean;
  delete: boolean;
}

interface ResourceAccess {
  resource: string;
  superadmin: AccessRight;
}
```

### Sample Data
```typescript
const mockAccessData: ResourceAccess[] = [
  {
    resource: 'Program Studi & CPL',
    superadmin: { read: true, write: true, delete: true }
  },
  // ... 6 more resources
];
```

---

## 🔧 Kustomisasi

### Tambah Resource Baru

Edit `components/superadmin/AccessMatrixContent.tsx`:

```tsx
const mockAccessData: ResourceAccess[] = [
  // ... existing data
  {
    resource: 'Resource Baru',
    superadmin: { read: true, write: false, delete: false }
  }
];
```

### Ubah Warna Badge

```tsx
style={{
  backgroundColor: 'rgba(239, 253, 163, 0.15)',  // Background
  color: '#EFFDA3',                               // Text color
  border: '1px solid rgba(239, 253, 163, 0.3)',  // Border
}}
```

### Tambah Role Baru

1. Update interface:
```tsx
interface ResourceAccess {
  resource: string;
  superadmin: AccessRight;
  admin: AccessRight;      // New role
}
```

2. Update data dan tabel sesuai kebutuhan

---

## 📱 Responsive Breakpoints

| Device | Breakpoint | Behavior |
|--------|------------|----------|
| **Desktop** | ≥1024px | Sidebar open, full table view |
| **Tablet** | 768-1023px | Sidebar collapsed, scrollable table |
| **Mobile** | <768px | Sidebar overlay, horizontal scroll |

---

## 🔒 Security & Access Control

### Protected Route
```tsx
// Hanya SUPERADMIN yang dapat mengakses
if (user.role?.toLowerCase() !== 'superadmin') {
  router.push('/unauthorized');
}
```

### Features
- ✅ Authentication check
- ✅ Role-based access control
- ✅ Automatic redirect untuk unauthorized users
- ✅ Session management

---

## 📚 Dokumentasi Lengkap

| Dokumen | Deskripsi | Link |
|---------|-----------|------|
| **Index** | Navigasi dokumentasi | [INDEX_ACCESS_MATRIX.md](./INDEX_ACCESS_MATRIX.md) |
| **Quick Start** | Panduan cepat memulai | [QUICK_START_ACCESS_MATRIX.md](./QUICK_START_ACCESS_MATRIX.md) |
| **Summary** | Ringkasan & overview | [SUMMARY_ACCESS_MATRIX.md](./SUMMARY_ACCESS_MATRIX.md) |
| **Full Docs** | Dokumentasi lengkap | [SUPERADMIN_ACCESS_MATRIX.md](./SUPERADMIN_ACCESS_MATRIX.md) |
| **Visual Guide** | Panduan visual & design | [VISUAL_GUIDE_ACCESS_MATRIX.md](./VISUAL_GUIDE_ACCESS_MATRIX.md) |

---

## ✅ Testing Checklist

### HTML Demo
- [ ] Buka `access-matrix-demo.html` di browser
- [ ] Verifikasi styling sesuai design
- [ ] Test hover effects
- [ ] Test responsive di mobile view

### Next.js App
- [ ] Login sebagai SUPERADMIN
- [ ] Akses `/superadmin/access-matrix`
- [ ] Verifikasi tabel dan badge
- [ ] Test sidebar navigation
- [ ] Test logout functionality
- [ ] Test protected route
- [ ] Test responsive design

---

## 🚧 Roadmap

### Phase 1: Current (✅ Complete)
- [x] UI Components
- [x] Layout & Navigation
- [x] Mock Data
- [x] Responsive Design
- [x] Documentation

### Phase 2: Backend Integration (⏳ Future)
- [ ] API endpoints
- [ ] Real-time data fetching
- [ ] Loading & error states
- [ ] CRUD operations

### Phase 3: Advanced Features (⏳ Future)
- [ ] Multi-role support
- [ ] Inline editing
- [ ] Export to PDF/Excel
- [ ] Search & filter
- [ ] Audit trail

---

## 🐛 Troubleshooting

### Issue: Halaman tidak muncul
**Solusi**: Pastikan sudah login sebagai SUPERADMIN

### Issue: Styling tidak sesuai
**Solusi**: Clear browser cache dan reload

### Issue: Sidebar tidak muncul
**Solusi**: Check console untuk error, pastikan komponen sudah di-import

### Issue: Protected route tidak bekerja
**Solusi**: Verifikasi AuthContext dan middleware sudah setup

---

## 💡 Tips

1. **Preview Cepat**: Gunakan HTML demo untuk melihat styling tanpa setup server
2. **Development**: Gunakan Next.js app untuk testing dengan authentication
3. **Kustomisasi**: Semua warna dan spacing sudah didefinisikan di CSS variables
4. **Responsive**: Test di berbagai ukuran layar menggunakan browser DevTools

---

## 📦 Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS + Custom CSS
- **Icons**: Lucide React
- **Font**: Urbanist (Google Fonts)
- **State Management**: React Hooks

---

## 📄 License

This project is part of the CPL Management System.

---

## 👥 Contributors

- **Frontend Development**: Complete ✅
- **UI/UX Design**: Complete ✅
- **Documentation**: Complete ✅

---

## 📞 Support

Untuk pertanyaan atau bantuan:

1. **Baca dokumentasi** - Mulai dari [INDEX_ACCESS_MATRIX.md](./INDEX_ACCESS_MATRIX.md)
2. **Check troubleshooting** - Lihat section troubleshooting di atas
3. **Review source code** - Semua komponen sudah didokumentasikan
4. **Contact team** - Jika masih ada pertanyaan

---

## 🎉 Kesimpulan

Komponen Matrix Hak Akses per Role sudah **siap digunakan**!

**Mulai sekarang:**
1. Buka [QUICK_START_ACCESS_MATRIX.md](./QUICK_START_ACCESS_MATRIX.md) untuk memulai
2. Jalankan HTML demo untuk preview cepat
3. Atau langsung jalankan Next.js app untuk full experience

---

**Happy Coding! 🚀**

*Version 1.0.0 - Last Updated: 2026-05-25*
