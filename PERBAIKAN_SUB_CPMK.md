# ✅ Perbaikan Halaman Sub-CPMK

## 🔧 Masalah yang Diperbaiki

### 1. Kolom "Dibuat" Tidak Muncul
**Masalah**: Kolom "Dibuat" menampilkan "-" karena backend tidak mengirim field `created_at`

**Solusi**: 
- ❌ Hapus kolom "Dibuat" (tidak ada di database sub_cpmk)
- ✅ Ganti dengan kolom "Mata Kuliah" dan "CPL" yang lebih informatif

### 2. Tidak Ada Informasi CPL
**Masalah**: Tidak terlihat sub-CPMK ini terkait dengan CPL yang mana

**Solusi**:
- ✅ Tambah kolom "Mata Kuliah" (kode_mk + nama_mk)
- ✅ Tambah kolom "CPL" (kode_cpl)
- ✅ Data diambil dari JOIN dengan tabel mk_cpl, mata_kuliah, dan cpl

### 3. Input MK-CPL ID Manual
**Masalah**: User harus input ID manual (tidak user-friendly)

**Solusi**:
- ✅ Ganti dengan dropdown "Mata Kuliah & CPL"
- ✅ Dropdown menampilkan: "Kode MK - Nama MK → Kode CPL"
- ✅ Data diambil dari API `mkCplApi.getAll()`

---

## 📊 Perubahan Tabel

### Before:
| No | Kode Sub-CPMK | Deskripsi | Bobot (%) | Dibuat | Aksi |
|----|---------------|-----------|-----------|--------|------|
| 1  | SCPL-01       | ...       | 0.5000%   | -      | Edit Hapus |

**Masalah**:
- ❌ Bobot salah format (0.5000% seharusnya 50%)
- ❌ Dibuat tidak muncul
- ❌ Tidak tahu CPL mana yang terkait

### After:
| No | Kode Sub-CPMK | Deskripsi | Mata Kuliah | CPL | Bobot (%) | Aksi |
|----|---------------|-----------|-------------|-----|-----------|------|
| 1  | SCPL-01       | Mampu membuat program sederhana | IF101<br>Pemrograman Dasar | CPL-01 | 50.0% | Edit Hapus |

**Perbaikan**:
- ✅ Bobot format benar (50.0%)
- ✅ Mata Kuliah ditampilkan (kode + nama)
- ✅ CPL ditampilkan (kode_cpl)
- ✅ Informasi lengkap dan jelas

---

## 📝 Perubahan Form

### Before:
```
Kode Sub-CPMK: [input text]
Deskripsi: [textarea]
MK-CPL ID: [input text] ← User harus tahu ID manual
Bobot (%): [input number]
```

**Masalah**:
- ❌ User harus tahu MK-CPL ID (tidak user-friendly)
- ❌ Tidak tahu ID mana yang sesuai

### After:
```
Kode Sub-CPMK: [input text]
Deskripsi: [textarea]
Mata Kuliah & CPL: [dropdown] ← User pilih dari list
  - IF101 - Pemrograman Dasar → CPL-01
  - IF102 - Struktur Data → CPL-02
  - IF201 - Basis Data → CPL-03
Bobot (%): [input number]
```

**Perbaikan**:
- ✅ Dropdown user-friendly
- ✅ Menampilkan kode MK, nama MK, dan kode CPL
- ✅ User tidak perlu tahu ID manual

---

## 🔄 Data Flow

### Load Sub-CPMK:
```
1. Frontend: loadSubCpmk()
   ↓
2. API Call: subCpmkApi.getAll()
   ↓
3. Backend Query:
   SELECT 
     sc.id,
     sc.kode_sub_cpmk,
     sc.deskripsi,
     sc.bobot,
     mk.kode_mk,
     mk.nama_mk,
     cpl.kode_cpl
   FROM sub_cpmk sc
   JOIN mk_cpl mc ON sc.mk_cpl_id = mc.id
   JOIN mata_kuliah mk ON mc.mk_id = mk.id
   JOIN cpl ON mc.cpl_id = cpl.id
   ↓
4. Frontend: Display in table
```

### Load MK-CPL Dropdown:
```
1. Frontend: loadMKCPL()
   ↓
2. API Call: mkCplApi.getAll()
   ↓
3. Backend Query:
   SELECT 
     mc.id,
     mk.kode_mk,
     mk.nama_mk,
     cpl.kode_cpl
   FROM mk_cpl mc
   JOIN mata_kuliah mk ON mc.mk_id = mk.id
   JOIN cpl ON mc.cpl_id = cpl.id
   ↓
4. Frontend: Populate dropdown
```

---

## 📋 Struktur Data

### SubCPMK Interface (Updated):
```typescript
interface SubCPMK {
  id: number;
  kode_sub_cpmk: string;
  deskripsi: string;
  bobot: number;              // 0-1 (backend)
  mk_cpl_id?: number;
  kode_cpl?: string;          // ✅ NEW
  kode_mk?: string;           // ✅ NEW
  nama_mk?: string;           // ✅ NEW
  created_at?: string;
}
```

### MKCPL Interface (New):
```typescript
interface MKCPL {
  id: number;
  mk_id: string;
  cpl_id: string;
  kode_mk: string;
  nama_mk: string;
  kode_cpl: string;
  deskripsi_cpl: string;
}
```

---

## 🎨 UI Improvements

### Tabel:
- ✅ Kolom "Mata Kuliah" dengan 2 baris:
  - Baris 1: Badge kode_mk (dark)
  - Baris 2: nama_mk (text secondary)
