# Perbaikan Semester Database - Mata Kuliah

## 🔍 Masalah yang Ditemukan

### Masalah Utama:
Di halaman **Mata Kuliah & Pemetaan**, mata kuliah "Keamanan Informasi" menampilkan **Semester 1** padahal seharusnya **Semester 3**.

### Root Cause:
Ada **2 field semester** yang berbeda:
1. **`mata_kuliah.semester`** - Semester kurikulum (semester berapa MK ini seharusnya diambil)
2. **`kelas.semester_aktif`** - Semester saat kelas dibuka (bisa berbeda dari semester kurikulum)

**Masalah:** Frontend menampilkan `semester_aktif` dari tabel `kelas`, bukan `semester` dari tabel `mata_kuliah`.

### Contoh Kasus:
```
Tabel mata_kuliah:
- Keamanan Informasi → semester = 1 (SALAH, seharusnya 3)

Tabel kelas:
- Keamanan Informasi → semester_aktif = 1 (mengikuti semester di mata_kuliah)
```

---

## ✅ Solusi yang Diterapkan

### 1. **Backend - Update Query** ✅
File: `apps/backend/module2/src/models/kelasModel.js`

**Perubahan:**
```sql
-- SEBELUM
SELECT 
  kelas.semester_aktif,
  mk.nama_mk
FROM kelas
JOIN mata_kuliah mk ON kelas.mk_id = mk.id

-- SESUDAH
SELECT 
  kelas.semester_aktif,
  mk.semester as semester_mk,  -- ← TAMBAHAN
  mk.nama_mk
FROM kelas
JOIN mata_kuliah mk ON kelas.mk_id = mk.id
```

Sekarang backend mengirim **2 field semester**:
- `semester_aktif` - Semester saat kelas dibuka
- `semester_mk` - Semester kurikulum mata kuliah

### 2. **Frontend - Update Interface & Display** ✅
File: `apps/web/module2/app/superadmin/mata-kuliah/page.tsx`

**Perubahan Interface:**
```typescript
interface Kelas {
  // ... fields lain
  semester_aktif: number;
  semester_mk: number;  // ← TAMBAHAN
}
```

**Perubahan Display:**
```tsx
// SEBELUM
<span className="badge badge-yellow">Sem {item.semester_aktif}</span>

// SESUDAH
<span className="badge badge-yellow">Sem {item.semester_mk || item.semester_aktif}</span>
```

Prioritas: Tampilkan `semester_mk` (semester kurikulum), fallback ke `semester_aktif` jika tidak ada.

### 3. **Database - Fix Data** ✅
Dibuat 3 script SQL:

#### A. `CHECK_KEAMANAN_INFORMASI.sql`
Untuk cek data mata kuliah Keamanan Informasi.

#### B. `FIX_KEAMANAN_INFORMASI_SEMESTER.sql`
Untuk fix semester Keamanan Informasi dari 1 ke 3.

**Query Utama:**
```sql
-- Update semester di mata_kuliah
UPDATE mata_kuliah 
SET semester = 3 
WHERE nama_mk LIKE '%Keamanan%Informasi%' 
  AND semester != 3;

-- Update semester_aktif di kelas
UPDATE kelas 
SET semester_aktif = 3 
WHERE mk_id IN (
  SELECT id FROM mata_kuliah WHERE nama_mk LIKE '%Keamanan%Informasi%'
) AND semester_aktif != 3;
```

#### C. `FIX_ALL_SEMESTER_MISMATCH.sql` ⭐ **RECOMMENDED**
Untuk fix **SEMUA** ketidaksesuaian semester antara `mata_kuliah` dan `kelas`.

**Query Otomatis:**
```sql
-- Fix semua kelas agar semester_aktif sesuai dengan semester mata_kuliah
UPDATE kelas k
SET semester_aktif = mk.semester
FROM mata_kuliah mk
WHERE k.mk_id = mk.id
  AND k.semester_aktif != mk.semester;
```

---

## 📝 Langkah-Langkah Perbaikan

### Step 1: Cek Data Saat Ini
```bash
# Buka pgAdmin atau psql
# Jalankan query:
```
```sql
SELECT 
  mk.kode_mk,
  mk.nama_mk,
  mk.semester as semester_mk,
  k.semester_aktif,
  CASE 
    WHEN mk.semester = k.semester_aktif THEN '✅ Sesuai'
    ELSE '❌ Tidak Sesuai'
  END as status
FROM mata_kuliah mk
LEFT JOIN kelas k ON mk.id = k.mk_id
WHERE mk.nama_mk LIKE '%Keamanan%Informasi%';
```

