# 👨‍💼 Dashboard Admin Prodi - Dokumentasi

## 📋 Overview

Dashboard khusus untuk role **Admin Prodi** dengan desain modern menggunakan palette warna Urbanist dan hak akses yang terdefinisi dengan jelas.

## 🎨 Design System

### Font
- **Font Family**: Urbanist (Google Fonts)
- **Weights**: Regular (400), Medium (500), Bold (700), Extra Bold (800)
- **Hierarchy**:
  - Heading: 32px, Extra Bold (800)
  - Sub-heading: 24px, Bold (700)
  - Body: 14px, Medium (500)
  - Caption: 11-13px, Semi Bold (600)

### Color Palette

```css
/* Primary Colors */
--eerie-black: #232321    /* Teks gelap utama, background kontras */
--ghost-white: #F7F5FA    /* Background halaman utama */
--alice-blue: #E4EAEF     /* Card background, komponen sekunder */
--honeydew: #CFE3CA       /* Aksen hijau soft, badge positif */
--vanilla: #EFFDA3        /* Aksen kuning soft, highlight, badge warning */

/* Semantic Colors */
--text-primary: #212121
--text-secondary: #6B7280
--border-color: #E5E7EB
```

## 🔐 Hak Akses Admin Prodi

Dashboard menampilkan 7 fitur dengan hak akses yang berbeda:

| No | Fitur | Hak Akses | Keterangan |
|----|-------|-----------|------------|
| 1 | Kelola CPL | **R/W** (Full Access) | Dapat membaca dan menulis |
| 2 | Kelola CPMK | **R/W** (Full Access) | Dapat membaca dan menulis |
| 3 | Kelola Sub-CPMK | **R/W** (Full Access) | Dapat membaca dan menulis |
| 4 | Lihat Capaian Mahasiswa | **R** (Read Only) | Hanya dapat membaca |
| 5 | Kelola Mata Kuliah | **R/W** (Full Access) | Dapat membaca dan menulis |
| 6 | Kelola Dosen | **R/W** (Full Access) | Hanya untuk prodi sendiri |
| 7 | Lihat Mahasiswa | **R** (Read Only) | Hanya untuk prodi sendiri |

### Badge Colors

