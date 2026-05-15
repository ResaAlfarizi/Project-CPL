# 📮 POSTMAN COLLECTION - README

Panduan lengkap untuk menggunakan Postman Collection untuk testing Module 2 sesuai matrik akses.

---

## 📦 FILE YANG DIBUAT

```
✅ POSTMAN_COLLECTION.json                  - Collection file (37 requests)
✅ CARA_IMPORT_POSTMAN_COLLECTION.md        - Panduan import & setup lengkap
✅ POSTMAN_COLLECTION_SUMMARY.md            - Ringkasan collection
✅ POSTMAN_TESTING_COMPLETE.md              - Complete guide testing
✅ POSTMAN_COLLECTION_README.md             - File ini
```

---

## 🎯 APA ITU POSTMAN COLLECTION?

Postman Collection adalah kumpulan requests yang sudah dikonfigurasi untuk testing API. Collection ini berisi:

- **37 requests** untuk testing semua resource
- **8 sections** yang terorganisir berdasarkan resource
- **Environment variables** untuk manage token
- **Pre-configured headers** untuk Authorization
- **Test cases** untuk validasi response

---

## 📊 STRUKTUR COLLECTION

```
Module 2 - CPL System API
├── 1. AUTHENTICATION (4 requests)
│   ├── Login - Superadmin
│   ├── Login - Admin Prodi
│   ├── Login - Dosen
│   └── Login - Mahasiswa
│
├── 2. PROGRAM STUDI & CPL (4 requests)
│   ├── GET - Superadmin (R/W/D)
│   ├── GET - Admin Prodi (R/W)
│   ├── GET - Dosen (R)
│   └── GET - Mahasiswa (R)
│
├── 3. MATA KULIAH & PEMETAAN (7 requests)
│   ├── GET - Superadmin (R/W/D)
│   ├── GET - Admin Prodi (R/W)
│   ├── GET - Dosen (R)
│   ├── GET - Mahasiswa (R)
│   ├── POST - Superadmin (R/W/D)
│   ├── POST - Admin Prodi (R/W)
│   ├── POST - Dosen (R) - SHOULD FAIL
│   └── POST - Mahasiswa (R) - SHOULD FAIL
│
├── 4. SUB-CPMK (4 requests)
│   ├── GET - Superadmin (R/W/D)
│   ├── GET - Admin Prodi (R/W)
│   ├── GET - Dosen (R/W)
│   └── GET - Mahasiswa (R)
│
├── 5. INPUT NILAI SUB-CPMK (6 requests)
│   ├── GET - Superadmin (R/W/D)
│   ├── GET - Admin Prodi (R)
│   ├── GET - Dosen (R/W - kelas sendiri)
│   ├── POST - Superadmin (R/W/D)
│   ├── POST - Admin Prodi (R) - SHOULD FAIL
│   └── POST - Dosen (R/W - kelas sendiri)
│
├── 6. CAPAIAN CPL MAHASISWA (4 requests)
│   ├── GET - Superadmin (R/W/D)
│   ├── GET - Admin Prodi (R/W)
│   ├── GET - Dosen (R - kelas sendiri)
│   └── GET - Mahasiswa (R - diri sendiri)
│
├── 7. MANAJEMEN USER (4 requests)
│   ├── GET - Superadmin (R/W/D)
│   ├── GET - Admin Prodi (R/W - prodi sendiri)
│   ├── GET - Dosen - SHOULD FAIL
│   └── GET - Mahasiswa - SHOULD FAIL
│
└── 8. AUDIT LOG (4 requests)
    ├── GET - Superadmin (R)
    ├── GET - Admin Prodi (R - prodi sendiri)
    ├── GET - Dosen - SHOULD FAIL
    └── GET - Mahasiswa - SHOULD FAIL
```

**Total: 37 requests**

---

## 🚀 QUICK START

### **1. Import Collection (2 menit)**
```
Postman → Import → Upload Files → POSTMAN_COLLECTION.json
```

### **2. Setup Environment (3 menit)**
```
Environments → + → Module2 Test → Create
```

