# 🚀 Implementation Guide - Superadmin Features dengan Role-Based Access

## 📊 Matrix Hak Akses Superadmin

| Resource | Read (R) | Write (W) | Delete (D) |
|----------|----------|-----------|------------|
| Program Studi & CPL | ✅ | ✅ | ✅ |
| Mata Kuliah & Pemetaan | ✅ | ✅ | ✅ |
| Sub-CPMK | ✅ | ✅ | ✅ |
| Input Nilai Sub-CPMK | ✅ | ✅ | ✅ |
| Capaian CPL Mahasiswa | ✅ | ✅ | ✅ |
| Manajemen User | ✅ | ✅ | ✅ |
| Audit Log | ✅ | ❌ | ❌ |

---

## ✅ Yang Sudah Diimplementasi

### 1. **Manajemen User** (R/W/D) ✅
**File**: `app/superadmin/users/page.tsx`

**Fitur:**
- ✅ **Read**: Lihat daftar user dengan tabel
- ✅ **Write**: Tombol "Tambah User" dan "Edit User"
- ✅ **Delete**: Tombol "Hapus" dengan confirmation
- ✅ Search functionality
- ✅ Filter by status
- ✅ Modal untuk create/edit (placeholder)
- ✅ Info card menjelaskan hak akses R/W/D

**Actions:**
- View list of users
- Create new user
- Edit existing user
- Delete user (with confirmation)
- Search users

---

### 2. **Audit Log** (R only) ✅
**File**: `app/superadmin/audit-log/page.tsx`

**Fitur:**
- ✅ **Read**: Lihat daftar audit log
- ❌ **Write**: Tidak ada tombol create/edit
- ❌ **Delete**: Tidak ada tombol delete
- ✅ Search functionality
- ✅ Filter by action type (CREATE/UPDATE/DELETE/READ)
- ✅ Export button (untuk download log)
- ✅ Warning card menjelaskan hak akses READ only

**Actions:**
- View audit logs
- Search logs
- Filter by action type
- Export logs (read-only operation)

---

## 🔨 Template untuk Fitur Lainnya

### Template: Full Access (R/W/D)

Untuk fitur dengan akses penuh seperti:
- Program Studi & CPL
- Mata Kuliah & Pemetaan
- Sub-CPMK
- Input Nilai Sub-CPMK
- Capaian CPL Mahasiswa

```tsx
'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

interface DataItem {
  id: number;
  // ... other fields
}

export default function FeaturePage() {
  const [data, setData] = useState<DataItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  // READ: Display data in table
  const filteredData = data.filter(item => {
    // filter logic
  });

  // WRITE: Create new item
  const handleCreate = () => {
    setModalMode('create');
    setShowModal(true);
  };

  // WRITE: Edit existing item
  const handleEdit = (item: DataItem) => {
    setModalMode('edit');
    setShowModal(true);
  };

  // DELETE: Remove item
  const handleDelete = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      setData(data.filter(d => d.id !== id));
      alert('Data berhasil dihapus');
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header with CREATE button */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h1>Feature Name</h1>
          <p>Description</p>
        </div>
        <button onClick={handleCreate} className="btn btn-primary">
          <Plus size={18} />
          Tambah Data
        </button>
      </div>

      {/* Search */}
      <div className="card" style={{ marginBottom: '16px', padding: '16px' }}>
        <input
          type="text"
          placeholder="Cari..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field"
        />
      </div>

      {/* Table with EDIT and DELETE buttons */}
      <div className="card" style={{ padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Column 1</th>
              <th>Column 2</th>
              <th style={{ textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item.id}>
                <td>{/* data */}</td>
                <td>{/* data */}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button onClick={() => handleEdit(item)} className="btn btn-sm btn-secondary">
                      <Edit2 size={14} />
                      Edit
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="btn btn-sm">
                      <Trash2 size={14} />
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Info Card */}
      <div className="card" style={{ marginTop: '16px', backgroundColor: 'var(--alice-blue)' }}>
        <p>
          <strong>Hak Akses:</strong> Anda memiliki akses penuh (R/W/D) untuk fitur ini.
        </p>
      </div>
    </div>
  );
}
```

---

## 📝 Implementasi Step-by-Step

### Step 1: Program Studi & CPL (R/W/D)

**File**: `app/superadmin/prodi-cpl/page.tsx`

**Data Structure:**
```typescript
interface ProdiCPL {
  id: number;
  kodeProdi: string;
  namaProdi: string;
  jenjang: string;
  jumlahCPL: number;
  status: 'active' | 'inactive';
}
```

**Actions:**
- ✅ View list of program studi
- ✅ Create new prodi
- ✅ Edit prodi details
- ✅ Delete prodi
- ✅ View CPL for each prodi

---

### Step 2: Mata Kuliah & Pemetaan (R/W/D)

**File**: `app/superadmin/mata-kuliah/page.tsx`

**Data Structure:**
```typescript
interface MataKuliah {
  id: number;
  kodeMK: string;
  namaMK: string;
  sks: number;
  semester: number;
  prodi: string;
  cplTerpetakan: number;
}
```

