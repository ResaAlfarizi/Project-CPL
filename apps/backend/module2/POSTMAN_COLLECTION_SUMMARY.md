# 📮 POSTMAN COLLECTION - RINGKASAN

Ringkasan lengkap Postman Collection untuk testing Module 2 sesuai matrik akses.

---

## 📥 FILE YANG DIBUAT

```
✅ POSTMAN_COLLECTION.json              - Collection file (import ke Postman)
✅ CARA_IMPORT_POSTMAN_COLLECTION.md    - Panduan import & setup
✅ POSTMAN_COLLECTION_SUMMARY.md        - File ini (ringkasan)
```

---

## 🎯 STRUKTUR COLLECTION

Collection sudah terorganisir menjadi **8 section** sesuai matrik akses:

### **1. AUTHENTICATION** (4 requests)
- Login Superadmin
- Login Admin Prodi
- Login Dosen
- Login Mahasiswa

### **2. PROGRAM STUDI & CPL** (4 requests)
- GET - Superadmin (R/W/D)
- GET - Admin Prodi (R/W)
- GET - Dosen (R)
- GET - Mahasiswa (R)

### **3. MATA KULIAH & PEMETAAN** (7 requests)
- GET - Superadmin (R/W/D)
- GET - Admin Prodi (R/W)
- GET - Dosen (R)
- GET - Mahasiswa (R)
- POST - Superadmin (R/W/D)
- POST - Admin Prodi (R/W)
- POST - Dosen (R) - SHOULD FAIL
- POST - Mahasiswa (R) - SHOULD FAIL

### **4. SUB-CPMK** (4 requests)
- GET - Superadmin (R/W/D)
- GET - Admin Prodi (R/W)
- GET - Dosen (R/W)
- GET - Mahasiswa (R)

### **5. INPUT NILAI SUB-CPMK** (6 requests)
- GET - Superadmin (R/W/D)
- GET - Admin Prodi (R)
- GET - Dosen (R/W - kelas sendiri)
- POST - Superadmin (R/W/D)
- POST - Admin Prodi (R) - SHOULD FAIL
- POST - Dosen (R/W - kelas sendiri)

### **6. CAPAIAN CPL MAHASISWA** (4 requests)
- GET - Superadmin (R/W/D)
- GET - Admin Prodi (R/W)
- GET - Dosen (R - kelas sendiri)
- GET - Mahasiswa (R - diri sendiri)

### **7. MANAJEMEN USER** (4 requests)
- GET - Superadmin (R/W/D)
- GET - Admin Prodi (R/W - prodi sendiri)
- GET - Dosen - SHOULD FAIL
- GET - Mahasiswa - SHOULD FAIL

### **8. AUDIT LOG** (4 requests)
- GET - Superadmin (R)
- GET - Admin Prodi (R - prodi sendiri)
- GET - Dosen - SHOULD FAIL
- GET - Mahasiswa - SHOULD FAIL

**Total: 37 requests**

---

## 🔑 ENVIRONMENT VARIABLES

Collection sudah include 7 environment variables:

| Variable | Default Value | Deskripsi |
|----------|---------------|-----------|
| `base_url` | http://localhost:3000/api/v1/m2 | Base URL API |
| `token_superadmin` | (kosong) | Token Superadmin |
| `token_admin_prodi` | (kosong) | Token Admin Prodi |
| `token_dosen` | (kosong) | Token Dosen |
| `token_mahasiswa` | (kosong) | Token Mahasiswa |
| `mahasiswa_id` | bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1 | ID Mahasiswa |
| `kelas_id` | fffffff1-ffff-ffff-ffff-fffffffffff1 | ID Kelas |

---

## 📊 MATRIK AKSES YANG DITEST

