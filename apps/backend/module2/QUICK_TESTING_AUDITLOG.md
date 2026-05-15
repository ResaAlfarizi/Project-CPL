# 🚀 QUICK TESTING AUDIT LOG - STEP BY STEP

Panduan cepat untuk testing Auth Audit Log di Postman.

---

## 📋 PERSIAPAN

### **1. Pastikan Backend Running**
```bash
npm start
```

### **2. Buka Postman**
- Buat folder baru: `Auth Audit Log Testing`
- Buat environment variable untuk token

---

## 🔑 STEP 1: LOGIN (Buat Audit Log Otomatis)

**Request:**
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
  "success": true,
  "message": "Login berhasil",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "email": "admin@if.ac.id",
      "name": "Admin",
      "role": "Superadmin"
    }
  }
}
```

**💡 TIPS:**
- Copy token dari response
- Simpan di Postman environment variable: `{{token}}`
- Gunakan token ini untuk semua request berikutnya

---

## 📊 STEP 2: LIHAT SEMUA AUDIT LOG

**Request:**
```http
GET http://localhost:3000/api/v1/m2/auth-audit-log?limit=100&offset=0
Authorization: Bearer {{token}}
```

**Response:**
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

**✅ EXPECTED:**
- Akan melihat log dari login di STEP 1
- Event type: `login_success`
- IP address: `127.0.0.1` (localhost)

---

## 🔍 STEP 3: LIHAT AUDIT LOG BY ID

**Request:**
```http
GET http://localhost:3000/api/v1/m2/auth-audit-log/1
Authorization: Bearer {{token}}
```

**Response:**
```json
{
  "success": true,
  "message": "Berhasil mengambil data auth audit log",
  "data": {
    "id": 1,
    "user_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "event_type": "login_success",
    "ip_address": "127.0.0.1",
    "user_agent": "PostmanRuntime/7.32.3",
    "detail": "{\"email\":\"admin@if.ac.id\"}",
    "created_at": "2024-01-01T10:00:00.000Z"
  }
}
```

---

## 👤 STEP 4: LIHAT AUDIT LOG BY USER

**Request:**
```http
GET http://localhost:3000/api/v1/m2/auth-audit-log/user/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx?limit=100&offset=0
Authorization: Bearer {{token}}
```

**Ganti `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` dengan user_id dari STEP 2**

**Response:**
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
      "created_at": "2024-01-01T10:00:00.000Z"
    }
  ]
}
```

---

## 📌 STEP 5: LIHAT AUDIT LOG BY EVENT TYPE

### **5A. Login Success**
```http
GET http://localhost:3000/api/v1/m2/auth-audit-log/event/login_success?limit=100&offset=0
Authorization: Bearer {{token}}
```

### **5B. Login Failed (Coba Login dengan Password Salah)**

**Pertama, coba login dengan password salah:**
```http
POST http://localhost:3000/api/v1/m2/auth/login
Content-Type: application/json

{
  "email": "admin@if.ac.id",
  "password": "wrongpassword"
}
```

**Kemudian lihat login_failed logs:**
```http
GET http://localhost:3000/api/v1/m2/auth-audit-log/event/login_failed?limit=100&offset=0
Authorization: Bearer {{token}}
```

**Response:**
```json
{
  "success": true,
  "message": "Berhasil mengambil data auth audit log",
  "data": [
    {
      "id": 2,
      "user_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "event_type": "login_failed",
      "ip_address": "127.0.0.1",
      "user_agent": "PostmanRuntime/7.32.3",
      "detail": "{\"reason\":\"wrong_password\",\"email\":\"admin@if.ac.id\"}",
      "created_at": "2024-01-01T10:05:00.000Z"
    }
  ]
}
```

---

## 📈 STEP 6: LIHAT LOGIN STATISTICS

**Request:**
```http
GET http://localhost:3000/api/v1/m2/auth-audit-log/statistics/login?days=7
Authorization: Bearer {{token}}
```

**Response:**
```json
{
  "success": true,
  "message": "Berhasil mengambil statistik login",
  "data": [
    {
      "date": "2024-01-07",
      "successful_logins": 5,
      "failed_logins": 1,
      "account_locked": 0
    },
    {
      "date": "2024-01-06",
      "successful_logins": 3,
      "failed_logins": 0,
      "account_locked": 0
    }
  ]
}
```

**✅ EXPECTED:**
- Melihat trend login dalam 7 hari terakhir
- Successful logins: login berhasil
- Failed logins: login gagal
- Account locked: account yang dikunci

---

## ⚠️ STEP 7: LIHAT USER DENGAN FAILED LOGIN TERBANYAK

