# 🆕 FITUR BARU - MODULE 2 (UPDATED)

Dokumentasi untuk fitur-fitur baru yang disesuaikan dengan schema database.

---

## 📋 DAFTAR FITUR BARU

1. **Program Studi** - CRUD untuk program studi
2. **CPL (Capaian Pembelajaran Lulusan)** - CRUD untuk CPL
3. **Sub-CPMK** - CRUD untuk Sub-CPMK (terikat ke mk_cpl)

**Total Endpoints Baru:** 18 endpoints

---

## 1️⃣ PROGRAM STUDI

### **Endpoints:**

#### GET Semua Program Studi
```http
GET http://localhost:3000/api/v1/m2/prodi
Authorization: Bearer {{token}}
```

**Response:**
```json
{
  "success": true,
  "message": "Berhasil mengambil data program studi",
  "data": [
    {
      "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "kode_prodi": "IF",
      "nama_prodi": "Teknik Informatika",
      "jenjang": "S1",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### GET Program Studi by ID
```http
GET http://localhost:3000/api/v1/m2/prodi/{id}
Authorization: Bearer {{token}}
```

#### POST Buat Program Studi (Superadmin, Admin Prodi)
```http
POST http://localhost:3000/api/v1/m2/prodi
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "kode_prodi": "SI",
  "nama_prodi": "Sistem Informasi",
  "jenjang": "S1"
}
```

**Jenjang yang valid:** `D3`, `S1`, `S2`, `S3`

#### PUT Update Program Studi (Superadmin, Admin Prodi)
```http
PUT http://localhost:3000/api/v1/m2/prodi/{id}
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "kode_prodi": "SI",
  "nama_prodi": "Sistem Informasi",
  "jenjang": "S1"
}
```

#### DELETE Hapus Program Studi (Superadmin Only)
```http
DELETE http://localhost:3000/api/v1/m2/prodi/{id}
Authorization: Bearer {{token}}
```

### **Matrik Akses:**
| Role | Read | Write | Delete |
|------|------|-------|--------|
| Superadmin | ✅ | ✅ | ✅ |
| Admin Prodi | ✅ | ✅ | ❌ |
| Dosen | ✅ | ❌ | ❌ |
| Mahasiswa | ✅ | ❌ | ❌ |

---

## 2️⃣ CPL (CAPAIAN PEMBELAJARAN LULUSAN)

### **Endpoints:**

#### GET Semua CPL
```http
GET http://localhost:3000/api/v1/m2/cpl
Authorization: Bearer {{token}}
```

**Response:**
```json
{
  "success": true,
  "message": "Berhasil mengambil data CPL",
  "data": [
    {
      "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "kode_cpl": "CPL-01",
      "deskripsi": "Mampu menerapkan logika pemrograman",
      "prodi_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "is_active": true,
      "nama_prodi": "Teknik Informatika",
      "kode_prodi": "IF",
      "jenjang": "S1"
    }
  ]
}
```

#### GET CPL by ID
```http
GET http://localhost:3000/api/v1/m2/cpl/{id}
Authorization: Bearer {{token}}
```

#### GET CPL by Prodi
```http
GET http://localhost:3000/api/v1/m2/cpl/prodi/{prodi_id}
Authorization: Bearer {{token}}
```

#### POST Buat CPL (Superadmin, Admin Prodi)
```http
POST http://localhost:3000/api/v1/m2/cpl
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "kode_cpl": "CPL-02",
  "deskripsi": "Mampu menganalisis kebutuhan sistem",
  "prodi_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "is_active": true
}
```

#### PUT Update CPL (Superadmin, Admin Prodi)
```http
PUT http://localhost:3000/api/v1/m2/cpl/{id}
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "kode_cpl": "CPL-02",
  "deskripsi": "Mampu menganalisis kebutuhan sistem",
  "prodi_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "is_active": true
}
```

#### DELETE Hapus CPL (Superadmin Only)
```http
DELETE http://localhost:3000/api/v1/m2/cpl/{id}
Authorization: Bearer {{token}}
```

### **Matrik Akses:**
| Role | Read | Write | Delete |
|------|------|-------|--------|
| Superadmin | ✅ | ✅ | ✅ |
| Admin Prodi | ✅ | ✅ | ❌ |
| Dosen | ✅ | ❌ | ❌ |
| Mahasiswa | ✅ | ❌ | ❌ |

---

## 3️⃣ SUB-CPMK

**PENTING:** Sub-CPMK terikat ke `mk_cpl` (pemetaan MK ke CPL), bukan langsung ke CPMK.

### **Endpoints:**

#### GET Semua Sub-CPMK
```http
GET http://localhost:3000/api/v1/m2/sub-cpmk
Authorization: Bearer {{token}}
```

**Response:**
```json
{
  "success": true,
  "message": "Berhasil mengambil data Sub-CPMK",
  "data": [
    {
      "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "kode_sub_cpmk": "SUB-CPMK-01",
      "deskripsi": "Mampu membuat variabel dan tipe data",
      "mk_cpl_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "bobot": 0.2,
      "mk_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "cpl_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "bobot_mk_ke_cpl": 0.3,
      "kode_mk": "IF101",
      "nama_mk": "Pemrograman Dasar",
      "sks": 3,
      "semester": 1,
      "kode_cpl": "CPL-01",
      "deskripsi_cpl": "Mampu menerapkan logika pemrograman"
    }
  ]
}
```

#### GET Sub-CPMK by ID
```http
GET http://localhost:3000/api/v1/m2/sub-cpmk/{id}
Authorization: Bearer {{token}}
```

#### GET Sub-CPMK by MK_CPL
```http
GET http://localhost:3000/api/v1/m2/sub-cpmk/mk-cpl/{mk_cpl_id}
Authorization: Bearer {{token}}
```

#### GET Sub-CPMK by MK
```http
GET http://localhost:3000/api/v1/m2/sub-cpmk/mk/{mk_id}
Authorization: Bearer {{token}}
```

#### GET Sub-CPMK by CPL
```http
GET http://localhost:3000/api/v1/m2/sub-cpmk/cpl/{cpl_id}
Authorization: Bearer {{token}}
```

#### POST Buat Sub-CPMK (Superadmin, Admin Prodi)
```http
POST http://localhost:3000/api/v1/m2/sub-cpmk
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "kode_sub_cpmk": "SUB-CPMK-02",
  "deskripsi": "Mampu membuat fungsi dan prosedur",
  "mk_cpl_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "bobot": 0.3
}
```

**PENTING:** Bobot harus antara 0 dan 1 (desimal), bukan 0-100!

#### PUT Update Sub-CPMK (Superadmin, Admin Prodi)
```http
PUT http://localhost:3000/api/v1/m2/sub-cpmk/{id}
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "kode_sub_cpmk": "SUB-CPMK-02",
  "deskripsi": "Mampu membuat fungsi dan prosedur",
  "mk_cpl_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "bobot": 0.3
}
```

#### DELETE Hapus Sub-CPMK (Superadmin Only)
```http
DELETE http://localhost:3000/api/v1/m2/sub-cpmk/{id}
Authorization: Bearer {{token}}
```

### **Matrik Akses:**
| Role | Read | Write | Delete |
|------|------|-------|--------|
| Superadmin | ✅ | ✅ | ✅ |
| Admin Prodi | ✅ | ✅ | ❌ |
| Dosen | ✅ | ❌ | ❌ |
| Mahasiswa | ✅ | ❌ | ❌ |

---

## 📊 TOTAL ENDPOINTS SEKARANG

| Resource | Endpoints | Total |
|----------|-----------|-------|
| Auth | 2 | 2 |
| Users | 5 | 5 |
| Kelas | 6 | 6 |
| Enrollment | 6 | 6 |
| Nilai | 7 | 7 |
| Capaian | 6 | 6 |
| Dashboard | 3 | 3 |
| **Program Studi** | **5** | **5** |
| **CPL** | **6** | **6** |
| **Sub-CPMK** | **8** | **8** |
| **TOTAL** | | **54** |

---

## 📝 CATATAN PENTING

### **1. Struktur Database**

**Program Studi:**
- `id` (UUID)
- `kode_prodi` (VARCHAR)
- `nama_prodi` (VARCHAR)
- `jenjang` (VARCHAR) - D3, S1, S2, S3
- `created_at` (TIMESTAMPTZ)

**CPL:**
- `id` (UUID)
- `prodi_id` (UUID) → program_studi
- `kode_cpl` (VARCHAR)
- `deskripsi` (TEXT)
- `is_active` (BOOLEAN)

**MK_CPL (Pemetaan MK ke CPL):**
- `id` (UUID)
- `mk_id` (UUID) → mata_kuliah
- `cpl_id` (UUID) → cpl
- `bobot` (NUMERIC) - 0 sampai 1

**Sub-CPMK:**
- `id` (UUID)
- `mk_cpl_id` (UUID) → mk_cpl
- `kode_sub_cpmk` (VARCHAR)
- `deskripsi` (TEXT)
- `bobot` (NUMERIC) - 0 sampai 1

### **2. Relasi Tabel**
```
program_studi
    ↓
   cpl ←─────┐
    ↓        │