### **3. Login & Get Tokens (5 menit)**
```
1. AUTHENTICATION → Login Superadmin → Send → Copy token
1. AUTHENTICATION → Login Admin Prodi → Send → Copy token
1. AUTHENTICATION → Login Dosen → Send → Copy token
1. AUTHENTICATION → Login Mahasiswa → Send → Copy token
```

### **4. Update Environment Variables (2 menit)**
```
Environments → Module2 Test → Update token variables
```

### **5. Start Testing (10+ menit)**
```
Test setiap request dan verifikasi response
```

**Total waktu: ~25 menit**

---

## 📋 TESTING CHECKLIST

### **Phase 1: Authentication** ✅
- [ ] Login Superadmin berhasil (200 OK)
- [ ] Login Admin Prodi berhasil (200 OK)
- [ ] Login Dosen berhasil (200 OK)
- [ ] Login Mahasiswa berhasil (200 OK)

### **Phase 2: Program Studi & CPL** ✅
- [ ] Superadmin bisa read (200 OK)
- [ ] Admin Prodi bisa read (200 OK)
- [ ] Dosen bisa read (200 OK)
- [ ] Mahasiswa bisa read (200 OK)

### **Phase 3: Mata Kuliah & Pemetaan** ✅
- [ ] Superadmin bisa read & create (200/201 OK)
- [ ] Admin Prodi bisa read & create (200/201 OK)
- [ ] Dosen bisa read (200 OK)
- [ ] Dosen TIDAK bisa create (403 Forbidden)
- [ ] Mahasiswa bisa read (200 OK)
- [ ] Mahasiswa TIDAK bisa create (403 Forbidden)

### **Phase 4: Sub-CPMK** ✅
- [ ] Superadmin bisa read (200 OK)
- [ ] Admin Prodi bisa read (200 OK)
- [ ] Dosen bisa read (200 OK)
- [ ] Mahasiswa bisa read (200 OK)

### **Phase 5: Input Nilai Sub-CPMK** ✅
- [ ] Superadmin bisa read & create (200/201 OK)
- [ ] Admin Prodi bisa read (200 OK)
- [ ] Admin Prodi TIDAK bisa create (403 Forbidden)
- [ ] Dosen bisa read & create (200/201 OK)

### **Phase 6: Capaian CPL Mahasiswa** ✅
- [ ] Superadmin bisa read (200 OK)
- [ ] Admin Prodi bisa read (200 OK)
- [ ] Dosen bisa read (200 OK)
- [ ] Mahasiswa bisa read (200 OK)

### **Phase 7: Manajemen User** ✅
- [ ] Superadmin bisa read (200 OK)
- [ ] Admin Prodi bisa read (200 OK)
- [ ] Dosen TIDAK bisa read (403 Forbidden)
- [ ] Mahasiswa TIDAK bisa read (403 Forbidden)

### **Phase 8: Audit Log** ✅
- [ ] Superadmin bisa read (200 OK)
- [ ] Admin Prodi bisa read (200 OK)
- [ ] Dosen TIDAK bisa read (403 Forbidden)
- [ ] Mahasiswa TIDAK bisa read (403 Forbidden)

---

## 🔑 TEST USERS

| Email | Password | Role |
|-------|----------|------|
| admin@if.ac.id | password123 | Superadmin |
| admin_prodi@if.ac.id | password123 | Admin Prodi |
| dosen1@if.ac.id | password123 | Dosen |
| mhs1@if.ac.id | password123 | Mahasiswa |

---

## 📊 MATRIK AKSES

| Resource | Superadmin | Admin Prodi | Dosen | Mahasiswa |
|----------|-----------|-----------|-------|-----------|
| **Program Studi & CPL** | R/W/D ✅ | R/W ✅ | R ✅ | R ✅ |
| **Mata Kuliah & Pemetaan** | R/W/D ✅ | R/W ✅ | R ✅ | R ✅ |
| **Sub-CPMK** | R/W/D ✅ | R/W ✅ | R/W ✅ | R ✅ |
| **Input Nilai Sub-CPMK** | R/W/D ✅ | R ❌ | R/W ✅ | — ❌ |
| **Capaian CPL Mahasiswa** | R/W/D ✅ | R/W ✅ | R ✅ | R ✅ |
| **Manajemen User** | R/W/D ✅ | R/W ✅ | — ❌ | — ❌ |
| **Audit Log** | R ✅ | R ✅ | — ❌ | — ❌ |

