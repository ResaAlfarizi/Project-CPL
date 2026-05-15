# 📚 MODULE 2 - DOKUMENTASI LENGKAP

Module 2 adalah modul untuk **Authentication, User Management, dan Sistem Akademik CPL**.

---

## 📁 STRUKTUR FOLDER

```
module2/
├── src/
│   ├── config/
│   │   └── db.js                    # Konfigurasi koneksi database PostgreSQL
│   │
│   ├── controllers/                 # Business Logic Layer
│   │   ├── authController.js        # Login & Register
│   │   ├── userController.js        # Manajemen User
│   │   ├── kelasController.js       # Manajemen Kelas
│   │   ├── enrollmentController.js  # Manajemen Pendaftaran Mahasiswa ke Kelas
│   │   ├── nilaiController.js       # Manajemen Nilai CPL
│   │   ├── capaianController.js     # Analisis Capaian CPL
│   │   └── dashboardController.js   # Dashboard untuk berbagai role
│   │
│   ├── models/                      # Data Access Layer (Query Database)
│   │   ├── authModel.js             # Query untuk autentikasi
│   │   ├── userModel.js             # Query untuk user
│   │   ├── kelasModel.js            # Query untuk kelas
│   │   ├── enrollmentModel.js       # Query untuk enrollment
│   │   ├── nilaiModel.js            # Query untuk nilai
│   │   ├── capaianModel.js          # Query untuk analisis capaian
│   │   └── dashboardModel.js        # Query untuk dashboard
│   │
│   ├── routes/                      # API Endpoints
│   │   ├── index.js                 # Router utama (menggabungkan semua routes)
│   │   ├── authRoutes.js            # Endpoint /auth
│   │   ├── userRoutes.js            # Endpoint /users
│   │   ├── kelasRoutes.js           # Endpoint /kelas
│   │   ├── enrollmentRoutes.js      # Endpoint /enrollment
│   │   ├── nilaiRoutes.js           # Endpoint /nilai
│   │   ├── capaianRoutes.js         # Endpoint /capaian
│   │   └── dashboardRoutes.js       # Endpoint /dashboard
│   │
│   ├── middlewares/                 # Middleware untuk proteksi route
│   │   ├── authMiddleware.js        # Cek JWT token (apakah user sudah login)
│   │   ├── roleMiddleware.js        # Cek role user (Admin, Dosen, Mahasiswa, dll)
│   │   └── errorMiddleware.js       # Handle error global
│   │
│   └── utils/                       # Helper functions
│       ├── bcrypt.js                # Hash & compare password
│       ├── jwt.js                   # Generate & verify JWT token
│       └── response.js              # Format response API (success/error)
```

---

## 🔐 AUTENTIKASI & AUTHORIZATION

### **1. authMiddleware.js**
**Fungsi:** Memastikan user sudah login (memiliki token JWT yang valid)

**Cara Kerja:**
1. Ambil token dari header `Authorization: Bearer <token>`
2. Verify token menggunakan JWT
3. Jika valid, simpan data user ke `req.user` (berisi `id` dan `role`)
4. Jika tidak valid, return error 401

**Contoh Penggunaan:**
```javascript
router.get("/kelas", authMiddleware, getAllKelasHandler);
// User harus login untuk akses endpoint ini
```

---

### **2. roleMiddleware.js**
**Fungsi:** Memastikan user memiliki role yang sesuai

**Cara Kerja:**
1. Cek `req.user.role` (sudah diset oleh authMiddleware)
2. Bandingkan dengan role yang diizinkan
3. Jika tidak sesuai, return error 403 (Forbidden)

**Contoh Penggunaan:**
```javascript
router.post("/kelas", authMiddleware, authorize("Admin", "Kaprodi"), createKelasHandler);
// Hanya Admin dan Kaprodi yang bisa buat kelas
```

---

## 📊 PENJELASAN SETIAP FILE

### **MODELS** (Berinteraksi dengan Database)

#### **kelasModel.js**
**Fungsi:** Mengelola data kelas (mata kuliah yang dibuka untuk semester tertentu)

