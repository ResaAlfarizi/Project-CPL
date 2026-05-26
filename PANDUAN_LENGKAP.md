# 🎯 PANDUAN LENGKAP - Project CPL

## ✅ STATUS SISTEM

### 🟢 Backend (Port 3000)
- **Status**: RUNNING ✅
- **URL**: http://localhost:3000
- **Module 1**: `/api/v1/m1/*` (Kurikulum, Dosen, Mahasiswa, MK)
- **Module 2**: `/api/v1/m2/*` (CPL, Penilaian, User Management)

### 🟢 Frontend (Port 3001)
- **Status**: RUNNING ✅
- **URL**: http://localhost:3001
- **Framework**: Next.js 16.2.6 (Turbopack)

### 🟢 Database
- **Type**: PostgreSQL
- **Host**: localhost:5432
- **Database**: projectcpl
- **Status**: CONNECTED ✅

---

## 🚀 CARA MENGGUNAKAN

### 1️⃣ Akses Aplikasi
Buka browser dan akses:
```
http://localhost:3001
```

### 2️⃣ Login Superadmin
```
Email: superadmin@if.ac.id
Password: superadmin123
```

### 3️⃣ Menu Superadmin
Setelah login, Anda akan masuk ke dashboard superadmin dengan menu:

#### 📊 Dashboard
- Overview sistem
- Statistik user
- Aktivitas terbaru

#### 👥 Manajemen User
- **URL**: `/superadmin/users`
- **Fitur**:
  - ✅ Tambah user baru (Dosen, Mahasiswa, Admin Prodi)
  - ✅ Edit user (email, role)
  - ✅ Hapus user
  - ✅ Search & filter
  - ✅ Role dropdown dinamis dari database
  - ✅ Superadmin hanya 1 (tidak bisa ditambah)
  - ✅ User yang login tidak muncul di list

#### 🎓 Program Studi & CPL
- **URL**: `/superadmin/prodi-cpl`
- **Fitur**:
  - ✅ Tambah program studi (kode, nama, jenjang)
  - ✅ Edit program studi
  - ✅ Hapus program studi
  - ✅ Tambah CPL per prodi
  - ✅ View CPL per prodi (modal)
  - ✅ Edit CPL
  - ✅ Hapus CPL
  - ✅ Status aktif/nonaktif CPL

#### 📚 Mata Kuliah & Pemetaan
- **URL**: `/superadmin/mata-kuliah`
- **Fitur**:
  - ✅ Tambah kelas mata kuliah
  - ✅ Dropdown mata kuliah (dari module1)
  - ✅ Dropdown dosen pengampu
  - ✅ Tahun akademik (format: 2024/2025)
  - ✅ Semester aktif (1-8)
  - ✅ Validasi semester sesuai mata kuliah
  - ✅ Nama kelas (opsional)
  - ✅ Edit kelas
  - ✅ Hapus kelas

#### 📝 Sub CPMK
- **URL**: `/superadmin/sub-cpmk`
- **Fitur**:
  - Kelola Sub-CPMK per mata kuliah
  - Mapping ke CPL

#### 📊 Input Nilai
- **URL**: `/superadmin/input-nilai`
- **Fitur**:
  - Input nilai mahasiswa per sub-CPMK
  - Bulk input nilai

#### 📈 Capaian
- **URL**: `/superadmin/capaian`
- **Fitur**:
  - Lihat capaian CPL mahasiswa
  - Capaian per kelas
  - Capaian per prodi

#### 📋 Audit Log
- **URL**: `/superadmin/audit-log`
- **Fitur**:
  - ✅ View semua aktivitas login/logout
  - ✅ Filter by event type (login_success, login_failed, logout, dll)
  - ✅ Search by user
  - ✅ Export to CSV
  - ✅ Timestamp lengkap
  - ✅ IP address tracking
  - ✅ Status badge (success/failed/pending)

---

## 🎨 FITUR UI/UX

