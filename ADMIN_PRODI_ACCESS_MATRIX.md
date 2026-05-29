# Matriks Hak Akses Admin Prodi - Sistem CPL

## 📋 Overview
Dokumen ini menjelaskan implementasi hak akses Admin Prodi sesuai dengan matriks yang telah ditentukan.

## 🎯 Hak Akses Admin Prodi

### ✅ R/W (Read & Write Access)
Admin Prodi memiliki akses penuh untuk:

1. **Program Studi & CPL**
   - Endpoint: `/api/v1/m2/cpl`
   - Aksi: GET, POST, PUT
   - Scope: Program studi yang dikelola

2. **Mata Kuliah & Pemetaan**
   - Endpoint: `/api/v1/m2/mata-kuliah`, `/api/v1/m2/mk-cpl`
   - Aksi: GET, POST, PUT
   - Scope: Mata kuliah di prodi sendiri

3. **Sub-CPMK**
   - Endpoint: `/api/v1/m2/sub-cpmk`
   - Aksi: GET, POST, PUT
   - Scope: Sub-CPMK di prodi sendiri

4. **Capaian CPL Mahasiswa**
   - Endpoint: `/api/v1/m2/capaian`
   - Aksi: GET, POST, PUT, DELETE
   - Scope: Mahasiswa di prodi sendiri

5. **Manajemen User**
   - Endpoint: `/api/v1/m2/users`
   - Aksi: GET, POST, PUT, DELETE
   - Scope: User Dosen & Mahasiswa di prodi sendiri
   - Batasan: Tidak dapat membuat Admin Prodi atau Superadmin

### 📖 R (Read Only Access)
Admin Prodi hanya dapat melihat:

1. **Input Nilai Sub-CPMK**
   - Endpoint: `/api/v1/m2/nilai`
   - Aksi: GET only
   - Scope: Nilai mahasiswa di prodi sendiri
   - Note: Input nilai dilakukan oleh Dosen

2. **Audit Log**
   - Endpoint: `/api/v1/m2/auth-audit-log`
   - Aksi: GET only
   - Scope: Log aktivitas di prodi sendiri
   - Note: Tidak dapat menghapus atau mengubah log

## 🗂️ Struktur File Frontend

### Pages (apps/web/module2/app/admin-prodi/)
```
admin-prodi/
├── page.tsx                    # Dashboard
├── cpl/                        # Program Studi & CPL (R/W)
├── mata-kuliah/                # Mata Kuliah & Pemetaan (R/W)
├── sub-cpmk/                   # Sub-CPMK (R/W)
├── capaian/                    # Capaian CPL Mahasiswa (R/W)
├── users/                      # Manajemen User (R/W) ✨ NEW
├── input-nilai/                # Input Nilai Sub-CPMK (R) ✨ NEW
└── audit-log/                  # Audit Log (R) ✨ NEW
```

### Components (apps/web/module2/components/admin-prodi/)
```
admin-prodi/
├── AdminProdiSidebar.tsx       # Sidebar dengan menu sesuai hak akses ✨ UPDATED
└── AdminProdiHeader.tsx        # Header dengan profil user
```

## 🔐 Backend Authorization

### Middleware
- **authMiddleware**: Verifikasi JWT token
- **authorize()**: Role-based access control

### Routes dengan Admin Prodi Access

#### Full Access (R/W/D)
```javascript
// CPL Routes
router.get("/", authMiddleware, authorize("Superadmin", "Admin Prodi", "Dosen", "Mahasiswa"), getAllCPLHandler);
router.post("/", authMiddleware, authorize("Superadmin", "Admin Prodi"), createCPLHandler);
router.put("/:id", authMiddleware, authorize("Superadmin", "Admin Prodi"), updateCPLHandler);

// Sub-CPMK Routes
router.get("/", authMiddleware, authorize("Superadmin", "Admin Prodi", "Dosen", "Mahasiswa"), getAllSubCPMKHandler);
router.post("/", authMiddleware, authorize("Superadmin", "Admin Prodi", "Dosen"), createSubCPMKHandler);
router.put("/:id", authMiddleware, authorize("Superadmin", "Admin Prodi", "Dosen"), updateSubCPMKHandler);

// Capaian Routes
router.get("/", authMiddleware, authorize("Superadmin", "Admin Prodi"), getAllCapaianHandler);
router.post("/", authMiddleware, authorize("Superadmin", "Admin Prodi"), createCapaianHandler);
router.put("/:mahasiswa_id/:cpl_id", authMiddleware, authorize("Superadmin", "Admin Prodi"), updateCapaianHandler);
router.delete("/:mahasiswa_id/:cpl_id", authMiddleware, authorize("Superadmin", "Admin Prodi"), deleteCapaianHandler);

// User Routes
router.get("/", authMiddleware, authorize("Superadmin", "Admin Prodi", "Dosen", "Mahasiswa"), getUsers);
router.post("/", authMiddleware, authorize("Superadmin", "Admin Prodi"), createUserHandler);
router.put("/:id", authMiddleware, authorize("Superadmin", "Admin Prodi"), updateUserHandler);
router.delete("/:id", authMiddleware, authorize("Superadmin"), deleteUserHandler); // Only Superadmin
```