- ✅ Kolom "CPL" dengan badge (green)
- ✅ Bobot format: `(item.bobot * 100).toFixed(1)%` → "50.0%"

### Form:
- ✅ Dropdown MK-CPL dengan format:
  ```
  {kode_mk} - {nama_mk} → {kode_cpl}
  ```
  Contoh: "IF101 - Pemrograman Dasar → CPL-01"
- ✅ Saat edit: Dropdown disabled, tampilkan MK dan CPL yang dipilih
- ✅ Helper text yang jelas

---

## 🧪 Cara Test

### Test 1: Lihat Tabel
1. Buka http://localhost:3001/superadmin/sub-cpmk
2. Lihat kolom "Mata Kuliah" dan "CPL"
3. Harus muncul kode MK, nama MK, dan kode CPL ✅

### Test 2: Tambah Sub-CPMK
1. Klik "Tambah Sub-CPMK"
2. Lihat dropdown "Mata Kuliah & CPL"
3. Harus ada pilihan dengan format: "Kode MK - Nama MK → Kode CPL" ✅
4. Pilih salah satu
5. Isi form lainnya
6. Klik "Simpan"
7. Data muncul di tabel dengan info MK dan CPL ✅

### Test 3: Edit Sub-CPMK
1. Klik "Edit" pada salah satu row
2. Modal terbuka dengan data pre-filled
3. Dropdown MK-CPL disabled (tidak bisa diubah)
4. Tampilkan MK dan CPL yang dipilih ✅
5. Edit bobot atau deskripsi
6. Klik "Simpan"
7. Data terupdate ✅

### Test 4: Bobot Format
1. Lihat kolom "Bobot (%)"
2. Harus format: "50.0%" bukan "0.5000%" ✅
3. Badge warna kuning ✅

---

## 📊 Database Schema

### sub_cpmk Table:
```sql
CREATE TABLE sub_cpmk (
  id SERIAL PRIMARY KEY,
  kode_sub_cpmk VARCHAR(20) NOT NULL,
  deskripsi TEXT NOT NULL,
  mk_cpl_id INTEGER REFERENCES mk_cpl(id),
  bobot DECIMAL(5,4) NOT NULL  -- 0.0000 to 1.0000
);
```

**Note**: Tidak ada kolom `created_at` di tabel sub_cpmk

### mk_cpl Table:
```sql
CREATE TABLE mk_cpl (
  id SERIAL PRIMARY KEY,
  mk_id UUID REFERENCES mata_kuliah(id),
  cpl_id UUID REFERENCES cpl(id),
  bobot DECIMAL(5,4)
);
```

---

## ✅ Hasil Akhir

### Tabel Sub-CPMK:
```
┌────┬──────────────┬─────────────────────────────┬──────────────────────┬─────────┬───────────┬──────────────┐
│ No │ Kode Sub-CPMK│ Deskripsi                   │ Mata Kuliah          │ CPL     │ Bobot (%) │ Aksi         │
├────┼──────────────┼─────────────────────────────┼──────────────────────┼─────────┼───────────┼──────────────┤
│ 1  │ SCPL-01      │ Mampu membuat program       │ IF101                │ CPL-01  │ 50.0%     │ Edit Hapus   │
│    │              │ sederhana                   │ Pemrograman Dasar    │         │           │              │
├────┼──────────────┼─────────────────────────────┼──────────────────────┼─────────┼───────────┼──────────────┤
│ 2  │ SCPL-02      │ Mampu menggunakan           │ IF101                │ CPL-01  │ 50.0%     │ Edit Hapus   │
│    │              │ percabangan dan looping     │ Pemrograman Dasar    │         │           │              │
└────┴──────────────┴─────────────────────────────┴──────────────────────┴─────────┴───────────┴──────────────┘
```

### Form Tambah:
```
┌─────────────────────────────────────────────────────────┐
│ Tambah Sub-CPMK                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Kode Sub-CPMK *                                         │
│ [SCPL-03                                            ]   │
│                                                         │
│ Deskripsi *                                             │
│ [Mampu bekerja dalam kelompok                       ]   │
│ [                                                   ]   │
│                                                         │
│ Mata Kuliah & CPL *                                     │
│ [▼ IF101 - Pemrograman Dasar → CPL-01              ]   │
│    IF102 - Struktur Data → CPL-02                      │
│    IF201 - Basis Data → CPL-03                         │
│                                                         │
│ Bobot (%) *                                             │
│ [100                                                ]   │
│ Masukkan bobot dalam persen (0-100)                    │
│                                                         │
│                                    [Batal]  [Simpan]   │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Summary

### ✅ Perbaikan:
1. ✅ Hapus kolom "Dibuat" (tidak ada di database)
2. ✅ Tambah kolom "Mata Kuliah" (kode + nama)
3. ✅ Tambah kolom "CPL" (kode_cpl)
4. ✅ Ganti input MK-CPL ID dengan dropdown
5. ✅ Format bobot benar (50.0% bukan 0.5000%)
6. ✅ Dropdown user-friendly dengan format jelas

### ✅ Fitur Baru:
- ✅ Load MK-CPL dari API
- ✅ Dropdown dengan format: "Kode MK - Nama MK → Kode CPL"
- ✅ Tampilkan info MK dan CPL di tabel
- ✅ Edit mode: Dropdown disabled, tampilkan MK & CPL

### ✅ Status:
- ✅ Data dari database (100%)
- ✅ CRUD lengkap
- ✅ Validation
- ✅ Loading states
- ✅ Error handling
- ✅ User-friendly

**Status: READY TO USE** 🎉