**Fungsi-fungsi:**
- `getAllKelas()` - Ambil semua kelas dengan info mata kuliah, dosen, kurikulum
- `getKelasById(id)` - Ambil detail kelas berdasarkan ID
- `getKelasByDosenId(dosenId)` - Ambil kelas yang diampu dosen tertentu
- `createKelas()` - Buat kelas baru
- `updateKelas()` - Update data kelas
- `deleteKelas()` - Hapus kelas

**Contoh Data:**
```json
{
  "id": 1,
  "mata_kuliah_id": 5,
  "dosen_id": 3,
  "tahun_ajaran": "2024/2025",
  "semester": "Ganjil",
  "kode_mk": "IF101",
  "nama_mk": "Pemrograman Web",
  "nama_dosen": "Dr. Budi Santoso"
}
```

---

#### **enrollmentModel.js**
**Fungsi:** Mengelola pendaftaran mahasiswa ke kelas (seperti KRS)

**Fungsi-fungsi:**
- `getAllEnrollment()` - Ambil semua enrollment
- `getEnrollmentById(id)` - Ambil detail enrollment
- `getEnrollmentByMahasiswaId(mahasiswaId)` - Ambil KRS mahasiswa
- `getEnrollmentByKelasId(kelasId)` - Ambil daftar mahasiswa di kelas
- `checkEnrollmentExists()` - Cek apakah mahasiswa sudah daftar di kelas
- `createEnrollment()` - Mahasiswa daftar kelas
- `deleteEnrollment()` - Mahasiswa drop kelas

**Contoh Data:**
```json
{
  "id": 1,
  "mahasiswa_id": 10,
  "kelas_id": 5,
  "nim": "2021001",
  "nama_mahasiswa": "Andi Wijaya",
  "kode_mk": "IF101",
  "nama_mk": "Pemrograman Web"
}
```

---

#### **nilaiModel.js**
**Fungsi:** Mengelola nilai mahasiswa untuk setiap CPL (Capaian Pembelajaran Lulusan)

**Fungsi-fungsi:**
- `getAllNilai()` - Ambil semua nilai
- `getNilaiById(id)` - Ambil detail nilai
- `getNilaiByEnrollmentId(enrollmentId)` - Ambil semua nilai CPL untuk 1 mahasiswa di 1 kelas
- `getNilaiByMahasiswaId(mahasiswaId)` - Ambil semua nilai mahasiswa
- `getNilaiByKelasId(kelasId)` - Ambil nilai semua mahasiswa di kelas
- `checkNilaiExists()` - Cek apakah nilai sudah ada
- `createNilai()` - Buat nilai baru
- `updateNilai()` - Update nilai
- `deleteNilai()` - Hapus nilai

**Contoh Data:**
```json
{
  "id": 1,
  "enrollment_id": 5,
  "cpl_id": 2,
  "nilai": 85,
  "kode_cpl": "CPL-01",
  "deskripsi_cpl": "Mampu menerapkan konsep pemrograman",
  "nilai_minimum": 75
}
```

---

#### **capaianModel.js**
**Fungsi:** Menghitung dan menganalisis capaian CPL mahasiswa

**Fungsi-fungsi:**
- `getCapaianByMahasiswaId(mahasiswaId)` - Rata-rata nilai CPL mahasiswa
- `getCapaianByProdiId(prodiId)` - Rata-rata nilai CPL seluruh mahasiswa di prodi
- `getCapaianByKelasId(kelasId)` - Rata-rata nilai CPL mahasiswa di kelas
- `getCapaianDetailByMahasiswaId(mahasiswaId)` - Detail capaian per mata kuliah
- `getMahasiswaBelumCapaiCPL(cplId, prodiId)` - Daftar mahasiswa yang belum mencapai CPL

**Contoh Data:**
```json
{
  "cpl_id": 1,
  "kode_cpl": "CPL-01",
  "deskripsi_cpl": "Mampu menerapkan konsep pemrograman",
  "rata_rata_nilai": 82.5,
  "nilai_minimum": 75,
  "jumlah_penilaian": 10,
  "status_capaian": "Tercapai"
}
```

---

#### **dashboardModel.js**
**Fungsi:** Menyediakan data statistik untuk dashboard

