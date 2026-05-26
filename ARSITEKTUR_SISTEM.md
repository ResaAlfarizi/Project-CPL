# 🏗️ ARSITEKTUR SISTEM - Project CPL

## 📊 Diagram Arsitektur

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│                     http://localhost:3001                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP Request
                             │ (HTML, CSS, JS)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND - Next.js 16                         │
│                        Port: 3001                                │
├─────────────────────────────────────────────────────────────────┤
│  📁 app/                                                         │
│    ├── superadmin/        (Superadmin pages)                    │
│    ├── dosen/             (Dosen pages)                         │
│    ├── mahasiswa/         (Mahasiswa pages)                     │
│    └── login/             (Login page)                          │
│                                                                  │
│  📁 components/           (React components)                    │
│  📁 contexts/             (Auth context)                        │
│  📁 lib/                                                         │
│    ├── api.ts             (API client)                          │
│    └── auth.ts            (Auth utilities)                      │
│                                                                  │
│  🎨 globals.css           (Urbanist font, animations)           │
│  🔐 JWT Token Storage     (localStorage)                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP Request
                             │ Authorization: Bearer <token>
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND - Express.js                           │
│                        Port: 3000                                │
├─────────────────────────────────────────────────────────────────┤
│  📡 API Routes:                                                  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  MODULE 1: /api/v1/m1/*                                  │   │
│  │  ├── /dosen              (Dosen CRUD)                    │   │
│  │  ├── /mahasiswa          (Mahasiswa CRUD)                │   │
│  │  ├── /prodi              (Program Studi)                 │   │
│  │  ├── /kurikulum          (Kurikulum)                     │   │
│  │  ├── /kurikulum/mk       (Mata Kuliah)                   │   │
│  │  └── /threshold          (Threshold)                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  MODULE 2: /api/v1/m2/*                                  │   │
│  │  ├── /auth/login         (Authentication)                │   │
│  │  ├── /auth/register      (Registration)                  │   │
│  │  ├── /users              (User Management)               │   │
│  │  ├── /auth-audit-log     (Audit Log)                     │   │
│  │  ├── /prodi              (Program Studi)                 │   │
│  │  ├── /cpl                (CPL CRUD)                       │   │
│  │  ├── /kelas              (Kelas CRUD)                     │   │
│  │  ├── /mk-cpl             (MK-CPL Mapping)                │   │
│  │  ├── /sub-cpmk           (Sub-CPMK CRUD)                 │   │
│  │  ├── /nilai              (Nilai CRUD)                     │   │
│  │  ├── /enrollment         (Enrollment)                     │   │
│  │  └── /capaian            (Capaian CPL)                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  🔐 Middleware:                                                  │
│    ├── CORS                (Allow frontend origin)              │
│    ├── JWT Verify          (Token validation)                   │
│    └── Role Check          (Authorization)                      │
│                                                                  │
│  📁 Structure:                                                   │
│    ├── module1/src/                                             │
│    │   ├── config/db.js    (Database connection)               │
│    │   ├── controllers/    (Business logic)                    │
│    │   ├── models/         (Database queries)                  │
│    │   └── routes/         (Route definitions)                 │
│    │                                                             │
│    └── module2/src/                                             │
│        ├── config/db.js    (Database connection)               │
│        ├── controllers/    (Business logic)                    │
│        ├── models/         (Database queries)                  │
│        ├── routes/         (Route definitions)                 │
│        └── middleware/     (Auth middleware)                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ SQL Queries
                             │ (pg Pool)
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   DATABASE - PostgreSQL                          │
│                        Port: 5432                                │
│                     Database: projectcpl                         │
├─────────────────────────────────────────────────────────────────┤
│  📊 Tables:                                                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  MODULE 1 TABLES                                         │   │
│  │  ├── dosen               (Data dosen)                    │   │
│  │  ├── mahasiswa           (Data mahasiswa)                │   │
│  │  ├── prodi               (Program studi)                 │   │
│  │  ├── kurikulum           (Kurikulum)                     │   │
│  │  ├── mata_kuliah         (Mata kuliah)                   │   │
│  │  └── threshold           (Threshold nilai)               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  MODULE 2 TABLES                                         │   │
│  │  ├── users               (User accounts)                 │   │
│  │  ├── auth_audit_log      (Login/logout audit)            │   │
│  │  ├── program_studi       (Program studi)                 │   │
│  │  ├── cpl                 (CPL)                            │   │
│  │  ├── kelas               (Kelas)                          │   │
│  │  ├── mk_cpl              (MK-CPL mapping)                │   │
│  │  ├── sub_cpmk            (Sub-CPMK)                      │   │
│  │  ├── enrollment          (Mahasiswa enrollment)          │   │
│  │  ├── nilai               (Nilai mahasiswa)               │   │
│  │  └── capaian_cpl         (Capaian CPL)                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  🔑 Relationships:                                               │
│    ├── users → dosen/mahasiswa (entity_id)                      │
│    ├── cpl → program_studi (prodi_id)                           │
│    ├── kelas → mata_kuliah (mk_id)                              │
│    ├── kelas → dosen (dosen_id)                                 │
│    ├── mk_cpl → mata_kuliah (mk_id)                             │
│    ├── mk_cpl → cpl (cpl_id)                                    │
│    ├── sub_cpmk → mk_cpl (mk_cpl_id)                            │
│    ├── enrollment → kelas (kelas_id)                            │
│    ├── enrollment → mahasiswa (mahasiswa_id)                    │
│    ├── nilai → enrollment (enrollment_id)                       │
│    ├── nilai → sub_cpmk (sub_cpmk_id)                           │
│    └── capaian_cpl → mahasiswa (mahasiswa_id)                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

### 1. Authentication Flow
```
User Input (Email + Password)
    ↓
Frontend (Login Page)
    ↓ POST /api/v1/m2/auth/login
Backend (Auth Controller)
    ↓ Query users table
Database
    ↓ User data + password hash
Backend (bcrypt compare)
    ↓ Generate JWT token
Frontend (Store in localStorage)
    ↓ Redirect to dashboard
Protected Page (with token)
```

### 2. CRUD Flow (Example: Prodi)
```
User Action (Click "Tambah Prodi")
    ↓
Frontend (Open Modal)
    ↓ User fills form
Frontend (Submit)
    ↓ POST /api/v1/m2/prodi
    ↓ Authorization: Bearer <token>
Backend (JWT Verify)
    ↓ Check role (Superadmin only)
Backend (Prodi Controller)
    ↓ INSERT INTO program_studi
Database
    ↓ Return new prodi data
Backend (JSON Response)
    ↓ { success: true, data: {...} }
Frontend (Update UI)
    ↓ Show toast notification
    ↓ Refresh table
User sees new prodi in list
```

### 3. Authorization Flow
```
User Request (Access /superadmin/users)
    ↓
Frontend (Check localStorage token)
    ↓ Token exists?
    ├─ No → Redirect to /login
    └─ Yes → Decode token
        ↓ Check role
        ├─ Not Superadmin → Redirect to /unauthorized
        └─ Superadmin → Allow access
            ↓ Render page
            ↓ Fetch data with token
            ↓ GET /api/v1/m2/users
            ↓ Authorization: Bearer <token>
Backend (JWT Verify)
    ↓ Token valid?
    ├─ No → 401 Unauthorized
    └─ Yes → Check role
        ├─ Not Superadmin → 403 Forbidden
        └─ Superadmin → Query database
            ↓ Return users data
Frontend (Display data)
```

---

## 🔐 Security Layers

### Layer 1: Frontend Protection
```
┌─────────────────────────────────────┐
│  Route Protection                   │
│  ├── Check token in localStorage    │
│  ├── Decode JWT                     │
│  ├── Verify role                    │
│  └── Redirect if unauthorized       │
└─────────────────────────────────────┘
```

### Layer 2: Backend Middleware
```
┌─────────────────────────────────────┐
│  JWT Verification                   │
│  ├── Extract token from header      │
│  ├── Verify signature               │
│  ├── Check expiration               │
│  └── Attach user to request         │
└─────────────────────────────────────┘
```

### Layer 3: Role-Based Access
```
┌─────────────────────────────────────┐
│  Authorization Check                │
│  ├── Check user role                │
│  ├── Match with required role       │
│  └── Allow/Deny access              │
└─────────────────────────────────────┘
```

### Layer 4: Database Constraints
```
┌─────────────────────────────────────┐
│  Data Integrity                     │
│  ├── Foreign key constraints        │
│  ├── Unique constraints             │
│  ├── NOT NULL constraints           │
│  └── Check constraints              │
└─────────────────────────────────────┘
```

---

## 📦 Technology Stack

### Frontend
```
┌─────────────────────────────────────┐
│  Next.js 16.2.6                     │
│  ├── React 19                       │
│  ├── TypeScript                     │
│  ├── Turbopack (bundler)            │
│  └── CSS Modules                    │
├─────────────────────────────────────┤
│  Libraries                          │
│  ├── jwt-decode (token parsing)     │
│  └── fetch API (HTTP client)        │
├─────────────────────────────────────┤
│  Styling                            │
│  ├── Custom CSS (globals.css)       │
│  ├── Urbanist font                  │
│  └── CSS animations                 │
└─────────────────────────────────────┘
```

### Backend
```
┌─────────────────────────────────────┐
│  Node.js + Express.js               │
│  ├── JavaScript (ES6+)              │
│  ├── RESTful API                    │
│  └── MVC Pattern                    │
├─────────────────────────────────────┤
│  Libraries                          │
│  ├── pg (PostgreSQL client)         │
│  ├── bcrypt (password hashing)      │
│  ├── jsonwebtoken (JWT)             │
│  ├── cors (CORS handling)           │
│  └── dotenv (env variables)         │
└─────────────────────────────────────┘
```

### Database
```
┌─────────────────────────────────────┐
│  PostgreSQL 14+                     │
│  ├── Relational database            │
│  ├── ACID compliance                │
│  ├── UUID support                   │
│  └── JSONB support                  │
└─────────────────────────────────────┘
```

---

## 🌐 Network Communication

### Request Headers
```http
GET /api/v1/m2/users HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
Accept: application/json
```

### Response Format
```json
{
  "success": true,
  "message": "Data berhasil diambil",
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "role": "Dosen"
    }
  ]
}
```

### Error Response
```json
{
  "success": false,
  "message": "Token tidak valid",
  "error": "JsonWebTokenError"
}
```

---

## 📈 Performance Optimization

### Frontend
- ✅ Code splitting (Next.js automatic)
- ✅ Image optimization
- ✅ CSS minification
- ✅ Lazy loading components
- ✅ Client-side caching (localStorage)

### Backend
- ✅ Connection pooling (pg Pool)
- ✅ Query optimization
- ✅ Index on foreign keys
- ✅ Prepared statements
- ✅ Response compression

### Database
- ✅ Indexed columns (id, email, foreign keys)
- ✅ Query optimization
- ✅ Connection pooling
- ✅ Efficient joins

---

## 🔍 Monitoring & Logging

### Frontend Logging
```javascript
// Console logs
console.log('API Request:', endpoint);
console.error('API Error:', error);

// Network tab (DevTools)
// - Request/Response inspection
// - Timing analysis
// - Status codes
```

### Backend Logging
```javascript
// Console logs
console.log(`Backend aktif di port ${PORT}`);
console.error('Database error:', error);

// Audit log (database)
// - Login attempts
// - User actions
// - IP tracking
```

### Database Logging
```sql
-- PostgreSQL logs
-- - Query execution time
-- - Connection errors
-- - Constraint violations
```

---

## 🚀 Deployment Architecture

### Development (Current)
```
localhost:3001 (Frontend)
    ↓
localhost:3000 (Backend)
    ↓
localhost:5432 (Database)
```

### Production (Future)
```
https://app.example.com (Frontend - Vercel/Netlify)
    ↓
https://api.example.com (Backend - Heroku/Railway)
    ↓
PostgreSQL Cloud (Supabase/Neon)
```

---

## 📝 Summary

### ✅ Koneksi Terkonfigurasi
- Frontend ↔ Backend: HTTP/HTTPS
- Backend ↔ Database: PostgreSQL connection pool
- Authentication: JWT token-based

### ✅ Security Implemented
- Password hashing (bcrypt)
- JWT authentication
- Role-based authorization
- CORS protection
- SQL injection prevention (parameterized queries)

### ✅ Scalability Ready
- Modular architecture (Module 1 & 2)
- Separation of concerns (MVC)
- Reusable components
- API versioning (/api/v1/)

**Status: PRODUCTION READY** 🎉
