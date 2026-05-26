# ✅ Status Koneksi Database & Backend

## 🎯 Status Saat Ini

### Backend Server
- ✅ **Status**: RUNNING
- ✅ **Port**: 3000
- ✅ **PID**: 19140
- ✅ **Health Check**: http://localhost:3000 → `{"success":true,"message":"Backend Modul 1 & 2 aktif"}`

### Frontend Server
- ✅ **Status**: RUNNING
- ✅ **Port**: 3001
- ✅ **URL**: http://localhost:3001
- ✅ **API Config**: `NEXT_PUBLIC_API_URL=http://localhost:3000`

### Database PostgreSQL
- ✅ **Host**: localhost
- ✅ **Port**: 5432
- ✅ **Database**: projectcpl
- ✅ **User**: postgres
- ✅ **Password**: gantengbro (configured)

---

## 📡 API Endpoints

### Module 1 (Kurikulum)
Base URL: `http://localhost:3000/api/v1/m1`

- **Dosen**: `/dosen`
- **Mahasiswa**: `/mahasiswa`
- **Program Studi**: `/prodi`
- **Kurikulum**: `/kurikulum`
- **Mata Kuliah**: `/kurikulum/mk`
- **Threshold**: `/threshold`

### Module 2 (CPL & Penilaian)
Base URL: `http://localhost:3000/api/v1/m2`

#### Authentication
- `POST /auth/login` - Login user
- `POST /auth/register` - Register user

#### Superadmin
- `GET /users` - Get all users
- `POST /users` - Create user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `GET /auth-audit-log` - Get audit logs

#### Program Studi & CPL
- `GET /prodi` - Get all prodi
- `POST /prodi` - Create prodi
- `PUT /prodi/:id` - Update prodi
- `DELETE /prodi/:id` - Delete prodi
- `GET /cpl` - Get all CPL
- `GET /cpl/prodi/:prodiId` - Get CPL by prodi
- `POST /cpl` - Create CPL
- `PUT /cpl/:id` - Update CPL
- `DELETE /cpl/:id` - Delete CPL

#### Mata Kuliah & Kelas
- `GET /kelas` - Get all kelas
- `POST /kelas` - Create kelas
- `PUT /kelas/:id` - Update kelas
- `DELETE /kelas/:id` - Delete kelas

#### Sub-CPMK
- `GET /sub-cpmk` - Get all sub-CPMK
- `GET /sub-cpmk/mk/:mkId` - Get sub-CPMK by mata kuliah
- `POST /sub-cpmk` - Create sub-CPMK
- `PUT /sub-cpmk/:id` - Update sub-CPMK
- `DELETE /sub-cpmk/:id` - Delete sub-CPMK

#### Nilai & Capaian
- `GET /nilai` - Get all nilai
- `GET /nilai/kelas/:kelasId` - Get nilai by kelas
- `POST /nilai` - Create nilai
- `PUT /nilai/:id` - Update nilai
- `DELETE /nilai/:id` - Delete nilai
- `GET /capaian/mahasiswa/:mahasiswaId` - Get capaian mahasiswa
- `GET /capaian/kelas/:kelasId` - Get capaian kelas
- `GET /capaian/prodi/:prodiId` - Get capaian prodi

---

## 🔐 Authentication Flow

### 1. Login
```javascript
POST http://localhost:3000/api/v1/m2/auth/login
Content-Type: application/json

{
  "email": "superadmin@if.ac.id",
  "password": "superadmin123"
}

Response:
{
  "message": "Login berhasil",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Use Token in Requests
```javascript
GET http://localhost:3000/api/v1/m2/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Token Payload
```json
{
  "id": "uuid",
  "role": "Superadmin",
  "entity_id": "uuid",
  "entity_type": "admin",
  "prodi_id": null,
  "nama": "Superadmin",
  "iat": 1234567890,
  "exp": 1234567890
}
```

---

## 🧪 Test Koneksi

### Test 1: Backend Health Check
```bash
curl http://localhost:3000
```
Expected: `{"success":true,"message":"Backend Modul 1 & 2 aktif"}`

### Test 2: Login (Superadmin)
```bash
curl -X POST http://localhost:3000/api/v1/m2/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"superadmin@if.ac.id\",\"password\":\"superadmin123\"}"
```

