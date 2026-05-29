# Mata Kuliah Tidak Muncul - Penjelasan

## Pertanyaan
"Sudah tambah mata kuliah tapi tidak muncul, gimana ya?"

## Penjelasan

### Perbedaan Mata Kuliah vs Kelas

**Halaman "Mata Kuliah & Pemetaan" menampilkan KELAS, bukan Mata Kuliah!**

#### Mata Kuliah (Data Master)
- Kode MK: IF101
- Nama: Pemrograman Web
- SKS: 3
- Semester: 3
- **Ini adalah template/blueprint**

#### Kelas (Instance)
- Mata Kuliah: IF101 - Pemrograman Web
- Tahun Akademik: 2024/2025
- Semester Aktif: 3
- Nama Kelas: Kelas A
- Dosen: Dr. Ahmad
- **Ini adalah kelas yang dibuka dari mata kuliah**

### Workflow yang Benar

```
1. Klik "Tambah Mata Kuliah"
   ↓
   Buat mata kuliah baru (IF101 - Pemrograman Web)
   ↓
   Mata kuliah tersimpan di database
   ↓
   
2. Klik "Tambah Kelas"
   ↓
   Pilih mata kuliah dari dropdown (IF101 - Pemrograman Web)
   ↓
   Isi tahun akademik, semester, dosen
   ↓
   Kelas dibuat dan MUNCUL DI TABEL
```

## Kenapa Mata Kuliah Tidak Muncul di Tabel?

**Karena tabel menampilkan KELAS, bukan mata kuliah!**

Setelah tambah mata kuliah:
1. ✅ Mata kuliah tersimpan di database
2. ✅ Mata kuliah muncul di **dropdown** saat klik "Tambah Kelas"
3. ❌ Mata kuliah **TIDAK** muncul di tabel (karena tabel untuk kelas)

## Cara Melihat Mata Kuliah yang Sudah Ditambahkan

### Opsi 1: Cek di Dropdown "Tambah Kelas"
1. Klik button "Tambah Kelas"
2. Lihat dropdown "Mata Kuliah"
3. Mata kuliah baru seharusnya ada di sana

### Opsi 2: Cek di Database
Jalankan SQL: `CHECK_MATA_KULIAH.sql`

```sql
-- Cek mata kuliah yang baru ditambahkan
SELECT 
    mk.kode_mk,
    mk.nama_mk,
    mk.sks,
    ps.nama_prodi,
    mk.created_at
FROM mk
JOIN program_studi ps ON mk.prodi_id = ps.id
ORDER BY mk.created_at DESC
LIMIT 10;
```

### Opsi 3: Buat Kelas dari Mata Kuliah Tersebut
1. Klik "Tambah Kelas"
2. Pilih mata kuliah yang baru dibuat
3. Isi form (tahun akademik, semester, dosen)
4. Simpan
5. **Sekarang akan muncul di tabel!**

## Contoh Lengkap

### Step 1: Tambah Mata Kuliah
```
Klik "Tambah Mata Kuliah"
- Kode MK: IF101
- Nama MK: Pemrograman Web
- SKS: 3
- Semester: 3
Klik "Simpan"
```

**Result**: Mata kuliah tersimpan, muncul notifikasi sukses

### Step 2: Cek Dropdown
```
Klik "Tambah Kelas"
Lihat dropdown "Mata Kuliah"
```

**Result**: IF101 - Pemrograman Web (3 SKS) ada di dropdown

### Step 3: Buat Kelas
```
Pilih: IF101 - Pemrograman Web
Tahun Akademik: 2024/2025
Semester Aktif: 3
Nama Kelas: Kelas A
Dosen: Dr. Ahmad
Klik "Simpan"
```

**Result**: Kelas muncul di tabel!

## Tabel Menampilkan Apa?

Tabel menampilkan **KELAS** dengan kolom:
- No
- Kode MK
- Nama Mata Kuliah
- SKS
- Tahun Akademik
- Semester
- Nama Kelas
- Dosen
- Aksi

**Setiap baris = 1 kelas yang dibuka**

Contoh:
```
| No | Kode MK | Nama MK          | SKS | Tahun      | Sem | Kelas   | Dosen     |
|----|---------|------------------|-----|------------|-----|---------|-----------|
| 1  | IF101   | Pemrograman Web  | 3   | 2024/2025  | 3   | Kelas A | Dr. Ahmad |
| 2  | IF101   | Pemrograman Web  | 3   | 2024/2025  | 3   | Kelas B | Dr. Budi  |
| 3  | IF102   | Basis Data       | 3   | 2024/2025  | 4   | Kelas A | Dr. Citra |
```

Perhatikan: IF101 muncul 2 kali karena ada 2 kelas (A dan B)

## Troubleshooting

### Mata Kuliah Tidak Muncul di Dropdown

**Kemungkinan**:
1. Mata kuliah tidak tersimpan (cek console error)
2. prodi_id tidak sesuai
3. Data belum di-refresh

**Solusi**:
1. Refresh halaman (F5)
2. Cek console (F12) untuk error
3. Jalankan SQL check: `CHECK_MATA_KULIAH.sql`

### Mata Kuliah Tersimpan Tapi Tidak di Dropdown

**Kemungkinan**: prodi_id tidak sesuai dengan admin yang login

**Solusi**:
```sql
-- Cek prodi_id mata kuliah
SELECT mk.kode_mk, mk.nama_mk, mk.prodi_id, ps.nama_prodi
FROM mk
LEFT JOIN program_studi ps ON mk.prodi_id = ps.id
WHERE mk.kode_mk = 'IF101';

-- Cek prodi_id admin
SELECT u.email, u.prodi_id, ps.nama_prodi
FROM users u
LEFT JOIN program_studi ps ON u.prodi_id = ps.id
WHERE u.email = 'admin.if@university.ac.id';
```

Pastikan `prodi_id` sama!

## Summary

✅ **Mata kuliah TERSIMPAN** di database
✅ **Mata kuliah MUNCUL** di dropdown "Tambah Kelas"
❌ **Mata kuliah TIDAK MUNCUL** di tabel (karena tabel untuk kelas)

**Untuk melihat di tabel**: Buat kelas dari mata kuliah tersebut!

---

**File SQL untuk Cek**: `CHECK_MATA_KULIAH.sql`