**Request:**
```http
GET http://localhost:3000/api/v1/m2/auth-audit-log/statistics/failed-logins?days=7&limit=10
Authorization: Bearer {{token}}
```

**Response:**
```json
{
  "success": true,
  "message": "Berhasil mengambil data user dengan login gagal terbanyak",
  "data": [
    {
      "user_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "email": "admin@if.ac.id",
      "failed_attempts": 1,
      "last_failed_attempt": "2024-01-01T10:05:00.000Z"
    }
  ]
}
```

**✅ EXPECTED:**
- Melihat user dengan failed login terbanyak
- Berguna untuk detect brute force attack

---

## 🗑️ STEP 8: DELETE OLD AUDIT LOG (CLEANUP)

**Request:**
```http
DELETE http://localhost:3000/api/v1/m2/auth-audit-log/cleanup?days=90
Authorization: Bearer {{token}}
```

**Response:**
```json
{
  "success": true,
  "message": "Berhasil menghapus auth audit log lebih dari 90 hari",
  "data": {
    "deleted_count": 0
  }
}
```

**⚠️ CATATAN:**
- Hanya Superadmin yang bisa delete
- Akan menghapus log lebih dari 90 hari
- Gunakan untuk maintenance database

---

## 📋 CHECKLIST TESTING

Gunakan checklist ini untuk memastikan semua endpoint berfungsi:

```
✅ STEP 1: Login (create audit log otomatis)
✅ STEP 2: GET semua audit log
✅ STEP 3: GET audit log by ID
✅ STEP 4: GET audit log by user
✅ STEP 5A: GET audit log by event type (login_success)
✅ STEP 5B: GET audit log by event type (login_failed)
✅ STEP 6: GET login statistics
✅ STEP 7: GET users with most failed logins
✅ STEP 8: DELETE old audit log (cleanup)
```

---

## 🔐 AUTHORIZATION RULES

| Endpoint | Superadmin | Admin Prodi | Dosen | Mahasiswa |
|----------|-----------|-----------|-------|-----------|
| GET all | ✅ | ✅ | ❌ | ❌ |
| GET by ID | ✅ | ✅ | ❌ | ❌ |
| GET by user | ✅ | ✅ | ❌ | ❌ |
| GET by event type | ✅ | ✅ | ❌ | ❌ |
| GET statistics | ✅ | ✅ | ❌ | ❌ |
| GET failed logins | ✅ | ✅ | ❌ | ❌ |
| DELETE cleanup | ✅ | ❌ | ❌ | ❌ |

---

## 🎯 COMMON ISSUES & SOLUTIONS

### **❌ Error: 401 Unauthorized**
**Solusi:**
- Pastikan token ada di Authorization header
- Format: `Bearer {{token}}`
- Jangan di Query Params atau Body

### **❌ Error: 403 Forbidden**
**Solusi:**
- Pastikan role Anda adalah Superadmin atau Admin Prodi
- Untuk DELETE, harus Superadmin

### **❌ Error: 404 Not Found**
**Solusi:**
- Pastikan ID yang digunakan benar
- Cek di STEP 2 untuk melihat ID yang tersedia

### **❌ Error: 400 Bad Request (Event Type)**
**Solusi:**
- Event type harus salah satu dari:
  - `login_success`
  - `login_failed`
  - `logout`
  - `token_refresh`
  - `account_locked`
  - `password_reset_req`
  - `password_changed`

---

## 💡 TIPS & TRICKS

### **1. Gunakan Environment Variables**
```
token = {{token}}
base_url = http://localhost:3000/api/v1/m2
```

### **2. Buat Collection dengan Pre-request Script**
```javascript
// Otomatis set Authorization header
pm.request.headers.add({
  key: 'Authorization',
  value: 'Bearer ' + pm.environment.get('token')
});
```

### **3. Pagination**
```
limit=50&offset=0   // Halaman 1
limit=50&offset=50  // Halaman 2
limit=50&offset=100 // Halaman 3
```

### **4. Time Range**
```
days=1   // 24 jam terakhir
days=7   // 7 hari terakhir
days=30  // 30 hari terakhir
days=90  // 90 hari terakhir
```

---

## 🚀 NEXT STEPS

Setelah testing audit log berhasil:

1. **Integrate ke Dashboard** - Tampilkan statistik login
2. **Setup Alerts** - Notifikasi jika ada brute force attack
3. **Export Reports** - Export audit log ke CSV/PDF
4. **Automated Cleanup** - Setup cron job untuk delete old logs

---

**Happy Testing!** 🎉

Jika ada pertanyaan, lihat `AUTH_AUDIT_LOG.md` untuk dokumentasi lengkap.
