# 🚀 Quick Start - Database Setup

Panduan cepat untuk setup database dalam 5 menit.

---

## ⚡ Cara Tercepat (Windows)

### 1. Double-click file ini:

```
setup-database.bat
```

Ikuti instruksi di layar. Selesai! ✅

---

## 📝 Manual Setup (3 Langkah)

### Step 1: Buat Database

```bash
psql -U postgres -c "CREATE DATABASE sistem_cpl;"
```

### Step 2: Jalankan Semua Script

```bash
cd database
psql -U postgres -d sistem_cpl -f 01_modul1_ddl.sql
psql -U postgres -d sistem_cpl -f 02_modul2_ddl.sql
psql -U postgres -d sistem_cpl -f 03_auth_system.sql
psql -U postgres -d sistem_cpl -f 05_insert_test_users.sql
```

### Step 3: Update Backend .env

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sistem_cpl
DB_USER=postgres
DB_PASSWORD=your_password
```

---

## 🔐 Test Users

Semua password: **admin123**

| Role | Email | Password |
|------|-------|----------|
| Superadmin | admin@cpl.ac.id | admin123 |
| Admin Prodi | admin.ti@cpl.ac.id | admin123 |
| Dosen | budi.santoso@cpl.ac.id | admin123 |
| **Mahasiswa** | **ahmad.fauzi@student.cpl.ac.id** | **admin123** |

---

## ✅ Verifikasi

```sql
-- Login ke database
psql -U postgres -d sistem_cpl

-- Cek tabel
\dt

-- Cek users
SELECT email, r.nama_role FROM users u JOIN roles r ON u.role_id = r.id;

-- Keluar
\q
```

Expected output:
```
                email                |  nama_role   
-------------------------------------+--------------
 admin@cpl.ac.id                     | Superadmin
 admin.ti@cpl.ac.id                  | Admin Prodi
 budi.santoso@cpl.ac.id              | Dosen
 ahmad.fauzi@student.cpl.ac.id       | Mahasiswa
```

---

## 🧪 Testing Login Mahasiswa

### 1. Jalankan Backend

```bash
cd apps/backend/module2
npm install
npm start
```

Backend running di: http://localhost:3000

### 2. Jalankan Frontend

```bash
cd apps/web/module2
npm install
npm run dev
```

Frontend running di: http://localhost:3001

### 3. Login

- Buka: http://localhost:3001/login
- Email: **ahmad.fauzi@student.cpl.ac.id**
- Password: **admin123**
- Klik **Masuk**

✅ Anda akan diredirect ke `/mahasiswa` (Portal Mahasiswa)

---

## 🔧 Troubleshooting

### Error: "database already exists"

```sql
DROP DATABASE sistem_cpl;
CREATE DATABASE sistem_cpl;
```

### Error: "password authentication failed"

Cek password postgres Anda:
```bash
psql -U postgres
# Masukkan password saat diminta
```

### Error: "psql: command not found"

Tambahkan PostgreSQL ke PATH:
```
C:\Program Files\PostgreSQL\14\bin
```

---

## 📊 Struktur Database

```
sistem_cpl
├── Modul 1 (Master Data)
│   ├── program_studi
│   ├── cpl
│   ├── dosen
│   ├── mahasiswa
│   ├── mata_kuliah
│   ├── mk_cpl
│   ├── sub_cpmk
│   └── threshold_status
│
├── Modul 2 (Operasional)
│   ├── kelas
│   ├── enrollment
│   ├── nilai_sub_cpmk
│   ├── capaian_cpl_mk
│   └── capaian_cpl_mahasiswa
│
└── Auth System
    ├── roles
    ├── users
    ├── role_permissions
    ├── refresh_tokens
    ├── password_resets
    └── auth_audit_log
```

---

## 🎯 Next Steps

1. ✅ Database setup selesai
2. ✅ Test users sudah dibuat
3. 🔄 Jalankan backend
4. 🔄 Jalankan frontend
5. 🔄 Login sebagai mahasiswa
6. 🎉 Explore portal mahasiswa!

---

**Need help?** Baca `README.md` untuk panduan lengkap.
