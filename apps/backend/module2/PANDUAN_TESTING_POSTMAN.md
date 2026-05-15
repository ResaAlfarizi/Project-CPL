# 📮 PANDUAN TESTING LENGKAP DI POSTMAN

Panduan step-by-step untuk testing semua endpoint Module 2 di Postman.

---

## 📋 DAFTAR ISI

1. [Setup Awal](#setup-awal)
2. [Testing Authentication](#testing-authentication)
3. [Testing Program Studi](#testing-program-studi)
4. [Testing CPL](#testing-cpl)
5. [Testing Sub-CPMK](#testing-sub-cpmk)
6. [Testing Kelas](#testing-kelas)
7. [Testing Enrollment](#testing-enrollment)
8. [Testing Nilai](#testing-nilai)
9. [Testing Capaian](#testing-capaian)
10. [Testing Dashboard](#testing-dashboard)
11. [Testing Auth Audit Log](#testing-auth-audit-log)

---

## 🚀 SETUP AWAL

### **Step 1: Jalankan Backend**
```bash
cd apps/backend
npm start
```

**Output yang benar:**
```
Backend Modul 1 dan Modul 2 aktif di port 3000
```

### **Step 2: Buat Environment di Postman**

1. Klik **"Environments"** di sidebar kiri
2. Klik **"+"** untuk buat environment baru
3. Nama: `Module2 Dev`
4. Tambah variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `base_url` | http://localhost:3000/api/v1/m2 | http://localhost:3000/api/v1/m2 |
| `token` | (kosong) | (kosong) |

5. Klik **"Save"**
6. Pilih environment **"Module2 Dev"** di dropdown kanan atas

---

## 🔐 TESTING AUTHENTICATION

### **1. LOGIN**

**Request:**
```http
POST {{base_url}}/auth/login
Content-Type: application/json

{
  "email": "admin@if.ac.id",
  "password": "password123"
}
```

**Cara di Postman:**
1. Method: `POST`
2. URL: `{{base_url}}/auth/login`
3. Tab **"Body"** → pilih **"raw"** → pilih **"JSON"**
4. Paste body di atas
5. Klik **"Send"**

**Response (200 OK):**
```json
{
  "message": "Login berhasil",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Step 3: Copy Token**
1. Copy token dari response (tanpa tanda kutip)
2. Klik **"Environments"** → **"Module2 Dev"**
3. Paste token di kolom **"Current Value"** untuk variable `token`
4. Klik **"Save"**

✅ **Sekarang semua request bisa menggunakan `{{token}}`**

---

## 📚 TESTING PROGRAM STUDI

### **1. GET Semua Program Studi**

**Request:**
```http
GET {{base_url}}/prodi
Authorization: Bearer {{token}}
```

**Cara di Postman:**
1. Method: `GET`
2. URL: `{{base_url}}/prodi`
3. Tab **"Headers"**:
   - Key: `Authorization`
   - Value: `Bearer {{token}}`
4. Klik **"Send"**

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Berhasil mengambil data program studi",
  "data": [
    {
      "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "kode_prodi": "IF",
      "nama_prodi": "Teknik Informatika",
      "jenjang": "S1",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### **2. POST Buat Program Studi (Superadmin Only)**

**Request:**
```http
POST {{base_url}}/prodi
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "kode_prodi": "SI",
  "nama_prodi": "Sistem Informasi",
  "jenjang": "S1"
}
```

**Cara di Postman:**
1. Method: `POST`
2. URL: `{{base_url}}/prodi`
3. Tab **"Headers"**:
   - Key: `Authorization`, Value: `Bearer {{token}}`
   - Key: `Content-Type`, Value: `application/json`
4. Tab **"Body"** → **"raw"** → **"JSON"**
5. Paste body di atas
6. Klik **"Send"**

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Program studi berhasil dibuat",
  "data": {
    "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "kode_prodi": "SI",
    "nama_prodi": "Sistem Informasi",
    "jenjang": "S1",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## 🎯 TESTING CPL

### **1. GET Semua CPL**

**Request:**
```http
GET {{base_url}}/cpl
Authorization: Bearer {{token}}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Berhasil mengambil data CPL",
  "data": [
    {
      "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "kode_cpl": "CPL-01",
      "deskripsi": "Mampu menerapkan logika pemrograman",
      "prodi_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "is_active": true,
      "nama_prodi": "Teknik Informatika",
      "kode_prodi": "IF",
      "jenjang": "S1"
    }
  ]
}
```

### **2. GET CPL by Prodi**

**Request:**
```http
GET {{base_url}}/cpl/prodi/{prodi_id}
Authorization: Bearer {{token}}
```

**Contoh:**
```http
GET {{base_url}}/cpl/prodi/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Authorization: Bearer {{token}}
```

### **3. POST Buat CPL (Superadmin, Admin Prodi)**

**Request:**
```http
POST {{base_url}}/cpl
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "kode_cpl": "CPL-02",
  "deskripsi": "Mampu menganalisis kebutuhan sistem",
  "prodi_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "is_active": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "CPL berhasil dibuat",
  "data": {
    "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "kode_cpl": "CPL-02",
    "deskripsi": "Mampu menganalisis kebutuhan sistem",
    "prodi_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "is_active": true
  }
}
```

---

## 📝 TESTING SUB-CPMK

### **1. GET Semua Sub-CPMK**

**Request:**
```http
GET {{base_url}}/sub-cpmk
Authorization: Bearer {{token}}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Berhasil mengambil data Sub-CPMK",
  "data": [
    {
      "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "kode_sub_cpmk": "SUB-CPMK-01",
      "deskripsi": "Mampu membuat variabel dan tipe data",
      "mk_cpl_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "bobot": 0.2,
      "mk_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "cpl_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "bobot_mk_ke_cpl": 0.3,
      "kode_mk": "IF101",
      "nama_mk": "Pemrograman Dasar",
      "sks": 3,
      "semester": 1,
      "kode_cpl": "CPL-01",
      "deskripsi_cpl": "Mampu menerapkan logika pemrograman"
    }
  ]
}
```

### **2. GET Sub-CPMK by MK**

**Request:**
```http
GET {{base_url}}/sub-cpmk/mk/{mk_id}
Authorization: Bearer {{token}}
```

### **3. GET Sub-CPMK by CPL**

**Request:**
```http
GET {{base_url}}/sub-cpmk/cpl/{cpl_id}
Authorization: Bearer {{token}}
```

### **4. POST Buat Sub-CPMK (Superadmin, Admin Prodi)**

**Request:**
```http
POST {{base_url}}/sub-cpmk
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "kode_sub_cpmk": "SUB-CPMK-02",
  "deskripsi": "Mampu membuat fungsi dan prosedur",
  "mk_cpl_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "bobot": 0.3
}
```

**PENTING:** Bobot harus antara 0 dan 1 (desimal), bukan 0-100!

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Sub-CPMK berhasil dibuat",
  "data": {
    "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "kode_sub_cpmk": "SUB-CPMK-02",
    "deskripsi": "Mampu membuat fungsi dan prosedur",
    "mk_cpl_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "bobot": 0.3
  }
}
```

---

## 📚 TESTING KELAS

### **1. GET Semua Kelas**

**Request:**
```http
GET {{base_url}}/kelas
Authorization: Bearer {{token}}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Berhasil mengambil data kelas",
  "data": [
    {
      "id": "fffffff1-ffff-ffff-ffff-fffffffffff1",
      "kode_mk": "IF101",
      "nama_mk": "Pemrograman Dasar",
      "nama_dosen": "Dr. Budi Santoso",
      "tahun_akademik": "2024/2025",
      "semester_aktif": 1,
      "sks": 3
    }
  ]
}
```

### **2. POST Buat Kelas (Superadmin, Admin Prodi)**

**Request:**
```http
POST {{base_url}}/kelas
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "mk_id": "ccccccc1-cccc-cccc-cccc-ccccccccccc1",
  "dosen_id": "aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1",
  "tahun_akademik": "2024/2025",
  "semester_aktif": 1,
  "nama_kelas": "A"
}
```

---

## 👥 TESTING ENROLLMENT

### **1. GET Mahasiswa di Kelas**

**Request:**
```http
GET {{base_url}}/enrollment/kelas/{kelas_id}
Authorization: Bearer {{token}}
```

**Contoh:**
```http
GET {{base_url}}/enrollment/kelas/fffffff1-ffff-ffff-ffff-fffffffffff1
Authorization: Bearer {{token}}
```

### **2. POST Daftar Kelas**

**Request:**
```http
POST {{base_url}}/enrollment
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "mahasiswa_id": "bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1",
  "kelas_id": "fffffff1-ffff-ffff-ffff-fffffffffff1"
}
```

---

## 📊 TESTING NILAI

### **1. GET Nilai Kelas**

**Request:**
```http
GET {{base_url}}/nilai/kelas/{kelas_id}
Authorization: Bearer {{token}}
```

### **2. POST Input Nilai (Dosen, Superadmin)**

**Request:**
```http
POST {{base_url}}/nilai
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "enrollment_id": "99999991-9999-9999-9999-999999999991",
  "sub_cpmk_id": "eeeeeee1-eeee-eeee-eeee-eeeeeeeeeee1",
  "nilai": 85
}
```

---

## 🎯 TESTING CAPAIAN

### **1. GET Capaian Mahasiswa (Mahasiswa)**

**Request:**
```http
GET {{base_url}}/capaian/mahasiswa/my-capaian
Authorization: Bearer {{token_mahasiswa}}
```

### **2. GET Capaian Prodi (Superadmin, Admin Prodi)**

**Request:**
```http
GET {{base_url}}/capaian/prodi/{prodi_id}
Authorization: Bearer {{token}}
```

---

## 📈 TESTING DASHBOARD

### **1. GET Dashboard Admin**

**Request:**
```http
GET {{base_url}}/dashboard/admin/{prodi_id}
Authorization: Bearer {{token}}
```

### **2. GET Dashboard Dosen**

**Request:**
```http
GET {{base_url}}/dashboard/dosen
Authorization: Bearer {{token_dosen}}
```

### **3. GET Dashboard Mahasiswa**

**Request:**
```http
GET {{base_url}}/dashboard/mahasiswa
Authorization: Bearer {{token_mahasiswa}}
```

---

## 🔐 TESTING AUTH AUDIT LOG

### **1. GET Semua Auth Audit Log**

**Request:**
```http
GET {{base_url}}/auth-audit-log?limit=100&offset=0
Authorization: Bearer {{token}}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Berhasil mengambil data auth audit log",
  "data": [
    {
      "id": 1,
      "user_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "event_type": "login_success",
      "ip_address": "127.0.0.1",
      "user_agent": "PostmanRuntime/7.32.3",
      "detail": "{\"email\":\"admin@if.ac.id\"}",
      "created_at": "2024-01-01T10:00:00.000Z",
      "user_email": "admin@if.ac.id",
      "user_name": "Admin"
    }
  ]
}
```

### **2. GET Login Statistics**

**Request:**
```http
GET {{base_url}}/auth-audit-log/statistics/login?days=7
Authorization: Bearer {{token}}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Berhasil mengambil statistik login",
  "data": [
    {
      "date": "2024-01-07",
      "successful_logins": 45,
      "failed_logins": 5,
      "account_locked": 1
    }
  ]
}
```

### **3. GET Users with Most Failed Logins**

**Request:**
```http
GET {{base_url}}/auth-audit-log/statistics/failed-logins?days=7&limit=10
Authorization: Bearer {{token}}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Berhasil mengambil data user dengan login gagal terbanyak",
  "data": [
    {
      "user_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "email": "user@example.com",
      "failed_attempts": 12,
      "last_failed_attempt": "2024-01-07T15:30:00.000Z"
    }
  ]
}
```

### **4. GET Auth Audit Log by Event Type**

**Request:**
```http
GET {{base_url}}/auth-audit-log/event/login_failed?limit=50&offset=0
Authorization: Bearer {{token}}
```

**Event types yang valid:**
- `login_success`
- `login_failed`
- `logout`
- `token_refresh`
- `account_locked`
- `password_reset_req`
- `password_changed`

---

## 📋 CHECKLIST TESTING LENGKAP

### **Authentication:**
- [ ] POST Login
- [ ] Verify token disimpan di environment

### **Program Studi:**
- [ ] GET semua program studi
- [ ] GET program studi by ID
- [ ] POST buat program studi (Superadmin)
- [ ] PUT update program studi (Superadmin)
- [ ] DELETE hapus program studi (Superadmin)

### **CPL:**
- [ ] GET semua CPL
- [ ] GET CPL by ID
- [ ] GET CPL by prodi
- [ ] POST buat CPL (Superadmin, Admin Prodi)
- [ ] PUT update CPL (Superadmin, Admin Prodi)
- [ ] DELETE hapus CPL (Superadmin)

### **Sub-CPMK:**
- [ ] GET semua Sub-CPMK
- [ ] GET Sub-CPMK by ID
- [ ] GET Sub-CPMK by MK_CPL
- [ ] GET Sub-CPMK by MK
- [ ] GET Sub-CPMK by CPL
- [ ] POST buat Sub-CPMK (Superadmin, Admin Prodi)
- [ ] PUT update Sub-CPMK (Superadmin, Admin Prodi)
- [ ] DELETE hapus Sub-CPMK (Superadmin)

### **Kelas:**
- [ ] GET semua kelas
- [ ] GET kelas by ID
- [ ] GET kelas dosen (Dosen)
- [ ] POST buat kelas (Superadmin, Admin Prodi)
- [ ] PUT update kelas (Superadmin, Admin Prodi)
- [ ] DELETE hapus kelas (Superadmin)

### **Enrollment:**
- [ ] GET semua enrollment
- [ ] GET enrollment by ID
- [ ] GET mahasiswa di kelas
- [ ] GET KRS mahasiswa (Mahasiswa)
- [ ] POST daftar kelas
- [ ] DELETE drop kelas

### **Nilai:**
- [ ] GET semua nilai
- [ ] GET nilai by ID
- [ ] GET nilai kelas
- [ ] GET nilai mahasiswa (Mahasiswa)
- [ ] POST input nilai (Dosen, Superadmin)
- [ ] PUT update nilai (Dosen, Superadmin)
- [ ] DELETE hapus nilai (Superadmin)

### **Capaian:**
- [ ] GET capaian mahasiswa (Mahasiswa)
- [ ] GET capaian mahasiswa by ID
- [ ] GET capaian prodi
- [ ] GET capaian kelas
- [ ] GET detail capaian
- [ ] GET mahasiswa belum capai CPL

### **Dashboard:**
- [ ] GET dashboard admin
- [ ] GET dashboard dosen
- [ ] GET dashboard mahasiswa

### **Auth Audit Log:**
- [ ] GET semua auth audit log
- [ ] GET auth audit log by ID
- [ ] GET auth audit log by user
- [ ] GET auth audit log by event type
- [ ] GET login statistics
- [ ] GET users with most failed logins
- [ ] DELETE old auth audit log (cleanup)

---

## 💡 TIPS POSTMAN

### **1. Gunakan Environment Variables**
```
{{base_url}} = http://localhost:3000/api/v1/m2
{{token}} = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **2. Gunakan Collection**
Simpan semua request dalam satu collection untuk reusability.

### **3. Gunakan Pre-request Script untuk Auto-login**
```javascript
// Pre-request Script
if (!pm.environment.get("token")) {
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
      pm.environment.set("token", response.json().token);
    }
  });
}
```

### **4. Gunakan Tests untuk Validasi**
```javascript
// Tests
pm.test("Status code is 200", function() {
  pm.response.to.have.status(200);
});

pm.test("Response has success true", function() {
  var jsonData = pm.response.json();
  pm.expect(jsonData.success).to.eql(true);
});

pm.test("Response has data", function() {
  var jsonData = pm.response.json();
  pm.expect(jsonData.data).to.exist;
});
```

---

## ⚠️ COMMON ERRORS

### **401 Unauthorized**
**Penyebab:** Token tidak ada atau tidak valid
**Solusi:** 
1. Login ulang
2. Copy token baru
3. Update environment variable `token`

### **403 Forbidden**
**Penyebab:** Role tidak sesuai dengan endpoint
**Solusi:** Gunakan user dengan role yang tepat

### **400 Bad Request**
**Penyebab:** Data tidak lengkap atau format salah
**Solusi:** Cek body request sesuai dengan contoh

### **404 Not Found**
**Penyebab:** Resource tidak ditemukan
**Solusi:** Cek ID yang digunakan

---

## 📊 TOTAL ENDPOINTS: 61

- Authentication: 2 endpoints
- Users: 5 endpoints
- Program Studi: 5 endpoints
- CPL: 6 endpoints
- Sub-CPMK: 8 endpoints
- Kelas: 6 endpoints
- Enrollment: 6 endpoints
- Nilai: 7 endpoints
- Capaian: 6 endpoints
- Dashboard: 3 endpoints
- Auth Audit Log: 7 endpoints

---

**Selamat testing!** 🚀

Jika ada error, cek:
1. Backend sudah running
2. Token sudah di-set di environment
3. Authorization header sudah benar
4. Body request sesuai format
