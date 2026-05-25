# 🚨 PERBAIKAN CEPAT - Error "Unexpected token <!DOCTYPE"

## ❌ Error yang Terjadi:
```
Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

## 🔍 Penyebab:
Backend mengembalikan HTML error page, bukan JSON. Ini terjadi karena:
1. Backend tidak jalan
2. Backend tidak bisa connect ke database
3. CORS issue

## ✅ SOLUSI STEP-BY-STEP:

### STEP 1: Test Koneksi Database

```bash
cd "c:\Users\audina firdaus\OneDrive\Documents\pemweb\UAS CPL\Project-CPL\apps\backend"
node test-db-connection.js
```

**Jika GAGAL:**
- Buka pgAdmin
- Pastikan PostgreSQL running
- Pastikan database `projectcpl` ada
- Jika belum ada, buat database baru:
  ```sql
  CREATE DATABASE projectcpl;
  ```

### STEP 2: Insert Dummy Data

1. Buka pgAdmin
2. Connect ke database `projectcpl`
3. Klik kanan database → Query Tool
4. Buka file: `database/06_dummy_data_lengkap.sql`
5. Copy SEMUA isi file
6. Paste di Query Tool
7. Klik Execute (F5) atau tekan F5
8. Tunggu sampai selesai
9. Pastikan tidak ada error

**Verifikasi data berhasil:**
```sql
SELECT * FROM users WHERE email = 'mhs1@if.ac.id';
```
Harus ada 1 row dengan email tersebut.

### STEP 3: Jalankan Backend

```bash
cd "c:\Users\audina firdaus\OneDrive\Documents\pemweb\UAS CPL\Project-CPL\apps\backend"
node app.js
```

**Output yang BENAR:**
```
Backend Modul 1 dan Modul 2 aktif di port 3000
```

**Jika ada error:**
- Cek error message
- Biasanya masalah di koneksi database
- Cek file `.env` kredensial database benar

### STEP 4: Test Backend API

Buka terminal BARU (jangan tutup terminal backend):

```bash
cd "c:\Users\audina firdaus\OneDrive\Documents\pemweb\UAS CPL\Project-CPL\apps\backend"
node test-api.js
```

**Semua test harus ✅ Success**

Jika test login GAGAL:
- Cek password hash di database
- Jalankan script hash password:
  ```bash
  node hash-password.js password123
  ```
- Copy hash yang dihasilkan
- Update di database:
  ```sql
  UPDATE users 
  SET password_hash = 'PASTE_HASH_DISINI' 
  WHERE email = 'mhs1@if.ac.id';
  ```

### STEP 5: Jalankan Frontend

Buka terminal BARU (jangan tutup terminal backend):

```bash
cd "c:\Users\audina firdaus\OneDrive\Documents\pemweb\UAS CPL\Project-CPL\apps\web\module2"
npm run dev
```

**Output yang BENAR:**
```
▲ Next.js 14.x.x
- Local:        http://localhost:3001
```

### STEP 6: Test Login

1. Buka browser: `http://localhost:3001/login`
2. Buka DevTools (F12) → Console
3. Login dengan:
   - Email: `mhs1@if.ac.id`
   - Password: `password123`
4. Klik "Masuk"

**Jika berhasil:**
- Redirect ke `/mahasiswa`
- Tidak ada error di console
- Token tersimpan di localStorage

**Jika masih error:**
- Screenshot error di console
- Screenshot error di Network tab
- Kirim screenshot untuk analisis

---

## 🔧 TROUBLESHOOTING TAMBAHAN

### Error: "Cannot find module 'pg'"
```bash
cd apps/backend
npm install pg dotenv express cors bcrypt jsonwebtoken
```

### Error: "Cannot find module 'next'"
```bash
cd apps/web/module2
npm install
```

### Error: "ECONNREFUSED 127.0.0.1:5432"
- PostgreSQL tidak running
- Buka Services → PostgreSQL → Start
- Atau buka pgAdmin dan start server

### Error: "password authentication failed"
- Password salah di file `.env`
- Cek password PostgreSQL yang benar
- Update file `.env` dengan password yang benar

### Error: "database projectcpl does not exist"
- Database belum dibuat
- Buka pgAdmin
- Klik kanan "Databases" → Create → Database
- Nama: `projectcpl`
- Owner: `postgres`
- Save

---

## 📋 CHECKLIST CEPAT

- [ ] PostgreSQL running
- [ ] Database `projectcpl` ada
- [ ] Dummy data sudah diinsert
- [ ] File `.env` kredensial benar
- [ ] Backend jalan di port 3000
- [ ] Test backend API berhasil
- [ ] Frontend jalan di port 3001
- [ ] Login berhasil tanpa error

---

## 🆘 MASIH ERROR?

Jalankan command ini dan kirim hasilnya:

```bash
# Test 1: Cek backend
cd apps/backend
node test-db-connection.js

# Test 2: Cek API
node test-api.js

# Test 3: Cek port
netstat -ano | findstr :3000
netstat -ano | findstr :3001
```

Screenshot:
1. Error di browser console (F12)
2. Error di terminal backend
3. Error di terminal frontend
4. Network tab di DevTools (F12 → Network)
