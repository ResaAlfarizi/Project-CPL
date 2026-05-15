# Solusi: Token Tidak Valid

## Penyebab Umum dan Cara Mengatasinya

### 1. **Format Authorization Header Salah**
**Masalah**: Token dikirim dengan format yang salah

**Solusi**:
- ✅ **BENAR**: `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- ❌ **SALAH**: `Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (tanpa "Bearer")
- ❌ **SALAH**: `Authorization: Token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (gunakan "Bearer", bukan "Token")

**Di Postman**:
1. Buka tab **Authorization**
2. Pilih type **Bearer Token**
3. Paste token di field **Token**
4. Jangan di Query Params atau Header manual

---

### 2. **JWT_SECRET Tidak Konsisten**
**Masalah**: JWT_SECRET di `.env` berbeda dengan yang digunakan saat generate token

**Cara Cek**:
```bash
# Buka file .env
cat apps/backend/.env
```

Pastikan:
```
JWT_SECRET=secret123
```

**Jika berubah**:
1. Update `.env`
2. **Restart backend** (Ctrl+C, lalu `npm start` atau `npm run dev`)
3. Login ulang untuk mendapat token baru

---

### 3. **Token Sudah Kadaluarsa**
**Masalah**: Token berlaku hanya 1 jam (sesuai `expiresIn: "1h"` di jwt.js)

**Solusi**:
- Login ulang untuk mendapat token baru
- Atau ubah `expiresIn` di `apps/backend/module2/src/utils/jwt.js` jika ingin lebih lama

---

### 4. **Backend Belum Restart Setelah Perubahan .env**
**Masalah**: Perubahan di `.env` tidak terbaca karena backend masih running dengan config lama

**Solusi**:
1. Stop backend (Ctrl+C)
2. Restart: `npm start` atau `npm run dev`
3. Login ulang

---

### 5. **Database User Tidak Ada atau Password Salah**
**Masalah**: User tidak ditemukan di database atau password tidak sesuai

**Cara Cek**:
```sql
-- Cek user di database
SELECT id, email, nama_role FROM users;

-- Cek password hash
SELECT id, email, password_hash FROM users WHERE email = 'admin@example.com';
```

**Pastikan user sudah ada**:
```sql
-- Insert test user jika belum ada
INSERT INTO users (id, email, password_hash, role_id, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@example.com',
  '$2b$10$EawDMbamOlHASNWbvQmAWOP.hS3vDX88E/ZnqieV9/AYD7XIP45dC',
  (SELECT id FROM roles WHERE nama_role = 'Superadmin' LIMIT 1),
  NOW(),
  NOW()
);
```

---

## Langkah-Langkah Debugging

### Step 1: Verifikasi Login Berhasil
```
POST http://localhost:3000/api/v1/m2/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response yang benar**:
```json
{
  "message": "Login berhasil",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Jika error**:
- "User tidak ditemukan" → User belum ada di database
- "Password salah" → Password tidak sesuai
- Error lain → Cek console backend untuk detail

---

### Step 2: Copy Token dengan Benar
1. Copy seluruh string token dari response (tanpa tanda kutip)
2. Jangan tambah "Bearer" secara manual di Postman (Postman akan menambahnya otomatis)

---

### Step 3: Gunakan Token di Request Berikutnya
**Di Postman**:
1. Buka tab **Authorization**
2. Pilih type **Bearer Token**
3. Paste token di field **Token**
4. Klik **Send**

**Atau manual di Header**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### Step 4: Cek Response
**Jika berhasil**: Akan dapat data sesuai endpoint

**Jika "Token tidak valid"**:
- Cek format Authorization header (harus "Bearer <token>")
- Cek JWT_SECRET di `.env`
- Restart backend
- Login ulang

---

## Contoh Lengkap Testing di Postman

### 1. Login
```
POST http://localhost:3000/api/v1/m2/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "message": "Login berhasil",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1Njc4LWFiY2QtZWZnaC1pams..."
}
```

### 2. Copy Token dan Gunakan di Request Berikutnya
```
GET http://localhost:3000/api/v1/m2/kelas
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1Njc4LWFiY2QtZWZnaC1pams...
```

---

## Checklist Debugging

- [ ] Format Authorization header: `Bearer <token>` (bukan Query Params)
- [ ] JWT_SECRET di `.env` = `secret123`
- [ ] Backend sudah di-restart setelah perubahan `.env`
- [ ] User ada di database dengan password yang benar
- [ ] Token belum kadaluarsa (berlaku 1 jam)
- [ ] Copy token dengan benar (tanpa tanda kutip)
- [ ] Gunakan Bearer Token di Postman Authorization tab

---

## Jika Masih Error

1. **Cek console backend** untuk error message detail
2. **Cek database** apakah user dan role sudah ada
3. **Cek .env** apakah JWT_SECRET sudah benar
4. **Restart backend** dan login ulang
5. **Clear Postman cache** (Ctrl+Shift+Delete) dan coba lagi

---

## File yang Sudah Diupdate

- `apps/backend/module2/src/middlewares/authMiddleware.js` - Ditambah validasi format header dan error message lebih detail
- Middleware sekarang memberikan error message yang lebih spesifik untuk memudahkan debugging

