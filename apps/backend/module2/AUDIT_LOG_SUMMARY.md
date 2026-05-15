# 🔐 AUTH AUDIT LOG - COMPLETE SUMMARY

Ringkasan lengkap fitur Auth Audit Log untuk testing dan implementasi.

---

## 📌 QUICK OVERVIEW

**Auth Audit Log** adalah fitur untuk tracking semua aktivitas autentikasi pengguna.

### **Apa yang di-track?**
- ✅ Login berhasil
- ✅ Login gagal
- ✅ Logout
- ✅ Token refresh
- ✅ Account locked
- ✅ Password reset request
- ✅ Password changed

### **Siapa yang bisa akses?**
- ✅ Superadmin (Read + Delete)
- ✅ Admin Prodi (Read only)
- ❌ Dosen (No access)
- ❌ Mahasiswa (No access)

---

## 🚀 QUICK START (3 MENIT)

### **Step 1: Login**
```http
POST http://localhost:3000/api/v1/m2/auth/login
Content-Type: application/json

{
  "email": "admin@if.ac.id",
  "password": "password123"
}
```

### **Step 2: Lihat Audit Log**
```http
GET http://localhost:3000/api/v1/m2/auth-audit-log
Authorization: Bearer {{token}}
```

### **Step 3: Lihat Statistik**
```http
GET http://localhost:3000/api/v1/m2/auth-audit-log/statistics/login?days=7
Authorization: Bearer {{token}}
```

---

## 📚 DOKUMENTASI FILES

| File | Deskripsi | Waktu |
|------|-----------|-------|
| **AUTH_AUDIT_LOG.md** | Dokumentasi lengkap fitur | 15 min |
| **QUICK_TESTING_AUDITLOG.md** | Panduan testing step-by-step | 15 min |
| **POSTMAN_AUDITLOG_COLLECTION.md** | Setup Postman collection | 10 min |
| **AUDIT_LOG_SUMMARY.md** | File ini - ringkasan cepat | 5 min |

---

## 🔗 7 ENDPOINTS

### **1️⃣ GET Semua Audit Log**
```http
GET http://localhost:3000/api/v1/m2/auth-audit-log?limit=100&offset=0
Authorization: Bearer {{token}}
```
**Akses:** Superadmin, Admin Prodi

---

### **2️⃣ GET Audit Log by ID**
```http
GET http://localhost:3000/api/v1/m2/auth-audit-log/1
Authorization: Bearer {{token}}
```
**Akses:** Superadmin, Admin Prodi

---

### **3️⃣ GET Audit Log by User**
```http
GET http://localhost:3000/api/v1/m2/auth-audit-log/user/{user_id}?limit=100&offset=0
Authorization: Bearer {{token}}
```
**Akses:** Superadmin, Admin Prodi

---

### **4️⃣ GET Audit Log by Event Type**
```http
GET http://localhost:3000/api/v1/m2/auth-audit-log/event/{event_type}?limit=100&offset=0
Authorization: Bearer {{token}}
```

**Valid Event Types:**
- `login_success` - Login berhasil
- `login_failed` - Login gagal
- `logout` - Logout
- `token_refresh` - Token di-refresh
- `account_locked` - Account dikunci
- `password_reset_req` - Request reset password
- `password_changed` - Password diubah

**Akses:** Superadmin, Admin Prodi

---

### **5️⃣ GET Login Statistics**
```http
GET http://localhost:3000/api/v1/m2/auth-audit-log/statistics/login?days=7
Authorization: Bearer {{token}}
```

**Query Parameters:**
- `days=1` - 24 jam terakhir
- `days=7` - 7 hari terakhir (default)
- `days=30` - 30 hari terakhir
- `days=90` - 90 hari terakhir

**Response:**
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

**Akses:** Superadmin, Admin Prodi

---

### **6️⃣ GET Users with Most Failed Logins**
```http
GET http://localhost:3000/api/v1/m2/auth-audit-log/statistics/failed-logins?days=7&limit=10
Authorization: Bearer {{token}}
```