- **R/W (Full Access)**: 
  - Background: Gradient hijau soft (#D1FAE5 → #A7F3D0)
  - Text: Dark green (#065F46)
  - Border: Light green (#6EE7B7)

- **R (Read Only)**:
  - Background: Gradient biru soft (#DBEAFE → #BFDBFE)
  - Text: Dark blue (#1E40AF)
  - Border: Light blue (#93C5FD)

## 📁 Struktur File

```
apps/web/module2/
├── app/
│   └── admin-prodi/
│       ├── layout.tsx          # Layout dengan sidebar & header
│       ├── page.tsx            # Dashboard utama
│       └── README.md           # Dokumentasi ini
│
└── components/
    └── admin-prodi/
        ├── AdminProdiSidebar.tsx   # Sidebar navigasi
        └── AdminProdiHeader.tsx    # Header dengan user menu
```

## 🎯 Fitur Dashboard

### 1. **Stats Cards**
Menampilkan 4 kartu statistik dengan warna berbeda:
- Total CPL (Vanilla gradient)
- Total CPMK (Honeydew gradient)
- Total Dosen (Alice Blue gradient)
- Total Mahasiswa (Ghost White gradient)

### 2. **Access Rights Cards**
Grid cards yang menampilkan:
- Icon fitur (emoji)
- Nama fitur
- Deskripsi singkat
- Badge hak akses (R/W atau R)
- Keterangan tambahan (jika ada)

### 3. **Info Banner**
Banner informasi dengan:
- Background Vanilla gradient
- Icon 💡
- Informasi penting tentang hak akses

### 4. **Sidebar Navigation**
- Logo Admin Prodi
- Menu navigasi dengan badge akses
- Active state dengan highlight
- Footer info akses

### 5. **Header**
- Toggle sidebar button
- Welcome message
- Notification button (dengan badge)
- User profile dropdown

## 🚀 Cara Menggunakan

### 1. Login sebagai Admin Prodi

```typescript
// Credentials untuk testing
email: "adminprodi@example.com"
password: "password123"
role: "Admin Prodi" atau "admin_prodi"
```

### 2. Akses Dashboard

Setelah login, Anda akan diarahkan ke:
```
http://localhost:3000/admin-prodi
```

### 3. Navigasi

Gunakan sidebar untuk navigasi ke fitur-fitur:
- Dashboard: `/admin-prodi`
- Kelola CPL: `/admin-prodi/cpl`
- Kelola CPMK: `/admin-prodi/cpmk`
- Kelola Sub-CPMK: `/admin-prodi/sub-cpmk`
- Capaian Mahasiswa: `/admin-prodi/capaian`
- Mata Kuliah: `/admin-prodi/mata-kuliah`
- Kelola Dosen: `/admin-prodi/dosen`
- Data Mahasiswa: `/admin-prodi/mahasiswa`

## 🎨 Komponen UI

### Card Component
```tsx
<div className="card" style={{
  background: 'linear-gradient(135deg, #EFFDA3 0%, #E5F195 100%)',
  border: '1.5px solid #DBE787',
  padding: '24px',
}}>
  {/* Content */}
</div>
```

### Badge Component
```tsx
// Full Access Badge
<span className="badge" style={{
  background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
  color: '#065F46',
  border: '1.5px solid #6EE7B7',
}}>
  ✏️ FULL ACCESS
</span>

// Read Only Badge
<span className="badge" style={{
  background: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
  color: '#1E40AF',
  border: '1.5px solid #93C5FD',
}}>
  👁️ READ ONLY
</span>
```

## 📱 Responsive Design

Dashboard fully responsive dengan breakpoint:
- Desktop: > 1024px (Sidebar expanded)
- Tablet/Mobile: < 1024px (Sidebar collapsed, toggle button)

## 🔒 Security & Authorization

### Route Protection
Layout menggunakan `useAuth()` hook untuk:
1. Cek apakah user sudah login
2. Validasi role user = "Admin Prodi" atau "admin_prodi"
3. Redirect ke `/login` jika belum login
4. Redirect ke `/unauthorized` jika role tidak sesuai

### Data Dummy
Saat ini menggunakan data dummy untuk:
- Stats (Total CPL, CPMK, Dosen, Mahasiswa)
- Access Rights (7 fitur dengan hak akses)

**Note**: Untuk production, ganti dengan API call ke backend.

## 🎭 Animations

Dashboard menggunakan CSS animations:
- `fadeIn`: Fade in dengan slide up
- `slideInUp`: Slide dari bawah
- `scaleIn`: Scale dari kecil
- Stagger delays untuk sequential animation

## 🛠️ Customization

### Mengubah Warna
Edit di `globals.css`:
```css
:root {
  --alice-blue: #E4EAEF;
  --honeydew: #CFE3CA;
  --vanilla: #EFFDA3;
  --eerie-black: #232321;
  --ghost-white: #F7F5FA;
}
```

### Menambah Menu Sidebar
Edit `AdminProdiSidebar.tsx`:
```typescript
const menuItems: MenuItem[] = [
  // ... existing items
  { 
    label: 'Menu Baru', 
    href: '/admin-prodi/menu-baru', 
    icon: '🆕',
    badge: 'R/W',
    badgeColor: 'green'
  },
];
```

### Mengubah Stats
Edit `page.tsx`:
```typescript
// Ganti dengan API call
const stats = await fetch('/api/admin-prodi/stats');
```

## 📊 Data Structure

### AccessRight Interface
```typescript
interface AccessRight {
  id: number;
  fitur: string;
  deskripsi: string;
  akses: 'R/W' | 'R';
  keterangan?: string;
  icon: string;
}
```

## 🐛 Troubleshooting

### Dashboard tidak muncul
1. Pastikan sudah login dengan role "Admin Prodi"
2. Cek console browser untuk error
3. Pastikan AuthContext berfungsi dengan baik

### Sidebar tidak toggle
1. Cek responsive breakpoint (< 1024px)
2. Pastikan state `sidebarCollapsed` berfungsi
3. Cek z-index overlay

### Badge warna tidak sesuai
1. Cek `getAccessBadgeStyle()` function
2. Pastikan akses value = 'R/W' atau 'R'
3. Cek CSS gradient di globals.css

## 📝 TODO / Future Improvements

- [ ] Integrasi dengan backend API
- [ ] Real-time notifications
- [ ] Dark mode support
- [ ] Export data functionality
- [ ] Advanced filtering & search
- [ ] User profile management
- [ ] Activity logs
- [ ] Analytics dashboard

## 👥 Credits

- Design System: Urbanist Font + Custom Palette
- Icons: Emoji + SVG Icons
- Framework: Next.js 14 + TypeScript
- Styling: CSS-in-JS + Global CSS

---

**Version**: 1.0.0  
**Last Updated**: May 28, 2026  
**Author**: Kiro AI Assistant
