# 📁 Struktur Folder Superadmin

## 🎯 Struktur Lengkap

```
apps/web/module2/app/superadmin/
├── layout.tsx                    # Layout dengan sidebar & header
├── page.tsx                      # Dashboard utama
│
├── prodi-cpl/
│   └── page.tsx                  # Program Studi & CPL
│
├── mata-kuliah/
│   └── page.tsx                  # Mata Kuliah & Pemetaan
│
├── sub-cpmk/
│   └── page.tsx                  # Sub-CPMK
│
├── input-nilai/
│   └── page.tsx                  # Input Nilai Sub-CPMK
│
├── capaian/
│   └── page.tsx                  # Capaian CPL Mahasiswa
│
├── users/
│   └── page.tsx                  # Manajemen User
│
├── audit-log/
│   └── page.tsx                  # Audit Log
│
└── settings/
    └── page.tsx                  # Pengaturan
```

## 📊 Routing

| URL | Halaman | Status |
|-----|---------|--------|
| `/superadmin` | Dashboard | ✅ Complete |
| `/superadmin/prodi-cpl` | Program Studi & CPL | ✅ Created |
| `/superadmin/mata-kuliah` | Mata Kuliah & Pemetaan | ✅ Created |
| `/superadmin/sub-cpmk` | Sub-CPMK | ✅ Created |
| `/superadmin/input-nilai` | Input Nilai Sub-CPMK | ✅ Created |
| `/superadmin/capaian` | Capaian CPL Mahasiswa | ✅ Created |
| `/superadmin/users` | Manajemen User | ✅ Created |
| `/superadmin/audit-log` | Audit Log | ✅ Created |
| `/superadmin/settings` | Pengaturan | ✅ Created |

## 🎨 Dashboard Features (Fixed)

### ✅ Perbaikan yang Dilakukan

1. **System Stats**
   - Label diperpendek: "Aktivitas Hari Ini" → "Aktivitas"
   - Tidak ada text yang terpotong

2. **Recent Activities**
   - Judul diperpendek: "Ringkasan Aktivitas Terbaru" → "Aktivitas Terbaru"
   - Action text diperpendek:
     - "Menambahkan mata kuliah baru" → "Tambah mata kuliah"
     - "Mengupdate nilai Sub-CPMK" → "Update nilai"
     - "Menghapus user tidak aktif" → "Hapus user"
     - "Melihat capaian mahasiswa" → "Lihat capaian"
   - Resource text diperpendek:
     - "Mata Kuliah & Pemetaan" → "Mata Kuliah"
     - "Input Nilai Sub-CPMK" → "Input Nilai"
     - "Capaian CPL Mahasiswa" → "Capaian CPL"
   - Time text diperpendek:
     - "5 menit yang lalu" → "5 menit lalu"
     - "15 menit yang lalu" → "15 menit lalu"
     - "1 jam yang lalu" → "1 jam lalu"
     - "2 jam yang lalu" → "2 jam lalu"
   - Added `whitespace-nowrap` untuk mencegah text wrap

## 📄 Template Page

Setiap halaman fitur menggunakan template yang sama:

```tsx
'use client';

import React from 'react';

export default function FeaturePage() {
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1
          className="text-3xl font-bold mb-2"
          style={{
            color: '#212121',
            fontFamily: 'Urbanist, sans-serif',
          }}
        >
          Nama Fitur
        </h1>
        <p
          className="text-base"
          style={{
            color: '#6B7280',
            fontFamily: 'Urbanist, sans-serif',
          }}
        >
          Deskripsi fitur
        </p>
      </div>

      {/* Content */}
      <div
        className="p-8 rounded-xl text-center"
        style={{
          backgroundColor: '#fff',
          border: '1px solid #E5E7EB',
        }}
      >
        <div
          className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ backgroundColor: '#F6F5FA' }}
        >
          <span style={{ fontSize: '32px' }}>🎯</span>
        </div>
        <h3
          className="text-xl font-bold mb-2"
          style={{ color: '#212121', fontFamily: 'Urbanist, sans-serif' }}
        >
          Halaman Nama Fitur
        </h3>
        <p
          className="text-sm"
          style={{ color: '#6B7280', fontFamily: 'Urbanist, sans-serif' }}
        >
          Fitur ini akan segera tersedia
        </p>
      </div>
    </div>
  );
}
```

## 🎯 Next Steps untuk Setiap Fitur

Untuk mengembangkan setiap fitur, Anda bisa:

1. **Tambahkan State Management**
   ```tsx
   const [data, setData] = useState([]);
   const [loading, setLoading] = useState(false);
   ```

2. **Fetch Data dari API**
   ```tsx
   useEffect(() => {
     fetchData();
   }, []);
   ```

3. **Tambahkan Tabel/List**
   - Gunakan komponen tabel yang sama seperti di dashboard
   - Tambahkan pagination jika perlu

4. **Tambahkan Form**
   - Create/Edit form dengan modal atau halaman terpisah
   - Validasi input

5. **Tambahkan Actions**
   - Button Create, Edit, Delete
   - Confirmation dialog untuk delete

## 📊 Contoh Pengembangan: Manajemen User

```tsx
'use client';

import React, { useState } from 'react';

export default function UsersPage() {
  const [users, setUsers] = useState([
    { id: 1, name: 'Admin Prodi', email: 'admin@example.com', role: 'Admin' },
    { id: 2, name: 'Dosen A', email: 'dosen@example.com', role: 'Dosen' },
  ]);

  return (
    <div className="animate-fade-in">
      {/* Header with Action Button */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Manajemen User</h1>
          <p className="text-base text-gray-600">
            Kelola pengguna dan hak akses sistem
          </p>
        </div>
        <button className="btn btn-primary">
          + Tambah User
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left">Nama</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Role</th>
              <th className="px-6 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4">{user.name}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">{user.role}</td>
                <td className="px-6 py-4 text-center">
                  <button className="btn btn-sm btn-secondary mr-2">
                    Edit
                  </button>
                  <button className="btn btn-sm btn-ghost">
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

## 🎨 Styling Guidelines

### Colors
- Primary: `#212121` (Eerie Black)
- Secondary: `#6B7280` (Gray)
- Background: `#fff` (White)
- Border: `#E5E7EB` (Light Gray)
- Accent: `#EFFDA3` (Vanilla), `#CFDECA` (Honeydew)

### Typography
- Font: `Urbanist, sans-serif`
- Heading: `text-3xl font-bold` (28px)
- Subheading: `text-xl font-bold` (20px)
- Body: `text-base` (16px)
- Small: `text-sm` (14px)

### Spacing
- Section margin: `mb-6` (24px)
- Card padding: `p-8` (32px)
- Table cell padding: `px-6 py-4` (24px horizontal, 16px vertical)

## ✅ Checklist Pengembangan

Untuk setiap fitur, pastikan:

- [ ] Header dengan judul dan deskripsi
- [ ] Loading state saat fetch data
- [ ] Empty state jika tidak ada data
- [ ] Error handling
- [ ] Responsive design
- [ ] Hover effects pada interactive elements
- [ ] Confirmation dialog untuk delete
- [ ] Success/error toast notification
- [ ] Pagination jika data banyak
- [ ] Search/filter functionality

---

**Created: 2026-05-25**  
**Status: ✅ Complete**