**Query Parameters:**
- `days=7` - 7 hari terakhir (default)
- `limit=10` - Top 10 users (default)

**Response:**
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

**Akses:** Superadmin, Admin Prodi

---

### **7️⃣ DELETE Old Audit Log (Cleanup)**
```http
DELETE http://localhost:3000/api/v1/m2/auth-audit-log/cleanup?days=90
Authorization: Bearer {{token}}
```

**Query Parameters:**
- `days=90` - Hapus log lebih dari 90 hari (default)

**Response:**
```json
{
  "success": true,
  "message": "Berhasil menghapus auth audit log lebih dari 90 hari",
  "data": {
    "deleted_count": 1523
  }
}
```

**⚠️ Akses:** Superadmin ONLY

---

## 🔄 AUTOMATIC LOGGING

Audit log **otomatis dibuat** saat:

### **Login Berhasil**
```javascript
// Otomatis di authController.js
await createAuthAuditLog(
  user.id,
  'login_success',
  req.ip,
  req.get('user-agent'),
  { email }
);
```

### **Login Gagal**
```javascript
// Otomatis di authController.js
await createAuthAuditLog(
  user.id,
  'login_failed',
  req.ip,
  req.get('user-agent'),
  { reason: 'wrong_password', email }
);
```

---

## 📊 RESPONSE FORMAT

### **Audit Log Record**
```json
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
```

### **Fields:**
- `id` - Unique identifier
- `user_id` - UUID of user
- `event_type` - Type of event
- `ip_address` - IP address of request
- `user_agent` - Browser/device info
- `detail` - Additional info (JSON string)
- `created_at` - Timestamp
- `user_email` - Email of user (from join)
- `user_name` - Name of user (from join)

---

## 🎯 USE CASES

### **1. Monitor Login Activity**
```http
GET /auth-audit-log/statistics/login?days=30
```
Lihat trend login dalam 30 hari terakhir.

### **2. Detect Brute Force Attack**
```http
GET /auth-audit-log/statistics/failed-logins?days=1&limit=20
```
Lihat user dengan failed login terbanyak dalam 24 jam.

### **3. Audit User Activity**
```http
GET /auth-audit-log/user/{user_id}?limit=100
```
Lihat semua aktivitas autentikasi user tertentu.

### **4. Track Failed Logins**
```http
GET /auth-audit-log/event/login_failed?limit=100
```
Lihat semua login gagal.

### **5. Cleanup Old Logs**
```http
DELETE /auth-audit-log/cleanup?days=90
```
Hapus log lebih dari 90 hari (maintenance).

---

## ✅ TESTING CHECKLIST

```
✅ Step 1: Login (create audit log otomatis)
✅ Step 2: GET semua audit log
✅ Step 3: GET audit log by ID
✅ Step 4: GET audit log by user
✅ Step 5A: GET audit log by event type (login_success)
✅ Step 5B: GET audit log by event type (login_failed)
✅ Step 6: GET login statistics
✅ Step 7: GET users with most failed logins
✅ Step 8: DELETE old audit log (cleanup)
```

---

## 🔐 AUTHORIZATION MATRIX

| Endpoint | Superadmin | Admin Prodi | Dosen | Mahasiswa |
|----------|-----------|-----------|-------|-----------|
| GET all | ✅ | ✅ | ❌ | ❌ |
| GET by ID | ✅ | ✅ | ❌ | ❌ |
| GET by user | ✅ | ✅ | ❌ | ❌ |
| GET by event | ✅ | ✅ | ❌ | ❌ |
| GET statistics | ✅ | ✅ | ❌ | ❌ |
| GET failed logins | ✅ | ✅ | ❌ | ❌ |
| DELETE cleanup | ✅ | ❌ | ❌ | ❌ |

---

## 🛠️ IMPLEMENTATION DETAILS

