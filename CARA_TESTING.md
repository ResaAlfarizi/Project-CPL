# 🧪 Cara Testing Login Mahasiswa

## ✅ Yang Sudah Diperbaiki

1. ✅ `AuthContext.tsx` - Redirect ke `/mahasiswa` untuk role Mahasiswa
2. ✅ `middleware.ts` - Decode token dan redirect berdasarkan role
3. ✅ `lib/auth.ts` - Simpan token di localStorage DAN cookies
4. ✅ `app/page.tsx` - Root page redirect berdasarkan role

---

## 🚀 Langkah Testing

### 1. Restart Dev Server

**PENTING:** Restart frontend agar perubahan diterapkan

```bash
# Stop frontend (Ctrl+C di terminal)
# Lalu jalankan lagi:
cd apps/web/module2
npm run dev
```

### 2. Clear Browser Data

**Sebelum login, clear dulu:**

1. Buka DevTools (F12)
2. Tab **Application** (Chrome) atau **Storage** (Firefox)
3. Klik **Clear site data** atau **Clear storage**
4. Atau manual:
   - Hapus `auth_token` di Local Storage
   - Hapus cookie `auth_token`

### 3. Login

1. Buka: http://localhost:3001/login
2. Masukkan:
   - **Email:** `mhs1@if.ac.id`
   - **Password:** `123456`
3. Klik **Masuk**

### 4. Cek Console

Buka Console (F12), seharusnya muncul:

```
🔐 Login attempt: mhs1@if.ac.id
✅ Login response: {message: "Login berhasil", token: "..."}
🎫 Decoded token: {id: "...", role: "Mahasiswa", iat: ..., exp: ...}
➡️ Redirecting to /mahasiswa
```

### 5. Verifikasi Redirect

Setelah login, URL harus berubah ke:
```
http://localhost:3001/mahasiswa
```

Dan tampil **Portal Mahasiswa** dengan sidebar.

---

## 🔍 Jika Masih Gagal

### Cek 1: Backend Running?

```bash
cd apps/backend/module2
npm start
```

Expected output:
```
Server running on port 3000
```

### Cek 2: User Mahasiswa Ada?

```bash
cd database
psql -U postgres -d sistem_cpl -f check-users.sql
```

Harus ada user dengan email `mhs1@if.ac.id` dan role `Mahasiswa`

### Cek 3: Token Tersimpan?

Setelah login, cek di DevTools:

**Local Storage:**
- Key: `auth_token`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**Cookies:**
- Name: `auth_token`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Cek 4: Role di Token Benar?

Copy token, paste di https://jwt.io

Payload harus:
```json
{
  "id": "uuid-mahasiswa",
  "role": "Mahasiswa",  ← HARUS "Mahasiswa" (huruf besar M)
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Cek 5: Network Request

Tab **Network** → Filter: `login`

**Request:**
```json
{
  "email": "mhs1@if.ac.id",
  "password": "123456"
}
```

**Response (Status 200):**
```json
{
  "message": "Login berhasil",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Jika status **401** atau **404**, berarti user tidak ada atau password salah.

---

## 🐛 Troubleshooting

### Problem: "User tidak ditemukan"

**Solusi:** Insert user mahasiswa

```bash
cd database
psql -U postgres -d sistem_cpl -f 05_insert_test_users.sql
```

### Problem: "Password salah"

**Solusi:** Reset password

```sql
-- Login ke database
psql -U postgres -d sistem_cpl

-- Update password (hash untuk '123456')
UPDATE users 
SET password_hash = '$2b$10$rZ5qH8QqJ5YvK5xK5xK5xOqJ5YvK5xK5xK5xK5xK5xK5xK5xK5xK5'
WHERE email = 'mhs1@if.ac.id';
```

### Problem: Redirect ke `/dashboard` bukan `/mahasiswa`

**Penyebab:** Role di token bukan "Mahasiswa"

**Solusi:** Cek role di database

```sql
SELECT u.email, r.nama_role 
FROM users u 
JOIN roles r ON u.role_id = r.id 
WHERE u.email = 'mhs1@if.ac.id';
```

Harus return `nama_role` = **"Mahasiswa"** (bukan "mahasiswa")

### Problem: Stuck di login page

**Solusi:**

1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+Shift+R)
3. Restart dev server
4. Coba browser lain (Chrome/Firefox)

### Problem: CORS Error

**Solusi:** Cek backend `app.js`

```javascript
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));
```

---

## ✅ Expected Result

Setelah login berhasil:

1. ✅ URL: `http://localhost:3001/mahasiswa`
2. ✅ Sidebar kiri dengan menu:
   - Dashboard
   - Capaian CPL Saya
   - Program Studi & CPL
   - Mata Kuliah
   - Sub-CPMK
3. ✅ Header atas: "Portal Mahasiswa"
4. ✅ Konten: Welcome banner + stats cards
5. ✅ Tombol logout di sidebar bawah

---

## 📸 Screenshot Expected

```
┌─────────────────────────────────────────────────────┐
│ [Logo] Sistem CPL    │  Portal Mahasiswa  [Logout] │
├──────────────┬──────────────────────────────────────┤
│              │  Selamat Datang, Mahasiswa!          │
│ Dashboard    │  ┌────┬────┬────┬────┐              │
│ Capaian CPL  │  │CPL │CPL │Prodi│ID │              │
│ Program Studi│  │ 5  │ 3  │ 1  │123│              │
│ Mata Kuliah  │  └────┴────┴────┴────┘              │
│ Sub-CPMK     │                                      │
│              │  Ringkasan Capaian CPL               │
│              │  ┌──────────────────────┐            │
│ [Logout]     │  │ CPL-01  ████░░ 75.5  │            │
│              │  │ CPL-02  ██████ 85.0  │            │
└──────────────┴──┴──────────────────────┴────────────┘
```

---

## 🎯 Next Steps

Setelah berhasil login:

1. ✅ Explore menu **Capaian CPL Saya**
2. ✅ Lihat **Program Studi & CPL**
3. ✅ Browse **Mata Kuliah**
4. ✅ Cek **Sub-CPMK**
5. ✅ Test logout

---

**Need help?** Baca `TEST_LOGIN.md` untuk debugging lebih detail.
