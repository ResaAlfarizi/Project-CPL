# Dosen - Backend & Database Connection Guide

## 📋 Overview
Dokumentasi lengkap koneksi web dosen dengan backend API dan database PostgreSQL.

## 🔐 Hak Akses Dosen

### ✅ R/W (Read & Write Access)
Dosen memiliki akses penuh untuk:

1. **Input Nilai Sub-CPMK**
   - Endpoint: `/api/v1/m2/nilai`
   - Aksi: GET, POST, PUT
   - Scope: Kelas yang diampu sendiri

2. **Sub-CPMK**
   - Endpoint: `/api/v1/m2/sub-cpmk`
   - Aksi: GET, POST, PUT
   - Scope: Mata kuliah yang diampu

### 📖 R (Read Only Access)
Dosen hanya dapat melihat:

1. **Capaian CPL Mahasiswa**
   - Endpoint: `/api/v1/m2/capaian`
   - Aksi: GET only
   - Scope: Mahasiswa di kelas yang diampu

2. **Program Studi & CPL**
   - Endpoint: `/api/v1/m2/cpl`, `/api/v1/m2/prodi`
   - Aksi: GET only
   - Scope: Prodi tempat mengajar

3. **Mata Kuliah**
   - Endpoint: `/api/v1/m2/mata-kuliah`
   - Aksi: GET only
   - Scope: MK yang diampu

## 🗂️ Struktur Frontend

### Pages (apps/web/module2/app/dosen/)
```
dosen/
├── page.tsx                    # Dashboard
├── input-nilai/                # Input Nilai Sub-CPMK (R/W) ✅
├── sub-cpmk/                   # Sub-CPMK (R/W) ✅
├── capaian/                    # Capaian Mahasiswa (R) ✅
├── mata-kuliah/                # Mata Kuliah (R)
├── prodi/                      # Program Studi (R)
├── profile/                    # Profil Dosen (R)
└── settings/                   # Pengaturan (placeholder)
```

### Components (apps/web/module2/components/dosen/)
```
dosen/
├── DosenSidebar.tsx            # Sidebar dengan menu
└── DosenHeader.tsx             # Header dengan profil
```

## 🔌 API Connections

### 1. Dashboard (`/dosen`)
```typescript
// File: apps/web/module2/app/dosen/page.tsx
import { dashboardApi, kelasApi } from '@/lib/api';

// Get dashboard data
const res = await dashboardApi.getDosen();
// Returns: { statistik: { total_kelas, total_mahasiswa, total_mk }, kelas: [...] }

// Fallback: Get my classes
const kelasRes = await kelasApi.getMyClasses();
// Returns: { data: [{ id, nama_kelas, nama_mk, ... }] }
```

**Backend Endpoint**:
```javascript
// Route: GET /api/v1/m2/dashboard/dosen
router.get("/dosen", authMiddleware, authorize("Dosen"), getDashboardDosenHandler);
```

### 2. Input Nilai (`/dosen/input-nilai`)
```typescript
// File: apps/web/module2/app/dosen/input-nilai/page.tsx
import { kelasApi, nilaiApi, enrollmentApi, subCpmkApi } from '@/lib/api';

// Get my classes
const res = await kelasApi.getMyClasses();

// Get nilai by kelas
const nilaiRes = await nilaiApi.getByKelas(kelas_id);

// Get enrollments by kelas
const enrollRes = await enrollmentApi.getByKelas(kelas_id);

// Get sub-cpmk by MK
const subRes = await subCpmkApi.getByMk(mk_id);

// Create nilai
await nilaiApi.create({ enrollment_id, sub_cpmk_id, nilai });

// Update nilai
await nilaiApi.update(id, { nilai });
```

**Backend Endpoints**:
```javascript
// Get my classes
GET /api/v1/m2/kelas/dosen/my-classes
authorize("Dosen")

// Get nilai by kelas
GET /api/v1/m2/nilai/kelas/:kelas_id
authorize("Dosen", "Superadmin", "Admin Prodi")

// Create nilai
POST /api/v1/m2/nilai
authorize("Dosen", "Superadmin")

// Update nilai
PUT /api/v1/m2/nilai/:id
authorize("Dosen", "Superadmin")
```

