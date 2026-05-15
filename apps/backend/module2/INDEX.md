# 📚 INDEX DOKUMENTASI MODULE 2

Panduan lengkap untuk backend Module 2 - Sistem Akademik CPL.

---

## 🎯 MULAI DARI SINI

**Baru pertama kali?** Baca file ini dulu untuk memahami struktur dokumentasi.

---

## 📖 DOKUMENTASI UTAMA

### **1. DOKUMENTASI_LENGKAP.md** ⭐ (BACA INI DULU!)
File dokumentasi lengkap yang menggabungkan semua panduan:
- Setup database
- Setup backend
- Testing di Postman
- Struktur file
- Penjelasan models, controllers, routes
- Matrik akses
- Contoh request API
- Troubleshooting

**Waktu baca:** ~30 menit

---

### **3. POSTMAN_TESTING_GUIDE.md** 🆕
Panduan lengkap untuk testing API di Postman:
- Cara setup Authorization header dengan benar
- Solusi untuk error 401 Unauthorized
- Contoh request untuk setiap endpoint
- Tips & tricks menggunakan Postman
- Debugging error response

**Waktu baca:** ~15 menit

---

### **4. PANDUAN_TESTING_POSTMAN.md** 🆕🔥
**PANDUAN TERBARU** - Testing lengkap semua fitur:
- Setup environment di Postman
- Testing semua 61 endpoints
- Testing Program Studi, CPL, Sub-CPMK
- Testing Auth Audit Log
- Checklist testing lengkap
- Tips & common errors

**Waktu baca:** ~30 menit

---

### **5. SOLUSI_401_UNAUTHORIZED.md** 🆕
Panduan khusus untuk mengatasi error 401:
- Penjelasan penyebab error
- Solusi step-by-step
- Cara kerja authentication
- Error yang mungkin terjadi

**Waktu baca:** ~10 menit

---

### **4b. SOLUSI_TOKEN_TIDAK_VALID.md** 🆕
Panduan khusus untuk mengatasi error "Token tidak valid":
- Penyebab umum dan cara mengatasinya
- Langkah-langkah debugging
- Contoh lengkap testing di Postman
- Checklist debugging

**Waktu baca:** ~10 menit

---

### **5. QUICK_REFERENCE.md** 🆕
Cheat sheet untuk testing API:
- Semua endpoint dalam satu halaman
- Format request & response
- Test users
- Common errors

**Waktu baca:** ~5 menit (untuk referensi cepat)

---

### **6. QUICK_TESTING_AUDITLOG.md** 🆕🔥 (AUDIT LOG TESTING)
**Panduan cepat testing Auth Audit Log** - Step by step:
- Setup Postman untuk audit log
- 8 step testing dari login hingga cleanup
- Checklist testing lengkap
- Authorization rules
- Common issues & solutions
- Tips & tricks

**Waktu baca:** ~15 menit

---

### **7. POSTMAN_AUDITLOG_COLLECTION.md** 🆕
Panduan membuat Postman Collection untuk audit log:
- Cara import collection
- 8 requests siap pakai
- Pre-request scripts & tests
- Testing workflows
- Postman tips & tricks

**Waktu baca:** ~10 menit

---

### **6. README.md**
Dokumentasi teknis lengkap tentang:
- Struktur folder
- Penjelasan setiap file
- Cara kerja authentication & authorization
- Tabel akses per endpoint

**Waktu baca:** ~20 menit

---

## 🔐 AUTH AUDIT LOG FEATURES (NEW!)

### **Auth Audit Log Documentation**
- **AUTH_AUDIT_LOG.md** - Dokumentasi lengkap fitur audit log
- **QUICK_TESTING_AUDITLOG.md** - Panduan cepat testing (8 steps)
- **POSTMAN_AUDITLOG_COLLECTION.md** - Postman collection setup

### **Fitur:**
- Track login success/failed
- Track logout, token refresh
- Track password changes
- Login statistics & trends
- Detect brute force attacks
- Automatic logging on login events

### **Endpoints:**
- GET `/auth-audit-log` - Semua logs
- GET `/auth-audit-log/:id` - Detail log
- GET `/auth-audit-log/user/:user_id` - Logs by user
- GET `/auth-audit-log/event/:event_type` - Logs by event
- GET `/auth-audit-log/statistics/login` - Login statistics
- GET `/auth-audit-log/statistics/failed-logins` - Failed login stats
- DELETE `/auth-audit-log/cleanup` - Delete old logs

**Total: 7 endpoints**

---

## 🚀 QUICK START (5 MENIT)

Jika kamu ingin langsung mencoba:

