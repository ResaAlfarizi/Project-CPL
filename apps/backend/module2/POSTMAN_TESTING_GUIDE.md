# 📮 PANDUAN TESTING DI POSTMAN

Panduan lengkap untuk testing API Module 2 di Postman dengan benar.

---

## ⚠️ MASALAH UMUM: 401 Unauthorized

**Penyebab:** Token ditempatkan di tempat yang salah.

### ❌ SALAH - Token di Query Params
```
GET http://localhost:3000/api/v1/m2/kelas?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Hasil:** 401 Unauthorized ❌

### ✅ BENAR - Token di Authorization Header
```
GET http://localhost:3000/api/v1/m2/kelas
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Hasil:** 200 OK ✅

---

## 🔑 STEP 1: LOGIN DAN DAPATKAN TOKEN

### **Request:**
```http
POST http://localhost:3000/api/v1/m2/auth/login
Content-Type: application/json

{
  "email": "admin@if.ac.id",
  "password": "password123"
}
```

### **Response:**
```json
{
  "message": "Login berhasil",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFhYWFhYWExLWFhYWEtYWFhYS1hYWFhLWFhYWFhYWFhYWFhMSIsImVtYWlsIjoiYWRtaW5AaWYuYWMuaWQiLCJyb2xlIjoic3VwZXJhZG1pbiIsImlhdCI6MTcxNjAxMjM0NSwiZXhwIjoxNzE2MDk4NzQ1fQ.abc123..."
}
```

### **Salin Token:**
Salin seluruh string token (tanpa tanda kutip), contoh:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFhYWFhYWExLWFhYWEtYWFhYS1hYWFhLWFhYWFhYWFhYWFhMSIsImVtYWlsIjoiYWRtaW5AaWYuYWMuaWQiLCJyb2xlIjoic3VwZXJhZG1pbiIsImlhdCI6MTcxNjAxMjM0NSwiZXhwIjoxNzE2MDk4NzQ1fQ.abc123...
```

---

## 📍 STEP 2: SETUP AUTHORIZATION HEADER DI POSTMAN

### **Cara 1: Manual di setiap request**

1. **Buka tab "Headers"** di Postman
2. **Tambah header baru:**
   - Key: `Authorization`
   - Value: `Bearer <paste_token_here>`

**Contoh:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFhYWFhYWExLWFhYWEtYWFhYS1hYWFhLWFhYWFhYWFhYWFhMSIsImVtYWlsIjoiYWRtaW5AaWYuYWMuaWQiLCJyb2xlIjoic3VwZXJhZG1pbiIsImlhdCI6MTcxNjAxMjM0NSwiZXhwIjoxNzE2MDk4NzQ1fQ.abc123...
```

### **Cara 2: Gunakan Postman Environment (Recommended)**

1. **Buat Environment:**
   - Klik "Environments" di sidebar
   - Klik "+" untuk buat environment baru
   - Nama: `Module2 Dev`

2. **Tambah Variable:**
   - Variable: `token`
   - Initial Value: `<paste_token_here>`
   - Current Value: `<paste_token_here>`

3. **Gunakan di Request:**
   - Authorization Header: `Bearer {{token}}`

4. **Update Token:**
   - Setelah login, copy token baru
   - Update di Environment

---

## 🧪 STEP 3: TEST ENDPOINT

### **1. GET Semua Kelas**

**Request:**
```http
GET http://localhost:3000/api/v1/m2/kelas
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
      "mk_id": "ccccccc1-cccc-cccc-cccc-ccccccccccc1",
      "dosen_id": "aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1",
      "tahun_akademik": "2024/2025",
      "semester_aktif": 1,
      "nama_kelas": "A",
      "kode_mk": "IF101",
      "nama_mk": "Pemrograman Dasar",
      "sks": 3,
      "nama_dosen": "Dr. Budi Santoso",
      "nama_prodi": "Teknik Informatika"
    }
  ]
}
```

### **2. GET Detail Kelas**

**Request:**
```http
GET http://localhost:3000/api/v1/m2/kelas/fffffff1-ffff-ffff-ffff-fffffffffff1
Authorization: Bearer {{token}}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Berhasil mengambil data kelas",
  "data": {
    "id": "fffffff1-ffff-ffff-ffff-fffffffffff1",
    "mk_id": "ccccccc1-cccc-cccc-cccc-ccccccccccc1",
    "dosen_id": "aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1",
    "tahun_akademik": "2024/2025",
    "semester_aktif": 1,
    "nama_kelas": "A",
    "kode_mk": "IF101",
    "nama_mk": "Pemrograman Dasar",
    "sks": 3,
    "nama_dosen": "Dr. Budi Santoso",
    "nidn": "0001234567",
    "nama_prodi": "Teknik Informatika"
  }
}
```

### **3. GET Kelas Dosen (Dosen Only)**

**Request:**
```http
GET http://localhost:3000/api/v1/m2/kelas/dosen/my-classes
Authorization: Bearer {{token_dosen}}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Berhasil mengambil data kelas",
  "data": [
    {
      "id": "fffffff1-ffff-ffff-ffff-fffffffffff1",
      "tahun_akademik": "2024/2025",
      "semester_aktif": 1,
      "nama_kelas": "A",
      "kode_mk": "IF101",
      "nama_mk": "Pemrograman Dasar",
      "sks": 3,
      "jumlah_mahasiswa": 30
    }
  ]
}
```