| Resource | Superadmin | Admin Prodi | Dosen | Mahasiswa |
|----------|-----------|-----------|-------|-----------|
| **Program Studi & CPL** | R/W/D ✅ | R/W ✅ | R ✅ | R ✅ |
| **Mata Kuliah & Pemetaan** | R/W/D ✅ | R/W ✅ | R ✅ | R ✅ |
| **Sub-CPMK** | R/W/D ✅ | R/W ✅ | R/W ✅ | R ✅ |
| **Input Nilai Sub-CPMK** | R/W/D ✅ | R ❌ | R/W ✅ | — ❌ |
| **Capaian CPL Mahasiswa** | R/W/D ✅ | R/W ✅ | R ✅ | R ✅ |
| **Manajemen User** | R/W/D ✅ | R/W ✅ | — ❌ | — ❌ |
| **Audit Log** | R ✅ | R ✅ | — ❌ | — ❌ |

**Keterangan:**
- ✅ = Bisa akses (200 OK)
- ❌ = TIDAK bisa akses (403 Forbidden)
- R = Read
- W = Write
- D = Delete

---

## 🚀 QUICK START

### **Step 1: Import Collection**
```
Postman → Import → Upload Files → POSTMAN_COLLECTION.json
```

### **Step 2: Setup Environment**
```
Environments → + → Module2 Test → Create
```

### **Step 3: Login untuk setiap role**
```
1. AUTHENTICATION → Login Superadmin → Send
1. AUTHENTICATION → Login Admin Prodi → Send
1. AUTHENTICATION → Login Dosen → Send
1. AUTHENTICATION → Login Mahasiswa → Send
```

### **Step 4: Copy token ke environment**
```
Environments → Module2 Test → Update token_superadmin, token_admin_prodi, token_dosen, token_mahasiswa
```

### **Step 5: Test setiap resource**
```
2. PROGRAM STUDI & CPL → GET - Superadmin → Send
2. PROGRAM STUDI & CPL → GET - Admin Prodi → Send
... (dan seterusnya)
```

---

## ✅ TESTING CHECKLIST

### **Authentication**
- [ ] Login Superadmin berhasil (200 OK)
- [ ] Login Admin Prodi berhasil (200 OK)
- [ ] Login Dosen berhasil (200 OK)
- [ ] Login Mahasiswa berhasil (200 OK)

### **Program Studi & CPL**
- [ ] Superadmin bisa read (200 OK)
- [ ] Admin Prodi bisa read (200 OK)
- [ ] Dosen bisa read (200 OK)
- [ ] Mahasiswa bisa read (200 OK)

### **Mata Kuliah & Pemetaan**
- [ ] Superadmin bisa read & create (200/201 OK)
- [ ] Admin Prodi bisa read & create (200/201 OK)
- [ ] Dosen bisa read (200 OK)
- [ ] Dosen TIDAK bisa create (403 Forbidden)
- [ ] Mahasiswa bisa read (200 OK)
- [ ] Mahasiswa TIDAK bisa create (403 Forbidden)

### **Sub-CPMK**
- [ ] Superadmin bisa read (200 OK)
- [ ] Admin Prodi bisa read (200 OK)
- [ ] Dosen bisa read (200 OK)
- [ ] Mahasiswa bisa read (200 OK)

### **Input Nilai Sub-CPMK**
- [ ] Superadmin bisa read & create (200/201 OK)
- [ ] Admin Prodi bisa read (200 OK)
- [ ] Admin Prodi TIDAK bisa create (403 Forbidden)
- [ ] Dosen bisa read & create (200/201 OK)

### **Capaian CPL Mahasiswa**
- [ ] Superadmin bisa read (200 OK)
- [ ] Admin Prodi bisa read (200 OK)
- [ ] Dosen bisa read (200 OK)
- [ ] Mahasiswa bisa read (200 OK)

### **Manajemen User**
- [ ] Superadmin bisa read (200 OK)
- [ ] Admin Prodi bisa read (200 OK)
- [ ] Dosen TIDAK bisa read (403 Forbidden)
- [ ] Mahasiswa TIDAK bisa read (403 Forbidden)

