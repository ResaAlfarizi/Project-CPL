# 📚 DOKUMENTASI LENGKAP MODULE 2

Panduan lengkap untuk setup, testing, dan menggunakan backend Module 2.

---

## 📑 DAFTAR ISI

1. [Setup Database](#setup-database)
2. [Setup Backend](#setup-backend)
3. [Testing di Postman](#testing-di-postman)
4. [Struktur File](#struktur-file)
5. [Penjelasan Models](#penjelasan-models)
6. [Penjelasan Controllers](#penjelasan-controllers)
7. [Penjelasan Routes](#penjelasan-routes)
8. [Matrik Akses](#matrik-akses)
9. [Contoh Request API](#contoh-request-api)
10. [Troubleshooting](#troubleshooting)

---

## 🗄️ SETUP DATABASE

### **Step 1: Buat Database**
```bash
createdb projectcpl
```

### **Step 2: Jalankan SQL Schema**
Jalankan file SQL yang sudah kamu punya (schema lengkap dengan tabel, view, function).

```bash
psql -U postgres -d projectcpl -f schema.sql
```

### **Step 3: Update Password Hash**
Generate password hash untuk semua user dummy:

```bash
psql -U postgres -d projectcpl -f UPDATE_PASSWORD.sql
```

**Atau manual di pgAdmin:**
```sql
UPDATE users 
SET password_hash = '$2b$10$EawDMbamOlHASNWbvQmAWOP.hS3vDX88E/ZnqieV9/AYD7XIP45dC'
WHERE email IN ('admin@if.ac.id', 'dosen1@if.ac.id', 'mhs1@if.ac.id');
```

**Password untuk semua user:** `password123`

### **Step 4: Verifikasi Database**
```sql
-- Cek tabel sudah ada
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Cek data dummy sudah ada
SELECT COUNT(*) FROM mahasiswa;
SELECT COUNT(*) FROM dosen;
SELECT COUNT(*) FROM kelas;
```

---

## 🚀 SETUP BACKEND

### **Step 1: Install Dependencies**
```bash
cd apps/backend
npm install
```

### **Step 2: Check .env**
Pastikan file `.env` sudah ada dengan konfigurasi:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=projectcpl
DB_USER=postgres
DB_PASSWORD=1234
JWT_SECRET=secret123
```

### **Step 3: Jalankan Backend**

**Production Mode:**
```bash
npm start
```

**Development Mode (auto-reload):**
```bash
npm run dev
```

**Output yang benar:**
```
Backend Modul 1 dan Modul 2 aktif di port 3000
```

---

## 🧪 TESTING DI POSTMAN

### **Step 1: Login**

**Request:**
```http
POST http://localhost:3000/api/v1/m2/auth/login
Content-Type: application/json

{
  "email": "admin@if.ac.id",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login berhasil",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### **Step 2: Copy Token**
Salin token dari response, gunakan untuk request berikutnya.

### **Step 3: Test Endpoint**

**Lihat Semua Kelas:**
```http
GET http://localhost:3000/api/v1/m2/kelas
Authorization: Bearer <paste_token_here>
```

**Response:**
```json
{
  "success": true,
  "message": "Berhasil mengambil data kelas",
  "data": [
    {
      "id": "fffffff1-ffff-ffff-ffff-fffffffffff1",
      "kode_mk": "IF101",
      "nama_mk": "Pemrograman Dasar",
      "nama_dosen": "Dr. Budi Santoso",
      "tahun_akademik": "2024/2025",
      "semester_aktif": 1,
      "sks": 3
    }
  ]
}
```

---

## 📁 STRUKTUR FILE

```
module2/
├── src/
│   ├── config/
│   │   └── db.js                    # Koneksi database
│   │
│   ├── controllers/
│   │   ├── authController.js        # Login & Register
│   │   ├── userController.js        # User management
│   │   ├── kelasController.js       # Kelas CRUD
│   │   ├── enrollmentController.js  # Enrollment CRUD
│   │   ├── nilaiController.js       # Nilai CRUD
│   │   ├── capaianController.js     # Capaian analysis
│   │   └── dashboardController.js   # Dashboard
│   │
│   ├── models/
│   │   ├── authModel.js             # Auth queries
│   │   ├── userModel.js             # User queries
│   │   ├── kelasModel.js            # Kelas queries
│   │   ├── enrollmentModel.js       # Enrollment queries
│   │   ├── nilaiModel.js            # Nilai queries
│   │   ├── capaianModel.js          # Capaian queries
│   │   └── dashboardModel.js        # Dashboard queries
│   │
│   ├── routes/
│   │   ├── index.js                 # Main router
│   │   ├── authRoutes.js            # /api/v1/m2/auth
│   │   ├── userRoutes.js            # /api/v1/m2/users
│   │   ├── kelasRoutes.js           # /api/v1/m2/kelas
│   │   ├── enrollmentRoutes.js      # /api/v1/m2/enrollment
│   │   ├── nilaiRoutes.js           # /api/v1/m2/nilai
│   │   ├── capaianRoutes.js         # /api/v1/m2/capaian
│   │   └── dashboardRoutes.js       # /api/v1/m2/dashboard
│   │
│   ├── middlewares/
│   │   ├── authMiddleware.js        # JWT verification
│   │   ├── roleMiddleware.js        # Role-based access
│   │   └── errorMiddleware.js       # Error handling
│   │
│   └── utils/
│       ├── bcrypt.js                # Password hashing
│       ├── jwt.js                   # Token generation
│       └── response.js              # Response formatter
│
└── DOKUMENTASI_LENGKAP.md           # File ini
```

---

## 📊 PENJELASAN MODELS

### **1. kelasModel.js**
**Fungsi:** Query database untuk tabel `kelas`

**Fungsi-fungsi:**
- `getAllKelas()` - Ambil semua kelas
- `getKelasById(id)` - Ambil kelas by ID
- `getKelasByDosenId(dosenId)` - Ambil kelas yang diampu dosen
- `createKelas()` - Buat kelas baru
- `updateKelas()` - Update kelas
- `deleteKelas()` - Hapus kelas

**Contoh Data:**
```json
{
  "id": "fffffff1-ffff-ffff-ffff-fffffffffff1",
  "mk_id": "ccccccc1-cccc-cccc-cccc-ccccccccccc1",
  "dosen_id": "aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1",
  "tahun_akademik": "2024/2025",
  "semester_aktif": 1,
  "nama_kelas": "A",
  "kode_mk": "IF101",
  "nama_mk": "Pemrograman Dasar",
  "sks": 3,
  "nama_dosen": "Dr. Budi Santoso"
}
```

### **2. enrollmentModel.js**
**Fungsi:** Query database untuk tabel `enrollment` (KRS)

**Fungsi-fungsi:**
- `getAllEnrollment()` - Ambil semua enrollment
- `getEnrollmentById(id)` - Ambil enrollment by ID
- `getEnrollmentByMahasiswaId(mahasiswaId)` - Ambil KRS mahasiswa
- `getEnrollmentByKelasId(kelasId)` - Ambil mahasiswa di kelas
- `checkEnrollmentExists()` - Cek duplikasi
- `createEnrollment()` - Daftar kelas
- `deleteEnrollment()` - Drop kelas

### **3. nilaiModel.js**
**Fungsi:** Query database untuk tabel `nilai_sub_cpmk`

**Fungsi-fungsi:**
- `getAllNilai()` - Ambil semua nilai
- `getNilaiById(id)` - Ambil nilai by ID
- `getNilaiByEnrollmentId(enrollmentId)` - Ambil nilai per enrollment
- `getNilaiByMahasiswaId(mahasiswaId)` - Ambil nilai mahasiswa
- `getNilaiByKelasId(kelasId)` - Ambil nilai kelas
- `checkNilaiExists()` - Cek duplikasi
- `createNilai()` - Input nilai
- `updateNilai()` - Update nilai
- `deleteNilai()` - Hapus nilai

### **4. capaianModel.js**
**Fungsi:** Query database untuk analisis capaian CPL

**Menggunakan VIEW:**
- `v_capaian_cpl_mahasiswa` - Capaian CPL per mahasiswa
- `v_capaian_cpl_mk` - Capaian CPL per mata kuliah

**Fungsi-fungsi:**
- `getCapaianByMahasiswaId()` - Capaian mahasiswa
- `getCapaianByProdiId()` - Capaian prodi
- `getCapaianByKelasId()` - Capaian kelas
- `getCapaianDetailByMahasiswaId()` - Detail capaian per MK
- `getMahasiswaBelumCapaiCPL()` - Mahasiswa belum capai CPL

### **5. dashboardModel.js**
**Fungsi:** Query database untuk dashboard

**Fungsi-fungsi:**
- `getDashboardAdmin(prodiId)` - Dashboard admin/kaprodi
- `getDashboardDosen(dosenId)` - Dashboard dosen
- `getDashboardMahasiswa(mahasiswaId)` - Dashboard mahasiswa

---

## 🎮 PENJELASAN CONTROLLERS

### **1. kelasController.js**
**Fungsi:** Business logic untuk kelas

**Handler:**
- `getAllKelasHandler` - GET semua kelas
- `getKelasByIdHandler` - GET kelas by ID
- `getKelasByDosenHandler` - GET kelas dosen
- `createKelasHandler` - POST buat kelas (validasi input)
- `updateKelasHandler` - PUT update kelas
- `deleteKelasHandler` - DELETE hapus kelas

**Validasi:**
- Cek kelengkapan data
- Cek format data

### **2. enrollmentController.js**
**Fungsi:** Business logic untuk enrollment

**Handler:**
- `getAllEnrollmentHandler` - GET semua enrollment
- `getEnrollmentByIdHandler` - GET enrollment by ID
- `getEnrollmentByMahasiswaHandler` - GET KRS mahasiswa
- `getEnrollmentByKelasHandler` - GET mahasiswa di kelas
- `createEnrollmentHandler` - POST daftar kelas (cek duplikasi)
- `deleteEnrollmentHandler` - DELETE drop kelas

### **3. nilaiController.js**
**Fungsi:** Business logic untuk nilai

**Handler:**
- `getAllNilaiHandler` - GET semua nilai
- `getNilaiByIdHandler` - GET nilai by ID
- `getNilaiByEnrollmentHandler` - GET nilai per enrollment
- `getNilaiByMahasiswaHandler` - GET nilai mahasiswa
- `getNilaiByKelasHandler` - GET nilai kelas
- `createNilaiHandler` - POST input nilai (validasi 0-100, cek duplikasi)
- `updateNilaiHandler` - PUT update nilai
- `deleteNilaiHandler` - DELETE hapus nilai

### **4. capaianController.js**
**Fungsi:** Business logic untuk capaian

**Handler:**
- `getCapaianMahasiswaHandler` - GET capaian mahasiswa
- `getCapaianMahasiswaByIdHandler` - GET capaian mahasiswa tertentu
- `getCapaianProdiHandler` - GET capaian prodi
- `getCapaianKelasHandler` - GET capaian kelas
- `getCapaianDetailMahasiswaHandler` - GET detail capaian
- `getMahasiswaBelumCapaiHandler` - GET mahasiswa belum capai

### **5. dashboardController.js**
**Fungsi:** Business logic untuk dashboard

**Handler:**
- `getDashboardAdminHandler` - GET dashboard admin
- `getDashboardDosenHandler` - GET dashboard dosen
- `getDashboardMahasiswaHandler` - GET dashboard mahasiswa

---

## 🛣️ PENJELASAN ROUTES

### **1. kelasRoutes.js**
```javascript
GET    /api/v1/m2/kelas                    // Semua kelas (Superadmin, Admin Prodi, Dosen, Mahasiswa)
GET    /api/v1/m2/kelas/:id                // Detail kelas (Semua)
GET    /api/v1/m2/kelas/dosen/my-classes   // Kelas dosen (Dosen)
POST   /api/v1/m2/kelas                    // Buat kelas (Superadmin, Admin Prodi)
PUT    /api/v1/m2/kelas/:id                // Update kelas (Superadmin, Admin Prodi)
DELETE /api/v1/m2/kelas/:id                // Hapus kelas (Superadmin)
```

### **2. enrollmentRoutes.js**
```javascript
GET    /api/v1/m2/enrollment                           // Semua enrollment (Superadmin, Admin Prodi)
GET    /api/v1/m2/enrollment/:id                       // Detail enrollment (Superadmin, Admin Prodi, Dosen)
GET    /api/v1/m2/enrollment/kelas/:kelas_id           // Mahasiswa di kelas (Dosen, Superadmin, Admin Prodi)
GET    /api/v1/m2/enrollment/mahasiswa/my-enrollment   // KRS mahasiswa (Mahasiswa)
POST   /api/v1/m2/enrollment                           // Daftar kelas (Superadmin, Admin Prodi)
DELETE /api/v1/m2/enrollment/:id                       // Drop kelas (Superadmin)
```

### **3. nilaiRoutes.js**
```javascript
GET    /api/v1/m2/nilai                           // Semua nilai (Superadmin, Admin Prodi)
GET    /api/v1/m2/nilai/:id                       // Detail nilai (Superadmin, Admin Prodi, Dosen)
GET    /api/v1/m2/nilai/kelas/:kelas_id           // Nilai kelas (Dosen, Superadmin, Admin Prodi)
GET    /api/v1/m2/nilai/mahasiswa/my-nilai        // Nilai mahasiswa (Mahasiswa)
POST   /api/v1/m2/nilai                           // Input nilai (Dosen, Superadmin)
PUT    /api/v1/m2/nilai/:id                       // Update nilai (Dosen, Superadmin)
DELETE /api/v1/m2/nilai/:id                       // Hapus nilai (Superadmin)
```

### **4. capaianRoutes.js**
```javascript
GET /api/v1/m2/capaian/mahasiswa/my-capaian              // Capaian mahasiswa (Mahasiswa)
GET /api/v1/m2/capaian/mahasiswa/my-capaian/detail       // Detail capaian (Mahasiswa)
GET /api/v1/m2/capaian/mahasiswa/:mahasiswa_id           // Capaian mahasiswa tertentu (Superadmin, Admin Prodi, Dosen)
GET /api/v1/m2/capaian/prodi/:prodi_id                   // Capaian prodi (Superadmin, Admin Prodi)
GET /api/v1/m2/capaian/kelas/:kelas_id                   // Capaian kelas (Dosen, Superadmin, Admin Prodi)
GET /api/v1/m2/capaian/belum-capai/:cpl_id/:prodi_id     // Mahasiswa belum capai (Superadmin, Admin Prodi)
```

### **5. dashboardRoutes.js**
```javascript
GET /api/v1/m2/dashboard/admin/:prodi_id   // Dashboard admin (Superadmin, Admin Prodi)
GET /api/v1/m2/dashboard/dosen             // Dashboard dosen (Dosen)
GET /api/v1/m2/dashboard/mahasiswa         // Dashboard mahasiswa (Mahasiswa)
```

---

## 🔐 MATRIK AKSES

| RESOURCE | SUPERADMIN | ADMIN PRODI | DOSEN | MAHASISWA |
|----------|-----------|-----------|-------|-----------|
| **Kelas** | R/W/D | R/W | R | R |
| **Enrollment** | R/W/D | R | R/W (data sendiri) | - |
| **Nilai** | R/W/D | R | R/W (data sendiri) | - |
| **Capaian** | R/W/D | R/W | R (data sendiri) | R (data sendiri) |
| **Dashboard** | R/W/D | R/W | - | - |

**Keterangan:**
- **R** = Read (Baca)
- **W** = Write (Buat/Edit)
- **D** = Delete (Hapus)
- **-** = Tidak ada akses
- **(data sendiri)** = Hanya bisa akses data milik sendiri

---

## 📝 CONTOH REQUEST API

### **1. LOGIN**

**Request:**
```http
POST http://localhost:3000/api/v1/m2/auth/login
Content-Type: application/json

{
  "email": "admin@if.ac.id",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login berhasil",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### **2. LIHAT SEMUA KELAS**

**Request:**
```http
GET http://localhost:3000/api/v1/m2/kelas
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Berhasil mengambil data kelas",
  "data": [
    {
      "id": "fffffff1-ffff-ffff-ffff-fffffffffff1",
      "kode_mk": "IF101",
      "nama_mk": "Pemrograman Dasar",
      "nama_dosen": "Dr. Budi Santoso",
      "tahun_akademik": "2024/2025",
      "semester_aktif": 1
    }
  ]
}
```

### **3. LIHAT MAHASISWA DI KELAS**

**Request:**
```http
GET http://localhost:3000/api/v1/m2/enrollment/kelas/fffffff1-ffff-ffff-ffff-fffffffffff1
Authorization: Bearer <token_dosen>
```

**Response:**
```json
{
  "success": true,
  "message": "Berhasil mengambil data enrollment",
  "data": [
    {
      "id": "99999991-9999-9999-9999-999999999991",
      "mahasiswa_id": "bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1",
      "nim": "220001",
      "nama_mahasiswa": "Ahmad Fauzi",
      "angkatan": 2022
    }
  ]
}
```

### **4. INPUT NILAI SUB-CPMK**

**Request:**
```http
POST http://localhost:3000/api/v1/m2/nilai
Authorization: Bearer <token_dosen>
Content-Type: application/json

{
  "enrollment_id": "99999991-9999-9999-9999-999999999991",
  "sub_cpmk_id": "eeeeeee1-eeee-eeee-eeee-eeeeeeeeeee1",
  "nilai": 85
}
```

**Response:**
```json
{
  "success": true,
  "message": "Nilai berhasil dibuat",
  "data": {
    "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "enrollment_id": "99999991-9999-9999-9999-999999999991",
    "sub_cpmk_id": "eeeeeee1-eeee-eeee-eeee-eeeeeeeeeee1",
    "nilai": 85
  }
}
```

### **5. LIHAT CAPAIAN MAHASISWA**

**Request:**
```http
GET http://localhost:3000/api/v1/m2/capaian/mahasiswa/my-capaian
Authorization: Bearer <token_mahasiswa>
```

**Response:**
```json
{
  "success": true,
  "message": "Berhasil mengambil data capaian",
  "data": [
    {
      "cpl_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "kode_cpl": "CPL-01",
      "deskripsi_cpl": "Mampu menerapkan logika pemrograman",
      "rata_rata_nilai": 87.5,
      "nilai_minimum": 75,
      "status_capaian": "Excellence"
    }
  ]
}
```

### **6. LIHAT DASHBOARD MAHASISWA**

**Request:**
```http
GET http://localhost:3000/api/v1/m2/dashboard/mahasiswa
Authorization: Bearer <token_mahasiswa>
```

**Response:**
```json
{
  "success": true,
  "message": "Berhasil mengambil data dashboard mahasiswa",
  "data": {
    "mahasiswa": {
      "id": "bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1",
      "nim": "220001",
      "nama": "Ahmad Fauzi",
      "angkatan": 2022,
      "nama_prodi": "Teknik Informatika"
    },
    "statistik": {
      "total_kelas": 2
    },
    "capaian_cpl": [
      {
        "kode_cpl": "CPL-01",
        "rata_rata": 87.5,
        "status": "Excellence"
      }
    ],
    "riwayat_kelas": [
      {
        "tahun_akademik": "2024/2025",
        "semester_aktif": 1,
        "kode_mk": "IF101",
        "nama_mk": "Pemrograman Dasar",
        "sks": 3,
        "nama_dosen": "Dr. Budi Santoso"
      }
    ]
  }
}
```

---

## 🐛 TROUBLESHOOTING

### **Error: "Cannot find module"**
```bash
npm install
```

### **Error: "Database connection failed"**
- Pastikan PostgreSQL sudah running
- Cek DATABASE_URL di .env
- Cek database `projectcpl` sudah dibuat

### **Error: "Login failed"**
- Pastikan password hash sudah diupdate
- Pastikan email benar
- Pastikan password = `password123`

### **Error: "Token tidak valid"**
- Pastikan JWT_SECRET di .env sama
- Pastikan token belum expired
- Pastikan format: `Bearer <token>`

### **Error: "Akses ditolak" (403)**
- Pastikan role user sesuai dengan endpoint
- Lihat matrik akses di atas

### **Error: "Data tidak lengkap" (400)**
- Pastikan semua field required sudah diisi
- Lihat contoh request di atas

---

## 📌 CATATAN PENTING

### **1. UUID Format**
- ID menggunakan UUID: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- Tidak perlu `parseInt()` untuk UUID
- Langsung gunakan sebagai string

### **2. Field Names**
- `tahun_akademik` (format: '2024/2025')
- `semester_aktif` (1 = Ganjil, 2 = Genap)
- `mk_id` (bukan `mata_kuliah_id`)
- `sub_cpmk_id` (bukan `cpl_id` untuk tabel nilai)

### **3. Password**
- Password untuk semua user: `password123`
- Hash: `$2b$10$EawDMbamOlHASNWbvQmAWOP.hS3vDX88E/ZnqieV9/AYD7XIP45dC`

### **4. Roles**
- `superadmin` - Full access
- `admin_prodi` - Admin program studi
- `dosen` - Dosen pengampu
- `mahasiswa` - Mahasiswa

---

## ✅ CHECKLIST SETUP

- [ ] Database `projectcpl` sudah dibuat
- [ ] SQL schema sudah dijalankan
- [ ] Password hash sudah diupdate
- [ ] Backend dependencies sudah diinstall
- [ ] .env sudah dikonfigurasi
- [ ] Backend sudah running (`npm start`)
- [ ] Login berhasil di Postman
- [ ] Endpoint kelas bisa diakses
- [ ] Semua endpoint sudah ditest

---

**Selamat! Backend sudah siap digunakan!** 🎉
