# 📌 QUICK REFERENCE - MODULE 2 API

Cheat sheet untuk testing API Module 2.

---

## 🔑 LOGIN

```http
POST http://localhost:3000/api/v1/m2/auth/login
Content-Type: application/json

{
  "email": "admin@if.ac.id",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login berhasil",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 📋 KELAS ENDPOINTS

### GET Semua Kelas
```http
GET http://localhost:3000/api/v1/m2/kelas
Authorization: Bearer {{token}}
```

### GET Detail Kelas
```http
GET http://localhost:3000/api/v1/m2/kelas/{id}
Authorization: Bearer {{token}}
```

### GET Kelas Dosen (Dosen Only)
```http
GET http://localhost:3000/api/v1/m2/kelas/dosen/my-classes
Authorization: Bearer {{token_dosen}}
```

### POST Buat Kelas (Admin Only)
```http
POST http://localhost:3000/api/v1/m2/kelas
Authorization: Bearer {{token_admin}}
Content-Type: application/json

{
  "mk_id": "ccccccc1-cccc-cccc-cccc-ccccccccccc1",
  "dosen_id": "aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1",
  "tahun_akademik": "2024/2025",
  "semester_aktif": 1,
  "nama_kelas": "A"
}
```

### PUT Update Kelas (Admin Only)
```http
PUT http://localhost:3000/api/v1/m2/kelas/{id}
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

### DELETE Hapus Kelas (Superadmin Only)
```http
DELETE http://localhost:3000/api/v1/m2/kelas/{id}
Authorization: Bearer {{token_superadmin}}
```

---

## 📝 ENROLLMENT ENDPOINTS

### GET Semua Enrollment
```http
GET http://localhost:3000/api/v1/m2/enrollment
Authorization: Bearer {{token}}
```

### GET Mahasiswa di Kelas
```http
GET http://localhost:3000/api/v1/m2/enrollment/kelas/{kelas_id}
Authorization: Bearer {{token_dosen}}
```

### GET KRS Mahasiswa
```http
GET http://localhost:3000/api/v1/m2/enrollment/mahasiswa/my-enrollment
Authorization: Bearer {{token_mahasiswa}}
```

### POST Daftar Kelas
```http
POST http://localhost:3000/api/v1/m2/enrollment
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "mahasiswa_id": "bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1",
  "kelas_id": "fffffff1-ffff-ffff-ffff-fffffffffff1"
}
```

### DELETE Drop Kelas
```http
DELETE http://localhost:3000/api/v1/m2/enrollment/{id}
Authorization: Bearer {{token}}
```

---

## 📊 NILAI ENDPOINTS

### GET Semua Nilai
```http
GET http://localhost:3000/api/v1/m2/nilai
Authorization: Bearer {{token}}
```

### GET Nilai Kelas
```http
GET http://localhost:3000/api/v1/m2/nilai/kelas/{kelas_id}
Authorization: Bearer {{token_dosen}}
```

### GET Nilai Mahasiswa
```http
GET http://localhost:3000/api/v1/m2/nilai/mahasiswa/my-nilai
Authorization: Bearer {{token_mahasiswa}}
```

### POST Input Nilai
```http
POST http://localhost:3000/api/v1/m2/nilai
Authorization: Bearer {{token_dosen}}
Content-Type: application/json

{
  "enrollment_id": "99999991-9999-9999-9999-999999999991",
  "sub_cpmk_id": "eeeeeee1-eeee-eeee-eeee-eeeeeeeeeee1",
  "nilai": 85
}
```

### PUT Update Nilai
```http
PUT http://localhost:3000/api/v1/m2/nilai/{id}
Authorization: Bearer {{token_dosen}}
Content-Type: application/json

{
  "enrollment_id": "99999991-9999-9999-9999-999999999991",
  "sub_cpmk_id": "eeeeeee1-eeee-eeee-eeee-eeeeeeeeeee1",
  "nilai": 90
}
```

### DELETE Hapus Nilai
```http
DELETE http://localhost:3000/api/v1/m2/nilai/{id}
Authorization: Bearer {{token}}
```

---