**Fungsi-fungsi:**
- `getDashboardAdmin(prodiId)` - Dashboard untuk Admin/Kaprodi
  - Total mahasiswa, dosen, kelas, CPL
  - Capaian CPL keseluruhan
  
- `getDashboardDosen(dosenId)` - Dashboard untuk Dosen
  - Total kelas yang diampu
  - Total mahasiswa yang diajar
  - Capaian CPL per kelas
  
- `getDashboardMahasiswa(mahasiswaId)` - Dashboard untuk Mahasiswa
  - Info mahasiswa
  - Capaian CPL mahasiswa
  - Riwayat kelas

---

### **CONTROLLERS** (Business Logic)

Controllers berisi logika bisnis dan validasi sebelum memanggil model.

#### **kelasController.js**
**Fungsi:** Mengatur logika untuk manajemen kelas

**Handler:**
- `getAllKelasHandler` - GET semua kelas
- `getKelasByIdHandler` - GET kelas by ID
- `getKelasByDosenHandler` - GET kelas yang diampu dosen (ambil dari JWT token)
- `createKelasHandler` - POST buat kelas (validasi input)
- `updateKelasHandler` - PUT update kelas
- `deleteKelasHandler` - DELETE hapus kelas

**Validasi:**
- Cek kelengkapan data (mata_kuliah_id, tahun_ajaran, semester)
- Return error 400 jika data tidak lengkap

---

#### **enrollmentController.js**
**Fungsi:** Mengatur logika untuk pendaftaran mahasiswa ke kelas

**Handler:**
- `getAllEnrollmentHandler` - GET semua enrollment
- `getEnrollmentByIdHandler` - GET enrollment by ID
- `getEnrollmentByMahasiswaHandler` - GET KRS mahasiswa (ambil dari JWT token)
- `getEnrollmentByKelasHandler` - GET mahasiswa di kelas
- `createEnrollmentHandler` - POST daftar kelas (cek duplikasi)
- `deleteEnrollmentHandler` - DELETE drop kelas

**Validasi:**
- Cek apakah mahasiswa sudah terdaftar di kelas (tidak boleh duplikat)

---

#### **nilaiController.js**
**Fungsi:** Mengatur logika untuk manajemen nilai CPL

**Handler:**
- `getAllNilaiHandler` - GET semua nilai
- `getNilaiByIdHandler` - GET nilai by ID
- `getNilaiByEnrollmentHandler` - GET nilai per enrollment
- `getNilaiByMahasiswaHandler` - GET semua nilai mahasiswa (ambil dari JWT token)
- `getNilaiByKelasHandler` - GET nilai mahasiswa di kelas
- `createNilaiHandler` - POST input nilai (validasi 0-100, cek duplikasi)
- `updateNilaiHandler` - PUT update nilai (validasi 0-100)
- `deleteNilaiHandler` - DELETE hapus nilai

**Validasi:**
- Nilai harus antara 0-100
- Tidak boleh duplikat (1 enrollment + 1 CPL = 1 nilai)

---

#### **capaianController.js**
**Fungsi:** Mengatur logika untuk analisis capaian CPL

**Handler:**
- `getCapaianMahasiswaHandler` - GET capaian mahasiswa (ambil dari JWT token)
- `getCapaianMahasiswaByIdHandler` - GET capaian mahasiswa tertentu
- `getCapaianProdiHandler` - GET capaian prodi
- `getCapaianKelasHandler` - GET capaian kelas
- `getCapaianDetailMahasiswaHandler` - GET detail capaian per mata kuliah
- `getMahasiswaBelumCapaiHandler` - GET mahasiswa yang belum mencapai CPL

---

#### **dashboardController.js**
**Fungsi:** Mengatur logika untuk dashboard

**Handler:**
- `getDashboardAdminHandler` - GET dashboard admin (perlu prodi_id)
- `getDashboardDosenHandler` - GET dashboard dosen (ambil dari JWT token)
- `getDashboardMahasiswaHandler` - GET dashboard mahasiswa (ambil dari JWT token)

---

### **ROUTES** (API Endpoints)

Routes mendefinisikan endpoint API dan proteksi akses.

#### **Contoh: kelasRoutes.js**