**Actions:**
- ✅ View list of mata kuliah
- ✅ Create new mata kuliah
- ✅ Edit mata kuliah
- ✅ Delete mata kuliah
- ✅ Map CPL to mata kuliah

---

### Step 3: Sub-CPMK (R/W/D)

**File**: `app/superadmin/sub-cpmk/page.tsx`

**Data Structure:**
```typescript
interface SubCPMK {
  id: number;
  kodeSubCPMK: string;
  deskripsi: string;
  mataKuliah: string;
  bobot: number;
  cplTerkait: string[];
}
```

**Actions:**
- ✅ View list of sub-CPMK
- ✅ Create new sub-CPMK
- ✅ Edit sub-CPMK
- ✅ Delete sub-CPMK
- ✅ Link to CPL

---

### Step 4: Input Nilai Sub-CPMK (R/W/D)

**File**: `app/superadmin/input-nilai/page.tsx`

**Data Structure:**
```typescript
interface NilaiSubCPMK {
  id: number;
  mahasiswa: string;
  nim: string;
  mataKuliah: string;
  subCPMK: string;
  nilai: number;
  tanggalInput: string;
}
```

**Actions:**
- ✅ View nilai mahasiswa
- ✅ Input nilai baru
- ✅ Edit nilai
- ✅ Delete nilai
- ✅ Filter by mahasiswa/mata kuliah

---

### Step 5: Capaian CPL Mahasiswa (R/W/D)

**File**: `app/superadmin/capaian/page.tsx`

**Data Structure:**
```typescript
interface CapaianCPL {
  id: number;
  mahasiswa: string;
  nim: string;
  cpl: string;
  capaian: number;
  status: 'Excellent' | 'Good' | 'Satisfactory' | 'Needs Improvement';
  semester: number;
}
```

**Actions:**
- ✅ View capaian mahasiswa
- ✅ Update capaian
- ✅ Generate report
- ✅ Export data

---

## 🎨 UI Components yang Digunakan

### 1. Buttons
```tsx
// Primary button (for CREATE)
<button className="btn btn-primary">
  <Plus size={18} />
  Tambah Data
</button>

// Secondary button (for EDIT)
<button className="btn btn-sm btn-secondary">
  <Edit2 size={14} />
  Edit
</button>

// Danger button (for DELETE)
<button className="btn btn-sm" style={{ backgroundColor: '#fde8e8', color: '#9b1c1c' }}>
  <Trash2 size={14} />
  Hapus
</button>
```

### 2. Table
```tsx
<div className="card" style={{ padding: 0 }}>
  <table className="data-table">
    <thead>
      <tr>
        <th>Column</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Data</td>
      </tr>
    </tbody>
  </table>
</div>
```

### 3. Search Input
```tsx
<div style={{ position: 'relative' }}>
  <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
  <input
    type="text"
    placeholder="Cari..."
    className="input-field"
    style={{ paddingLeft: '40px' }}
  />
</div>
```

### 4. Badge
```tsx
<span className="badge badge-green">Active</span>
<span className="badge badge-yellow">Pending</span>
<span className="badge badge-red">Inactive</span>
```

### 5. Modal
```tsx
{showModal && (
  <div className="modal-overlay" onClick={() => setShowModal(false)}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <h2>Modal Title</h2>
      {/* Form content */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button onClick={() => setShowModal(false)} className="btn btn-secondary">
          Batal
        </button>
        <button className="btn btn-primary">
          Simpan
        </button>
      </div>
    </div>
  </div>
)}
```

---

## 🔐 Access Control Implementation

### Check User Role
```tsx
import { useAuth } from '@/contexts/AuthContext';

export default function FeaturePage() {
  const { user } = useAuth();
  
  // Check if user has write access
  const canWrite = user?.role?.toLowerCase() === 'superadmin';
  
  // Check if user has delete access
  const canDelete = user?.role?.toLowerCase() === 'superadmin';
  
  return (
    <>
      {canWrite && (
        <button onClick={handleCreate}>Tambah Data</button>
      )}
      
      {canDelete && (
        <button onClick={handleDelete}>Hapus</button>
      )}
    </>
  );
}
```

---

## 📊 Next Steps

1. ✅ **Manajemen User** - Complete
2. ✅ **Audit Log** - Complete
3. ⏳ **Program Studi & CPL** - Use template above
4. ⏳ **Mata Kuliah & Pemetaan** - Use template above
5. ⏳ **Sub-CPMK** - Use template above
6. ⏳ **Input Nilai Sub-CPMK** - Use template above
7. ⏳ **Capaian CPL Mahasiswa** - Use template above
8. ⏳ **Pengaturan** - System settings

---

## 🎯 Testing Checklist

Untuk setiap fitur, pastikan:

- [ ] **READ**: Data ditampilkan dengan benar
- [ ] **WRITE**: Tombol create/edit berfungsi
- [ ] **DELETE**: Tombol delete dengan confirmation
- [ ] Search functionality bekerja
- [ ] Filter functionality bekerja
- [ ] Modal create/edit muncul
- [ ] Form validation
- [ ] Success/error messages
- [ ] Responsive design
- [ ] Access control sesuai role

---

**Status**: 2/8 Complete (Manajemen User & Audit Log)  
**Next**: Implement remaining features using template above