## 🎯 CAPAIAN ENDPOINTS

### GET Capaian Mahasiswa
```http
GET http://localhost:3000/api/v1/m2/capaian/mahasiswa/my-capaian
Authorization: Bearer {{token_mahasiswa}}
```

### GET Detail Capaian
```http
GET http://localhost:3000/api/v1/m2/capaian/mahasiswa/my-capaian/detail
Authorization: Bearer {{token_mahasiswa}}
```

### GET Capaian Mahasiswa Tertentu
```http
GET http://localhost:3000/api/v1/m2/capaian/mahasiswa/{mahasiswa_id}
Authorization: Bearer {{token}}
```

### GET Capaian Prodi
```http
GET http://localhost:3000/api/v1/m2/capaian/prodi/{prodi_id}
Authorization: Bearer {{token}}
```

### GET Capaian Kelas
```http
GET http://localhost:3000/api/v1/m2/capaian/kelas/{kelas_id}
Authorization: Bearer {{token_dosen}}
```

### GET Mahasiswa Belum Capai CPL
```http
GET http://localhost:3000/api/v1/m2/capaian/belum-capai/{cpl_id}/{prodi_id}
Authorization: Bearer {{token}}
```

---

## 📈 DASHBOARD ENDPOINTS

### GET Dashboard Admin
```http
GET http://localhost:3000/api/v1/m2/dashboard/admin/{prodi_id}
Authorization: Bearer {{token_admin}}
```

### GET Dashboard Dosen
```http
GET http://localhost:3000/api/v1/m2/dashboard/dosen
Authorization: Bearer {{token_dosen}}
```

### GET Dashboard Mahasiswa
```http
GET http://localhost:3000/api/v1/m2/dashboard/mahasiswa
Authorization: Bearer {{token_mahasiswa}}
```

---

## 👥 TEST USERS

| Email | Password | Role |
|-------|----------|------|
| admin@if.ac.id | password123 | Admin Prodi |
| dosen1@if.ac.id | password123 | Dosen |
| mhs1@if.ac.id | password123 | Mahasiswa |

---

## 🔐 AUTHORIZATION HEADER

**Format:**
```
Authorization: Bearer <token>
```

**Contoh:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFhYWFhYWExLWFhYWEtYWFhYS1hYWFhLWFhYWFhYWFhYWFhMSIsImVtYWlsIjoiYWRtaW5AaWYuYWMuaWQiLCJyb2xlIjoic3VwZXJhZG1pbiIsImlhdCI6MTcxNjAxMjM0NSwiZXhwIjoxNzE2MDk4NzQ1fQ.abc123...
```

---

## 🔄 SEMESTER AKTIF

| Value | Keterangan |
|-------|-----------|
| 1 | Ganjil (Semester 1, 3, 5, 7) |
| 2 | Genap (Semester 2, 4, 6, 8) |

---

## 📊 RESPONSE FORMAT

### Success (200 OK)
```json
{
  "success": true,
  "message": "Deskripsi",
  "data": {}
}
```

### Error (4xx/5xx)
```json
{
  "message": "Error description"
}
```

---

## ⚠️ COMMON ERRORS

| Error | Penyebab | Solusi |
|-------|----------|--------|
| 401 Unauthorized | Token tidak ada/invalid | Tambah Authorization header |
| 403 Forbidden | Role tidak sesuai | Gunakan user dengan role tepat |
| 400 Bad Request | Data tidak lengkap | Cek field required |
| 404 Not Found | Resource tidak ada | Cek ID yang digunakan |
| 500 Server Error | Error di backend | Cek console backend |

---

## 🔗 BASE URL

```
http://localhost:3000/api/v1/m2
```

---

## 📚 DOKUMENTASI LENGKAP

- **DOKUMENTASI_LENGKAP.md** - Panduan lengkap
- **POSTMAN_TESTING_GUIDE.md** - Cara testing di Postman
- **SOLUSI_401_UNAUTHORIZED.md** - Solusi error 401
- **README.md** - Dokumentasi teknis

---

**Print atau bookmark halaman ini untuk referensi cepat!** 📌
