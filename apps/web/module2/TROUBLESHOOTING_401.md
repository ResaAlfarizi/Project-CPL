# 🔧 Troubleshooting Error 401 (Unauthorized)

## ❌ Masalah

Saat login, muncul error:
```
POST http://localhost:3000/api/v1/m2/auth/login 401 (Unauthorized)
```

## 🔍 Penyebab

Error 401 berarti password tidak cocok atau user tidak ditemukan. Ini bisa terjadi karena:

1. **User belum ada di database**
2. **Password hash tidak cocok**
3. **Email yang digunakan salah**

## ✅ Solusi

### Langkah 1: Cek User di Database

Buka PostgreSQL dan jalankan:
```sql
SELECT id, email, password_hash, role_id FROM users;
```

Cek apakah user dengan email `dosen3@if.ac.id` sudah ada.

### Langkah 2: Jika User Belum Ada, Buat User Baru

Jalankan SQL script ini di PostgreSQL:

```sql
INSERT INTO users (email, password_hash, role_id, created_at, updated_at)
VALUES (
  'dosen3@if.ac.id',
  '$2b$10$BtrKvcGZ05nJ89ljM8HHDe/k/wj5jXKDJ.1PDQsMtOV28d0PgPz9a',
  2,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = '$2b$10$BtrKvcGZ05nJ89ljM8HHDe/k/wj5jXKDJ.1PDQsMtOV28d0PgPz9a',
  updated_at = NOW();
```

**Atau gunakan file SQL yang sudah disiapkan:**
```bash
# Di PostgreSQL, jalankan:
\i 'D:/pweb/repo git/Project-CPL/apps/backend/module2/INSERT_TEST_USER.sql'
```

### Langkah 3: Verifikasi User Berhasil Dibuat

```sql
SELECT id, email, role_id FROM users WHERE email = 'dosen3@if.ac.id';
```

Seharusnya mengembalikan 1 row.

### Langkah 4: Coba Login Lagi

1. Refresh browser (F5)
2. Masukkan:
   - **Email**: `dosen3@if.ac.id`
   - **Password**: `test123`
3. Klik "Masuk"

Seharusnya login berhasil dan redirect ke dashboard!

---

## 📝 Informasi User Test

| Field | Value |
|-------|-------|
| Email | `dosen3@if.ac.id` |
| Password | `test123` |
| Password Hash | `$2b$10$BtrKvcGZ05nJ89ljM8HHDe/k/wj5jXKDJ.1PDQsMtOV28d0PgPz9a` |
| Role ID | 2 (Dosen) |

---

## 🔐 Cara Generate Password Hash Baru

Jika ingin membuat user dengan password berbeda:

### Menggunakan Node.js

```bash
cd apps/backend
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('PASSWORD_ANDA', 10).then(hash => console.log(hash));"
```

Ganti `PASSWORD_ANDA` dengan password yang diinginkan.

### Menggunakan Script generate-hash.js

```bash
cd apps/web/module2
node generate-hash.js PASSWORD_ANDA
```

---

## 🐛 Debug Tips

### 1. Cek Console Browser

Buka DevTools (F12) → Console, cari error message yang lebih detail.

### 2. Cek Network Tab

1. Buka DevTools (F12) → Network
2. Coba login
3. Cari request ke `/api/v1/m2/auth/login`
4. Lihat Response tab untuk error message dari backend

### 3. Cek Backend Logs

Lihat terminal backend untuk error message:
```bash
cd apps/backend
node app.js
```

### 4. Test API Langsung dengan cURL

```bash
curl -X POST http://localhost:3000/api/v1/m2/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dosen3@if.ac.id",
    "password": "test123"
  }'
```

Seharusnya mengembalikan:
```json
{
  "message": "Login berhasil",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## ✅ Checklist

- [ ] User sudah ada di database
- [ ] Password hash sudah di-update dengan benar
- [ ] Browser sudah di-refresh
- [ ] Email yang digunakan benar: `dosen3@if.ac.id`
- [ ] Password yang digunakan benar: `test123`
- [ ] Backend berjalan di port 3000
- [ ] Frontend berjalan di port 3001

---

## 🆘 Masih Error?

Jika masih error setelah mengikuti langkah di atas:

1. **Cek apakah database connection bekerja**
   ```sql
   SELECT * FROM users LIMIT 1;
   ```

2. **Cek apakah bcrypt module terinstall di backend**
   ```bash
   cd apps/backend
   npm list bcrypt
   ```

3. **Cek apakah JWT_SECRET sudah diset di .env**
   ```bash
   cat .env
   ```

4. **Restart backend**
   ```bash
   # Matikan backend (Ctrl+C)
   # Jalankan lagi:
   node app.js
   ```

5. **Clear browser cache**
   - DevTools → Application → Clear site data
   - Atau gunakan Incognito mode

---

**Jika masih ada masalah, hubungi tim development dengan screenshot error message!**
