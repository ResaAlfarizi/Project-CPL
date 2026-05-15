# 🔐 FLOW AUTHENTICATION & TOKEN

## 📊 Diagram Alur Authentication

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                          │
└─────────────────────────────────────────────────────────────────┘

1. LOGIN
   ┌──────────────────────────────────────────────────────────┐
   │ POST /auth/login                                         │
   │ {                                                        │
   │   "email": "admin@if.ac.id",                            │
   │   "password": "password123"                             │
   │ }                                                        │
   └──────────────────────────────────────────────────────────┘
                            ↓
   ┌──────────────────────────────────────────────────────────┐
   │ authController.login()                                   │
   │ 1. Cari user di database                                │
   │ 2. Bandingkan password dengan hash                      │
   │ 3. Generate JWT token                                   │
   └──────────────────────────────────────────────────────────┘
                            ↓
   ┌──────────────────────────────────────────────────────────┐
   │ Response:                                                │
   │ {                                                        │
   │   "message": "Login berhasil",                          │
   │   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."   │
   │ }                                                        │
   └──────────────────────────────────────────────────────────┘


2. GUNAKAN TOKEN
   ┌──────────────────────────────────────────────────────────┐
   │ GET /kelas                                               │
   │ Headers:                                                 │
   │   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6... │
   └──────────────────────────────────────────────────────────┘
                            ↓
   ┌──────────────────────────────────────────────────────────┐
   │ authMiddleware()                                         │
   │ 1. Ambil Authorization header                           │
   │ 2. Validasi format: "Bearer <token>"                    │
   │ 3. Extract token                                        │
   │ 4. Verify token dengan JWT_SECRET                       │
   │ 5. Decode token → dapatkan user info                    │
   └──────────────────────────────────────────────────────────┘
                            ↓
   ┌──────────────────────────────────────────────────────────┐
   │ roleMiddleware()                                         │
   │ 1. Cek role user                                        │
   │ 2. Validasi akses ke endpoint                           │
   │ 3. Lanjut ke controller atau reject                     │
   └──────────────────────────────────────────────────────────┘
                            ↓
   ┌──────────────────────────────────────────────────────────┐
   │ kelasController.getKelas()                               │
   │ 1. Ambil data dari database                             │
   │ 2. Return response                                       │
   └──────────────────────────────────────────────────────────┘
                            ↓
   ┌──────────────────────────────────────────────────────────┐
   │ Response:                                                │
   │ {                                                        │
   │   "success": true,                                       │
   │   "message": "Data kelas berhasil diambil",             │
   │   "data": [...]                                          │
   │ }                                                        │
   └──────────────────────────────────────────────────────────┘
```

---

## 🔑 JWT Token Structure

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1Njc4LWFiY2QtZWZnaC1pams...
│                                      │                                          │
└──────────────────────────────────────┴──────────────────────────────────────────┘
         HEADER                              PAYLOAD                    SIGNATURE
         (Algorithm)                    (User Info + Expiry)         (Signed with SECRET)
```

### **Header:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

### **Payload:**
```json
{
  "id": "12345678-abcd-efgh-ijkl...",
  "role": "Admin Prodi",
  "iat": 1234567890,
  "exp": 1234571490
}
```

### **Signature:**
```
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  "secret123"
)
```

---

## 🛡️ Authorization Header Format

### **BENAR ✅**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **SALAH ❌**
```
Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
(Tanpa "Bearer")

Authorization: Token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
(Gunakan "Bearer", bukan "Token")

Authorization: Bearer
(Token kosong)

Query Params: ?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
(Jangan di Query Params)
```

---

## 🔄 Token Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                    TOKEN LIFECYCLE                          │
└─────────────────────────────────────────────────────────────┘

1. GENERATE (saat login)
   ├─ User login dengan email & password
   ├─ Password diverifikasi
   └─ JWT token di-generate dengan expiry 1 jam

2. STORE (di client)
   ├─ Token disimpan di localStorage / sessionStorage
   ├─ Atau di memory (lebih aman)
   └─ Jangan di cookie (kecuali httpOnly)

3. SEND (di setiap request)
   ├─ Token dikirim di Authorization header
   ├─ Format: "Bearer <token>"
   └─ Jangan di Query Params atau Body