### **Step 1: Update Password Database**
```bash
psql -U postgres -d projectcpl -f UPDATE_PASSWORD.sql
```

### **Step 2: Jalankan Backend**
```bash
cd apps/backend
npm start
```

### **Step 3: Test di Postman**
```http
POST http://localhost:3000/api/v1/m2/auth/login
{
  "email": "admin@if.ac.id",
  "password": "password123"
}
```

---

## 📁 STRUKTUR FOLDER

```
module2/
├── src/
│   ├── config/          # Database config
│   ├── controllers/     # Business logic (5 files)
│   ├── models/          # Database queries (5 files)
│   ├── routes/          # API endpoints (5 files)
│   ├── middlewares/     # Auth & role protection
│   └── utils/           # Helper functions
│
├── DOKUMENTASI_LENGKAP.md  # ⭐ Baca ini!
├── README.md               # Dokumentasi teknis
├── INDEX.md                # File ini
└── UPDATE_PASSWORD.sql     # Password hash update
```

---

## 🔑 INFORMASI PENTING

### **Database**
- **Host:** localhost
- **Port:** 5432
- **Database:** projectcpl
- **User:** postgres
- **Password:** 1234

### **Backend**
- **Port:** 3000
- **Base URL:** http://localhost:3000/api/v1/m2

### **Test Users**
| Email | Password | Role |
|-------|----------|------|
| admin@if.ac.id | password123 | Admin Prodi |
| dosen1@if.ac.id | password123 | Dosen |
| mhs1@if.ac.id | password123 | Mahasiswa |

---

## 📊 ENDPOINT SUMMARY

### **Authentication** (2 endpoints)
- POST `/auth/login` - Login
- POST `/auth/logout` - Logout

### **Users** (5 endpoints)
- GET `/users` - Semua user
- GET `/users/:id` - Detail user
- GET `/users/email/:email` - User by email
- POST `/users` - Buat user
- PUT `/users/:id` - Update user

### **Program Studi** (5 endpoints) 🆕
- GET `/prodi` - Semua prodi
- GET `/prodi/:id` - Detail prodi
- POST `/prodi` - Buat prodi
- PUT `/prodi/:id` - Update prodi
- DELETE `/prodi/:id` - Hapus prodi

### **CPL** (6 endpoints) 🆕
- GET `/cpl` - Semua CPL
- GET `/cpl/:id` - Detail CPL
- GET `/cpl/prodi/:prodi_id` - CPL by prodi
- POST `/cpl` - Buat CPL
- PUT `/cpl/:id` - Update CPL
- DELETE `/cpl/:id` - Hapus CPL

### **Sub-CPMK** (8 endpoints) 🆕
- GET `/sub-cpmk` - Semua sub-CPMK
- GET `/sub-cpmk/:id` - Detail sub-CPMK
- GET `/sub-cpmk/mk-cpl/:mk_cpl_id` - Sub-CPMK by MK-CPL
- GET `/sub-cpmk/mk/:mk_id` - Sub-CPMK by MK
- GET `/sub-cpmk/cpl/:cpl_id` - Sub-CPMK by CPL
- POST `/sub-cpmk` - Buat sub-CPMK
- PUT `/sub-cpmk/:id` - Update sub-CPMK
- DELETE `/sub-cpmk/:id` - Hapus sub-CPMK

### **Kelas** (6 endpoints)
- GET `/kelas` - Semua kelas
- GET `/kelas/:id` - Detail kelas
- GET `/kelas/dosen/my-classes` - Kelas dosen
- POST `/kelas` - Buat kelas
- PUT `/kelas/:id` - Update kelas
- DELETE `/kelas/:id` - Hapus kelas

### **Enrollment** (6 endpoints)
- GET `/enrollment` - Semua enrollment
- GET `/enrollment/:id` - Detail enrollment
- GET `/enrollment/kelas/:kelas_id` - Mahasiswa di kelas
- GET `/enrollment/mahasiswa/my-enrollment` - KRS mahasiswa
- POST `/enrollment` - Daftar kelas
- DELETE `/enrollment/:id` - Drop kelas

### **Nilai** (7 endpoints)
- GET `/nilai` - Semua nilai
- GET `/nilai/:id` - Detail nilai
- GET `/nilai/kelas/:kelas_id` - Nilai kelas
- GET `/nilai/mahasiswa/my-nilai` - Nilai mahasiswa
- POST `/nilai` - Input nilai
- PUT `/nilai/:id` - Update nilai
- DELETE `/nilai/:id` - Hapus nilai

