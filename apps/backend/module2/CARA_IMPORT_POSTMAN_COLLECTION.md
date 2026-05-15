# 📮 CARA IMPORT POSTMAN COLLECTION

Panduan lengkap untuk import dan menggunakan Postman Collection untuk testing.

---

## 📥 STEP 1: DOWNLOAD COLLECTION

File collection sudah tersedia di:
```
apps/backend/module2/POSTMAN_COLLECTION.json
```

---

## 📥 STEP 2: IMPORT KE POSTMAN

### **Cara 1: Import dari File**

1. **Buka Postman**
2. **Klik "Import"** (tombol di atas sidebar kiri)
3. **Pilih "Upload Files"**
4. **Cari file:** `POSTMAN_COLLECTION.json`
5. **Klik "Import"**

### **Cara 2: Import dari Link**

1. **Buka Postman**
2. **Klik "Import"**
3. **Pilih "Link"**
4. **Paste URL** (jika file di server)
5. **Klik "Import"**

---

## ⚙️ STEP 3: SETUP ENVIRONMENT

### **Buat Environment Baru**

1. **Klik "Environments"** di sidebar kiri
2. **Klik "+"** untuk buat environment baru
3. **Nama:** `Module2 Test`
4. **Klik "Create"**

### **Tambah Variables**

Di environment yang baru dibuat, tambah variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `base_url` | http://localhost:3000/api/v1/m2 | http://localhost:3000/api/v1/m2 |
| `token_superadmin` | (kosong) | (kosong) |
| `token_admin_prodi` | (kosong) | (kosong) |
| `token_dosen` | (kosong) | (kosong) |
| `token_mahasiswa` | (kosong) | (kosong) |
| `mahasiswa_id` | bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1 | bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1 |
| `kelas_id` | fffffff1-ffff-ffff-ffff-fffffffffff1 | fffffff1-ffff-ffff-ffff-fffffffffff1 |

---

## 🔑 STEP 4: LOGIN DAN DAPATKAN TOKEN

### **Login Superadmin**

1. **Buka Collection:** `1. AUTHENTICATION`
2. **Klik:** `Login - Superadmin`
3. **Klik "Send"**
4. **Copy token dari response**
5. **Update environment variable:** `token_superadmin` dengan token yang dicopy

### **Login Admin Prodi**

1. **Klik:** `Login - Admin Prodi`
2. **Klik "Send"**
3. **Copy token dari response**
4. **Update environment variable:** `token_admin_prodi` dengan token yang dicopy

### **Login Dosen**

1. **Klik:** `Login - Dosen`
2. **Klik "Send"**
3. **Copy token dari response**
4. **Update environment variable:** `token_dosen` dengan token yang dicopy

### **Login Mahasiswa**

1. **Klik:** `Login - Mahasiswa`
2. **Klik "Send"**
3. **Copy token dari response**
4. **Update environment variable:** `token_mahasiswa` dengan token yang dicopy

---

## 🧪 STEP 5: TEST SETIAP RESOURCE

Collection sudah terorganisir berdasarkan resource:

### **1. PROGRAM STUDI & CPL**
Test akses untuk setiap role:
- ✅ Superadmin: R/W/D (bisa read)
- ✅ Admin Prodi: R/W (bisa read)
- ✅ Dosen: R (bisa read)
- ✅ Mahasiswa: R (bisa read)

### **2. MATA KULIAH & PEMETAAN**
Test akses untuk setiap role:
- ✅ Superadmin: R/W/D (bisa read & create)
- ✅ Admin Prodi: R/W (bisa read & create)
- ❌ Dosen: R (TIDAK bisa create - 403)
- ❌ Mahasiswa: R (TIDAK bisa create - 403)

### **3. SUB-CPMK**
Test akses untuk setiap role:
- ✅ Superadmin: R/W/D (bisa read)
- ✅ Admin Prodi: R/W (bisa read)
- ✅ Dosen: R/W (bisa read)
- ✅ Mahasiswa: R (bisa read)

### **4. INPUT NILAI SUB-CPMK**
Test akses untuk setiap role:
- ✅ Superadmin: R/W/D (bisa read & create)
- ❌ Admin Prodi: R (TIDAK bisa create - 403)
- ✅ Dosen: R/W (bisa read & create untuk kelas sendiri)
- ❌ Mahasiswa: — (TIDAK ada akses)

### **5. CAPAIAN CPL MAHASISWA**
Test akses untuk setiap role:
- ✅ Superadmin: R/W/D (bisa read semua)
- ✅ Admin Prodi: R/W (bisa read prodi sendiri)
- ✅ Dosen: R (bisa read kelas sendiri)
- ✅ Mahasiswa: R (bisa read diri sendiri)

