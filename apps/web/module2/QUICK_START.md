# 🚀 Quick Start - Login System

Panduan cepat untuk menjalankan sistem login dalam 5 menit!

## ⚡ Langkah Cepat

### 1️⃣ Install Dependencies (30 detik)
```bash
cd apps/web/module2
npm install
```

### 2️⃣ Setup Environment (10 detik)
Buat file `.env.local`:
```bash
echo NEXT_PUBLIC_API_URL=http://localhost:3000 > .env.local
```

### 3️⃣ Generate Password Hash (20 detik)
```bash
# Install bcrypt jika belum ada
npm install bcrypt

# Generate hash untuk password 'test123'
node generate-hash.js test123
```

Copy hash yang dihasilkan.

### 4️⃣ Buat Test User di Database (30 detik)
Buka PostgreSQL dan jalankan:
```sql
INSERT INTO users (email, password_hash, role_id, created_at, updated_at)
VALUES (
  'test@example.com',
  'PASTE_HASH_DARI_STEP_3_DISINI',
  1,
  NOW(),
  NOW()
);
```

### 5️⃣ Jalankan Backend (10 detik)
```bash
# Terminal 1
cd apps/backend
node app.js
```

### 6️⃣ Jalankan Frontend (10 detik)
```bash
# Terminal 2
cd apps/web/module2
npm run dev
```

### 7️⃣ Test Login! (10 detik)
1. Buka browser: `http://localhost:3001`
2. Login dengan:
   - **Email**: `test@example.com`
   - **Password**: `test123`
3. ✅ Berhasil! Anda akan masuk ke dashboard

---

## 🎯 Total Waktu: ~2 Menit

## 🐛 Troubleshooting Cepat

### Backend tidak bisa connect ke database?
```bash
# Cek PostgreSQL berjalan
# Windows:
services.msc
# Cari "PostgreSQL" dan pastikan status "Running"

# Atau cek di terminal:
psql -U postgres -d projectcpl
```

### Port 3000 sudah digunakan?
Edit `.env` di backend:
```env
PORT=3001
```
Dan update `.env.local` di frontend:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### "User tidak ditemukan"?
Cek apakah user sudah ada di database:
```sql
SELECT * FROM users WHERE email = 'test@example.com';
```

### Token tidak valid?
Clear localStorage:
1. Buka DevTools (F12)
2. Application → Local Storage
3. Hapus `auth_token`
4. Refresh dan login ulang

---

## 📚 Dokumentasi Lengkap

- **[LOGIN_GUIDE.md](./LOGIN_GUIDE.md)** - Panduan lengkap sistem login
- **[TESTING_LOGIN.md](./TESTING_LOGIN.md)** - Panduan testing
- **[README.md](./README.md)** - Dokumentasi utama

---

## ✅ Checklist

- [ ] Dependencies terinstall
- [ ] File `.env.local` dibuat
- [ ] Password hash di-generate
- [ ] Test user dibuat di database
- [ ] Backend berjalan di port 3000
- [ ] Frontend berjalan di port 3001
- [ ] Login berhasil

---

**Selamat! Sistem login Anda sudah berjalan! 🎉**