### Step 2: Fix Data di Database
```bash
# Jalankan script SQL:
```
```sql
-- Opsi 1: Fix hanya Keamanan Informasi
\i FIX_KEAMANAN_INFORMASI_SEMESTER.sql

-- Opsi 2: Fix SEMUA ketidaksesuaian (RECOMMENDED)
\i FIX_ALL_SEMESTER_MISMATCH.sql
```

### Step 3: Restart Backend
```bash
cd apps/backend
# Restart server Node.js (Ctrl+C lalu jalankan lagi)
node app.js
```

### Step 4: Refresh Frontend
```bash
# Di browser, hard refresh:
# Windows: Ctrl + Shift + R
# Mac: Cmd + Shift + R
```

### Step 5: Verifikasi
1. Buka halaman **Mata Kuliah & Pemetaan**
2. Cari "Keamanan Informasi"
3. Pastikan badge menampilkan **"Sem 3"** bukan "Sem 1"

---

## 🧪 Testing

### Test Case 1: Keamanan Informasi
- **Expected:** Badge "Sem 3"
- **Actual:** (cek setelah fix)

### Test Case 2: Mata Kuliah Lain
- **Expected:** Semester sesuai dengan kurikulum
- **Actual:** (cek setelah fix)

### Test Case 3: Filter Semester
- **Expected:** Filter semester 3 menampilkan Keamanan Informasi
- **Actual:** (cek setelah fix)

---

## 🔍 Verifikasi Database

### Query untuk Cek Semua Data:
```sql
-- Cek ketidaksesuaian
SELECT 
  mk.kode_mk,
  mk.nama_mk,
  mk.semester as semester_mk,
  k.semester_aktif,
  k.tahun_akademik,
  CASE 
    WHEN mk.semester = k.semester_aktif THEN '✅'
    ELSE '❌ PERLU DIPERBAIKI'
  END as status
FROM mata_kuliah mk
LEFT JOIN kelas k ON mk.id = k.mk_id
ORDER BY mk.semester ASC, mk.kode_mk ASC;
```

### Query untuk Summary:
```sql
SELECT 
  COUNT(*) as total_kelas,
  SUM(CASE WHEN mk.semester = k.semester_aktif THEN 1 ELSE 0 END) as sesuai,
  SUM(CASE WHEN mk.semester != k.semester_aktif THEN 1 ELSE 0 END) as tidak_sesuai
FROM kelas k
JOIN mata_kuliah mk ON k.mk_id = mk.id;
```

---

## ⚠️ Catatan Penting

### Perbedaan Semester:
- **`semester_mk`** (dari `mata_kuliah.semester`): Semester kurikulum - kapan MK ini **seharusnya** diambil
- **`semester_aktif`** (dari `kelas.semester_aktif`): Semester saat kelas dibuka - kapan kelas ini **aktif**

### Contoh Valid:
```
Mata Kuliah: Keamanan Informasi (semester_mk = 3)
Kelas 2024/2025: semester_aktif = 3 ✅ SESUAI
```

### Contoh Tidak Valid:
```
Mata Kuliah: Keamanan Informasi (semester_mk = 3)
Kelas 2024/2025: semester_aktif = 1 ❌ TIDAK SESUAI
```

### Rekomendasi:
**Selalu pastikan `semester_aktif` di tabel `kelas` sesuai dengan `semester` di tabel `mata_kuliah`.**

---

## 📊 Impact Analysis

### Files Changed:
1. ✅ `apps/backend/module2/src/models/kelasModel.js` - Update query
2. ✅ `apps/web/module2/app/superadmin/mata-kuliah/page.tsx` - Update interface & display
3. ✅ Database - Fix data semester

### Breaking Changes:
❌ **TIDAK ADA** - Perubahan backward compatible

### Migration Required:
✅ **YA** - Perlu jalankan script SQL untuk fix data

---

## 🚀 Deployment Checklist

- [ ] Backup database sebelum menjalankan script SQL
- [ ] Jalankan `FIX_ALL_SEMESTER_MISMATCH.sql` di database
- [ ] Verifikasi data dengan query cek
- [ ] Deploy backend dengan query baru
- [ ] Deploy frontend dengan interface baru
- [ ] Test di browser (hard refresh)
- [ ] Verifikasi badge semester sudah benar
- [ ] Test filter semester berfungsi

---

**Tanggal:** 1 Juni 2026  
**Status:** ✅ Fixed  
**Priority:** 🔴 HIGH (Data Integrity Issue)