mata_kuliah  │
    ↓        │
  mk_cpl ────┘
    ↓
sub_cpmk
```

### **3. Bobot Sub-CPMK**
- Bobot harus antara **0 dan 1** (desimal)
- Contoh: 0.2 = 20%, 0.3 = 30%
- Total bobot semua Sub-CPMK dalam satu mk_cpl sebaiknya = 1.0

### **4. Constraint**
- `kode_cpl` harus unique per prodi
- `kode_sub_cpmk` harus unique per mk_cpl
- `jenjang` harus salah satu dari: D3, S1, S2, S3

---

## ✅ CHECKLIST TESTING

### **Program Studi:**
- [ ] GET semua program studi
- [ ] GET program studi by ID
- [ ] POST buat program studi (Superadmin)
- [ ] PUT update program studi (Superadmin)
- [ ] DELETE hapus program studi (Superadmin)

### **CPL:**
- [ ] GET semua CPL
- [ ] GET CPL by ID
- [ ] GET CPL by prodi
- [ ] POST buat CPL (Superadmin, Admin Prodi)
- [ ] PUT update CPL (Superadmin, Admin Prodi)
- [ ] DELETE hapus CPL (Superadmin)

### **Sub-CPMK:**
- [ ] GET semua Sub-CPMK
- [ ] GET Sub-CPMK by ID
- [ ] GET Sub-CPMK by MK_CPL
- [ ] GET Sub-CPMK by MK
- [ ] GET Sub-CPMK by CPL
- [ ] POST buat Sub-CPMK (Superadmin, Admin Prodi)
- [ ] PUT update Sub-CPMK (Superadmin, Admin Prodi)
- [ ] DELETE hapus Sub-CPMK (Superadmin)

---

## 🚀 CARA TESTING

### **Step 1: Restart Backend**
```bash
npm start
```

### **Step 2: Login**
```http
POST http://localhost:3000/api/v1/m2/auth/login
Content-Type: application/json

{
  "email": "admin@if.ac.id",
  "password": "password123"
}
```

### **Step 3: Test Endpoints**

**Program Studi:**
```http
GET http://localhost:3000/api/v1/m2/prodi
Authorization: Bearer {{token}}
```

**CPL:**
```http
GET http://localhost:3000/api/v1/m2/cpl
Authorization: Bearer {{token}}
```

**Sub-CPMK:**
```http
GET http://localhost:3000/api/v1/m2/sub-cpmk
Authorization: Bearer {{token}}
```

---

**Fitur baru sudah disesuaikan dengan schema database!** 🎉

**Total endpoints sekarang: 54 endpoints**
