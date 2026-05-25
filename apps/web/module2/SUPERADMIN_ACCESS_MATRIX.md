# 🔐 Matrix Hak Akses per Role - Superadmin

## 📋 Deskripsi

Komponen UI Frontend untuk menampilkan **Matrix Hak Akses per Role** khusus untuk role SUPERADMIN. Halaman ini menampilkan tabel interaktif yang menunjukkan hak akses (Read/Write/Delete) untuk setiap resource dalam sistem.

## 🎨 Desain & Tema

### Font
- **Font Utama**: Urbanist (Regular / Medium / Bold)

### Palet Warna
- **Eerie Black** (`#212121`) - Background utama halaman (Dark Mode)
- **Ghost White** (`#F6F5FA`) - Teks utama dan kontras di atas background gelap
- **Alice Blue** (`#D8DFE9`) - Teks sekunder
- **Vanilla** (`#EFFDA3`) - Warna highlight badge hak akses (R/W/D)
- **Honeydew** (`#CFDECA`) - Aksen hijau pada judul halaman

## 📁 Struktur File

```
apps/web/module2/
├── app/
│   └── superadmin/
│       ├── layout.tsx                    # Layout utama superadmin dengan sidebar
│       ├── page.tsx                      # Dashboard superadmin
│       └── access-matrix/
│           └── page.tsx                  # Halaman Matrix Hak Akses
├── components/
│   ├── AccessMatrix.tsx                  # Komponen standalone (full page)
│   └── superadmin/
│       ├── SuperadminSidebar.tsx         # Sidebar navigasi superadmin
│       ├── SuperadminHeader.tsx          # Header dengan user info & logout
│       └── AccessMatrixContent.tsx       # Konten matrix (untuk layout)
```

## 🚀 Cara Menggunakan

### 1. Akses Halaman

Buka browser dan navigasi ke:
```
http://localhost:3000/superadmin/access-matrix
```

**Catatan**: Anda harus login sebagai user dengan role `SUPERADMIN` untuk mengakses halaman ini.

### 2. Fitur Halaman

#### ✅ Tabel Matrix Hak Akses
- Menampilkan 7 resource utama sistem
- Badge hak akses dengan format pill-shaped (R/W/D)
- Hover effect pada setiap baris
- Responsive design untuk mobile dan desktop

#### ✅ Resource yang Ditampilkan
1. **Program Studi & CPL** - [R/W/D]
2. **Mata Kuliah & Pemetaan** - [R/W/D]
3. **Sub-CPMK** - [R/W/D]
4. **Input Nilai Sub-CPMK** - [R/W/D]
5. **Capaian CPL Mahasiswa** - [R/W/D]
6. **Manajemen User** - [R/W/D]
7. **Audit Log** - [R] (Read only)

#### ✅ Legend
- **R** = Read (Baca)
- **W** = Write (Tulis)
- **D** = Delete (Hapus)

## 🎯 Komponen yang Tersedia

### 1. AccessMatrix (Standalone)
Komponen full-page dengan background gelap penuh.

```tsx
import AccessMatrix from '@/components/AccessMatrix';

export default function Page() {
  return <AccessMatrix />;
}
```

### 2. AccessMatrixContent (Dengan Layout)
Komponen yang terintegrasi dengan layout superadmin (sidebar + header).

```tsx
import AccessMatrixContent from '@/components/superadmin/AccessMatrixContent';

export default function Page() {
  return (
    <div style={{ backgroundColor: '#212121', padding: '32px' }}>
      <AccessMatrixContent />
    </div>
  );
}
```

## 🔧 Kustomisasi

### Menambah Resource Baru

Edit file `components/superadmin/AccessMatrixContent.tsx`:

```tsx
const mockAccessData: ResourceAccess[] = [
  // ... existing resources
  {
    resource: 'Resource Baru',
    superadmin: { read: true, write: true, delete: false }
  }
];
```

### Mengubah Warna Badge

Edit style pada komponen `AccessBadge`:

```tsx
style={{
  backgroundColor: 'rgba(239, 253, 163, 0.15)', // Background badge
  color: '#EFFDA3',                              // Warna teks
  border: '1px solid rgba(239, 253, 163, 0.3)', // Border badge
}}
```

### Menambah Role Baru

1. Tambahkan kolom baru di interface:
```tsx
interface ResourceAccess {
  resource: string;
  superadmin: AccessRight;
  admin: AccessRight;      // Role baru
  dosen: AccessRight;      // Role baru
}
```

2. Update data mock:
```tsx
const mockAccessData: ResourceAccess[] = [
  {
    resource: 'Program Studi & CPL',
    superadmin: { read: true, write: true, delete: true },
    admin: { read: true, write: true, delete: false },
    dosen: { read: true, write: false, delete: false }
  },
  // ...
];
```

3. Tambahkan kolom di tabel:
```tsx
<th>Admin</th>
<th>Dosen</th>
```

## 🎨 Styling Details

### Badge Style
- **Shape**: Pill-shaped (rounded-full)
- **Padding**: 3px horizontal, 1px vertical
- **Font**: Urbanist, 12px, Semi-bold
- **Background**: Transparan dengan opacity 15%
- **Border**: 1px solid dengan opacity 30%

