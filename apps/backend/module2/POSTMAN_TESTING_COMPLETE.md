# ✅ POSTMAN TESTING - COMPLETE GUIDE

Panduan lengkap untuk testing Module 2 menggunakan Postman Collection sesuai matrik akses.

---

## 📦 FILE YANG DIBUAT

```
✅ POSTMAN_COLLECTION.json                  - Collection file (37 requests)
✅ CARA_IMPORT_POSTMAN_COLLECTION.md        - Panduan import & setup
✅ POSTMAN_COLLECTION_SUMMARY.md            - Ringkasan collection
✅ POSTMAN_TESTING_COMPLETE.md              - File ini (complete guide)
```

---

## 🎯 OVERVIEW

Collection ini berisi **37 requests** yang diorganisir menjadi **8 sections** untuk testing semua resource sesuai matrik akses:

| Section | Requests | Matrik |
|---------|----------|--------|
| 1. Authentication | 4 | Login untuk 4 role |
| 2. Program Studi & CPL | 4 | R/W/D, R/W, R, R |
| 3. Mata Kuliah & Pemetaan | 7 | R/W/D, R/W, R, R (+ POST tests) |
| 4. Sub-CPMK | 4 | R/W/D, R/W, R/W, R |
| 5. Input Nilai Sub-CPMK | 6 | R/W/D, R, R/W, POST tests |
| 6. Capaian CPL Mahasiswa | 4 | R/W/D, R/W, R, R |
| 7. Manajemen User | 4 | R/W/D, R/W, —, — |
| 8. Audit Log | 4 | R, R, —, — |

**Total: 37 requests**

---

## 🚀 QUICK START (5 MENIT)

### **Step 1: Import Collection**
```
Postman → Import → Upload Files → POSTMAN_COLLECTION.json
```

### **Step 2: Setup Environment**
```
Environments → + → Module2 Test → Create
```

### **Step 3: Login & Get Tokens**
```
1. AUTHENTICATION → Login Superadmin → Send → Copy token
1. AUTHENTICATION → Login Admin Prodi → Send → Copy token
1. AUTHENTICATION → Login Dosen → Send → Copy token
1. AUTHENTICATION → Login Mahasiswa → Send → Copy token
```

### **Step 4: Update Environment Variables**
```
Environments → Module2 Test → Update:
- token_superadmin = <token dari login superadmin>
- token_admin_prodi = <token dari login admin prodi>
- token_dosen = <token dari login dosen>
- token_mahasiswa = <token dari login mahasiswa>
```

### **Step 5: Start Testing**
```
Klik setiap request dan klik "Send"
Verifikasi response sesuai matrik akses
```

---

## 📊 MATRIK AKSES YANG DITEST

### **Program Studi & CPL**
```
Superadmin:   R/W/D ✅ (bisa read)
Admin Prodi:  R/W   ✅ (bisa read)
Dosen:        R     ✅ (bisa read)
Mahasiswa:    R     ✅ (bisa read)
```

### **Mata Kuliah & Pemetaan**
```
Superadmin:   R/W/D ✅ (bisa read & create)
Admin Prodi:  R/W   ✅ (bisa read & create)
Dosen:        R     ✅ (bisa read)
              R     ❌ (TIDAK bisa create - 403)
Mahasiswa:    R     ✅ (bisa read)
              R     ❌ (TIDAK bisa create - 403)
```

### **Sub-CPMK**
```
Superadmin:   R/W/D ✅ (bisa read)
Admin Prodi:  R/W   ✅ (bisa read)
Dosen:        R/W   ✅ (bisa read)
Mahasiswa:    R     ✅ (bisa read)
```

### **Input Nilai Sub-CPMK**
```
Superadmin:   R/W/D ✅ (bisa read & create)
Admin Prodi:  R     ✅ (bisa read)
              R     ❌ (TIDAK bisa create - 403)
Dosen:        R/W   ✅ (bisa read & create untuk kelas sendiri)
Mahasiswa:    —     ❌ (TIDAK ada akses)
```

### **Capaian CPL Mahasiswa**
```
Superadmin:   R/W/D ✅ (bisa read semua)
Admin Prodi:  R/W   ✅ (bisa read prodi sendiri)
Dosen:        R     ✅ (bisa read kelas sendiri)
Mahasiswa:    R     ✅ (bisa read diri sendiri)
```

### **Manajemen User**
```
Superadmin:   R/W/D ✅ (bisa read semua)
Admin Prodi:  R/W   ✅ (bisa read prodi sendiri)
Dosen:        —     ❌ (TIDAK ada akses - 403)
Mahasiswa:    —     ❌ (TIDAK ada akses - 403)
```

### **Audit Log**
```
Superadmin:   R     ✅ (bisa read semua)
Admin Prodi:  R     ✅ (bisa read prodi sendiri)
Dosen:        —     ❌ (TIDAK ada akses - 403)
Mahasiswa:    —     ❌ (TIDAK ada akses - 403)
```

---

## 📋 TESTING CHECKLIST

### **Phase 1: Authentication**
- [ ] Login Superadmin berhasil (200 OK)
- [ ] Login Admin Prodi berhasil (200 OK)
- [ ] Login Dosen berhasil (200 OK)
- [ ] Login Mahasiswa berhasil (200 OK)
- [ ] Semua token sudah disimpan di environment

### **Phase 2: Program Studi & CPL**
- [ ] Superadmin bisa read (200 OK)
- [ ] Admin Prodi bisa read (200 OK)
- [ ] Dosen bisa read (200 OK)
- [ ] Mahasiswa bisa read (200 OK)