---

## 📚 DOKUMENTASI TERKAIT

| File | Deskripsi | Waktu |
|------|-----------|-------|
| **CARA_IMPORT_POSTMAN_COLLECTION.md** | Panduan import & setup lengkap | 15 min |
| **POSTMAN_COLLECTION_SUMMARY.md** | Ringkasan collection | 10 min |
| **POSTMAN_TESTING_COMPLETE.md** | Complete guide testing | 20 min |
| **QUICK_REFERENCE.md** | Cheat sheet endpoint | 5 min |
| **POSTMAN_TESTING_GUIDE.md** | Panduan testing di Postman | 15 min |

---

## 🎯 RECOMMENDED READING ORDER

1. **File ini** (POSTMAN_COLLECTION_README.md) - 5 menit
2. **CARA_IMPORT_POSTMAN_COLLECTION.md** - 15 menit
3. **POSTMAN_COLLECTION_SUMMARY.md** - 10 menit
4. **POSTMAN_TESTING_COMPLETE.md** - 20 menit
5. **Start testing** - 25+ menit

**Total: ~75 menit**

---

## 💡 TIPS

### **1. Gunakan Environment Variables**
```
✅ Lebih mudah manage token
✅ Tidak perlu copy-paste token
✅ Bisa switch environment dengan mudah
```

### **2. Gunakan Collection Runner**
```
✅ Test semua requests sekaligus
✅ Lihat hasil dalam satu dashboard
✅ Export hasil testing
```

### **3. Gunakan Tests untuk Validasi**
```
✅ Validasi response otomatis
✅ Deteksi error lebih cepat
✅ Generate report testing
```

### **4. Bookmark QUICK_REFERENCE.md**
```
✅ Akses cepat semua endpoint
✅ Format request & response
✅ Common errors
```

### **5. Print SOLUSI_401_UNAUTHORIZED.md**
```
✅ Referensi cepat jika dapat error 401
✅ Simpan di meja
```

---

## 🐛 COMMON ISSUES

### **Error: "Token tidak ada"**
```
Penyebab: Authorization header tidak ada
Solusi: Pastikan token sudah dicopy ke environment variable
```

### **Error: "Akses ditolak" (403)**
```
Penyebab: Role user tidak sesuai dengan endpoint
Solusi: Gunakan user dengan role yang tepat
```

### **Error: "Data tidak lengkap" (400)**
```
Penyebab: Field required tidak diisi
Solusi: Cek contoh body di collection
```

### **Error: "Database connection failed"**
```
Penyebab: PostgreSQL tidak running
Solusi: Buka Services, start PostgreSQL
```

---

## 🚀 NEXT STEPS

1. **Baca:** CARA_IMPORT_POSTMAN_COLLECTION.md
2. **Import:** POSTMAN_COLLECTION.json ke Postman
3. **Setup:** Environment dengan variables
4. **Login:** Untuk setiap role
5. **Test:** Setiap resource sesuai matrik akses
6. **Verifikasi:** Hasil testing dengan checklist

---

## ✅ COMPLETION CHECKLIST

- [ ] Collection sudah diimport ke Postman
- [ ] Environment sudah dibuat dan dikonfigurasi
- [ ] Semua 4 role sudah login dan dapat token
- [ ] Token sudah disimpan di environment variables
- [ ] Semua 37 requests sudah ditest
- [ ] Hasil testing sesuai dengan matrik akses
- [ ] Tidak ada error yang tidak terduga
- [ ] Hasil testing sudah didokumentasikan

---

## 📞 SUPPORT

Jika ada pertanyaan atau masalah:

1. **Baca dokumentasi** - Cari jawaban di dokumentasi
2. **Cek troubleshooting** - Lihat bagian troubleshooting
3. **Hubungi tim development** - Jika masalah tidak teratasi

---

**Selamat testing! 🚀**

Mulai dari: **CARA_IMPORT_POSTMAN_COLLECTION.md**