### **4. POST Buat Kelas (Admin Only)**

**Request:**
```http
POST http://localhost:3000/api/v1/m2/kelas
Authorization: Bearer {{token_admin}}
Content-Type: application/json

{
  "mk_id": "ccccccc1-cccc-cccc-cccc-ccccccccccc1",
  "dosen_id": "aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1",
  "tahun_akademik": "2024/2025",
  "semester_aktif": 1,
  "nama_kelas": "B"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Kelas berhasil dibuat",
  "data": {
    "id": "fffffff2-ffff-ffff-ffff-fffffffffff2",
    "mk_id": "ccccccc1-cccc-cccc-cccc-ccccccccccc1",
    "dosen_id": "aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1",
    "tahun_akademik": "2024/2025",
    "semester_aktif": 1,
    "nama_kelas": "B"
  }
}
```

### **5. PUT Update Kelas (Admin Only)**

**Request:**
```http
PUT http://localhost:3000/api/v1/m2/kelas/fffffff1-ffff-ffff-ffff-fffffffffff1
Authorization: Bearer {{token_admin}}
Content-Type: application/json

{
  "mk_id": "ccccccc1-cccc-cccc-cccc-ccccccccccc1",
  "dosen_id": "aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2",
  "tahun_akademik": "2024/2025",
  "semester_aktif": 2,
  "nama_kelas": "C"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Kelas berhasil diupdate",
  "data": {
    "id": "fffffff1-ffff-ffff-ffff-fffffffffff1",
    "mk_id": "ccccccc1-cccc-cccc-cccc-ccccccccccc1",
    "dosen_id": "aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2",
    "tahun_akademik": "2024/2025",
    "semester_aktif": 2,
    "nama_kelas": "C"
  }
}
```

### **6. DELETE Hapus Kelas (Superadmin Only)**

**Request:**
```http
DELETE http://localhost:3000/api/v1/m2/kelas/fffffff1-ffff-ffff-ffff-fffffffffff1
Authorization: Bearer {{token_superadmin}}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Kelas berhasil dihapus",
  "data": {
    "id": "fffffff1-ffff-ffff-ffff-fffffffffff1",
    "mk_id": "ccccccc1-cccc-cccc-cccc-ccccccccccc1",
    "dosen_id": "aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1",
    "tahun_akademik": "2024/2025",
    "semester_aktif": 1,
    "nama_kelas": "A"
  }
}
```

---

## 🔍 DEBUGGING: Cek Error Response

### **401 Unauthorized - Token tidak ada**
```json
{
  "message": "Token tidak ada"
}
```
**Solusi:** Tambah Authorization header dengan format `Bearer <token>`

### **401 Unauthorized - Token tidak valid**
```json
{
  "message": "Token tidak valid"
}
```
**Solusi:** 
- Pastikan token belum expired
- Pastikan JWT_SECRET di .env benar
- Login ulang untuk dapatkan token baru

### **403 Forbidden - Akses ditolak**
```json
{
  "message": "Akses ditolak"
}
```
**Solusi:** Pastikan role user sesuai dengan endpoint (lihat matrik akses)

### **400 Bad Request - Data tidak lengkap**
```json
{
  "message": "Data tidak lengkap"
}
```
**Solusi:** Pastikan semua field required sudah diisi

### **404 Not Found - Kelas tidak ditemukan**
```json
{
  "message": "Kelas tidak ditemukan"
}
```
**Solusi:** Pastikan ID kelas benar

---

## 📋 CHECKLIST TESTING

- [ ] Backend sudah running (`npm start`)
- [ ] Login berhasil dan dapat token
- [ ] Token disimpan di Environment atau Header
- [ ] GET /kelas berhasil (200 OK)
- [ ] GET /kelas/:id berhasil (200 OK)
- [ ] GET /kelas/dosen/my-classes berhasil (200 OK) - Dosen only
- [ ] POST /kelas berhasil (201 Created) - Admin only
- [ ] PUT /kelas/:id berhasil (200 OK) - Admin only
- [ ] DELETE /kelas/:id berhasil (200 OK) - Superadmin only

---

## 🎯 TIPS & TRICKS

### **1. Gunakan Postman Environment**
Lebih mudah untuk manage token dan base URL.

### **2. Gunakan Postman Collection**
Simpan semua request dalam satu collection untuk reusability.

### **3. Gunakan Pre-request Script**
Otomatis refresh token sebelum request:
```javascript
// Pre-request Script
if (pm.environment.get("token_expired")) {
  // Trigger login request
  pm.sendRequest({
    url: pm.environment.get("base_url") + "/auth/login",
    method: "POST",
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
```

---

## 📚 REFERENSI

- [Postman Documentation](https://learning.postman.com/)
- [JWT Format](https://jwt.io/)
- [HTTP Status Codes](https://httpwg.org/specs/rfc7231.html#status.codes)

---

**Selamat testing! 🚀**
