# 🎓 Sistem CPL - Portal Mahasiswa

Sistem Capaian Pembelajaran Lulusan (CPL) untuk mahasiswa UIN Sunan Ampel Surabaya.

## 🚀 Quick Start

**Baca file ini terlebih dahulu:** [`MULAI_DISINI.md`](./MULAI_DISINI.md)

## 📁 Struktur Project

```
Project-CPL/
├── apps/
│   ├── backend/          # Backend API (Node.js + Express)
│   │   ├── module1/      # Module 1 (CRUD Prodi, CPL, dll)
│   │   ├── module2/      # Module 2 (Authentication, Mahasiswa Portal)
│   │   ├── app.js        # Entry point
│   │   └── .env          # Configuration
│   └── web/
│       └── module2/      # Frontend (Next.js 14)
│           ├── app/      # Pages
│           ├── components/ # Components
│           ├── contexts/ # React Context
│           └── lib/      # Utilities
├── database/
│   └── 06_dummy_data_lengkap.sql  # Dummy data
└── docs/                 # Documentation
```

## 🎯 Fitur

### Portal Mahasiswa
- ✅ Login/Logout dengan JWT
- ✅ Dashboard mahasiswa
- ✅ Lihat Program Studi & CPL (Read-only)
- ✅ Lihat Mata Kuliah (Read-only)
- ✅ Lihat Sub-CPMK (Read-only)
- ✅ Lihat Capaian CPL diri sendiri dengan progress bar
- ✅ Lihat Profil mahasiswa
- ✅ Sidebar toggle (hamburger menu)
- ✅ Profile dropdown
- ✅ Responsive design

### UI/UX
- 🎨 Dark sidebar (#1a1a1a)
- 🎨 Yellow accent (#FFF063)
- 🎨 Pastel colors (Alice Blue, Honeydew)
- 🎨 Urbanist font
- 🎨 Badge "R" untuk read-only menu
- 🎨 Progress bar untuk capaian
- 🎨 Modern & clean design

## 🛠️ Tech Stack

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT Authentication
- Bcrypt

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS (custom)
- Context API

## 📋 Prerequisites

- Node.js v18+ 
- PostgreSQL 12+
- npm atau yarn

## 🚀 Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd Project-CPL
```

### 2. Setup Database
```bash
# Buat database di PostgreSQL
createdb projectcpl

# Import dummy data
psql -U postgres -d projectcpl -f database/06_dummy_data_lengkap.sql
```

### 3. Setup Backend
```bash
cd apps/backend

# Install dependencies
npm install

# Configure .env
# Edit file .env dengan kredensial database Anda

# Test connection
node test-db-connection.js

# Run backend
node app.js
```

### 4. Setup Frontend
```bash
cd apps/web/module2

# Install dependencies
npm install

# Configure .env.local
# Pastikan NEXT_PUBLIC_API_URL=http://localhost:3000

# Run frontend
npm run dev
```

### 5. Access Application
- Frontend: http://localhost:3001
- Backend: http://localhost:3000
- Login: mhs1@if.ac.id / password123

## 📚 Documentation

| File | Description |
|------|-------------|
| [`MULAI_DISINI.md`](./MULAI_DISINI.md) | 👈 **START HERE** - Quick start guide |
| [`PERBAIKAN_CEPAT.md`](./PERBAIKAN_CEPAT.md) | Troubleshooting common errors |
| [`CARA_MENJALANKAN.md`](./CARA_MENJALANKAN.md) | Detailed setup guide |
| [`CHECKLIST_LENGKAP.md`](./CHECKLIST_LENGKAP.md) | Complete feature checklist |
| [`VERIFIKASI_DATABASE.sql`](./VERIFIKASI_DATABASE.sql) | Database verification queries |

## 🧪 Testing

### Test Backend
```bash
cd apps/backend

# Test database connection
node test-db-connection.js

# Test API endpoints
node test-api.js
```

### Test Frontend
1. Open http://localhost:3001/login
2. Login with: mhs1@if.ac.id / password123
3. Navigate through all menu items
4. Check browser console (F12) for errors

## 🔐 Default Credentials

### Mahasiswa
- Email: mhs1@if.ac.id
- Password: password123
- Nama: Rizky Kurniawan
- NIM: 23010001
- Prodi: Teknik Lingkungan

### Other Test Users
- mhs2@if.ac.id / password123
- mhs3@if.ac.id / password123
- mhs4@if.ac.id / password123
- mhs5@if.ac.id / password123

## 🐛 Troubleshooting

### Error: "Unexpected token <!DOCTYPE"
Backend tidak jalan atau tidak bisa connect ke database.
➡️ Lihat [`PERBAIKAN_CEPAT.md`](./PERBAIKAN_CEPAT.md)

### Error: "Token tidak ada"
Token tidak tersimpan di localStorage.
```javascript
// Di browser console (F12):
localStorage.clear()
// Refresh dan login ulang
```

### Error: "Cannot connect to database"
```bash
cd apps/backend
node test-db-connection.js
```

### Error: "Port already in use"
```bash
# Kill process
taskkill /F /IM node.exe

# Or change port in .env
```

## 📊 Database Schema

### Main Tables
- `users` - User accounts
- `roles` - User roles
- `mahasiswa` - Student data
- `dosen` - Lecturer data
- `program_studi` - Study programs
- `cpl` - Learning outcomes
- `mata_kuliah` - Courses
- `kelas` - Classes
- `enrollment` - Student enrollments
- `sub_cpmk` - Sub-CPMK
- `nilai_sub_cpmk` - Grades

### Views
- `v_capaian_cpl_mahasiswa` - Student CPL achievement

## 🔄 API Endpoints

### Authentication
- `POST /api/v1/m2/auth/login` - Login
- `POST /api/v1/m2/auth/register` - Register

### Mahasiswa
- `GET /api/v1/m2/profile/mahasiswa/me` - Get profile
- `GET /api/v1/m2/capaian/mahasiswa/my-capaian` - Get CPL achievement
- `GET /api/v1/m2/capaian/mahasiswa/my-capaian/detail` - Get detailed achievement
- `GET /api/v1/m2/prodi` - Get all study programs
- `GET /api/v1/m2/cpl` - Get all CPL
- `GET /api/v1/m2/kelas` - Get all classes
- `GET /api/v1/m2/sub-cpmk` - Get all sub-CPMK

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Authors

- UIN Sunan Ampel Surabaya

## 🙏 Acknowledgments

- UIN Sunan Ampel Surabaya
- All contributors

---

**© 2026 Sistem CPL — UIN Sunan Ampel Surabaya**