### 3. Sub-CPMK (`/dosen/sub-cpmk`)
```typescript
// File: apps/web/module2/app/dosen/sub-cpmk/page.tsx
import { subCpmkApi, kelasApi, mkCplApi } from '@/lib/api';

// Get my sub-cpmk
const subRes = await subCpmkApi.getMySubCpmk();

// Get my classes
const kelasRes = await kelasApi.getMyClasses();

// Get my mk-cpl
const mkCplRes = await mkCplApi.getMyMkCpl();

// Create sub-cpmk
await subCpmkApi.create({ mk_cpl_id, kode_sub_cpmk, deskripsi, bobot });

// Update sub-cpmk
await subCpmkApi.update(id, { deskripsi, bobot });
```

**Backend Endpoints**:
```javascript
// Get my sub-cpmk
GET /api/v1/m2/sub-cpmk/dosen/my-sub-cpmk
authorize("Dosen")

// Get my mk-cpl
GET /api/v1/m2/mk-cpl/dosen/my-mk-cpl
authorize("Dosen")

// Create sub-cpmk
POST /api/v1/m2/sub-cpmk
authorize("Superadmin", "Admin Prodi", "Dosen")

// Update sub-cpmk
PUT /api/v1/m2/sub-cpmk/:id
authorize("Superadmin", "Admin Prodi", "Dosen")
```

### 4. Capaian (`/dosen/capaian`)
```typescript
// File: apps/web/module2/app/dosen/capaian/page.tsx
import { kelasApi, capaianApi } from '@/lib/api';

// Get my classes
const res = await kelasApi.getMyClasses();

// Get capaian by kelas
const capaianRes = await capaianApi.getByKelas(kelas_id);
```

**Backend Endpoints**:
```javascript
// Get capaian by kelas
GET /api/v1/m2/capaian/kelas/:kelas_id
authorize("Dosen", "Superadmin", "Admin Prodi")
```

### 5. Profile (`/dosen/profile`)
```typescript
// File: apps/web/module2/app/dosen/profile/page.tsx
import { profileApi } from '@/lib/api';

// Get my profile
const response = await profileApi.getMyProfile();
// Returns: { id, nidn, nama, email, nama_prodi, total_kelas, total_mahasiswa }
```

