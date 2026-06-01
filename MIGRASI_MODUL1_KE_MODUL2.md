# Migrasi Fitur Modul 1 ke Modul 2 Superadmin

## 📊 Analisis Fitur

### Fitur Modul 1 (Dashboard):
1. ✅ CPL
2. ✅ Dashboard
3. ✅ Dosen
4. ✅ Mahasiswa
5. ✅ Mapping (MK-CPL)
6. ✅ Mata Kuliah
7. ✅ Prodi
8. ✅ Sub-CPMK
9. ✅ Threshold

### Fitur Modul 2 Superadmin (Yang Sudah Ada):
1. ✅ Capaian
2. ✅ Input Nilai
3. ✅ Mata Kuliah (berbeda dengan modul 1 - ini adalah Kelas)
4. ✅ Prodi-CPL (mapping CPL ke prodi)
5. ✅ Sub-CPMK
6. ✅ Access Matrix
7. ✅ Audit Log
8. ✅ Settings
9. ✅ Users

---

## 🎯 Fitur yang Perlu Ditambahkan

### 1. **Prodi** (Program Studi) ❌
**Deskripsi:** Manajemen data program studi (kode, nama, jenjang)

**Fitur:**
- CRUD Prodi (Create, Read, Update, Delete)
- Filter/Search prodi
- Jenjang: D3, S1, S2, S3
- Summary cards per jenjang

**API Endpoint:** `/api/v1/m1/prodi`

**UI Adaptasi:**
- Gunakan Urbanist font
- Color palette: Eerie Black, Ghost White, Alice Blue, Honeydew, Vanilla
- Table layout dengan badge untuk jenjang
- Modal untuk Add/Edit
- Konfirmasi delete

---

### 2. **Dosen** ❌
**Deskripsi:** Manajemen data dosen (NIDN, nama)

**Fitur:**
- CRUD Dosen
- Search by NIDN atau nama
- Summary: Total dosen

**API Endpoint:** `/api/v1/m1/dosen`

**UI Adaptasi:**
- Table layout sederhana
- Badge untuk NIDN
- Modal untuk Add/Edit
- NIDN tidak bisa diubah setelah dibuat

---

### 3. **Mahasiswa** ❌
**Deskripsi:** Manajemen data mahasiswa (NIM, nama, prodi, angkatan)

**Fitur:**
- CRUD Mahasiswa
- Filter per Prodi
- Filter per Angkatan
- Search by NIM atau nama
- Relasi dengan Prodi

**API Endpoint:** `/api/v1/m1/mahasiswa`

**UI Adaptasi:**
- Table dengan kolom: NIM, Nama, Prodi, Angkatan
- Filter dropdown: Prodi, Angkatan
- Badge untuk NIM dan Angkatan
- Modal untuk Add/Edit
- NIM tidak bisa diubah setelah dibuat

---

### 4. **Threshold** ❌
**Deskripsi:** Konfigurasi threshold status CPL per prodi

**Fitur:**
- 5 Status default:
  - Excellence (85-100)
  - Satisfactory (70-84.99)
  - Competent (55-69.99)
  - Developing (40-54.99)
  - Not Competent (0-39.99)
- Konfigurasi per Prodi
- Visual bar untuk rentang nilai
- Reset ke default
- Validasi rentang nilai

**API Endpoint:** `/api/v1/m1/threshold`

**UI Adaptasi:**
- Dropdown pilih Prodi
- Card untuk setiap status dengan warna berbeda
- Input untuk nilai_min dan nilai_max
- Visual bar progress
- Preview table
- Button: Reset Default, Simpan

---

### 5. **Mapping (MK-CPL)** ⚠️ **SKIP**
**Alasan:** Sudah ada fitur "Mata Kuliah & Pemetaan" di modul 2 yang menangani kelas dan pemetaan MK-CPL melalui backend.

---

## 🎨 UI Guidelines

### Color Palette:
- **Eerie Black:** `#232321` (text primary)
- **Ghost White:** `#F7F5FA` (background)
- **Alice Blue:** `#E4EAEF` (secondary background)
- **Honeydew:** `#CFE3CA` (success/green)
- **Vanilla:** `#EFFDA3` (warning/yellow)

### Typography:
- **Font:** Urbanist (Regular, Medium, Bold, Extra Bold)
- **Sizes:**
  - Title: 24px (Extra Bold)
  - Subtitle: 14px (Regular)
  - Body: 14px (Regular)
  - Small: 12px (Regular)