### **Database Table**
```sql
CREATE TABLE auth_audit_log (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  detail JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### **Model Functions**
- `getAllAuthAuditLog(limit, offset)` - Get all logs
- `getAuthAuditLogById(id)` - Get by ID
- `getAuthAuditLogByUserId(user_id, limit, offset)` - Get by user
- `getAuthAuditLogByEventType(event_type, limit, offset)` - Get by event
- `getLoginStatistics(days)` - Get statistics
- `getUsersWithMostFailedLogins(days, limit)` - Get failed logins
- `deleteOldAuthAuditLog(days)` - Delete old logs
- `createAuthAuditLog(user_id, event_type, ip, user_agent, detail)` - Create log

### **Controller Functions**
- `getAllAuthAuditLogHandler` - Handle GET all
- `getAuthAuditLogByIdHandler` - Handle GET by ID
- `getAuthAuditLogByUserHandler` - Handle GET by user
- `getAuthAuditLogByEventTypeHandler` - Handle GET by event
- `getLoginStatisticsHandler` - Handle GET statistics
- `getUsersWithMostFailedLoginsHandler` - Handle GET failed logins
- `deleteOldAuthAuditLogHandler` - Handle DELETE cleanup

---

## 📁 FILES LOCATION

```
apps/backend/module2/
├── src/
│   ├── models/authAuditLogModel.js
│   ├── controllers/authAuditLogController.js
│   ├── routes/authAuditLogRoutes.js
│   └── controllers/authController.js (updated with logging)
│
├── AUTH_AUDIT_LOG.md (dokumentasi lengkap)
├── QUICK_TESTING_AUDITLOG.md (panduan testing)
├── POSTMAN_AUDITLOG_COLLECTION.md (Postman setup)
└── AUDIT_LOG_SUMMARY.md (file ini)
```

---

## 🚀 NEXT STEPS

1. **Read Documentation**
   - Baca `AUTH_AUDIT_LOG.md` untuk detail lengkap
   - Baca `QUICK_TESTING_AUDITLOG.md` untuk testing

2. **Setup Postman**
   - Follow `POSTMAN_AUDITLOG_COLLECTION.md`
   - Buat 8 requests sesuai panduan

3. **Test All Endpoints**
   - Run login request
   - Test semua 7 endpoints
   - Verify response format

4. **Integrate to Dashboard**
   - Display login statistics
   - Show failed login alerts
   - Create audit log viewer

---

## 💡 TIPS

### **1. Auto-Save Token di Postman**
Tambah Tests di login request:
```javascript
if (pm.response.code === 200) {
  var jsonData = pm.response.json();
  pm.environment.set("token", jsonData.data.token);
}
```

### **2. Pagination**
```
limit=50&offset=0   // Halaman 1
limit=50&offset=50  // Halaman 2
limit=50&offset=100 // Halaman 3
```

### **3. Time Range**
```
days=1   // 24 jam terakhir
days=7   // 7 hari terakhir
days=30  // 30 hari terakhir
days=90  // 90 hari terakhir
```

---

## ⚠️ COMMON ERRORS

### **401 Unauthorized**
- ❌ Token tidak ada di Authorization header
- ✅ Format: `Bearer {{token}}`

### **403 Forbidden**
- ❌ Role tidak memiliki akses
- ✅ Gunakan Superadmin atau Admin Prodi

### **404 Not Found**
- ❌ ID tidak ditemukan
- ✅ Cek ID di GET all endpoint

### **400 Bad Request**
- ❌ Event type tidak valid
- ✅ Gunakan salah satu dari 7 event types

---

## 📞 SUPPORT

Jika ada pertanyaan:
1. Baca `AUTH_AUDIT_LOG.md` - Jawaban untuk 90% pertanyaan
2. Lihat `QUICK_TESTING_AUDITLOG.md` - Panduan step-by-step
3. Cek `POSTMAN_AUDITLOG_COLLECTION.md` - Setup Postman

---

**Auth Audit Log siap digunakan!** 🎉

**Mulai dari:** QUICK_TESTING_AUDITLOG.md
