# 📮 POSTMAN COLLECTION - AUTH AUDIT LOG

Panduan untuk import dan menggunakan Postman Collection untuk Auth Audit Log.

---

## 📥 CARA IMPORT COLLECTION

### **Option 1: Manual Create (Recommended untuk Pemula)**

1. **Buka Postman**
2. **Buat Folder Baru:**
   - Klik `+` → `New Collection`
   - Nama: `Auth Audit Log Testing`
   - Klik `Create`

3. **Buat Environment Variable:**
   - Klik `Environments` (kiri atas)
   - Klik `+` → `Create New`
   - Nama: `CPL Module 2`
   - Tambah variable:
     ```
     Variable: token
     Initial Value: (kosong)
     Current Value: (kosong)
     ```
   - Klik `Save`

4. **Pilih Environment:**
   - Klik dropdown environment (kanan atas)
   - Pilih `CPL Module 2`

---

## 🔑 REQUEST 1: LOGIN

**Folder:** Auth Audit Log Testing

**Request Name:** 1. Login

```http
POST http://localhost:3000/api/v1/m2/auth/login
Content-Type: application/json

{
  "email": "admin@if.ac.id",
  "password": "password123"
}
```

**Pre-request Script:**
```javascript
// Tidak ada
```

**Tests (untuk auto-save token):**
```javascript
if (pm.response.code === 200) {
  var jsonData = pm.response.json();
  pm.environment.set("token", jsonData.data.token);
  console.log("✅ Token saved to environment");
}
```

**Expected Response:**
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

---

## 📊 REQUEST 2: GET ALL AUDIT LOG

**Request Name:** 2. GET All Audit Log

```http
GET http://localhost:3000/api/v1/m2/auth-audit-log?limit=100&offset=0
Authorization: Bearer {{token}}
```

**Pre-request Script:**
```javascript
// Tidak ada
```

**Tests:**
```javascript
pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("Response has data array", function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.data).to.be.an('array');
});
```

---

## 🔍 REQUEST 3: GET AUDIT LOG BY ID

**Request Name:** 3. GET Audit Log by ID

```http
GET http://localhost:3000/api/v1/m2/auth-audit-log/1
Authorization: Bearer {{token}}
```

**Pre-request Script:**
```javascript
// Tidak ada
```

---

## 👤 REQUEST 4: GET AUDIT LOG BY USER

**Request Name:** 4. GET Audit Log by User

```http
GET http://localhost:3000/api/v1/m2/auth-audit-log/user/{{user_id}}?limit=100&offset=0
Authorization: Bearer {{token}}
```

**Catatan:**
- Ganti `{{user_id}}` dengan user_id dari REQUEST 2
- Atau set environment variable `user_id`

---

## 📌 REQUEST 5A: GET AUDIT LOG - LOGIN SUCCESS

**Request Name:** 5A. GET Audit Log - Login Success

```http
GET http://localhost:3000/api/v1/m2/auth-audit-log/event/login_success?limit=100&offset=0
Authorization: Bearer {{token}}
```

---

## 📌 REQUEST 5B: GET AUDIT LOG - LOGIN FAILED

**Request Name:** 5B. GET Audit Log - Login Failed

**Step 1: Coba Login dengan Password Salah**
```http
POST http://localhost:3000/api/v1/m2/auth/login
Content-Type: application/json

{
  "email": "admin@if.ac.id",
  "password": "wrongpassword"
}
```

**Step 2: GET Login Failed Logs**
```http
GET http://localhost:3000/api/v1/m2/auth-audit-log/event/login_failed?limit=100&offset=0
Authorization: Bearer {{token}}
```

---

## 📈 REQUEST 6: GET LOGIN STATISTICS

**Request Name:** 6. GET Login Statistics

```http
GET http://localhost:3000/api/v1/m2/auth-audit-log/statistics/login?days=7
Authorization: Bearer {{token}}
```

**Query Parameters:**
- `days=1` - 24 jam terakhir
- `days=7` - 7 hari terakhir (default)
- `days=30` - 30 hari terakhir
- `days=90` - 90 hari terakhir

---

## ⚠️ REQUEST 7: GET USERS WITH MOST FAILED LOGINS

**Request Name:** 7. GET Users with Most Failed Logins

```http
GET http://localhost:3000/api/v1/m2/auth-audit-log/statistics/failed-logins?days=7&limit=10
Authorization: Bearer {{token}}
```

**Query Parameters:**
- `days=1` - 24 jam terakhir
- `days=7` - 7 hari terakhir (default)
- `limit=10` - Top 10 users (default)