### Components:
- **Buttons:** Rounded, dengan icon SVG
- **Badges:** Rounded pill dengan warna sesuai kategori
- **Cards:** Shadow subtle, border-radius 12px
- **Tables:** Zebra striping, hover effect
- **Modals:** Centered, backdrop blur
- **Forms:** Label bold, input dengan border

### Badge Colors:
- **Blue:** `#3b82f6` (info)
- **Green:** `#10b981` (success)
- **Yellow:** `#f59e0b` (warning)
- **Red:** `#ef4444` (danger)
- **Gray:** `#6b7280` (neutral)

---

## 📁 Struktur File

### Lokasi File Baru:
```
apps/web/module2/app/superadmin/
├── prodi/
│   └── page.tsx
├── dosen/
│   └── page.tsx
├── mahasiswa/
│   └── page.tsx
└── threshold/
    └── page.tsx
```

### Update Sidebar:
File: `apps/web/module2/components/SuperadminSidebar.tsx`

Tambahkan menu:
- Prodi
- Dosen
- Mahasiswa
- Threshold

---

## 🔧 API Integration

### Endpoints yang Digunakan:

**Prodi:**
- GET `/api/v1/m1/prodi` - List all
- POST `/api/v1/m1/prodi` - Create
- PUT `/api/v1/m1/prodi/:id` - Update
- DELETE `/api/v1/m1/prodi/:id` - Delete

**Dosen:**
- GET `/api/v1/m1/dosen` - List all
- POST `/api/v1/m1/dosen` - Create
- PUT `/api/v1/m1/dosen/:id` - Update
- DELETE `/api/v1/m1/dosen/:id` - Delete

**Mahasiswa:**
- GET `/api/v1/m1/mahasiswa` - List all
- POST `/api/v1/m1/mahasiswa` - Create
- PUT `/api/v1/m1/mahasiswa/:id` - Update
- DELETE `/api/v1/m1/mahasiswa/:id` - Delete

**Threshold:**
- GET `/api/v1/m1/threshold` - List all
- POST `/api/v1/m1/threshold/save/:prodi_id` - Save threshold per prodi

---

## ✅ Checklist Implementasi

### Prodi:
- [ ] Buat file `apps/web/module2/app/superadmin/prodi/page.tsx`
- [ ] Implementasi CRUD
- [ ] Summary cards per jenjang
- [ ] Search/filter
- [ ] Modal Add/Edit
- [ ] Konfirmasi Delete
- [ ] Integrasi API

### Dosen:
- [ ] Buat file `apps/web/module2/app/superadmin/dosen/page.tsx`
- [ ] Implementasi CRUD
- [ ] Search by NIDN/nama
- [ ] Summary total dosen
- [ ] Modal Add/Edit
- [ ] Konfirmasi Delete
- [ ] Integrasi API

### Mahasiswa:
- [ ] Buat file `apps/web/module2/app/superadmin/mahasiswa/page.tsx`
- [ ] Implementasi CRUD
- [ ] Filter per Prodi
- [ ] Filter per Angkatan
- [ ] Search by NIM/nama
- [ ] Modal Add/Edit
- [ ] Konfirmasi Delete
- [ ] Integrasi API

### Threshold:
- [ ] Buat file `apps/web/module2/app/superadmin/threshold/page.tsx`
- [ ] Dropdown pilih Prodi
- [ ] 5 Status cards dengan warna
- [ ] Input nilai_min dan nilai_max
- [ ] Visual bar progress
- [ ] Preview table
- [ ] Button Reset Default
- [ ] Button Simpan
- [ ] Validasi rentang nilai
- [ ] Integrasi API

### Sidebar:
- [ ] Update `SuperadminSidebar.tsx`
- [ ] Tambah menu Prodi
- [ ] Tambah menu Dosen
- [ ] Tambah menu Mahasiswa
- [ ] Tambah menu Threshold

---

## 🚀 Prioritas Implementasi

1. **HIGH:** Prodi (karena dibutuhkan oleh Mahasiswa)
2. **HIGH:** Dosen
3. **HIGH:** Mahasiswa
4. **MEDIUM:** Threshold

---

## 📝 Notes

- Semua fitur menggunakan **TypeScript** (`.tsx`)
- Gunakan **Toast notification** untuk feedback
- Gunakan **Modal** untuk Add/Edit
- Gunakan **Confirm dialog** untuk Delete
- Semua API call menggunakan **try-catch**
- Loading state untuk setiap API call
- Form validation sebelum submit

---

**Status:** 🔄 In Progress
**Tanggal:** 1 Juni 2026