### **6. MANAJEMEN USER**
Test akses untuk setiap role:
- ✅ Superadmin: R/W/D (bisa read semua)
- ✅ Admin Prodi: R/W (bisa read prodi sendiri)
- ❌ Dosen: — (TIDAK ada akses - 403)
- ❌ Mahasiswa: — (TIDAK ada akses - 403)

### **7. AUDIT LOG**
Test akses untuk setiap role:
- ✅ Superadmin: R (bisa read semua)
- ✅ Admin Prodi: R (bisa read prodi sendiri)
- ❌ Dosen: — (TIDAK ada akses - 403)
- ❌ Mahasiswa: — (TIDAK ada akses - 403)

---

## ✅ EXPECTED RESULTS

### **Untuk Request yang BERHASIL (200 OK)**
```json
{
  "success": true,
  "message": "Berhasil mengambil data...",
  "data": [...]
}
```

### **Untuk Request yang DITOLAK (403 Forbidden)**
```json
{
  "message": "Akses ditolak",
  "userRole": "dosen",
  "allowedRoles": ["Superadmin", "Admin Prodi"]
}
```

---

## 📋 TESTING CHECKLIST

### **Authentication**
- [ ] Login Superadmin berhasil
- [ ] Login Admin Prodi berhasil
- [ ] Login Dosen berhasil
- [ ] Login Mahasiswa berhasil
- [ ] Semua token sudah disimpan di environment

### **Program Studi & CPL**
- [ ] Superadmin bisa read (200 OK)
- [ ] Admin Prodi bisa read (200 OK)
- [ ] Dosen bisa read (200 OK)
- [ ] Mahasiswa bisa read (200 OK)

### **Mata Kuliah & Pemetaan**
- [ ] Superadmin bisa read (200 OK)
- [ ] Superadmin bisa create (201 Created)
- [ ] Admin Prodi bisa read (200 OK)
- [ ] Admin Prodi bisa create (201 Created)
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
- [ ] Superadmin bisa read (200 OK)
- [ ] Superadmin bisa create (201 Created)
- [ ] Admin Prodi bisa read (200 OK)
- [ ] Admin Prodi TIDAK bisa create (403 Forbidden)
- [ ] Dosen bisa read (200 OK)
- [ ] Dosen bisa create (201 Created)

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

## 💡 TIPS

### **1. Gunakan Pre-request Script untuk Auto-login**

Tambah pre-request script di collection level:

```javascript
// Pre-request Script
if (!pm.environment.get("token_superadmin")) {
  pm.sendRequest({
    url: pm.environment.get("base_url") + "/auth/login",
    method: "POST",
    header: {
      "Content-Type": "application/json"
    },
    body: {
      mode: "raw",
      raw: JSON.stringify({
        email: "admin@if.ac.id",
        password: "password123"
      })
    }
  }, function(err, response) {
    if (!err) {
      pm.environment.set("token_superadmin", response.json().token);
    }
  });
}
```

### **2. Gunakan Tests untuk Validasi Response**

Tambah tests di setiap request:

```javascript
// Tests
pm.test("Status code is 200", function() {
  pm.response.to.have.status(200);
});

pm.test("Response has success true", function() {
  var jsonData = pm.response.json();
  pm.expect(jsonData.success).to.eql(true);
});

pm.test("Response has data array", function() {
  var jsonData = pm.response.json();
  pm.expect(jsonData.data).to.be.an('array');
});
```

### **3. Gunakan Collection Runner untuk Batch Testing**

1. **Klik "Runner"** di Postman
2. **Pilih collection:** `Module 2 - CPL System API`
3. **Pilih environment:** `Module2 Test`
4. **Klik "Run"**
5. **Lihat hasil testing untuk semua request**

### **4. Export Results**

Setelah testing selesai:
1. **Klik "Export Results"**
2. **Pilih format:** JSON atau HTML
3. **Simpan file**

---

## 🐛 TROUBLESHOOTING

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

## 📚 REFERENSI

- [Postman Collection Format](https://learning.postman.com/docs/getting-started/importing-and-exporting-data/)
- [Postman Environment Variables](https://learning.postman.com/docs/sending-requests/managing-environments/)
- [Postman Pre-request Scripts](https://learning.postman.com/docs/writing-scripts/pre-request-scripts/)
- [Postman Tests](https://learning.postman.com/docs/writing-scripts/test-scripts/)

---

## 🎯 NEXT STEPS

1. **Import collection** ke Postman
2. **Setup environment** dengan variables
3. **Login** untuk setiap role dan dapatkan token
4. **Test** setiap resource sesuai matrik akses
5. **Verifikasi** hasil testing dengan checklist di atas

---

**Selamat testing! 🚀**

Jika ada pertanyaan atau masalah, silakan hubungi tim development.
