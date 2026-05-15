# 🆕 FITUR BARU - MODULE 2

Dokumentasi untuk fitur-fitur baru yang ditambahkan.

---

## 📋 DAFTAR FITUR BARU

1. **Program Studi** - CRUD untuk program studi
2. **CPL (Capaian Pembelajaran Lulusan)** - CRUD untuk CPL
3. **Sub-CPMK** - CRUD untuk Sub-CPMK
4. **Audit Log** - Tracking perubahan data

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
      "fakultas": "Fakultas Teknik",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### GET Program Studi by ID
```http
GET http://localhost:3000/api/v1/m2/prodi/{id}
Authorization: Bearer {{token}}
```

#### POST Buat Program Studi (Superadmin Only)
```http
POST http://localhost:3000/api/v1/m2/prodi
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "kode_prodi": "SI",
  "nama_prodi": "Sistem Informasi",
  "jenjang": "S1",
  "fakultas": "Fakultas Teknik"
}
```

#### PUT Update Program Studi (Superadmin Only)
```http
PUT http://localhost:3000/api/v1/m2/prodi/{id}
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "kode_prodi": "SI",
  "nama_prodi": "Sistem Informasi",
  "jenjang": "S1",
  "fakultas": "Fakultas Teknik"
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
| Admin Prodi | ✅ | ❌ | ❌ |
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
      "kategori": "Pengetahuan",
      "nama_prodi": "Teknik Informatika",
      "kode_prodi": "IF",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
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
  "kategori": "Keterampilan"
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
  "kategori": "Keterampilan"
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
      "cpmk_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "cpl_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "bobot": 20,
      "kode_cpmk": "CPMK-01",
      "deskripsi_cpmk": "Memahami dasar pemrograman",
      "kode_mk": "IF101",
      "nama_mk": "Pemrograman Dasar",
      "kode_cpl": "CPL-01",
      "deskripsi_cpl": "Mampu menerapkan logika pemrograman",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### GET Sub-CPMK by ID
```http
GET http://localhost:3000/api/v1/m2/sub-cpmk/{id}
Authorization: Bearer {{token}}
```

#### GET Sub-CPMK by CPMK
```http
GET http://localhost:3000/api/v1/m2/sub-cpmk/cpmk/{cpmk_id}
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
  "cpmk_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "cpl_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "bobot": 30
}
```

#### PUT Update Sub-CPMK (Superadmin, Admin Prodi)
```http
PUT http://localhost:3000/api/v1/m2/sub-cpmk/{id}
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "kode_sub_cpmk": "SUB-CPMK-02",
  "deskripsi": "Mampu membuat fungsi dan prosedur",
  "cpmk_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "cpl_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "bobot": 30
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

## 4️⃣ AUDIT LOG

### **Endpoints:**

#### GET Semua Audit Log
```http
GET http://localhost:3000/api/v1/m2/audit-log?limit=100&offset=0
Authorization: Bearer {{token}}
```

**Response:**
```json
{
  "success": true,
  "message": "Berhasil mengambil data audit log",
  "data": [
    {
      "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "user_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "action": "CREATE",
      "table_name": "kelas",
      "record_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "old_data": null,
      "new_data": "{\"mk_id\":\"...\",\"dosen_id\":\"...\"}",
      "ip_address": "127.0.0.1",
      "user_agent": "PostmanRuntime/7.32.3",
      "created_at": "2024-01-01T00:00:00.000Z",
      "user_email": "admin@if.ac.id",
      "user_role": "superadmin"
    }
  ]
}
```

#### GET Audit Log by ID
```http
GET http://localhost:3000/api/v1/m2/audit-log/{id}
Authorization: Bearer {{token}}
```

#### GET Audit Log by User
```http
GET http://localhost:3000/api/v1/m2/audit-log/user/{user_id}?limit=100&offset=0
Authorization: Bearer {{token}}
```

