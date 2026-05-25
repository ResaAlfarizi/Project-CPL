# Database Scripts

## Setup Database

### 1. Buat Database dan Jalankan Schema Utama

```bash
# Buat database (jika belum ada)
createdb sistem_cpl

# Atau via psql
psql -U postgres
CREATE DATABASE sistem_cpl;
\q

# Jalankan schema utama
psql -U postgres -d sistem_cpl -f "db lengkap.sql"
```

### 2. Insert Sample Data

```bash
# Jalankan sample data
psql -U postgres -d sistem_cpl -f sample-data.sql
```

## Sample Data yang Tersedia

### Users untuk Testing

| Role | Email | Password |
|------|-------|----------|
| Dosen | dosen@cpl.ac.id | password123 |
| Mahasiswa | mahasiswa@cpl.ac.id | password123 |

### Data yang Diinsert

1. **Program Studi**: Teknik Informatika (IF), Sistem Informasi (SI)
2. **CPL**: 3 CPL untuk Teknik Informatika
3. **Dosen**: Dr. Budi Santoso, Prof. Siti Aminah
4. **Mahasiswa**: 3 mahasiswa angkatan 2022
5. **Mata Kuliah**: 
   - IF101 - Pemrograman Dasar
   - IF201 - Struktur Data
   - IF301 - Basis Data
6. **Sub-CPMK**: 9 Sub-CPMK untuk berbagai mata kuliah
7. **Kelas**: 3 kelas aktif tahun akademik 2024/2025
8. **Enrollment**: Mahasiswa terdaftar di kelas
9. **Nilai**: Sample nilai untuk testing

## Troubleshooting

### Jika ada error "relation already exists"

Script menggunakan `ON CONFLICT DO NOTHING` sehingga aman dijalankan berulang kali.

### Jika ingin reset database

```bash
# Drop dan buat ulang database
psql -U postgres
DROP DATABASE sistem_cpl;
CREATE DATABASE sistem_cpl;
\q

# Jalankan ulang schema dan sample data
psql -U postgres -d sistem_cpl -f "db lengkap.sql"
psql -U postgres -d sistem_cpl -f sample-data.sql
```

### Generate Password Hash Baru

```bash
cd apps/backend
node hash.js <password_anda>
```

## Verifikasi Data

```sql
-- Cek jumlah data
SELECT 'program_studi' as tabel, COUNT(*) FROM program_studi
UNION ALL
SELECT 'cpl', COUNT(*) FROM cpl
UNION ALL
SELECT 'dosen', COUNT(*) FROM dosen
UNION ALL
SELECT 'mahasiswa', COUNT(*) FROM mahasiswa
UNION ALL
SELECT 'mata_kuliah', COUNT(*) FROM mata_kuliah
UNION ALL
SELECT 'mk_cpl', COUNT(*) FROM mk_cpl
UNION ALL
SELECT 'sub_cpmk', COUNT(*) FROM sub_cpmk
UNION ALL
SELECT 'kelas', COUNT(*) FROM kelas
UNION ALL
SELECT 'enrollment', COUNT(*) FROM enrollment
UNION ALL
SELECT 'users', COUNT(*) FROM users;

-- Cek Sub-CPMK untuk mata kuliah tertentu
SELECT 
  sc.kode_sub_cpmk,
  sc.deskripsi,
  sc.bobot,
  mk.nama_mk,
  cpl.kode_cpl
FROM sub_cpmk sc
JOIN mk_cpl mc ON sc.mk_cpl_id = mc.id
JOIN mata_kuliah mk ON mc.mk_id = mk.id
JOIN cpl ON mc.cpl_id = cpl.id
ORDER BY mk.nama_mk, sc.kode_sub_cpmk;
```