### **Phase 3: Mata Kuliah & Pemetaan**
- [ ] Superadmin bisa read (200 OK)
- [ ] Superadmin bisa create (201 Created)
- [ ] Admin Prodi bisa read (200 OK)
- [ ] Admin Prodi bisa create (201 Created)
- [ ] Dosen bisa read (200 OK)
- [ ] Dosen TIDAK bisa create (403 Forbidden)
- [ ] Mahasiswa bisa read (200 OK)
- [ ] Mahasiswa TIDAK bisa create (403 Forbidden)

### **Phase 4: Sub-CPMK**
- [ ] Superadmin bisa read (200 OK)
- [ ] Admin Prodi bisa read (200 OK)
- [ ] Dosen bisa read (200 OK)
- [ ] Mahasiswa bisa read (200 OK)

### **Phase 5: Input Nilai Sub-CPMK**
- [ ] Superadmin bisa read (200 OK)
- [ ] Superadmin bisa create (201 Created)
- [ ] Admin Prodi bisa read (200 OK)
- [ ] Admin Prodi TIDAK bisa create (403 Forbidden)
- [ ] Dosen bisa read (200 OK)
- [ ] Dosen bisa create (201 Created)

### **Phase 6: Capaian CPL Mahasiswa**
- [ ] Superadmin bisa read (200 OK)
- [ ] Admin Prodi bisa read (200 OK)
- [ ] Dosen bisa read (200 OK)
- [ ] Mahasiswa bisa read (200 OK)

### **Phase 7: Manajemen User**
- [ ] Superadmin bisa read (200 OK)
- [ ] Admin Prodi bisa read (200 OK)
- [ ] Dosen TIDAK bisa read (403 Forbidden)
- [ ] Mahasiswa TIDAK bisa read (403 Forbidden)

### **Phase 8: Audit Log**
- [ ] Superadmin bisa read (200 OK)
- [ ] Admin Prodi bisa read (200 OK)
- [ ] Dosen TIDAK bisa read (403 Forbidden)
- [ ] Mahasiswa TIDAK bisa read (403 Forbidden)

---

## 🔍 EXPECTED RESPONSES

### **Success Response (200 OK)**
```json
{
  "success": true,
  "message": "Berhasil mengambil data...",
  "data": [
    {
      "id": "...",
      "name": "...",
      ...
    }
  ]
}
```

### **Created Response (201 Created)**
```json
{
  "success": true,
  "message": "... berhasil dibuat",
  "data": {
    "id": "...",
    "name": "...",
    ...
  }
}
```

### **Forbidden Response (403 Forbidden)**
```json
{
  "message": "Akses ditolak",
  "userRole": "dosen",
  "allowedRoles": ["Superadmin", "Admin Prodi"]
}
```

### **Unauthorized Response (401 Unauthorized)**
```json
{
  "message": "Token tidak ada"
}
```

---

## 🧪 TESTING METHODS

### **Method 1: Manual Testing**
1. Import collection
2. Setup environment
3. Login untuk setiap role
4. Test setiap request satu per satu
5. Verifikasi response
6. Catat hasil testing

**Waktu:** ~30 menit

### **Method 2: Collection Runner**
1. Import collection
2. Setup environment
3. Login untuk setiap role
4. Buka Collection Runner
5. Run semua requests sekaligus
6. Lihat hasil testing dalam dashboard

**Waktu:** ~10 menit

### **Method 3: Automated Testing**
1. Import collection
2. Setup environment
3. Tambah tests di setiap request
4. Run collection dengan tests
5. Lihat hasil testing otomatis
6. Export report

**Waktu:** ~15 menit

---

## 💡 TIPS & BEST PRACTICES

### **1. Gunakan Environment Variables**
```
✅ Lebih mudah manage token
✅ Tidak perlu copy-paste token
✅ Bisa switch environment dengan mudah
```

### **2. Gunakan Pre-request Script**
```javascript
// Auto-login sebelum test
if (!pm.environment.get("token_superadmin")) {
  // Login request
}
```

### **3. Gunakan Tests untuk Validasi**
```javascript
// Validasi response otomatis
pm.test("Status code is 200", function() {
  pm.response.to.have.status(200);
});
```

### **4. Gunakan Collection Runner**
```
✅ Test semua requests sekaligus
✅ Lihat hasil dalam satu dashboard
✅ Export hasil testing
```

### **5. Gunakan Postman Monitors**
```
✅ Schedule testing otomatis
✅ Monitor API health
✅ Get notified jika ada error
```

---

## 🐛 TROUBLESHOOTING

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

### **Error: "Backend not running"**
```
Penyebab: Backend tidak running
Solusi: npm start di folder apps/backend
```

---

## 📚 DOKUMENTASI TERKAIT

- **CARA_IMPORT_POSTMAN_COLLECTION.md** - Panduan import & setup
- **POSTMAN_COLLECTION_SUMMARY.md** - Ringkasan collection
- **QUICK_REFERENCE.md** - Cheat sheet endpoint
- **POSTMAN_TESTING_GUIDE.md** - Panduan testing di Postman

---

## 🎯 NEXT STEPS

1. **Baca:** CARA_IMPORT_POSTMAN_COLLECTION.md
2. **Import:** POSTMAN_COLLECTION.json ke Postman
3. **Setup:** Environment dengan variables
4. **Login:** Untuk setiap role
5. **Test:** Setiap resource sesuai matrik akses
6. **Verifikasi:** Hasil testing dengan checklist
7. **Export:** Hasil testing (optional)

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

Semua file sudah siap di folder: `apps/backend/module2/`

Mulai dari: **CARA_IMPORT_POSTMAN_COLLECTION.md**
