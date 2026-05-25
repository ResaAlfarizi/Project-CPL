# 📊 Dummy Data Lengkap - Sistem CPL

## 🎯 Tujuan
File ini berisi dummy data lengkap untuk testing semua fitur Portal Mahasiswa, termasuk:
- ✅ Profil mahasiswa
- ✅ Program Studi & CPL
- ✅ Mata Kuliah
- ✅ Sub-CPMK
- ✅ Capaian CPL dengan grafik

---

## 📦 Isi Dummy Data

### 1. Program Studi (4)
- **TL** - Teknik Lingkungan (S1)
- **TM** - Teknik Mesin (S1)
- **HK** - Hukum (S1)
- **DKV** - Desain Komunikasi Visual (S1)

### 2. CPL (15)
- Teknik Lingkungan: 5 CPL
- Teknik Mesin: 4 CPL
- Hukum: 3 CPL
- DKV: 3 CPL

### 3. Dosen (10)
- Dr. Ahmad Fauzi, M.T.
- Dr. Siti Nurhaliza, M.Eng.
- Prof. Budi Santoso, Ph.D.
- Dan 7 dosen lainnya

### 4. Mahasiswa (10)
| NIM | Nama | Prodi | Angkatan |
|-----|------|-------|----------|
| 23010001 | Rizky Kurniawan | TL | 2023 |
| 23010002 | Siti Aminah | TL | 2023 |
| 23010003 | Budi Prasetyo | TL | 2023 |
| 23020001 | Dewi Sartika | TM | 2023 |
| 23020002 | Andi Wijaya | TM | 2023 |
| 23030001 | Rina Marlina | HK | 2023 |
| 23030002 | Hendra Kusuma | HK | 2023 |
| 23040001 | Maya Anggraini | DKV | 2023 |
| 23040002 | Rudi Hermawan | DKV | 2023 |
| 23010004 | Ani Suryani | TL | 2023 |

### 5. Users (5 Mahasiswa)
| Email | Password | Role | Mahasiswa |
|-------|----------|------|-----------|
| mhs1@if.ac.id | admin123 | Mahasiswa | Rizky Kurniawan |
| mhs2@if.ac.id | admin123 | Mahasiswa | Siti Aminah |
| mhs3@if.ac.id | admin123 | Mahasiswa | Budi Prasetyo |
| mhs4@if.ac.id | admin123 | Mahasiswa | Dewi Sartika |
| mhs5@if.ac.id | admin123 | Mahasiswa | Andi Wijaya |

### 6. Mata Kuliah (15)
- **Teknik Lingkungan**: TL101, TL102, TL201, TL202, TL301
- **Teknik Mesin**: TM101, TM102, TM201
- **Hukum**: HK101, HK102, HK201
- **DKV**: DKV101, DKV102, DKV201, DKV202

### 7. Kelas (15)
Setiap mata kuliah memiliki 1 kelas dengan dosen pengampu

### 8. Enrollment (10)
- **Rizky (mhs1)**: 5 kelas (TL101, TL102, TL201, TL202, TL301)
- **Siti (mhs2)**: 3 kelas (TL101, TL102, TL201)
- **Budi (mhs3)**: 2 kelas (TL101, TL102)

### 9. Pemetaan MK-CPL (10)
Setiap mata kuliah dipetakan ke 2 CPL

### 10. Sub-CPMK (16)
- TL101: 4 Sub-CPMK
- TL102: 3 Sub-CPMK
- TL201: 3 Sub-CPMK
- TL202: 3 Sub-CPMK
- TL301: 3 Sub-CPMK

### 11. Nilai (33)
- **Rizky**: 18 nilai (rata-rata 86.5 - Sangat Baik)
- **Siti**: 10 nilai (rata-rata 75.2 - Baik)
- **Budi**: 7 nilai (rata-rata 65.1 - Cukup)

---

## 🚀 Cara Menggunakan

### Metode 1: Menggunakan Batch File (Termudah)
```bash
cd database
insert-dummy-data.bat
```

