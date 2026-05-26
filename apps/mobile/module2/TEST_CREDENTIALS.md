# 🔐 Test Credentials - Mobile Module 2

## Kredensial untuk Testing

### 👨‍🎓 Mahasiswa (Baru Ditambahkan)

```
Email: mahasiswa@example.com
Password: password123
Role: mahasiswa
```

**Atau gunakan kredensial mahasiswa yang sudah ada di database Anda.**

### 👨‍🏫 Dosen (Sudah Ada)

```
Email: dosen@example.com
Password: password123
Role: dosen
```

### 👑 Superadmin (Sudah Ada)

```
Email: admin@example.com
Password: password123
Role: superadmin
```

## 📝 Cara Membuat User Mahasiswa Baru

Jika belum ada user mahasiswa di database, jalankan SQL berikut:

### 1. Buat Data Mahasiswa di Tabel Mahasiswa

```sql
-- Sesuaikan dengan struktur tabel mahasiswa Anda
INSERT INTO mahasiswa (nim, nama, email, prodi_id, angkatan) 
VALUES (
  '123456789',
  'Mahasiswa Demo',
  'mahasiswa@example.com',
  1, -- ID prodi (sesuaikan dengan data Anda)
  2021
);
```

### 2. Buat User Login

```sql
-- Hash password menggunakan bcrypt dengan salt 10
-- Password: password123
-- Hash: $2b$10$rZ5qJ5qJ5qJ5qJ5qJ5qJ5uXxXxXxXxXxXxXxXxXxXxXxXxXxXx

INSERT INTO users (email, password, role, entity_type, entity_id, nama) 
VALUES (
  'mahasiswa@example.com',
  '$2b$10$rZ5qJ5qJ5qJ5qJ5qJ5qJ5uXxXxXxXxXxXxXxXxXxXxXxXxXxXx', -- Ganti dengan hash yang benar
  'mahasiswa',
  'mahasiswa',
  1, -- ID dari tabel mahasiswa (dari step 1)
  'Mahasiswa Demo'
);
```

### 3. Generate Hash Password (Node.js)

Jika perlu generate hash password baru:

```javascript
// Jalankan di Node.js atau gunakan file hash.js yang sudah ada
const bcrypt = require('bcrypt');

const password = 'password123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) throw err;
  console.log('Hash:', hash);
  // Gunakan hash ini di SQL INSERT
});
```

**Atau gunakan file hash.js yang sudah ada:**

```bash
cd apps/backend
node hash.js password123
```

## 🎯 Testing Flow

### 1. Login sebagai Mahasiswa
```
1. Buka aplikasi mobile
2. Masukkan email: mahasiswa@example.com
3. Masukkan password: password123
4. Tap "Masuk"
```

### 2. Verifikasi Role
Setelah login, cek:
- ✅ Sidebar menu menampilkan 5 menu mahasiswa
- ✅ Header menampilkan badge "Mahasiswa"
- ✅ Dashboard menampilkan greeting dengan nama mahasiswa

### 3. Test Semua Screen
- ✅ Dashboard → Quick access berfungsi
- ✅ Program Studi → Search & toggle CPL berfungsi
- ✅ Mata Kuliah → Search & filter semester berfungsi
- ✅ Sub-CPMK → Search & expand/collapse berfungsi
- ✅ Capaian → Progress bar & detail toggle berfungsi
- ✅ Profil → Data tampil lengkap & logout berfungsi

## 🔄 Switch Role

Untuk test role berbeda:

1. **Logout** dari aplikasi
2. **Login** dengan kredensial role lain
3. **Verifikasi** sidebar menu berubah sesuai role

### Menu per Role

**Mahasiswa (5 menu):**
- Dashboard
- Program Studi
- Mata Kuliah
- Sub-CPMK
- Capaian Saya

**Dosen (6 menu):**
- Dashboard
- Program Studi & CPL
- Mata Kuliah
- Sub-CPMK
- Input Nilai
- Capaian Mahasiswa

**Superadmin (6 menu):**
- Dashboard
- Program Studi & CPL
- Mata Kuliah
- Sub-CPMK
- Input Nilai
- Capaian Mahasiswa

## 🐛 Troubleshooting Login

### Problem: "Invalid credentials"

**Cek:**
1. Email dan password benar
2. User ada di database
3. Password hash benar

**Solusi:**
```sql
-- Cek user di database
SELECT * FROM users WHERE email = 'mahasiswa@example.com';

-- Update password jika perlu
UPDATE users 
SET password = '$2b$10$newHashHere' 
WHERE email = 'mahasiswa@example.com';
```

### Problem: "Wrong role" atau redirect ke unauthorized

**Cek:**
1. Role di database adalah `'mahasiswa'` (lowercase)
2. JWT token include role

**Solusi:**
```sql
-- Update role jika salah
UPDATE users 
SET role = 'mahasiswa' 
WHERE email = 'mahasiswa@example.com';
```

### Problem: "Token invalid" atau "401 Unauthorized"

**Cek:**
1. JWT_SECRET di backend `.env` sama dengan yang digunakan
2. Token belum expired

**Solusi:**
- Logout dan login ulang
- Restart backend server

## 📊 Expected JWT Token

Setelah login berhasil, JWT token harus berisi:

```json
{
  "id": "user_id",
  "nama": "Mahasiswa Demo",
  "email": "mahasiswa@example.com",
  "role": "mahasiswa",
  "entity_id": "1",
  "entity_type": "mahasiswa",
  "iat": 1234567890,
  "exp": 1234567890
}
```

## 🔍 Debug JWT Token

Untuk debug JWT token:

1. **Copy token** dari AsyncStorage atau network response
2. **Decode** di https://jwt.io
3. **Verifikasi** payload sesuai struktur di atas

## 💡 Tips

1. **Gunakan kredensial yang sama** untuk web dan mobile
2. **Pastikan role lowercase** di database
3. **Hash password dengan bcrypt** salt 10
4. **JWT secret harus sama** di backend
5. **Token expire** sesuai konfigurasi backend

---

**Ready to Test! 🚀**

Gunakan kredensial di atas untuk testing aplikasi mobile module 2.