4. VERIFY (di server)
   ├─ Middleware extract token dari header
   ├─ Verify signature dengan JWT_SECRET
   ├─ Cek expiry time
   └─ Decode payload → dapatkan user info

5. USE (di controller)
   ├─ Gunakan user info dari req.user
   ├─ Cek role untuk authorization
   └─ Proses request

6. EXPIRE (setelah 1 jam)
   ├─ Token tidak bisa digunakan lagi
   ├─ User harus login ulang
   └─ Dapatkan token baru
```

---

## ⚠️ Error Scenarios

### **Scenario 1: Token Tidak Ada**
```
Request:
GET /kelas
(Tanpa Authorization header)

Response:
401 Unauthorized
{
  "message": "Token tidak ada"
}
```

### **Scenario 2: Format Header Salah**
```
Request:
GET /kelas
Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
(Tanpa "Bearer")

Response:
401 Unauthorized
{
  "message": "Format Authorization header salah. Gunakan: Bearer <token>"
}
```

### **Scenario 3: Token Invalid**
```
Request:
GET /kelas
Authorization: Bearer invalid_token_xyz

Response:
401 Unauthorized
{
  "message": "Token tidak valid"
}
```

### **Scenario 4: Token Expired**
```
Request:
GET /kelas
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
(Token sudah lebih dari 1 jam)

Response:
401 Unauthorized
{
  "message": "Token sudah kadaluarsa"
}
```

### **Scenario 5: Role Tidak Punya Akses**
```
Request:
GET /kelas (Superadmin only)
Authorization: Bearer <mahasiswa_token>

Response:
403 Forbidden
{
  "message": "Anda tidak memiliki akses ke resource ini"
}
```

---

## 🔐 Security Best Practices

### **1. JWT_SECRET**
- ✅ Simpan di `.env` (jangan di code)
- ✅ Gunakan secret yang kuat (minimal 32 karakter)
- ✅ Jangan share secret dengan orang lain
- ❌ Jangan hardcode di code

### **2. Token Storage (Client)**
- ✅ localStorage (untuk web app)
- ✅ sessionStorage (untuk session-based)
- ✅ Memory (paling aman, tapi hilang saat refresh)
- ❌ Cookie (kecuali httpOnly + Secure)

### **3. Token Transmission**
- ✅ HTTPS (enkripsi data in transit)
- ✅ Authorization header (standard)
- ✅ Bearer token format (standard)
- ❌ HTTP (tidak aman)
- ❌ Query params (bisa di-log)

### **4. Token Expiry**
- ✅ Set expiry time (1 jam)
- ✅ Implement refresh token (optional)
- ✅ Force re-login setelah expiry
- ❌ Token yang tidak pernah expire

### **5. Password Hashing**
- ✅ Gunakan bcrypt (sudah diimplementasi)
- ✅ Salt rounds: 10 (sudah diimplementasi)
- ❌ Plain text password
- ❌ Simple hash (MD5, SHA1)

---

## 📋 Checklist Testing

- [ ] Login berhasil dapat token
- [ ] Token format: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- [ ] Authorization header: `Bearer <token>`
- [ ] Request berhasil dengan token
- [ ] Request gagal tanpa token (401)
- [ ] Request gagal dengan token salah (401)
- [ ] Request gagal dengan role tidak punya akses (403)
- [ ] Token expired setelah 1 jam

---

## 🔗 File Terkait

- `apps/backend/module2/src/utils/jwt.js` - JWT generation & verification
- `apps/backend/module2/src/utils/bcrypt.js` - Password hashing
- `apps/backend/module2/src/middlewares/authMiddleware.js` - Token validation
- `apps/backend/module2/src/middlewares/roleMiddleware.js` - Role-based access
- `apps/backend/module2/src/controllers/authController.js` - Login & register

---

## 📚 Dokumentasi Terkait

- **SOLUSI_TOKEN_TIDAK_VALID.md** - Troubleshooting
- **POSTMAN_TESTING_GUIDE.md** - Testing di Postman
- **DOKUMENTASI_LENGKAP.md** - Dokumentasi lengkap

