# 🎓 Portal Mahasiswa - Sistem CPL

Portal web untuk mahasiswa melihat capaian Capaian Pembelajaran Lulusan (CPL) mereka.

---

## 🚀 Quick Start

### 1. Setup Database (5 menit)

```bash
cd database
setup-database.bat
```

### 2. Jalankan Backend

```bash
cd apps/backend/module2
npm install
npm start
```

### 3. Jalankan Frontend

```bash
cd apps/web/module2
npm install
npm run dev
```

### 4. Login

- URL: http://localhost:3001/login
- Email: **ahmad.fauzi@student.cpl.ac.id**
- Password: **admin123**

---

## ✨ Fitur

### 📊 Dashboard
- Ringkasan capaian CPL
- Stats cards (Total CPL, CPL Tercapai, dll)
- Progress bar per CPL

### 📈 Capaian CPL Saya
- **Tab Ringkasan:** Progress bar per CPL dengan badge status
- **Tab Detail:** Capaian per mata kuliah (tabel)
- Color coding: Hijau (≥80), Biru (≥60), Merah (<60)

### 🏫 Program Studi & CPL
- Daftar program studi
- CPL per prodi
- Tabel semua CPL

### 📚 Mata Kuliah
- Search mata kuliah
- Info lengkap (kode, nama, SKS, semester, dosen)
- Sub-CPMK per mata kuliah

### 📝 Sub-CPMK
- Tabel semua Sub-CPMK
- Search & filter per CPL
- Info bobot dan pemetaan

---

## 🎯 Hak Akses

| Resource | Akses |
|----------|-------|
| Program Studi & CPL | ✅ Read |
| Mata Kuliah | ✅ Read |
| Sub-CPMK | ✅ Read |
| Capaian CPL (diri sendiri) | ✅ Read |
| Input Nilai | ❌ No Access |
| Manajemen User | ❌ No Access |

---

## 📁 Struktur Project

```
Project-CPL/
├── apps/
│   ├── backend/module2/        # Backend API
│   └── web/module2/            # Frontend Next.js
│       └── app/mahasiswa/      # Portal Mahasiswa
│           ├── layout.tsx      # Layout + Sidebar
│           ├── page.tsx        # Dashboard
│           ├── capaian/        # Capaian CPL
│           ├── program-studi/  # Program Studi & CPL
│           ├── mata-kuliah/    # Mata Kuliah
│           └── sub-cpmk/       # Sub-CPMK
├── database/                   # SQL Scripts
│   ├── 01_modul1_ddl.sql
│   ├── 02_modul2_ddl.sql
│   ├── 03_auth_system.sql
│   ├── 05_insert_test_users.sql
│   └── setup-database.bat
├── CARA_TESTING.md            # Panduan testing
├── TEST_LOGIN.md              # Debugging login
└── RINGKASAN_LENGKAP.md       # Dokumentasi lengkap
```

---

## 🔧 Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Auth:** JWT + Context API
- **HTTP Client:** Fetch API

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Auth:** JWT + Bcrypt
- **ORM:** Raw SQL (pg)

---

## 🐛 Troubleshooting

### Login tidak redirect?

1. Clear browser cache & localStorage
2. Restart frontend: `npm run dev`
3. Hard refresh: Ctrl+Shift+R

### "User tidak ditemukan"?

```bash
cd database
psql -U postgres -d sistem_cpl -f 05_insert_test_users.sql
```

### Data tidak muncul?

Normal jika belum ada nilai yang diinput. Dashboard akan menampilkan "Belum ada data capaian CPL".

### CORS Error?

Cek `apps/backend/module2/app.js`:
```javascript
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));
```

---

## 📚 Dokumentasi

- **Setup Database:** `database/README.md`
- **Quick Start:** `database/QUICK_START.md`
- **Testing:** `CARA_TESTING.md`
- **Debugging:** `TEST_LOGIN.md`
- **Lengkap:** `RINGKASAN_LENGKAP.md`

---

## 🎨 Screenshots

### Login Page
```
┌─────────────────────────────────┐
│     🔒 Sistem CPL               │
│  Masuk ke akun Anda             │
│                                 │
│  Email: [________________]      │
│  Password: [____________]       │
│  □ Ingat saya   Lupa password? │
│                                 │
│  [        Masuk        ]        │
└─────────────────────────────────┘
```

### Dashboard Mahasiswa
```
┌──────────────┬─────────────────────────────────┐
│ Sistem CPL   │ Portal Mahasiswa      [Logout]  │
├──────────────┼─────────────────────────────────┤
│ Dashboard    │ Selamat Datang, Mahasiswa!      │
│ Capaian CPL  │ ┌────┬────┬────┬────┐           │
│ Program Studi│ │CPL │CPL │Prodi│ID │           │
│ Mata Kuliah  │ │ 5  │ 3  │ 1  │123│           │
│ Sub-CPMK     │ └────┴────┴────┴────┘           │
│              │ Ringkasan Capaian CPL           │
│ [Logout]     │ CPL-01  ████░░ 75.5             │
│              │ CPL-02  ██████ 85.0             │
└──────────────┴─────────────────────────────────┘
```

---

## ✅ Checklist

- [x] Database schema (Modul 1 & 2)
- [x] Authentication system
- [x] Test users
- [x] Backend API endpoints
- [x] Frontend portal mahasiswa
- [x] Dashboard
- [x] Capaian CPL
- [x] Program Studi & CPL
- [x] Mata Kuliah
- [x] Sub-CPMK
- [x] Responsive design
- [x] Role-based redirect
- [x] Dokumentasi lengkap

---

## 🚀 Deployment (Optional)

### Frontend (Vercel)
```bash
cd apps/web/module2
vercel
```

### Backend (Railway/Heroku)
```bash
cd apps/backend/module2
# Follow platform-specific deployment guide
```

### Database (Supabase/Railway)
- Export schema: `pg_dump -s sistem_cpl > schema.sql`
- Import ke production database

---

## 📞 Support

Jika ada pertanyaan atau masalah:
1. Baca dokumentasi di folder `database/`
2. Cek `CARA_TESTING.md` untuk panduan testing
3. Lihat console browser untuk error
4. Cek backend logs

---

## 📄 License

Project ini dibuat untuk keperluan UAS Pemrograman Web.

---

**Made with ❤️ for Mahasiswa**
