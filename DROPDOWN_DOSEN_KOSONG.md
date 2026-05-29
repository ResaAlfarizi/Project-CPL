# Dropdown Dosen Kosong - Solusi

## Masalah
Dropdown "Dosen Pengampu" kosong saat tambah kelas.

## Penyebab
1. **Belum ada data dosen** di database
2. **Filter terlalu ketat** - hanya menampilkan dosen dengan prodi_id yang sama persis

## Solusi

### 1. ✅ Perbaiki Filter Dosen

**File**: `apps/web/module2/app/admin-prodi/mata-kuliah/page.tsx`

**Filter Lama** (Terlalu Ketat):
```typescript
const filteredDosen = allDosen.filter((d: Dosen) => 
  String(d.prodi_id) === String(prodiId)
);
```

**Filter Baru** (Lebih Fleksibel):
```typescript
const filteredDosen = prodiId 
  ? allDosen.filter((d: Dosen) => 
      !d.prodi_id || String(d.prodi_id) === String(prodiId)
    )
  : allDosen;
```

**Penjelasan**:
- Tampilkan dosen yang **tidak punya prodi_id** (NULL)
- Tampilkan dosen yang **prodi_id-nya sesuai**
- Jika admin tidak punya prodi_id, tampilkan semua dosen

### 2. ✅ Tambah Console Log untuk Debug

Ditambahkan console.log untuk melihat data:
```typescript
console.log('All Dosen:', allDosen);
console.log('Filtered Dosen:', filteredDosen);
console.log('User prodi_id:', prodiId);
```

**Cara Cek**:
1. Buka halaman Mata Kuliah
2. Klik "Tambah Kelas"
3. Buka Console (F12)
4. Lihat log untuk debugging

### 3. ⚠️ Cek Data Dosen di Database

**Jalankan SQL**: `CHECK_DOSEN.sql`

```sql
-- Cek semua dosen
SELECT 
    d.id, d.nidn, d.nama,
    ps.nama_prodi
FROM dosen d
LEFT JOIN program_studi ps ON d.prodi_id = ps.id;
```

**Jika Kosong**, jalankan: `ADD_DOSEN_TEST.sql`

## Langkah Testing

### 1. Cek Database
```sql
-- File: CHECK_DOSEN.sql
-- Cek apakah ada data dosen
```

**Expected Result**:
```
| id | nidn | nama | prodi |
|----|------|------|-------|
| ... | 0123456789 | Dr. Ahmad Wijaya | Teknik Informatika |
| ... | 0987654321 | Dr. Budi Santoso | Teknik Informatika |
```

### 2. Jika Tidak Ada Dosen, Tambahkan
```sql
-- File: ADD_DOSEN_TEST.sql
-- Tambah 2 dosen test
```

**Dosen yang Ditambahkan**:
1. Dr. Ahmad Wijaya, S.Kom., M.Kom.
   - Email: dosen1@university.ac.id
   - NIDN: 0123456789

2. Dr. Budi Santoso, S.T., M.T.
   - Email: dosen2@university.ac.id
   - NIDN: 0987654321

### 3. Refresh Halaman
1. Refresh browser (F5)
2. Klik "Tambah Kelas"
3. Lihat dropdown "Dosen Pengampu"
4. Seharusnya ada pilihan dosen

### 4. Cek Console Log
1. Buka Console (F12)
2. Lihat log:
   ```
   All Dosen: [...]
   Filtered Dosen: [...]
   User prodi_id: ...
   ```

## Troubleshooting

### Dropdown Masih Kosong Setelah Tambah Dosen

**Kemungkinan 1**: Data belum di-refresh
- **Solusi**: Refresh halaman (F5)

**Kemungkinan 2**: API dosen tidak mengembalikan data
- **Solusi**: Cek console error
- Cek Network tab untuk response `/api/v1/m1/dosen`

**Kemungkinan 3**: Filter masih terlalu ketat
- **Solusi**: Cek console log untuk melihat data yang difilter

### Dosen Ada di Database Tapi Tidak Muncul

**Cek prodi_id**:
```sql
-- Cek prodi_id dosen
SELECT d.nama, d.prodi_id, ps.nama_prodi
FROM dosen d
LEFT JOIN program_studi ps ON d.prodi_id = ps.id;

-- Cek prodi_id admin
SELECT u.email, u.prodi_id, ps.nama_prodi
FROM users u
LEFT JOIN program_studi ps ON u.prodi_id = ps.id
WHERE u.email = 'admin.if@university.ac.id';
```

**Solusi**:
- Jika dosen punya prodi_id yang berbeda, update:
  ```sql
  UPDATE dosen
  SET prodi_id = (SELECT id FROM program_studi WHERE kode_prodi = 'IF')
  WHERE nidn = '0123456789';
  ```

- Atau set prodi_id dosen ke NULL agar muncul untuk semua prodi:
  ```sql
  UPDATE dosen
  SET prodi_id = NULL
  WHERE nidn = '0123456789';
  ```

## Expected Result

**Dropdown "Dosen Pengampu"**:
```
┌─────────────────────────────────────────────┐
│ Pilih Dosen (Opsional)                      │
├─────────────────────────────────────────────┤
│ Dr. Ahmad Wijaya, S.Kom., M.Kom. - 0123456789 │
│ Dr. Budi Santoso, S.T., M.T. - 0987654321   │
└─────────────────────────────────────────────┘
```

**Form Tambah Kelas**:
```
Mata Kuliah: [IF101 - Pemrograman Web (3 SKS)]
Dosen Pengampu: [Dr. Ahmad Wijaya, S.Kom., M.Kom. - 0123456789]
Tahun Akademik: [2024/2025]
Semester Aktif: [3]
Nama Kelas: [Kelas A]
```

## File yang Diubah/Ditambahkan

1. ✅ `apps/web/module2/app/admin-prodi/mata-kuliah/page.tsx`
   - Filter dosen diperbaiki
   - Console log ditambahkan

2. ✅ `CHECK_DOSEN.sql` (NEW)
   - Script untuk cek data dosen

3. ✅ `ADD_DOSEN_TEST.sql` (NEW)
   - Script untuk tambah dosen test

## Status
✅ Filter diperbaiki
⚠️ Perlu cek database dan tambah dosen jika belum ada

---

**LANGKAH SELANJUTNYA**:
1. Jalankan `CHECK_DOSEN.sql` di database
2. Jika tidak ada dosen, jalankan `ADD_DOSEN_TEST.sql`
3. Refresh halaman
4. Cek dropdown dosen
5. Lihat console log untuk debugging