### **Capaian** (6 endpoints)
- GET `/capaian/mahasiswa/my-capaian` - Capaian mahasiswa
- GET `/capaian/mahasiswa/my-capaian/detail` - Detail capaian
- GET `/capaian/mahasiswa/:mahasiswa_id` - Capaian mahasiswa tertentu
- GET `/capaian/prodi/:prodi_id` - Capaian prodi
- GET `/capaian/kelas/:kelas_id` - Capaian kelas
- GET `/capaian/belum-capai/:cpl_id/:prodi_id` - Mahasiswa belum capai

### **Dashboard** (3 endpoints)
- GET `/dashboard/admin/:prodi_id` - Dashboard admin
- GET `/dashboard/dosen` - Dashboard dosen
- GET `/dashboard/mahasiswa` - Dashboard mahasiswa

### **Auth Audit Log** (7 endpoints) 🆕
- GET `/auth-audit-log` - Semua logs
- GET `/auth-audit-log/:id` - Detail log
- GET `/auth-audit-log/user/:user_id` - Logs by user
- GET `/auth-audit-log/event/:event_type` - Logs by event
- GET `/auth-audit-log/statistics/login` - Login statistics
- GET `/auth-audit-log/statistics/failed-logins` - Failed login stats
- DELETE `/auth-audit-log/cleanup` - Delete old logs

**Total: 61 endpoints**

---

## 🔐 ROLES & PERMISSIONS

| Role | Akses |
|------|-------|
| **Superadmin** | Full access (R/W/D) |
| **Admin Prodi** | Full access prodi sendiri (R/W) |
| **Dosen** | Kelas & nilai yang diampu (R/W) |
| **Mahasiswa** | Data pribadi saja (R) |

---

## 🛠️ TEKNOLOGI

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT
- **Password Hashing:** bcrypt

---

## 📝 CATATAN PENTING

### **Database Schema**
- Menggunakan UUID sebagai primary key
- Field: `tahun_akademik`, `semester_aktif`, `mk_id`, `sub_cpmk_id`
- Tabel: `nilai_sub_cpmk` (bukan `nilai`)
- Menggunakan VIEW untuk capaian CPL

### **Password**
- Semua user: `password123`
- Hash: `$2b$10$EawDMbamOlHASNWbvQmAWOP.hS3vDX88E/ZnqieV9/AYD7XIP45dC`

### **API Response Format**
```json
{
  "success": true,
  "message": "Deskripsi",
  "data": {}
}
```

---

## ❓ FAQ

### **Q: Bagaimana cara login?**
A: POST ke `/auth/login` dengan email dan password.

### **Q: Bagaimana cara menggunakan token?**
A: Tambahkan header `Authorization: Bearer <token>` di setiap request.

### **Q: Apa itu Sub-CPMK?**
A: Sub-CPMK adalah breakdown dari CPL (Capaian Pembelajaran Lulusan) yang lebih detail.

### **Q: Bagaimana cara input nilai?**
A: POST ke `/nilai` dengan `enrollment_id`, `sub_cpmk_id`, dan `nilai`.

### **Q: Bagaimana cara lihat capaian?**
A: GET `/capaian/mahasiswa/my-capaian` untuk mahasiswa sendiri.

---

## 🆘 BUTUH BANTUAN?

### **Masalah Umum:**
- **401 Unauthorized?** → Baca **SOLUSI_401_UNAUTHORIZED.md**
- **Token tidak valid?** → Baca **SOLUSI_TOKEN_TIDAK_VALID.md**
- **Tidak tahu cara test di Postman?** → Baca **POSTMAN_TESTING_GUIDE.md**

### **Referensi Lengkap:**
1. **Baca DOKUMENTASI_LENGKAP.md** - Jawaban untuk 90% pertanyaan
2. **Lihat contoh request** - Di bagian "Contoh Request API"
3. **Cek troubleshooting** - Di bagian "Troubleshooting"
4. **Lihat README.md** - Untuk detail teknis

---

## ✅ CHECKLIST SETUP

- [ ] Database `projectcpl` sudah dibuat
- [ ] SQL schema sudah dijalankan
- [ ] Password hash sudah diupdate
- [ ] Backend dependencies sudah diinstall
- [ ] .env sudah dikonfigurasi
- [ ] Backend sudah running
- [ ] Login berhasil di Postman
- [ ] Semua endpoint sudah ditest

---

## 📞 INFORMASI KONTAK

Jika ada pertanyaan atau masalah, silakan hubungi tim development.

---

**Selamat! Kamu siap menggunakan backend Module 2!** 🎉

**Mulai dari:** DOKUMENTASI_LENGKAP.md