### Design System
- **Font**: Urbanist (Google Fonts)
- **Color Palette**:
  - Eerie Black (#212121) - Primary
  - Ghost White (#F8F9FC) - Background
  - Alice Blue (#D8DFE9) - Secondary
  - Vanilla (#EFFDA3) - Accent
  - Honeydew (#CFDECA) - Success

### Components
- ✅ Animated page transitions (fade-in, slide-in)
- ✅ Stagger animations for lists
- ✅ Skeleton loading states
- ✅ Toast notifications (success/error)
- ✅ Modal dialogs
- ✅ Responsive tables
- ✅ Badge components (color-coded)
- ✅ Empty states with icons
- ✅ Search & filter inputs
- ✅ Dropdown selects
- ✅ Form validation

### Responsive Design
- ✅ Desktop (1024px+)
- ✅ Tablet (768px - 1023px)
- ✅ Mobile (< 768px)
- ✅ Collapsible sidebar

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### JWT Token
- **Storage**: localStorage
- **Key**: `auth_token`
- **Expiry**: 24 hours
- **Payload**:
  ```json
  {
    "id": "user-uuid",
    "role": "Superadmin",
    "entity_id": "entity-uuid",
    "entity_type": "admin",
    "prodi_id": null,
    "nama": "Superadmin",
    "iat": 1234567890,
    "exp": 1234567890
  }
  ```

### Protected Routes
- `/superadmin/*` - Hanya Superadmin
- `/dosen/*` - Hanya Dosen
- `/mahasiswa/*` - Hanya Mahasiswa
- `/admin-prodi/*` - Hanya Admin Prodi

### Middleware
- ✅ Token validation
- ✅ Role-based access control
- ✅ Automatic redirect to login
- ✅ Unauthorized page

---

## 📡 API INTEGRATION

### Frontend → Backend
```
Frontend (Next.js)
  ↓ HTTP Request
  ↓ Authorization: Bearer <token>
Backend (Express.js)
  ↓ JWT Verify
  ↓ Database Query
PostgreSQL Database
  ↓ Result
Backend
  ↓ JSON Response
Frontend
```

### API Client (`lib/api.ts`)
- ✅ Centralized API calls
- ✅ Automatic token injection
- ✅ Error handling
- ✅ TypeScript types
- ✅ Module 1 & 2 integration

### Error Handling
- ✅ Network errors
- ✅ 401 Unauthorized → Redirect to login
- ✅ 403 Forbidden → Show unauthorized page
- ✅ 404 Not Found → Show empty state
- ✅ 500 Server Error → Show error toast

---

## 🗄️ DATABASE SCHEMA

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  entity_id UUID,
  entity_type VARCHAR(50),
  prodi_id INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Auth Audit Log
```sql
CREATE TABLE auth_audit_log (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  event_type VARCHAR(50) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  detail JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Program Studi
```sql
CREATE TABLE program_studi (
  id SERIAL PRIMARY KEY,
  kode_prodi VARCHAR(10) UNIQUE NOT NULL,
  nama_prodi VARCHAR(255) NOT NULL,
  jenjang VARCHAR(10),
  fakultas VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### CPL
```sql
CREATE TABLE cpl (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode_cpl VARCHAR(20) NOT NULL,
  deskripsi TEXT NOT NULL,
  prodi_id INTEGER REFERENCES program_studi(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Kelas
```sql
CREATE TABLE kelas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mk_id UUID REFERENCES mata_kuliah(id),
  dosen_id UUID REFERENCES dosen(id),
  tahun_akademik VARCHAR(20) NOT NULL,
  semester_aktif INTEGER NOT NULL,
  nama_kelas VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🧪 TESTING

### Manual Testing
1. **Login Flow**
   - ✅ Login dengan credentials valid
   - ✅ Login dengan credentials invalid
   - ✅ Logout
   - ✅ Token expiry handling

2. **CRUD Operations**
   - ✅ Create (Tambah data)
   - ✅ Read (Lihat data)
   - ✅ Update (Edit data)
   - ✅ Delete (Hapus data)

3. **Validation**
   - ✅ Required fields
   - ✅ Format validation (email, tahun akademik)
   - ✅ Unique constraints
   - ✅ Foreign key constraints

4. **UI/UX**
   - ✅ Loading states
   - ✅ Error messages
   - ✅ Success notifications
   - ✅ Empty states
   - ✅ Responsive design

### Test Script
Jalankan `test-connection.bat` untuk test koneksi:
```bash
test-connection.bat
```

---

## 🐛 TROUBLESHOOTING

### Problem: 404 Page Not Found
**Solution**:
1. Stop development server (Ctrl+C)
2. Hapus cache: `Remove-Item -Path .next -Recurse -Force`
3. Restart: `npm run dev`
4. Hard refresh browser: `Ctrl+Shift+R`

### Problem: Backend tidak merespons
**Solution**:
1. Cek apakah backend running: `netstat -ano | findstr :3000`
2. Restart backend: `cd apps/backend && node app.js`
3. Cek database connection di `.env`

### Problem: Database connection error
**Solution**:
1. Pastikan PostgreSQL running
2. Cek credentials di `apps/backend/.env`
3. Test connection: `psql -U postgres -d projectcpl`

### Problem: Token tidak valid
**Solution**:
1. Logout dan login ulang
2. Clear localStorage (F12 → Application → Local Storage → Clear)
3. Cek JWT_SECRET di backend `.env`

### Problem: CORS error
**Solution**:
1. Pastikan backend menggunakan `cors()` middleware
2. Cek `NEXT_PUBLIC_API_URL` di frontend `.env.local`
3. Restart backend

---

## 📚 DOKUMENTASI TAMBAHAN

### File Penting
- `KONEKSI_DATABASE_BACKEND.md` - Detail koneksi & API endpoints
- `SOLUSI_404.md` - Solusi masalah 404 setelah git pull
- `test-connection.bat` - Script test koneksi
- `apps/backend/module2/README.md` - Dokumentasi backend module2
- `apps/backend/module2/POSTMAN_COLLECTION.json` - Postman collection

### Struktur Folder
```
Project-CPL/
├── apps/
│   ├── backend/
│   │   ├── module1/          # Kurikulum, Dosen, Mahasiswa
│   │   ├── module2/          # CPL, Penilaian, User Management
│   │   ├── app.js            # Main backend server
│   │   └── .env              # Backend config
│   └── web/
│       └── module2/          # Frontend Next.js
│           ├── app/          # Pages & layouts
│           ├── components/   # React components
│           ├── contexts/     # Auth context
│           ├── lib/          # API client, utils
│           └── .env.local    # Frontend config
├── KONEKSI_DATABASE_BACKEND.md
├── SOLUSI_404.md
├── PANDUAN_LENGKAP.md
└── test-connection.bat
```

---

## 🎉 SELESAI!

Sistem sudah **FULLY CONNECTED** dan **READY TO USE**!

### Quick Start
1. ✅ Backend running di port 3000
2. ✅ Frontend running di port 3001
3. ✅ Database connected
4. ✅ Buka http://localhost:3001
5. ✅ Login: superadmin@if.ac.id / superadmin123
6. ✅ Mulai gunakan aplikasi!

### Support
Jika ada masalah, cek:
1. Backend console (terminal backend)
2. Frontend console (browser DevTools)
3. Network tab (F12 → Network)
4. Database logs (PostgreSQL)

**Happy Coding! 🚀**
