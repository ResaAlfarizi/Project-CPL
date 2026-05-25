# 📚 Database Setup - Sistem CPL

Panduan lengkap untuk setup database PostgreSQL untuk Sistem Capaian Pembelajaran Lulusan (CPL).

## 📋 Daftar Isi

1. [Prasyarat](#prasyarat)
2. [Struktur File](#struktur-file)
3. [Cara Menjalankan](#cara-menjalankan)
4. [Verifikasi](#verifikasi)
5. [Troubleshooting](#troubleshooting)

---

## 🔧 Prasyarat

Pastikan sudah terinstall:

- **PostgreSQL 12+** (Recommended: PostgreSQL 14 atau lebih baru)
- **psql** (PostgreSQL command-line tool)
- **pgAdmin** (Optional, untuk GUI)

### Cek Versi PostgreSQL

```bash
psql --version
```

---

## 📁 Struktur File

```
database/
├── 01_modul1_ddl.sql      # Schema Modul 1 (Master Data)
├── 02_modul2_ddl.sql      # Schema Modul 2 (Operasional)
├── 03_auth_system.sql     # Sistem Autentikasi & Otorisasi
├── 04_seed_data.sql       # Data contoh untuk testing
└── README.md              # Panduan ini
```

---

## 🚀 Cara Menjalankan

### **Metode 1: Menggunakan psql (Command Line)**

#### Step 1: Buat Database Baru

```bash
# Login ke PostgreSQL sebagai superuser
psql -U postgres

# Buat database baru
CREATE DATABASE sistem_cpl;

# Keluar dari psql
\q
```

#### Step 2: Jalankan Script SQL Secara Berurutan

```bash
# Pindah ke folder database
cd "c:\Users\audina firdaus\OneDrive\Documents\pemweb\UAS CPL\Project-CPL\database"

# Jalankan script satu per satu
psql -U postgres -d sistem_cpl -f 01_modul1_ddl.sql
psql -U postgres -d sistem_cpl -f 02_modul2_ddl.sql
psql -U postgres -d sistem_cpl -f 03_auth_system.sql
psql -U postgres -d sistem_cpl -f 04_seed_data.sql
```

**ATAU jalankan semua sekaligus:**

```bash
psql -U postgres -d sistem_cpl -f 01_modul1_ddl.sql -f 02_modul2_ddl.sql -f 03_auth_system.sql -f 04_seed_data.sql
```

---

### **Metode 2: Menggunakan pgAdmin (GUI)**

1. **Buka pgAdmin**
2. **Buat Database Baru:**
   - Klik kanan pada `Databases` → `Create` → `Database`
   - Nama: `sistem_cpl`
   - Owner: `postgres`
   - Klik `Save`

3. **Jalankan Script:**
   - Klik kanan pada database `sistem_cpl` → `Query Tool`
   - Buka file `01_modul1_ddl.sql` (File → Open)
   - Klik tombol ▶️ (Execute)
   - Ulangi untuk file `02`, `03`, dan `04`

---

### **Metode 3: One-Liner (Windows CMD)**

```cmd
cd "c:\Users\audina firdaus\OneDrive\Documents\pemweb\UAS CPL\Project-CPL\database" && psql -U postgres -c "CREATE DATABASE sistem_cpl;" && psql -U postgres -d sistem_cpl -f 01_modul1_ddl.sql && psql -U postgres -d sistem_cpl -f 02_modul2_ddl.sql && psql -U postgres -d sistem_cpl -f 03_auth_system.sql && psql -U postgres -d sistem_cpl -f 04_seed_data.sql
```

---

## ✅ Verifikasi

### 1. Cek Tabel yang Terbuat

```sql
-- Login ke database
psql -U postgres -d sistem_cpl

-- Lihat semua tabel
\dt

-- Expected output:
-- program_studi, cpl, dosen, mahasiswa, mata_kuliah, mk_cpl, sub_cpmk,
-- threshold_status, kelas, enrollment, nilai_sub_cpmk, capaian_cpl_mk,
-- capaian_cpl_mahasiswa, roles, users, role_permissions, refresh_tokens,
-- password_resets, auth_audit_log
```

### 2. Cek View

```sql
-- Lihat semua view
\dv

-- Expected output:
-- v_capaian_cpl_mk
-- v_capaian_cpl_mahasiswa
```

### 3. Cek Function & Procedure

```sql
-- Lihat semua function
\df

-- Expected output:
-- get_status_cpl
-- handle_login_attempt
-- revoke_all_tokens
-- hitung_capaian_cpl_mk (procedure)
```

### 4. Cek Data Roles

```sql
SELECT * FROM roles;

-- Expected output:
-- Superadmin, Admin Prodi, Dosen, Mahasiswa
```

---

## 🔐 Setup User Testing

### Generate Password Hash

Gunakan Node.js untuk generate password hash:

```javascript
// hash-password.js
const bcrypt = require('bcrypt');

const password = 'admin123';
const hash = bcrypt.hashSync(password, 10);
console.log(hash);
```

Jalankan:
```bash
node hash-password.js
```

### Insert User Mahasiswa

```sql
-- 1. Ambil role_id untuk Mahasiswa
SELECT id FROM roles WHERE nama_role = 'Mahasiswa';

-- 2. Ambil prodi_id (contoh: Teknik Informatika)
SELECT id FROM program_studi WHERE kode_prodi = 'TI';

-- 3. Buat mahasiswa dulu
INSERT INTO mahasiswa (prodi_id, nim, nama, angkatan) 
VALUES ('<prodi_id>', '2021001', 'Ahmad Fauzi', 2021)
RETURNING id;

-- 4. Buat user mahasiswa
INSERT INTO users (email, password_hash, role_id, entity_type, entity_id, prodi_id) 
VALUES (
    'ahmad.fauzi@student.ac.id',
    '$2b$10$...hash_dari_step_generate...',
    '<mahasiswa_role_id>',
    'mahasiswa',
    '<mahasiswa_id>',
    '<prodi_id>'
);
```

---

## 🔄 Update Backend .env

Setelah database dibuat, update file `.env` di backend:

```env
# apps/backend/.env atau apps/backend/module2/.env

DB_HOST=localhost
DB_PORT=5432
DB_NAME=sistem_cpl
DB_USER=postgres
DB_PASSWORD=your_postgres_password

JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=1h
```

---

## 🐛 Troubleshooting

### Error: "database already exists"

```sql
-- Drop database jika ingin reset
DROP DATABASE IF EXISTS sistem_cpl;
CREATE DATABASE sistem_cpl;
```

### Error: "permission denied"

```bash
# Pastikan login sebagai superuser
psql -U postgres

# Atau beri permission ke user lain
GRANT ALL PRIVILEGES ON DATABASE sistem_cpl TO your_user;
```

### Error: "extension pgcrypto does not exist"

```sql
-- Install extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### Error: "relation already exists"

Artinya tabel sudah ada. Pilihan:

1. **Drop semua tabel:**
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

2. **Atau drop database dan buat ulang:**
```sql
DROP DATABASE sistem_cpl;
CREATE DATABASE sistem_cpl;
```

---

## 📊 Struktur Database

### Modul 1: Master Data
- `program_studi` - Program studi
- `cpl` - Capaian Pembelajaran Lulusan
- `dosen` - Data dosen
- `mahasiswa` - Data mahasiswa
- `mata_kuliah` - Mata kuliah
- `mk_cpl` - Pemetaan MK ke CPL
- `sub_cpmk` - Sub-CPMK
- `threshold_status` - Threshold status capaian

### Modul 2: Operasional
- `kelas` - Kelas per semester
- `enrollment` - Pendaftaran mahasiswa ke kelas
- `nilai_sub_cpmk` - Nilai sub-CPMK mahasiswa
- `capaian_cpl_mk` - Capaian CPL per MK
- `capaian_cpl_mahasiswa` - Capaian CPL total mahasiswa

### Autentikasi
- `roles` - Role pengguna
- `users` - Data pengguna
- `role_permissions` - Hak akses per role
- `refresh_tokens` - Token refresh JWT
- `password_resets` - Token reset password
- `auth_audit_log` - Log aktivitas autentikasi

---

## 📞 Support

Jika ada masalah, cek:
1. Log PostgreSQL: `C:\Program Files\PostgreSQL\14\data\log\`
2. Versi PostgreSQL: `SELECT version();`
3. Extension installed: `\dx`

---

**✅ Database siap digunakan!**

Selanjutnya:
1. Jalankan backend: `cd apps/backend/module2 && npm start`
2. Jalankan frontend: `cd apps/web/module2 && npm run dev`
3. Login dengan user yang sudah dibuat