---

## 🗑️ REQUEST 8: DELETE OLD AUDIT LOG

**Request Name:** 8. DELETE Old Audit Log (Cleanup)

```http
DELETE http://localhost:3000/api/v1/m2/auth-audit-log/cleanup?days=90
Authorization: Bearer {{token}}
```

**⚠️ CATATAN:**
- Hanya Superadmin yang bisa delete
- Akan menghapus log lebih dari 90 hari

---

## 🎯 TESTING WORKFLOW

### **Workflow 1: Basic Testing**
1. Run REQUEST 1 (Login) → Token auto-saved
2. Run REQUEST 2 (GET All) → Lihat semua logs
3. Run REQUEST 3 (GET by ID) → Lihat detail 1 log
4. Run REQUEST 6 (Statistics) → Lihat statistik

### **Workflow 2: Event Type Testing**
1. Run REQUEST 1 (Login) → Create login_success log
2. Run REQUEST 5A (Login Success) → Lihat login_success logs
3. Run REQUEST 5B (Login Failed) → Coba login gagal, lihat logs

### **Workflow 3: Security Testing**
1. Run REQUEST 7 (Failed Logins) → Lihat user dengan failed login terbanyak
2. Run REQUEST 8 (Cleanup) → Delete old logs

---

## 📋 COLLECTION STRUCTURE

```
Auth Audit Log Testing
├── 1. Login
├── 2. GET All Audit Log
├── 3. GET Audit Log by ID
├── 4. GET Audit Log by User
├── 5A. GET Audit Log - Login Success
├── 5B. GET Audit Log - Login Failed
├── 6. GET Login Statistics
├── 7. GET Users with Most Failed Logins
└── 8. DELETE Old Audit Log (Cleanup)
```

---

## 🔐 AUTHORIZATION SETUP

### **Method 1: Header (Recommended)**
```
Authorization: Bearer {{token}}
```

### **Method 2: Postman Auth Tab**
1. Klik tab `Authorization`
2. Pilih type: `Bearer Token`
3. Token: `{{token}}`

---

## 💡 POSTMAN TIPS

### **1. Auto-Save Token**
Tambah Tests di REQUEST 1:
```javascript
if (pm.response.code === 200) {
  var jsonData = pm.response.json();
  pm.environment.set("token", jsonData.data.token);
}
```

### **2. Pre-request Script untuk Auto-Login**
Tambah di collection level:
```javascript
// Jika token expired, auto-login
if (!pm.environment.get("token")) {
  console.log("Token tidak ada, silakan login dulu");
}
```

### **3. Assertions/Tests**
```javascript
// Check status code
pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

// Check response structure
pm.test("Response has success field", function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData).to.have.property('success');
});

// Check data type
pm.test("Data is array", function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.data).to.be.an('array');
});
```

### **4. Visualize Response**
Tambah di Tests:
```javascript
pm.visualizer.set(pm.response.text());
```

---

## 🚀 QUICK START

1. **Buka Postman**
2. **Buat Collection:** `Auth Audit Log Testing`
3. **Buat Environment:** `CPL Module 2` dengan variable `token`
4. **Tambah 8 Requests** sesuai panduan di atas
5. **Run REQUEST 1** (Login) → Token auto-saved
6. **Run REQUEST 2-8** untuk testing

---

## ✅ VALIDATION CHECKLIST

```
✅ REQUEST 1: Login berhasil, token tersimpan
✅ REQUEST 2: GET all logs berhasil
✅ REQUEST 3: GET by ID berhasil
✅ REQUEST 4: GET by user berhasil
✅ REQUEST 5A: GET login_success berhasil
✅ REQUEST 5B: GET login_failed berhasil
✅ REQUEST 6: GET statistics berhasil
✅ REQUEST 7: GET failed logins berhasil
✅ REQUEST 8: DELETE cleanup berhasil (Superadmin only)
```

---

## 🎓 LEARNING RESOURCES

- **REST API Basics:** https://www.postman.com/api-platform/api-testing/
- **Postman Collections:** https://learning.postman.com/docs/collections/collections-overview/
- **Environment Variables:** https://learning.postman.com/docs/sending-requests/managing-environments/
- **Tests & Assertions:** https://learning.postman.com/docs/writing-scripts/test-scripts/

---

**Happy Testing!** 🎉

Untuk dokumentasi lengkap, lihat `AUTH_AUDIT_LOG.md` dan `QUICK_TESTING_AUDITLOG.md`