### Test 3: Get Users (with token)
```bash
curl http://localhost:3000/api/v1/m2/users ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test 4: Get Prodi
```bash
curl http://localhost:3000/api/v1/m2/prodi ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test 5: Get Mata Kuliah (Module 1)
```bash
curl http://localhost:3000/api/v1/m1/kurikulum/mk ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🔧 Frontend Configuration

### File: `apps/web/module2/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### File: `apps/web/module2/lib/api.ts`
- ✅ API Base URL configured
- ✅ JWT token handling implemented
- ✅ All endpoints mapped
- ✅ Error handling implemented

### File: `apps/web/module2/lib/auth.ts`
- ✅ Token storage (localStorage)
- ✅ Token decode (jwt-decode)
- ✅ Auth context provider

---

## 📊 Database Tables

### Module 2 Tables
- `users` - User accounts (Superadmin, Admin Prodi, Dosen, Mahasiswa)
- `auth_audit_log` - Login/logout audit trail
- `program_studi` - Program studi
- `cpl` - Capaian Pembelajaran Lulusan
- `kelas` - Kelas mata kuliah
- `mk_cpl` - Mapping mata kuliah ke CPL
- `sub_cpmk` - Sub-CPMK
- `enrollment` - Mahasiswa enrollment ke kelas
- `nilai` - Nilai mahasiswa per sub-CPMK
- `capaian_cpl` - Calculated capaian CPL mahasiswa

### Module 1 Tables
- `dosen` - Data dosen
- `mahasiswa` - Data mahasiswa
- `prodi` - Program studi (shared with module2)
- `kurikulum` - Kurikulum
- `mata_kuliah` - Mata kuliah
- `threshold` - Threshold nilai

---

## ✅ Checklist Koneksi

### Backend
- [x] Server running on port 3000
- [x] Database connection configured
- [x] CORS enabled for frontend
- [x] JWT authentication implemented
- [x] All routes registered (module1 + module2)

### Frontend
- [x] Server running on port 3001
- [x] API URL configured (.env.local)
- [x] API client implemented (lib/api.ts)
- [x] Auth context implemented
- [x] Token storage implemented
- [x] Protected routes implemented

### Database
- [x] PostgreSQL running on port 5432
- [x] Database 'projectcpl' exists
- [x] All tables created
- [x] Superadmin user exists

---

## 🚀 Cara Test di Browser

### 1. Buka Frontend
```
http://localhost:3001
```

### 2. Login sebagai Superadmin
```
Email: superadmin@if.ac.id
Password: superadmin123
```

### 3. Test Fitur Superadmin
- ✅ Dashboard → http://localhost:3001/superadmin
- ✅ Manajemen User → http://localhost:3001/superadmin/users
- ✅ Program Studi & CPL → http://localhost:3001/superadmin/prodi-cpl
- ✅ Mata Kuliah → http://localhost:3001/superadmin/mata-kuliah
- ✅ Audit Log → http://localhost:3001/superadmin/audit-log
- ✅ Sub CPMK → http://localhost:3001/superadmin/sub-cpmk
- ✅ Input Nilai → http://localhost:3001/superadmin/input-nilai
- ✅ Capaian → http://localhost:3001/superadmin/capaian

### 4. Cek Network Tab (F12)
- Buka DevTools (F12)
- Tab "Network"
- Lihat request ke `http://localhost:3000/api/v1/m2/*`
- Pastikan status 200 OK
- Cek response data

---

## 🐛 Troubleshooting

### Error: "Failed to fetch"
- Pastikan backend running di port 3000
- Cek CORS configuration di backend
- Cek `.env.local` di frontend

### Error: "401 Unauthorized"
- Token expired atau invalid
- Logout dan login ulang
- Cek token di localStorage (DevTools → Application → Local Storage)

### Error: "500 Internal Server Error"
- Cek backend console untuk error log
- Cek database connection
- Cek query SQL di backend

### Error: "404 Not Found"
- Cek endpoint URL
- Pastikan route terdaftar di backend
- Cek typo di URL

---

## 📝 Notes

1. **Backend dan Frontend sudah terhubung** ✅
2. **Database sudah dikonfigurasi** ✅
3. **Authentication flow sudah berfungsi** ✅
4. **Semua API endpoints sudah tersedia** ✅
5. **CORS sudah enabled** ✅

**Status: READY TO USE** 🎉
