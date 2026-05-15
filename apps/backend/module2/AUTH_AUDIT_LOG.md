# 🔐 AUTH AUDIT LOG - MODULE 2

Dokumentasi untuk fitur Auth Audit Log (tracking autentikasi).

---

## 📋 DESKRIPSI

Auth Audit Log adalah fitur untuk tracking semua aktivitas autentikasi seperti:
- Login berhasil
- Login gagal
- Logout
- Token refresh
- Account locked
- Password reset request
- Password changed

---

## 📊 EVENT TYPES

| Event Type | Deskripsi |
|------------|-----------|
| `login_success` | Login berhasil |
| `login_failed` | Login gagal (user tidak ditemukan atau password salah) |
| `logout` | User logout |
| `token_refresh` | Token di-refresh |
| `account_locked` | Account dikunci karena terlalu banyak login gagal |
| `password_reset_req` | Request reset password |
| `password_changed` | Password berhasil diubah |

---

## 🔗 ENDPOINTS

### **1. GET Semua Auth Audit Log**
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

---

### **2. GET Auth Audit Log by ID**
```http
GET http://localhost:3000/api/v1/m2/auth-audit-log/{id}
Authorization: Bearer {{token}}
```

---

### **3. GET Auth Audit Log by User**
```http
GET http://localhost:3000/api/v1/m2/auth-audit-log/user/{user_id}?limit=100&offset=0
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
      "created_at": "2024-01-01T10:00:00.000Z"
    }
  ]
}
```

---

### **4. GET Auth Audit Log by Event Type**
```http
GET http://localhost:3000/api/v1/m2/auth-audit-log/event/{event_type}?limit=100&offset=0
Authorization: Bearer {{token}}
```

**Contoh:**
```http
GET http://localhost:3000/api/v1/m2/auth-audit-log/event/login_failed?limit=50&offset=0
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

### **5. GET Login Statistics**
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
      "successful_logins": 45,
      "failed_logins": 5,
      "account_locked": 1
    },
    {
      "date": "2024-01-06",
      "successful_logins": 38,
      "failed_logins": 3,
      "account_locked": 0
    }
  ]
}
```

---

### **6. GET Users with Most Failed Logins**
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
      "email": "user@example.com",
      "failed_attempts": 12,
      "last_failed_attempt": "2024-01-07T15:30:00.000Z"
    }
  ]
}
```

---

### **7. DELETE Old Auth Audit Log (Cleanup)**
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
    "deleted_count": 1523
  }
}
```

---

## 🔐 MATRIK AKSES

| Role | Read | Delete |
|------|------|--------|
| Superadmin | ✅ | ✅ |
| Admin Prodi | ✅ | ❌ |
| Dosen | ❌ | ❌ |
| Mahasiswa | ❌ | ❌ |

---

## 🔄 AUTOMATIC LOGGING

Auth audit log akan **otomatis dibuat** saat:

### **1. Login Berhasil**
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

### **2. Login Gagal**
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

## 📝 DETAIL FIELD

Field `detail` berisi informasi tambahan dalam format JSON:

### **Login Success:**
```json
{
  "email": "admin@if.ac.id"
}
```

### **Login Failed:**
```json
{
  "reason": "wrong_password",
  "email": "admin@if.ac.id"
}
```

atau

```json
{
  "reason": "user_not_found",
  "email": "unknown@example.com"
}
```

---

## 📊 USE CASES

### **1. Monitoring Login Activity**
```http
GET /auth-audit-log/statistics/login?days=30
```
Untuk melihat trend login dalam 30 hari terakhir.

### **2. Detect Brute Force Attack**
```http
GET /auth-audit-log/statistics/failed-logins?days=1&limit=20
```
Untuk melihat user dengan login gagal terbanyak dalam 24 jam terakhir.

### **3. Audit User Activity**
```http
GET /auth-audit-log/user/{user_id}?limit=100
```
Untuk melihat semua aktivitas autentikasi user tertentu.

### **4. Track Failed Logins**
```http
GET /auth-audit-log/event/login_failed?limit=100
```
Untuk melihat semua login gagal.

### **5. Cleanup Old Logs**
```http
DELETE /auth-audit-log/cleanup?days=90
```
Untuk menghapus log lebih dari 90 hari (maintenance).

---

## 🔍 QUERY PARAMETERS

### **Pagination:**
- `limit` - Jumlah data per halaman (default: 100)
- `offset` - Offset data (default: 0)

### **Time Range:**
- `days` - Jumlah hari ke belakang (default: 7)

**Contoh:**
```http
GET /auth-audit-log?limit=50&offset=100
GET /auth-audit-log/statistics/login?days=30
GET /auth-audit-log/statistics/failed-logins?days=7&limit=20
```

---

## ⚠️ SECURITY NOTES

1. **IP Address Tracking** - Semua login di-track dengan IP address
2. **User Agent Tracking** - Browser/device info disimpan
3. **Failed Login Detection** - Bisa detect brute force attack
4. **Account Locking** - Otomatis lock account setelah 5x login gagal (handled by database function)

---

## 📈 DASHBOARD METRICS

Gunakan endpoint statistics untuk membuat dashboard:

### **Login Success Rate:**
```
success_rate = successful_logins / (successful_logins + failed_logins) * 100%
```

### **Security Alerts:**
- User dengan > 5 failed logins dalam 1 jam
- Account locked events
- Login dari IP address yang tidak biasa

---

## ✅ CHECKLIST TESTING

- [ ] GET semua auth audit log
- [ ] GET auth audit log by ID
- [ ] GET auth audit log by user
- [ ] GET auth audit log by event type (login_success)
- [ ] GET auth audit log by event type (login_failed)
- [ ] GET login statistics (7 days)
- [ ] GET users with most failed logins
- [ ] DELETE old auth audit log (cleanup)
- [ ] Verify automatic logging saat login berhasil
- [ ] Verify automatic logging saat login gagal

---

## 🚀 CARA TESTING

### **Step 1: Login (akan create audit log otomatis)**
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

**Auth Audit Log siap digunakan!** 🎉

**Total Endpoints:** 7 endpoints