```javascript
// GET /api/kelas - Admin/Kaprodi only
router.get("/", authMiddleware, authorize("Admin", "Kaprodi"), getAllKelasHandler);

// GET /api/kelas/:id - Semua role yang login
router.get("/:id", authMiddleware, getKelasByIdHandler);

// GET /api/kelas/dosen/my-classes - Dosen only
router.get("/dosen/my-classes", authMiddleware, authorize("Dosen"), getKelasByDosenHandler);

// POST /api/kelas - Admin/Kaprodi only
router.post("/", authMiddleware, authorize("Admin", "Kaprodi"), createKelasHandler);
```

---

## 🔑 ROLE-BASED ACCESS CONTROL (RBAC)

### **Role yang Tersedia:**
1. **Admin** - Akses penuh ke semua fitur
2. **Kaprodi** - Akses penuh untuk prodi tertentu
3. **Dosen** - Akses ke kelas yang diampu
4. **Mahasiswa** - Akses ke data pribadi

### **Tabel Akses:**

| Endpoint | Admin | Kaprodi | Dosen | Mahasiswa |
|----------|-------|---------|-------|-----------|
| GET /kelas | ✅ | ✅ | ❌ | ❌ |
| GET /kelas/:id | ✅ | ✅ | ✅ | ✅ |
| GET /kelas/dosen/my-classes | ❌ | ❌ | ✅ | ❌ |
| POST /kelas | ✅ | ✅ | ❌ | ❌ |
| GET /enrollment/mahasiswa/my-enrollment | ❌ | ❌ | ❌ | ✅ |
| POST /enrollment | ✅ | ✅ | ❌ | ✅ |
| POST /nilai | ✅ | ✅ | ✅ | ❌ |
| GET /capaian/mahasiswa/my-capaian | ❌ | ❌ | ❌ | ✅ |
| GET /dashboard/admin/:prodi_id | ✅ | ✅ | ❌ | ❌ |
| GET /dashboard/dosen | ❌ | ❌ | ✅ | ❌ |
| GET /dashboard/mahasiswa | ❌ | ❌ | ❌ | ✅ |

---

## 🚀 CARA MENGGUNAKAN API

### **1. Login**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "dosen@example.com",
  "password": "password123"
}

# Response:
{
  "message": "Login berhasil",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### **2. Akses Endpoint dengan Token**
```bash
GET /api/kelas/dosen/my-classes
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Response:
{
  "success": true,
  "message": "Berhasil mengambil data kelas",
  "data": [...]
}
```

### **3. Input Nilai**
```bash
POST /api/nilai
Authorization: Bearer <token_dosen>
Content-Type: application/json

{
  "enrollment_id": 5,
  "cpl_id": 2,
  "nilai": 85
}
```

### **4. Lihat Capaian Mahasiswa**
```bash
GET /api/capaian/mahasiswa/my-capaian
Authorization: Bearer <token_mahasiswa>

# Response:
{
  "success": true,
  "data": [
    {
      "kode_cpl": "CPL-01",
      "rata_rata_nilai": 82.5,
      "nilai_minimum": 75,
      "status_capaian": "Tercapai"
    }
  ]
}
```

---

## 📝 CATATAN PENTING

1. **Semua endpoint memerlukan autentikasi** (kecuali `/auth/login` dan `/auth/register`)
2. **Token JWT disimpan di header** `Authorization: Bearer <token>`
3. **Token berisi informasi:** `{ id: user_id, role: nama_role }`
4. **Nilai CPL harus 0-100**
5. **Mahasiswa tidak bisa daftar kelas yang sama 2x**
6. **Dosen hanya bisa akses kelas yang diampu**
7. **Mahasiswa hanya bisa akses data pribadi**

---

## 🔧 NEXT STEPS

1. ✅ Semua file sudah dibuat
2. ⏳ Test API menggunakan Postman/Thunder Client
3. ⏳ Buat dokumentasi API lengkap (Swagger/OpenAPI)
4. ⏳ Tambahkan validasi lebih detail (joi/express-validator)
5. ⏳ Tambahkan pagination untuk endpoint yang return banyak data
6. ⏳ Tambahkan logging (winston/morgan)

---

**Dibuat oleh:** Kiro AI Assistant  
**Tanggal:** 2026-05-14
