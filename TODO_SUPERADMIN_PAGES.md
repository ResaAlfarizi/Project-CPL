# TODO: Halaman Superadmin yang Perlu Dibuat

## ✅ Yang Sudah Dibuat:
1. ✅ **Prodi** - `apps/web/module2/app/superadmin/prodi/page.tsx`

## ❌ Yang Perlu Dibuat:

### 2. **Dosen** 
**File:** `apps/web/module2/app/superadmin/dosen/page.tsx`
**API:** `http://localhost:3000/api/v1/m1/dosen`
**Fitur:**
- CRUD Dosen (NIDN, Nama)
- Search by NIDN atau nama
- Summary: Total dosen
- NIDN tidak bisa diubah setelah dibuat

### 3. **Mahasiswa**
**File:** `apps/web/module2/app/superadmin/mahasiswa/page.tsx`
**API:** `http://localhost:3000/api/v1/m1/mahasiswa`
**Fitur:**
- CRUD Mahasiswa (NIM, Nama, Prodi, Angkatan)
- Filter per Prodi
- Filter per Angkatan
- Search by NIM atau nama
- NIM tidak bisa diubah setelah dibuat

### 4. **CPL**
**File:** `apps/web/module2/app/superadmin/cpl/page.tsx`
**API:** `http://localhost:3000/api/v1/m1/kurikulum/cpl`
**Fitur:**
- CRUD CPL (Kode CPL, Deskripsi, Prodi)
- Filter per Prodi
- Search by kode atau deskripsi

### 5. **Pemetaan MK-CPL**
**File:** `apps/web/module2/app/superadmin/mapping/page.tsx`
**API:** `http://localhost:3000/api/v1/m1/kurikulum/mapping`
**Fitur:**
- Mapping Mata Kuliah ke CPL
- Bobot per mapping
- Filter per Prodi
- Filter per Mata Kuliah

### 6. **Threshold**
**File:** `apps/web/module2/app/superadmin/threshold/page.tsx`
**API:** `http://localhost:3000/api/v1/m1/threshold`
**Fitur:**
- 5 Status: Excellence, Satisfactory, Competent, Developing, Not Competent
- Konfigurasi per Prodi
- Visual bar untuk rentang nilai
- Reset ke default
- Preview table

### 7. **Monitoring CPL**
**File:** `apps/web/module2/app/superadmin/monitoring-cpl/page.tsx`
**Fitur:**
- Dashboard monitoring pencapaian CPL
- Filter per Prodi, Angkatan, CPL
- Chart/grafik pencapaian
- Export data

### 8. **Role Permission**
**File:** `apps/web/module2/app/superadmin/role-permission/page.tsx`
**Fitur:**
- Manajemen role dan permission
- Matrix permission per role
- CRUD role

---

## 📝 Update Sidebar

**File:** `apps/web/module2/components/SuperadminSidebar.tsx`

**Struktur Menu:**
```
SUPERADMIN
├── Dashboard
├── MASTER DATA
│   ├── Program Studi ✅
│   ├── CPL ❌
│   ├── Dosen ❌
│   ├── Mahasiswa ❌
│   ├── Mata Kuliah ✅
│   ├── Pemetaan MK-CPL ❌
│   ├── Sub CPMK ✅
│   └── Threshold ❌
├── OPERASIONAL
│   ├── Manajemen User ✅ (Users)
│   ├── Role Permission ❌
│   ├── Monitoring CPL ❌
│   └── Audit Log ✅
└── Pengaturan ✅ (Settings)
```

---

## 🎯 Prioritas:

1. **HIGH:** Dosen (dependency untuk kelas)
2. **HIGH:** Mahasiswa (dependency untuk enrollment)
3. **HIGH:** CPL (dependency untuk mapping)
4. **MEDIUM:** Pemetaan MK-CPL
5. **MEDIUM:** Threshold
6. **LOW:** Monitoring CPL
7. **LOW:** Role Permission

---

## 📋 Checklist:

- [x] Prodi
- [ ] Dosen
- [ ] Mahasiswa
- [ ] CPL
- [ ] Pemetaan MK-CPL
- [ ] Threshold
- [ ] Monitoring CPL
- [ ] Role Permission
- [ ] Update Sidebar

---

**Status:** 🔄 In Progress (1/8 selesai)
**Next:** Buat halaman Dosen