#### GET Audit Log by Table
```http
GET http://localhost:3000/api/v1/m2/audit-log/table/{table_name}?limit=100&offset=0
Authorization: Bearer {{token}}
```

**Contoh:**
```http
GET http://localhost:3000/api/v1/m2/audit-log/table/kelas?limit=50&offset=0
Authorization: Bearer {{token}}
```

#### GET Audit Log by Record
```http
GET http://localhost:3000/api/v1/m2/audit-log/record/{table_name}/{record_id}
Authorization: Bearer {{token}}
```

**Contoh:**
```http
GET http://localhost:3000/api/v1/m2/audit-log/record/kelas/fffffff1-ffff-ffff-ffff-fffffffffff1
Authorization: Bearer {{token}}
```

#### DELETE Audit Log Lama (Superadmin Only)
```http
DELETE http://localhost:3000/api/v1/m2/audit-log/cleanup?days=90
Authorization: Bearer {{token}}
```

### **Matrik Akses:**
| Role | Read | Delete |
|------|------|--------|
| Superadmin | ✅ | ✅ |
| Admin Prodi | ✅ | ❌ |
| Dosen | ❌ | ❌ |
| Mahasiswa | ❌ | ❌ |

### **Actions yang di-track:**
- `CREATE` - Saat data baru dibuat
- `UPDATE` - Saat data diupdate
- `DELETE` - Saat data dihapus

### **Tables yang di-track:**
- `program_studi`
- `cpl`
- `sub_cpmk`
- `kelas`
- `enrollment`
- `nilai_sub_cpmk`

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
| **Sub-CPMK** | **7** | **7** |
| **Audit Log** | **6** | **6** |
| **TOTAL** | | **59** |

---

## 🔐 AUDIT LOG OTOMATIS

Audit log akan otomatis dibuat saat:

### **Program Studi:**
- ✅ Create program studi
- ✅ Update program studi
- ✅ Delete program studi

### **CPL:**
- ✅ Create CPL
- ✅ Update CPL
- ✅ Delete CPL

### **Sub-CPMK:**
- ✅ Create Sub-CPMK
- ✅ Update Sub-CPMK
- ✅ Delete Sub-CPMK

---

## 📝 CATATAN PENTING

### **1. Struktur Tabel**
Pastikan tabel-tabel berikut sudah ada di database:
- `program_studi` (id, kode_prodi, nama_prodi, jenjang, fakultas, created_at, updated_at)
- `cpl` (id, kode_cpl, deskripsi, prodi_id, kategori, created_at, updated_at)
- `sub_cpmk` (id, kode_sub_cpmk, deskripsi, cpmk_id, cpl_id, bobot, created_at, updated_at)
- `cpmk` (id, kode_cpmk, deskripsi, mk_id, created_at, updated_at)
- `audit_log` (id, user_id, action, table_name, record_id, old_data, new_data, ip_address, user_agent, created_at)

### **2. Relasi Tabel**
- `cpl` → `program_studi` (many-to-one)
- `sub_cpmk` → `cpmk` (many-to-one)
- `sub_cpmk` → `cpl` (many-to-one)
- `cpmk` → `mata_kuliah` (many-to-one)

### **3. Bobot Sub-CPMK**
- Bobot harus antara 0-100
- Total bobot semua Sub-CPMK dalam satu CPMK sebaiknya 100

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
- [ ] GET Sub-CPMK by CPMK
- [ ] GET Sub-CPMK by CPL
- [ ] POST buat Sub-CPMK (Superadmin, Admin Prodi)
- [ ] PUT update Sub-CPMK (Superadmin, Admin Prodi)
- [ ] DELETE hapus Sub-CPMK (Superadmin)

### **Audit Log:**
- [ ] GET semua audit log
- [ ] GET audit log by ID
- [ ] GET audit log by user
- [ ] GET audit log by table
- [ ] GET audit log by record
- [ ] DELETE audit log lama (Superadmin)

---

**Fitur baru sudah siap digunakan!** 🎉

**Total endpoints sekarang: 59 endpoints**
