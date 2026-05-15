# 🔧 PERBAIKAN: Token Tidak Valid

## Masalah yang Ditemukan

Ketika user mencoba menggunakan token untuk mengakses endpoint yang memerlukan authentication, menerima error:
```
"Token tidak valid"
```

Padahal token sudah berhasil didapat dari login.

---

## Root Cause Analysis

### **Penyebab Utama:**

1. **Middleware tidak validasi format header dengan ketat**
   - Middleware hanya split header tanpa cek apakah format benar
   - Jika header format salah, `token` bisa menjadi `undefined`
   - `jwt.verify(undefined, secret)` akan throw error "Token tidak valid"

2. **Error message tidak spesifik**
   - Semua error JWT di-catch dengan message yang sama
   - Sulit untuk debugging apakah masalah di format, secret, atau token expired

3. **Tidak ada validasi Bearer prefix**
   - Middleware tidak cek apakah header dimulai dengan "Bearer"
   - Bisa menerima format yang salah seperti "Token <token>" atau hanya "<token>"

---

## Solusi yang Diterapkan

### **File yang Diupdate:**
`apps/backend/module2/src/middlewares/authMiddleware.js`

### **Perubahan:**

#### **Sebelum:**
```javascript
const token = authHeader.split(" ")[1];

const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

#### **Sesudah:**
```javascript
// Extract token from "Bearer <token>" format
const parts = authHeader.split(" ");

if (parts.length !== 2 || parts[0] !== "Bearer") {
  return res.status(401).json({
    message: "Format Authorization header salah. Gunakan: Bearer <token>",
  });
}

const token = parts[1];

if (!token) {
  return res.status(401).json({
    message: "Token tidak ada",
  });
}

const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

### **Improvement:**

1. ✅ **Validasi format header** - Cek apakah ada 2 parts (Bearer + token)
2. ✅ **Validasi Bearer prefix** - Cek apakah prefix adalah "Bearer"
3. ✅ **Validasi token tidak kosong** - Cek apakah token ada
4. ✅ **Error message lebih spesifik** - Membedakan antara:
   - "Token tidak ada" - Header tidak ada
   - "Format Authorization header salah" - Format header salah
   - "Token sudah kadaluarsa" - Token expired
   - "Token tidak valid" - Token invalid/corrupted

---

## Cara Menggunakan Token dengan Benar

### **Format yang BENAR:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Format yang SALAH:**
```
Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  ❌ (tanpa Bearer)
Authorization: Token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  ❌ (gunakan Bearer)
Authorization: Bearer  ❌ (token kosong)
```

### **Di Postman:**
1. Buka tab **Authorization**
2. Pilih type **Bearer Token**
3. Paste token di field **Token**
4. Postman akan otomatis menambahkan "Bearer " prefix

---

## Testing Perbaikan

### **Step 1: Login**
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

### **Step 2: Copy Token**
Copy seluruh string token (tanpa tanda kutip)

### **Step 3: Gunakan Token**
```http
GET http://localhost:3000/api/v1/m2/kelas
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response yang diharapkan:**
```json
{
  "success": true,
  "message": "Data kelas berhasil diambil",
  "data": [...]
}
```

---

## Checklist Debugging Jika Masih Error

- [ ] Restart backend setelah update middleware
- [ ] Login ulang untuk mendapat token baru
- [ ] Gunakan format `Authorization: Bearer <token>` (bukan Query Params)
- [ ] Pastikan JWT_SECRET di `.env` = `secret123`
- [ ] Pastikan token belum expired (berlaku 1 jam)
- [ ] Copy token dengan benar (tanpa tanda kutip)
- [ ] Cek console backend untuk error message detail

---

## File Dokumentasi Terkait

- **SOLUSI_TOKEN_TIDAK_VALID.md** - Panduan lengkap troubleshooting
- **POSTMAN_TESTING_GUIDE.md** - Cara test di Postman dengan benar
- **SOLUSI_401_UNAUTHORIZED.md** - Solusi untuk error 401

---

## Kesimpulan

Perbaikan ini membuat middleware lebih robust dan error message lebih informatif, sehingga memudahkan debugging ketika ada masalah dengan token.

**Jika masih ada error, baca SOLUSI_TOKEN_TIDAK_VALID.md untuk panduan lengkap.**

