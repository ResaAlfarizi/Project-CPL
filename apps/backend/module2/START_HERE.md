# 🎯 START HERE - DOKUMENTASI MODULE 2

Selamat datang! Panduan ini akan membantu kamu memulai dengan Module 2.

---

## ✅ DOKUMENTASI SUDAH SELESAI DIBUAT

Total **10 file dokumentasi** telah dibuat untuk membantu kamu:

```
✅ INDEX.md                      - Entry point (baca ini dulu!)
✅ DOKUMENTASI_LENGKAP.md        - Panduan lengkap
✅ POSTMAN_TESTING_GUIDE.md      - Cara testing di Postman
✅ SOLUSI_401_UNAUTHORIZED.md    - Solusi error 401
✅ QUICK_REFERENCE.md            - Cheat sheet
✅ README.md                     - Dokumentasi teknis
✅ VISUAL_GUIDE.md               - Panduan visual
✅ RINGKASAN_DOKUMENTASI.md      - Ringkasan struktur
✅ DOKUMENTASI_SUMMARY.txt       - Summary lengkap
✅ UPDATE_PASSWORD.sql           - Password update
```

---

## 🚀 MULAI DARI SINI (3 LANGKAH)

### **Langkah 1: Baca INDEX.md** (5 menit)
```
Buka: INDEX.md
Tujuan: Pahami struktur dokumentasi dan quick start
```

### **Langkah 2: Baca DOKUMENTASI_LENGKAP.md** (30 menit)
```
Buka: DOKUMENTASI_LENGKAP.md
Tujuan: Setup database dan backend
```

### **Langkah 3: Baca VISUAL_GUIDE.md** (15 menit)
```
Buka: VISUAL_GUIDE.md
Tujuan: Follow step-by-step setup dan testing
```

**Total waktu: ~50 menit**

---

## 🎯 PILIH BERDASARKAN KEBUTUHAN

### **Saya baru pertama kali**
1. Baca: **INDEX.md** (5 min)
2. Baca: **DOKUMENTASI_LENGKAP.md** (30 min)
3. Baca: **VISUAL_GUIDE.md** (15 min)
4. Setup backend (5 min)
5. Test di Postman (10 min)

### **Saya sudah setup, mau test di Postman**
1. Baca: **POSTMAN_TESTING_GUIDE.md** (15 min)
2. Bookmark: **QUICK_REFERENCE.md** (untuk referensi)

### **Saya dapat error 401 Unauthorized**
1. Baca: **SOLUSI_401_UNAUTHORIZED.md** (10 min)
2. Follow: Solusi step-by-step

### **Saya ingin cepat lihat format request/response**
1. Buka: **QUICK_REFERENCE.md** (5 min)
2. Copy-paste format yang dibutuhkan

### **Saya ingin memahami struktur kode**
1. Baca: **README.md** (20 min)
2. Baca: **DOKUMENTASI_LENGKAP.md** bagian "Penjelasan Models/Controllers/Routes"

---

## 📋 INFORMASI PENTING

### **Database**
- Host: localhost
- Port: 5432
- Database: projectcpl
- User: postgres
- Password: 1234

### **Backend**
- Port: 3000
- Base URL: http://localhost:3000/api/v1/m2
- Start: `npm start`
- Dev: `npm run dev`

### **Test Users**
| Email | Password | Role |
|-------|----------|------|
| admin@if.ac.id | password123 | Admin Prodi |
| dosen1@if.ac.id | password123 | Dosen |
| mhs1@if.ac.id | password123 | Mahasiswa |

### **Authorization**
```
Format: Authorization: Bearer <token>
Tempat: Headers tab di Postman
JANGAN: Query params atau body
```

---

## 🔑 QUICK SETUP (5 STEPS)

### **Step 1: Update Password**
```bash
psql -U postgres -d projectcpl -f UPDATE_PASSWORD.sql
```