**Backend Endpoint**:
```javascript
// Get dosen profile
GET /api/v1/m2/profile/me
authorize("Dosen")
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(200) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role_id UUID NOT NULL REFERENCES roles(id),
    prodi_id UUID REFERENCES program_studi(id),
    entity_type VARCHAR(20) CHECK(entity_type IN('dosen','mahasiswa','admin')),
    entity_id UUID, -- References dosen.id for dosen users
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Dosen Table
```sql
CREATE TABLE dosen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nidn VARCHAR(20) UNIQUE NOT NULL,
    nama VARCHAR(200) NOT NULL,
    email VARCHAR(200),
    prodi_id UUID REFERENCES program_studi(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Kelas Table
```sql
CREATE TABLE kelas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mk_id UUID REFERENCES mata_kuliah(id),
    dosen_id UUID REFERENCES dosen(id), -- Dosen pengampu
    nama_kelas VARCHAR(100),
    tahun_akademik VARCHAR(20),
    semester_aktif SMALLINT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Nilai Table
```sql
CREATE TABLE nilai (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID REFERENCES enrollment(id),
    sub_cpmk_id UUID REFERENCES sub_cpmk(id),
    nilai DECIMAL(5,2) CHECK(nilai >= 0 AND nilai <= 100),
    input_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🔑 Membuat User Dosen

### SQL Script
```bash
# Jalankan SQL script
psql -d your_database -f ADD_DOSEN_USER.sql
```

### Login Credentials
```
Email: dosen@example.com
Password: dosen123
URL: http://localhost:3000/dosen
```

## 📊 Data Flow

### 1. Login Flow
```
User Login
    ↓
POST /api/v1/m2/auth/login
    ↓
Verify credentials
    ↓
Generate JWT token (includes: id, email, role, prodi_id, entity_id)
    ↓
Store token in localStorage
    ↓
Redirect to /dosen
```

### 2. Get My Classes Flow
```
Dashboard Load
    ↓
GET /api/v1/m2/kelas/dosen/my-classes
    ↓
Backend: Extract dosen_id from JWT token (entity_id)
    ↓
Query: SELECT * FROM kelas WHERE dosen_id = :entity_id
    ↓
Return kelas list
    ↓
Display in frontend
```

### 3. Input Nilai Flow
```
Select Kelas
    ↓
GET /api/v1/m2/enrollment/kelas/:kelas_id
    ↓
GET /api/v1/m2/sub-cpmk/mk/:mk_id
    ↓
Display form
    ↓
Submit nilai
    ↓
POST /api/v1/m2/nilai
    ↓
Insert into nilai table
    ↓
Refresh nilai list
```

## 🔒 Authorization Middleware

### authMiddleware
```javascript
// Verify JWT token
const token = req.headers.authorization.split(' ')[1];
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = decoded; // { id, email, role, prodi_id, entity_id }
```

### authorize Middleware
```javascript
const authorize = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user.role.toLowerCase().replace(/_/g, " ");
    const normalizedRoles = roles.map(role => role.toLowerCase().replace(/_/g, " "));
    
    if (!normalizedRoles.includes(userRole)) {
      return res.status(403).json({ message: "Akses ditolak" });
    }
    next();
  };
};
```

## 🧪 Testing

### 1. Login sebagai Dosen
```bash
POST http://localhost:3000/api/v1/m2/auth/login
Content-Type: application/json

{
  "email": "dosen@example.com",
  "password": "dosen123"
}

# Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "dosen@example.com",
    "role": "Dosen",
    "prodi_id": "uuid",
    "entity_id": "uuid"
  }
}
```

### 2. Get My Classes
```bash
GET http://localhost:3000/api/v1/m2/kelas/dosen/my-classes
Authorization: Bearer <token>

# Response:
{
  "data": [
    {
      "id": "uuid",
      "nama_kelas": "A",
      "nama_mk": "Pemrograman Web",
      "kode_mk": "IF-301",
      "tahun_akademik": "2024/2025",
      "semester_aktif": 1
    }
  ]
}
```

### 3. Get Nilai by Kelas
```bash
GET http://localhost:3000/api/v1/m2/nilai/kelas/<kelas_id>
Authorization: Bearer <token>

# Response:
{
  "data": [
    {
      "id": "uuid",
      "nim": "220001",
      "nama_mahasiswa": "Ahmad Fauzi",
      "kode_sub_cpmk": "SCPL-01",
      "nilai": 85,
      "input_at": "2024-05-29T10:00:00Z"
    }
  ]
}
```

### 4. Create Nilai
```bash
POST http://localhost:3000/api/v1/m2/nilai
Authorization: Bearer <token>
Content-Type: application/json

{
  "enrollment_id": "uuid",
  "sub_cpmk_id": "uuid",
  "nilai": 85
}

# Response:
{
  "message": "Nilai berhasil ditambahkan",
  "data": {
    "id": "uuid",
    "enrollment_id": "uuid",
    "sub_cpmk_id": "uuid",
    "nilai": 85,
    "input_at": "2024-05-29T10:00:00Z"
  }
}
```

## ✅ Checklist Koneksi

- [x] Layout dosen fix property isLoading
- [x] Dashboard terkoneksi dengan API
- [x] Input Nilai terkoneksi dengan API
- [x] Sub-CPMK terkoneksi dengan API
- [x] Capaian terkoneksi dengan API
- [x] Profile terkoneksi dengan API
- [x] Backend routes sudah sesuai
- [x] Authorization middleware berfungsi
- [x] SQL script untuk create user dosen
- [x] Dokumentasi lengkap

## 📝 Notes

1. **Scope Kelas**: Dosen hanya dapat mengakses kelas yang diampu (via `dosen_id` di tabel kelas)
2. **Entity ID**: User dosen memiliki `entity_id` yang merujuk ke `dosen.id`
3. **Prodi ID**: Dosen ter-assign ke satu program studi via `prodi_id`
4. **Input Nilai**: Hanya bisa input nilai untuk mahasiswa di kelas yang diampu
5. **Sub-CPMK**: Bisa create/update sub-cpmk untuk mata kuliah yang diampu

## 🎓 Cara Penggunaan

1. Login sebagai Dosen
2. Akses dashboard di `/dosen`
3. Pilih kelas dari dropdown
4. Input nilai mahasiswa
5. Kelola sub-cpmk mata kuliah
6. Lihat capaian mahasiswa

---

**Dokumentasi dibuat**: 29 Mei 2026
**Versi**: 1.0.0
**Status**: ✅ Connected & Tested