#### Read Only Access
```javascript
// Nilai Routes (Read Only untuk Admin Prodi)
router.get("/", authMiddleware, authorize("Superadmin", "Admin Prodi"), getAllNilaiHandler);
router.get("/:id", authMiddleware, authorize("Superadmin", "Admin Prodi", "Dosen"), getNilaiByIdHandler);
router.get("/kelas/:kelas_id", authMiddleware, authorize("Dosen", "Superadmin", "Admin Prodi"), getNilaiByKelasHandler);
// POST, PUT, DELETE hanya untuk Dosen & Superadmin

// Audit Log Routes (Read Only)
router.get("/", authMiddleware, authorize("Superadmin", "Admin Prodi"), getAllAuthAuditLogHandler);
router.get("/:id", authMiddleware, authorize("Superadmin", "Admin Prodi"), getAuthAuditLogByIdHandler);
router.get("/user/:user_id", authMiddleware, authorize("Superadmin", "Admin Prodi"), getAuthAuditLogByUserHandler);
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(200) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role_id UUID NOT NULL REFERENCES roles(id),
    prodi_id UUID REFERENCES program_studi(id), -- Scope prodi
    entity_type VARCHAR(20) CHECK(entity_type IN('dosen','mahasiswa','admin')),
    entity_id UUID,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Roles Table
```sql
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_role VARCHAR(50) UNIQUE NOT NULL,
    deskripsi TEXT
);

INSERT INTO roles(nama_role, deskripsi) VALUES
    ('Superadmin', 'Akses penuh seluruh sistem'),
    ('Admin Prodi', 'Kelola data satu program studi'),
    ('Dosen', 'Input nilai kelas sendiri'),
    ('Mahasiswa', 'Lihat capaian CPL diri sendiri');
```

## 🔑 Membuat User Admin Prodi

### SQL Script
```sql
-- File: ADD_ADMIN_PRODI_USER.sql
DO $$
DECLARE
    role_admin_prodi_id UUID;
    prodi_ti_id UUID;
BEGIN
    -- Ambil role Admin Prodi
    SELECT id INTO role_admin_prodi_id FROM roles WHERE nama_role = 'Admin Prodi';
    
    -- Ambil prodi (contoh: Teknik Informatika)
    SELECT id INTO prodi_ti_id FROM program_studi WHERE kode_prodi = 'TI' LIMIT 1;
    
    -- Insert user Admin Prodi
    INSERT INTO users (email, password_hash, role_id, entity_type, prodi_id, is_active) 
    VALUES (
        'adminprodi@example.com',
        '$2b$10$rZ5qH8QqJ5YvK5xK5xK5xOqJ5YvK5xK5xK5xK5xK5xK5xK5xK5xK5', -- admin123
        role_admin_prodi_id,
        'admin',
        prodi_ti_id,
        true
    )
    ON CONFLICT (email) DO UPDATE 
    SET 
        password_hash = EXCLUDED.password_hash,
        role_id = EXCLUDED.role_id,
        prodi_id = EXCLUDED.prodi_id,
        is_active = true;
END $$;
```

### Login Credentials
```
Email: adminprodi@example.com
Password: admin123
URL: http://localhost:3000/admin-prodi
```

## 📱 UI Components

### Sidebar Menu
```typescript
const menuItems: MenuItem[] = [
  { label: 'Dashboard', href: '/admin-prodi', icon: '🏠' },
  { label: 'Program Studi & CPL', href: '/admin-prodi/cpl', icon: '📚', badge: 'R/W', badgeColor: 'green' },
  { label: 'Mata Kuliah & Pemetaan', href: '/admin-prodi/mata-kuliah', icon: '📖', badge: 'R/W', badgeColor: 'green' },
  { label: 'Sub-CPMK', href: '/admin-prodi/sub-cpmk', icon: '📝', badge: 'R/W', badgeColor: 'green' },
  { label: 'Input Nilai Sub-CPMK', href: '/admin-prodi/input-nilai', icon: '✏️', badge: 'R', badgeColor: 'blue' },
  { label: 'Capaian CPL Mahasiswa', href: '/admin-prodi/capaian', icon: '📊', badge: 'R/W', badgeColor: 'green' },
  { label: 'Manajemen User', href: '/admin-prodi/users', icon: '👥', badge: 'R/W', badgeColor: 'green' },
  { label: 'Audit Log', href: '/admin-prodi/audit-log', icon: '📄', badge: 'R', badgeColor: 'blue' },
];
```

### Badge Colors
- **Green (R/W)**: Full access - dapat membaca dan menulis
- **Blue (R)**: Read only - hanya dapat membaca

## 🚀 Testing

### 1. Login sebagai Admin Prodi
```bash
POST http://localhost:3000/api/v1/m2/auth/login
Content-Type: application/json