### **Audit Log**
- [ ] Superadmin bisa read (200 OK)
- [ ] Admin Prodi bisa read (200 OK)
- [ ] Dosen TIDAK bisa read (403 Forbidden)
- [ ] Mahasiswa TIDAK bisa read (403 Forbidden)

---

## 📝 CATATAN PENTING

### **Test Users**
| Email | Password | Role |
|-------|----------|------|
| admin@if.ac.id | password123 | Superadmin |
| admin_prodi@if.ac.id | password123 | Admin Prodi |
| dosen1@if.ac.id | password123 | Dosen |
| mhs1@if.ac.id | password123 | Mahasiswa |

### **Expected Response Format**

**Success (200 OK):**
```json
{
  "success": true,
  "message": "Berhasil mengambil data...",
  "data": [...]
}
```

**Error (403 Forbidden):**
```json
{
  "message": "Akses ditolak",
  "userRole": "dosen",
  "allowedRoles": ["Superadmin", "Admin Prodi"]
}
```

---

## 🎯 TESTING STRATEGY

### **Approach 1: Manual Testing**
1. Import collection
2. Setup environment
3. Login untuk setiap role
4. Test setiap request satu per satu
5. Verifikasi response sesuai matrik akses

### **Approach 2: Batch Testing (Collection Runner)**
1. Import collection
2. Setup environment
3. Login untuk setiap role
4. Buka Collection Runner
5. Run semua requests sekaligus
6. Lihat hasil testing

### **Approach 3: Automated Testing (Tests)**
1. Import collection
2. Setup environment
3. Tambah tests di setiap request
4. Run collection dengan tests
5. Lihat hasil testing otomatis

---

## 💡 TIPS & TRICKS

### **1. Gunakan Postman Environment**
- Lebih mudah manage token
- Tidak perlu copy-paste token di setiap request
- Bisa switch environment dengan mudah

### **2. Gunakan Pre-request Script**
- Auto-login sebelum test
- Auto-update token jika expired
- Hemat waktu testing

### **3. Gunakan Tests**
- Validasi response otomatis
- Deteksi error lebih cepat
- Generate report testing

### **4. Gunakan Collection Runner**
- Test semua requests sekaligus
- Lihat hasil testing dalam satu dashboard
- Export hasil testing

### **5. Gunakan Postman Monitors**
- Schedule testing otomatis
- Monitor API health
- Get notified jika ada error

---

## 📚 REFERENSI

- [Postman Collection Format](https://learning.postman.com/docs/getting-started/importing-and-exporting-data/)
- [Postman Environment Variables](https://learning.postman.com/docs/sending-requests/managing-environments/)
- [Postman Pre-request Scripts](https://learning.postman.com/docs/writing-scripts/pre-request-scripts/)
- [Postman Tests](https://learning.postman.com/docs/writing-scripts/test-scripts/)
- [Postman Collection Runner](https://learning.postman.com/docs/running-collections/intro-to-collection-runs/)

---

## 🆘 TROUBLESHOOTING

### **Error: "Token tidak ada"**
- Pastikan token sudah dicopy ke environment variable
- Pastikan format: `Bearer <token>`

### **Error: "Akses ditolak" (403)**
- Pastikan role user sesuai dengan endpoint
- Lihat matrik akses di atas

### **Error: "Data tidak lengkap" (400)**
- Pastikan semua field required sudah diisi
- Lihat contoh body di collection

### **Error: "Database connection failed"**
- Pastikan PostgreSQL sudah running
- Pastikan backend sudah running

---

## 📞 NEXT STEPS

1. **Baca:** CARA_IMPORT_POSTMAN_COLLECTION.md
2. **Import:** POSTMAN_COLLECTION.json ke Postman
3. **Setup:** Environment dengan variables
4. **Login:** Untuk setiap role
5. **Test:** Setiap resource sesuai matrik akses
6. **Verifikasi:** Hasil testing dengan checklist

---

**Selamat testing! 🚀**

Jika ada pertanyaan atau masalah, silakan hubungi tim development.