### **Step 2: Install Dependencies**
```bash
cd apps/backend
npm install
```

### **Step 3: Jalankan Backend**
```bash
npm start
```

### **Step 4: Login di Postman**
```http
POST http://localhost:3000/api/v1/m2/auth/login
Content-Type: application/json

{
  "email": "admin@if.ac.id",
  "password": "password123"
}
```

### **Step 5: Test Endpoint**
```http
GET http://localhost:3000/api/v1/m2/kelas
Authorization: Bearer <token_dari_login>
```

---

## 📊 TOTAL ENDPOINTS: 28

- **Kelas:** 6 endpoints
- **Enrollment:** 6 endpoints
- **Nilai:** 7 endpoints
- **Capaian:** 6 endpoints
- **Dashboard:** 3 endpoints

---

## 🆘 MASALAH UMUM

### **Error: 401 Unauthorized**
→ Baca: **SOLUSI_401_UNAUTHORIZED.md**
→ Penyebab: Token di tempat salah
→ Solusi: Tambah Authorization header

### **Error: Database connection failed**
→ Penyebab: PostgreSQL tidak running
→ Solusi: Buka Services, start PostgreSQL

### **Error: Cannot find module**
→ Penyebab: Dependencies belum diinstall
→ Solusi: npm install

---

## 📚 DOKUMENTASI LENGKAP

| File | Tujuan | Waktu |
|------|--------|-------|
| INDEX.md | Entry point | 5 min |
| DOKUMENTASI_LENGKAP.md | Panduan lengkap | 30 min |
| POSTMAN_TESTING_GUIDE.md | Testing guide | 15 min |
| SOLUSI_401_UNAUTHORIZED.md | Error solution | 10 min |
| QUICK_REFERENCE.md | Cheat sheet | 5 min |
| README.md | Dokumentasi teknis | 20 min |
| VISUAL_GUIDE.md | Panduan visual | 15 min |
| RINGKASAN_DOKUMENTASI.md | Ringkasan struktur | 10 min |

---

## ✅ CHECKLIST SEBELUM MULAI

- [ ] Sudah baca file ini (START_HERE.md)
- [ ] Sudah baca INDEX.md
- [ ] Sudah tahu database credentials
- [ ] Sudah tahu test users
- [ ] Sudah tahu format Authorization header
- [ ] Siap untuk setup atau testing

---

## 💡 TIPS

1. **Bookmark QUICK_REFERENCE.md** - Untuk referensi cepat semua endpoint
2. **Print SOLUSI_401_UNAUTHORIZED.md** - Jika sering dapat error 401
3. **Gunakan Postman Environment** - Lebih mudah manage token
4. **Gunakan Ctrl+F** - Untuk search di dokumentasi
5. **Ikuti checklist** - Untuk memastikan setup benar

---

## 🎓 LEARNING PATH

```
START_HERE.md (ini)
    ↓
INDEX.md (5 min)
    ↓
DOKUMENTASI_LENGKAP.md (30 min)
    ↓
VISUAL_GUIDE.md (15 min)
    ↓
Setup backend (5 min)
    ↓
Test di Postman (10 min)
    ↓
Bookmark QUICK_REFERENCE.md
    ↓
SELESAI ✅
```

**Total waktu: ~65 menit**

---

## 🚀 NEXT STEP

**Buka file: INDEX.md**

Ini adalah entry point untuk memahami struktur dokumentasi dan quick start.

---

## 📞 BUTUH BANTUAN?

1. Cari di dokumentasi menggunakan Ctrl+F
2. Baca FAQ di INDEX.md
3. Baca Troubleshooting di DOKUMENTASI_LENGKAP.md
4. Baca SOLUSI_401_UNAUTHORIZED.md jika dapat error 401
5. Hubungi tim development jika masalah tidak teratasi

---

**Selamat! Kamu siap menggunakan Module 2!** 🎉

**Mulai dari:** INDEX.md