### Table Style
- **Border Radius**: 16px (rounded-2xl)
- **Background**: #2a2a2a (Dark gray)
- **Border**: 1px solid rgba(216, 223, 233, 0.1)
- **Shadow**: 0 8px 30px rgba(0, 0, 0, 0.3)

### Hover Effects
- **Row Hover**: Background berubah ke rgba(207, 222, 202, 0.05)
- **Transition**: 200ms ease

## 📱 Responsive Design

### Desktop (≥1024px)
- Sidebar terbuka secara default
- Tabel full width dengan padding optimal
- Semua kolom terlihat

### Tablet (768px - 1023px)
- Sidebar collapsed secara default
- Tabel scrollable horizontal jika perlu
- Badge tetap terlihat dengan baik

### Mobile (<768px)
- Sidebar sebagai overlay
- Tabel scrollable horizontal
- Padding dikurangi untuk optimasi ruang

## 🔒 Keamanan & Akses

### Protected Route
Halaman ini dilindungi oleh middleware dan layout:

```tsx
// app/superadmin/layout.tsx
useEffect(() => {
  if (!loading) {
    if (!user) {
      router.push('/login');
    } else if (user.role?.toLowerCase() !== 'superadmin') {
      router.push('/unauthorized');
    }
  }
}, [user, loading, router]);
```

### Role Check
- Hanya user dengan role `SUPERADMIN` yang dapat mengakses
- User lain akan diredirect ke `/unauthorized`
- User yang belum login akan diredirect ke `/login`

## 🚧 Catatan Penting

### ⚠️ Mock Data
Saat ini komponen menggunakan **mock data statis**. Data ini hardcoded di dalam komponen dan tidak terhubung dengan backend.

### 🔄 Integrasi Backend (Future)
Untuk menghubungkan dengan backend:

1. Buat API endpoint di backend:
```javascript
// GET /api/access-matrix
router.get('/access-matrix', authMiddleware, roleMiddleware(['SUPERADMIN']), async (req, res) => {
  // Query database untuk mendapatkan hak akses
  const accessMatrix = await getAccessMatrix();
  res.json(accessMatrix);
});
```

2. Update komponen untuk fetch data:
```tsx
'use client';

import { useEffect, useState } from 'react';

export default function AccessMatrixContent() {
  const [accessData, setAccessData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/access-matrix')
      .then(res => res.json())
      .then(data => {
        setAccessData(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  // Render table dengan accessData
}
```

## 📊 Data Structure

### AccessRight Interface
```typescript
interface AccessRight {
  read: boolean;
  write: boolean;
  delete: boolean;
}
```

### ResourceAccess Interface
```typescript
interface ResourceAccess {
  resource: string;
  superadmin: AccessRight;
}
```

## 🎯 Testing

### Manual Testing Checklist
- [ ] Login sebagai SUPERADMIN
- [ ] Akses halaman `/superadmin/access-matrix`
- [ ] Verifikasi semua 7 resource ditampilkan
- [ ] Hover pada setiap baris untuk melihat effect
- [ ] Verifikasi badge R/W/D sesuai dengan data
- [ ] Test responsive di mobile, tablet, dan desktop
- [ ] Test sidebar toggle
- [ ] Test logout functionality

## 🎨 Preview

### Desktop View
```
┌─────────────────────────────────────────────────────────┐
│  Matrix Hak Akses per Role                              │
│  Kelola dan pantau hak akses untuk setiap role          │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │ RESOURCE              │ SUPERADMIN             │    │
│  ├────────────────────────────────────────────────┤    │
│  │ Program Studi & CPL   │ [R] [W] [D]           │    │
│  │ Mata Kuliah & Pemetaan│ [R] [W] [D]           │    │
│  │ Sub-CPMK              │ [R] [W] [D]           │    │
│  │ ...                   │ ...                    │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  Legend: [R] Read  [W] Write  [D] Delete                │
└─────────────────────────────────────────────────────────┘
```

## 📝 Changelog

### Version 1.0.0 (Initial Release)
- ✅ Komponen AccessMatrix standalone
- ✅ Komponen AccessMatrixContent dengan layout
- ✅ SuperadminSidebar dengan navigasi
- ✅ SuperadminHeader dengan user info
- ✅ SuperadminLayout dengan protected route
- ✅ Dashboard superadmin
- ✅ Mock data untuk 7 resource
- ✅ Responsive design
- ✅ Hover effects dan animations

## 🔮 Future Enhancements

1. **Backend Integration**
   - Connect ke API endpoint
   - Real-time data fetching
   - CRUD operations untuk hak akses

2. **Multi-Role Support**
   - Tambah kolom untuk role lain (Admin, Dosen, Mahasiswa)
   - Filter berdasarkan role
   - Comparison view antar role

3. **Advanced Features**
   - Search & filter resource
   - Export to PDF/Excel
   - Audit trail untuk perubahan hak akses
   - Bulk edit hak akses

4. **UI Enhancements**
   - Dark/Light mode toggle
   - Customizable color themes
   - Drag & drop untuk reorder resource
   - Inline editing

## 📞 Support

Jika ada pertanyaan atau issue, silakan hubungi tim development atau buat issue di repository.

---

**Dibuat dengan ❤️ menggunakan Next.js, TypeScript, dan Tailwind CSS**
