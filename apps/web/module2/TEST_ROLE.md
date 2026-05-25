# 🧪 Test Role & Redirect

## Masalah: Tampilan tidak berubah

Anda masih di `/dashboard` bukan `/mahasiswa`. Ini berarti:
1. Role di token bukan "Mahasiswa", ATAU
2. Frontend belum di-restart setelah perubahan

---

## ✅ Solusi Cepat

### Step 1: Restart Frontend

**PENTING:** Restart dev server!

```bash
# Stop frontend (Ctrl+C)
# Lalu jalankan lagi:
cd apps/web/module2
npm run dev
```

### Step 2: Clear Browser

1. Buka DevTools (F12)
2. Tab **Application** → **Clear storage**
3. Klik **Clear site data**
4. Atau manual:
   - Hapus `auth_token` di Local Storage
   - Hapus cookie `auth_token`

### Step 3: Logout & Login Lagi

1. Klik tombol **Logout**
2. Login dengan akun mahasiswa:
   - Email: `ahmad.fauzi@student.cpl.ac.id`
   - Password: `admin123`

### Step 4: Cek URL

Setelah login, URL harus:
```
http://localhost:3001/mahasiswa
```

Bukan:
```
http://localhost:3001/dashboard  ← SALAH!
```

---

## 🔍 Debug: Cek Role di Token

Buka Console (F12), ketik:

```javascript
// 1. Ambil token
const token = localStorage.getItem('auth_token');
console.log('Token:', token);

// 2. Decode token
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Payload:', payload);
console.log('Role:', payload.role);
```

**Expected output:**
```javascript
{
  id: "uuid-mahasiswa",
  role: "Mahasiswa",  ← HARUS INI!
  iat: 1234567890,
  exp: 1234567890
}
```

Jika `role` bukan **"Mahasiswa"** (huruf besar M), maka Anda login dengan akun yang salah.

---

## 🎯 Test Akses Langsung

Coba akses langsung:

```
http://localhost:3001/mahasiswa
```

**Jika redirect ke `/login`:**
- Token tidak valid atau expired
- Role bukan Mahasiswa

**Jika muncul halaman mahasiswa:**
- ✅ Berhasil!
- Sidebar hitam dengan menu
- Header "Program Studi & CPL"

---

## 📋 Checklist

- [ ] Frontend sudah di-restart
- [ ] Browser cache sudah di-clear
- [ ] Logout dari akun lama
- [ ] Login dengan `ahmad.fauzi@student.cpl.ac.id`
- [ ] URL berubah ke `/mahasiswa`
- [ ] Sidebar hitam muncul
- [ ] Header "Program Studi & CPL" muncul

---

## 🐛 Jika Masih Gagal

### Cek 1: User Mahasiswa Ada?

```bash
cd database
psql -U postgres -d sistem_cpl

SELECT u.email, r.nama_role 
FROM users u 
JOIN roles r ON u.role_id = r.id 
WHERE u.email = 'ahmad.fauzi@student.cpl.ac.id';
```

Expected: 1 row dengan `nama_role` = **"Mahasiswa"**

### Cek 2: File Ada?

```bash
dir apps\web\module2\app\mahasiswa
```

Expected:
```
layout.tsx
page.tsx
program-studi/
```

### Cek 3: Backend Running?

```bash
curl http://localhost:3000
```

Expected: Response dari backend

---

## 💡 Tips

1. **Selalu restart frontend** setelah perubahan file
2. **Clear cache** sebelum test
3. **Gunakan Incognito mode** untuk test bersih
4. **Cek Console** untuk error messages

---

**Jika sudah ikuti semua step di atas tapi masih gagal, screenshot:**
1. Console browser (tab Console)
2. Network tab (request login)
3. Application tab (localStorage & cookies)