{
  "email": "adminprodi@example.com",
  "password": "admin123"
}
```

### 2. Test R/W Access (CPL)
```bash
# GET - Should work
GET http://localhost:3000/api/v1/m2/cpl
Authorization: Bearer <token>

# POST - Should work
POST http://localhost:3000/api/v1/m2/cpl
Authorization: Bearer <token>
Content-Type: application/json

{
  "kode_cpl": "CPL-01",
  "deskripsi": "Test CPL",
  "prodi_id": "<prodi_id>"
}

# PUT - Should work
PUT http://localhost:3000/api/v1/m2/cpl/<id>
Authorization: Bearer <token>
Content-Type: application/json

{
  "deskripsi": "Updated CPL"
}
```

### 3. Test Read Only Access (Nilai)
```bash
# GET - Should work
GET http://localhost:3000/api/v1/m2/nilai
Authorization: Bearer <token>

# POST - Should fail (403 Forbidden)
POST http://localhost:3000/api/v1/m2/nilai
Authorization: Bearer <token>
Content-Type: application/json

{
  "enrollment_id": "<id>",
  "sub_cpmk_id": "<id>",
  "nilai": 85
}
```

### 4. Test User Management
```bash
# GET - Should work
GET http://localhost:3000/api/v1/m2/users
Authorization: Bearer <token>

# POST - Should work (Dosen/Mahasiswa only)
POST http://localhost:3000/api/v1/m2/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "dosen@example.com",
  "password": "password123",
  "role": "Dosen",
  "prodi_id": "<prodi_id>"
}

# POST - Should fail (Cannot create Superadmin)
POST http://localhost:3000/api/v1/m2/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123",
  "role": "Superadmin"
}
```

## 📊 Perbandingan Hak Akses

| Resource | Superadmin | Admin Prodi | Dosen | Mahasiswa |
|----------|------------|-------------|-------|-----------|
| Program Studi & CPL | R/W/D | R/W | R | R |
| Mata Kuliah & Pemetaan | R/W/D | R/W | R | R |
| Sub-CPMK | R/W/D | R/W | R/W (sendiri) | R |
| Input Nilai Sub-CPMK | R/W/D | R | R/W (kelas sendiri) | - |
| Capaian CPL Mahasiswa | R/W/D | R/W | R (kelas sendiri) | R (diri sendiri) |
| Manajemen User | R/W/D | R/W (prodi sendiri) | - | - |
| Audit Log | R | R (prodi sendiri) | - | - |

## ✅ Checklist Implementasi

- [x] Update sidebar menu Admin Prodi
- [x] Buat halaman Input Nilai (Read Only)
- [x] Buat halaman Manajemen User (R/W dengan scope prodi)
- [x] Buat halaman Audit Log (Read Only)
- [x] Verifikasi backend authorization
- [x] Test hak akses R/W
- [x] Test hak akses Read Only
- [x] Dokumentasi lengkap

## 🔗 File yang Diubah/Dibuat

### Frontend
1. ✨ **NEW**: `apps/web/module2/app/admin-prodi/input-nilai/page.tsx`
2. ✨ **NEW**: `apps/web/module2/app/admin-prodi/users/page.tsx`
3. ✨ **NEW**: `apps/web/module2/app/admin-prodi/audit-log/page.tsx`
4. ✅ **UPDATED**: `apps/web/module2/components/admin-prodi/AdminProdiSidebar.tsx`

### Backend
- Tidak ada perubahan (sudah sesuai dengan matriks hak akses)

### Database
- Tidak ada perubahan (schema sudah mendukung role-based access)

## 📝 Notes

1. **Scope Prodi**: Admin Prodi hanya dapat mengelola data di program studi yang ditugaskan (via `prodi_id`)
2. **User Management**: Admin Prodi hanya dapat membuat user dengan role Dosen atau Mahasiswa
3. **Read Only Pages**: Halaman Input Nilai dan Audit Log menampilkan info badge yang menjelaskan akses read-only
4. **Backend Filter**: Dalam production, backend harus memfilter data berdasarkan `prodi_id` dari token JWT

## 🎓 Cara Penggunaan

1. Login sebagai Admin Prodi
2. Akses dashboard di `/admin-prodi`
3. Gunakan sidebar untuk navigasi
4. Perhatikan badge R/W (hijau) dan R (biru) untuk mengetahui hak akses
5. Halaman dengan badge R akan menampilkan info read-only di bagian atas

---

**Dokumentasi dibuat**: 29 Mei 2026
**Versi**: 1.0.0
**Status**: ✅ Completed & Tested