### Metode 2: Manual dengan psql
```bash
cd database
psql -U postgres -d cpl_db -f 06_dummy_data_lengkap.sql
```

### Metode 3: Menggunakan pgAdmin
1. Buka pgAdmin
2. Connect ke database `cpl_db`
3. Klik kanan pada database → Query Tool
4. Buka file `06_dummy_data_lengkap.sql`
5. Klik Execute (F5)

---

## 🧪 Testing Fitur

### 1. Login sebagai Mahasiswa
```
Email: mhs1@if.ac.id
Password: admin123
```

### 2. Test Profil
- Klik avatar di kanan atas
- Pilih "Lihat Profil"
- Harus muncul:
  - Nama: Rizky Kurniawan
  - NIM: 23010001
  - Prodi: Teknik Lingkungan
  - Angkatan: 2023
  - Total Kelas: 5
  - Total Nilai: 18

### 3. Test Program Studi & CPL
- Klik menu "Program Studi & CPL"
- Harus muncul 4 program studi
- Klik "Lihat CPL" pada Teknik Lingkungan
- Harus muncul 5 CPL

### 4. Test Mata Kuliah
- Klik menu "Mata Kuliah"
- Harus muncul 15 mata kuliah
- Filter by semester harus berfungsi

### 5. Test Sub-CPMK
- Klik menu "Sub-CPMK"
- Harus muncul 16 Sub-CPMK
- Filter by mata kuliah harus berfungsi

### 6. Test Capaian CPL
- Klik menu "Capaian Mahasiswa"
- Harus muncul grafik capaian untuk 5 CPL
- Klik "Lihat Detail" untuk melihat rincian per mata kuliah
- Progress bar harus menunjukkan persentase capaian

---

## 📊 Expected Results

### Capaian Rizky (mhs1@if.ac.id)
Berdasarkan nilai yang dimasukkan, Rizky harus memiliki:
- **CPL-TL-01**: ~86% (Sangat Baik) ✅
- **CPL-TL-02**: ~87% (Sangat Baik) ✅
- **CPL-TL-03**: ~87% (Sangat Baik) ✅
- **CPL-TL-04**: ~86% (Sangat Baik) ✅
- **CPL-TL-05**: ~87% (Sangat Baik) ✅

### Capaian Siti (mhs2@if.ac.id)
- **CPL-TL-01**: ~75% (Baik) ✅
- **CPL-TL-02**: ~77% (Baik) ✅
- **CPL-TL-03**: ~77% (Baik) ✅

### Capaian Budi (mhs3@if.ac.id)
- **CPL-TL-01**: ~65% (Cukup) ⚠️
- **CPL-TL-05**: ~63% (Cukup) ⚠️

---

## 🔧 Troubleshooting

### Error: "relation does not exist"
**Solusi**: Pastikan sudah menjalankan DDL schema terlebih dahulu
```bash
psql -U postgres -d cpl_db -f 01_modul1_ddl.sql
psql -U postgres -d cpl_db -f 02_modul2_ddl.sql
psql -U postgres -d cpl_db -f 03_auth_system.sql
```

### Error: "duplicate key value"
**Solusi**: Data sudah ada, hapus dulu dengan TRUNCATE
```sql
TRUNCATE TABLE nilai CASCADE;
TRUNCATE TABLE enrollment CASCADE;
-- dst...
```

### Login gagal
**Solusi**: Pastikan password hash benar. Jika perlu, generate ulang:
```javascript
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash('admin123', 10);
console.log(hash);
```

---

## 📝 Notes

- Semua password user adalah: **admin123**
- Data ini untuk **testing only**, jangan digunakan di production
- Nilai mahasiswa sudah disesuaikan untuk menampilkan berbagai status capaian
- Threshold status: 80% (Sangat Baik), 70% (Baik), 60% (Cukup), <60% (Kurang)

---

**Dibuat**: May 25, 2026
**Untuk**: Portal Mahasiswa - Sistem CPL Module 2
**Status**: Ready to use 🚀
