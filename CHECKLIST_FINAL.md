# ✅ Checklist Final - Portal Mahasiswa

Gunakan checklist ini untuk memastikan semua sudah berjalan dengan baik.

---

## 📋 Pre-Requirements

- [ ] PostgreSQL 12+ terinstall
- [ ] Node.js 16+ terinstall
- [ ] npm atau yarn terinstall
- [ ] Git terinstall (optional)

---

## 🗄️ Database Setup

### Step 1: Buat Database
- [ ] Database `sistem_cpl` sudah dibuat
- [ ] Bisa login ke database: `psql -U postgres -d sistem_cpl`

### Step 2: Jalankan DDL Scripts
- [ ] `01_modul1_ddl.sql` berhasil dijalankan
- [ ] `02_modul2_ddl.sql` berhasil dijalankan
- [ ] `03_auth_system.sql` berhasil dijalankan
- [ ] `05_insert_test_users.sql` berhasil dijalankan

### Step 3: Verifikasi Database
- [ ] Ada 19 tabel (cek dengan `\dt`)
- [ ] Ada 2 view: `v_capaian_cpl_mk`, `v_capaian_cpl_mahasiswa`
- [ ] Ada 4 roles: Superadmin, Admin Prodi, Dosen, Mahasiswa
- [ ] Ada minimal 1 user mahasiswa

**Cek dengan:**
```sql
SELECT email, r.nama_role 
FROM users u 
JOIN roles r ON u.role_id = r.id 
WHERE r.nama_role = 'Mahasiswa';
```

Expected: Minimal 1 row dengan email mahasiswa

---

## 🔧 Backend Setup

### Step 1: Install Dependencies
- [ ] `cd apps/backend/module2`
- [ ] `npm install` berhasil (no errors)

### Step 2: Configure Environment
- [ ] File `.env` sudah ada
- [ ] `DB_NAME=sistem_cpl`
- [ ] `DB_USER=postgres`
- [ ] `DB_PASSWORD` sudah diisi
- [ ] `JWT_SECRET` sudah diisi

### Step 3: Start Backend
- [ ] `npm start` berhasil
- [ ] Console menampilkan: "Server running on port 3000"
- [ ] Tidak ada error di console

### Step 4: Test Backend API
- [ ] Buka: http://localhost:3000
- [ ] Atau test login API:
```bash
curl -X POST http://localhost:3000/api/v1/m2/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"ahmad.fauzi@student.cpl.ac.id\",\"password\":\"admin123\"}"
```
- [ ] Response status 200
- [ ] Response berisi `token`

---

## 💻 Frontend Setup

### Step 1: Install Dependencies
- [ ] `cd apps/web/module2`
- [ ] `npm install` berhasil (no errors)

### Step 2: Configure Environment
- [ ] File `.env.local` sudah ada
- [ ] `NEXT_PUBLIC_API_URL=http://localhost:3000`

### Step 3: Start Frontend
- [ ] `npm run dev` berhasil
- [ ] Console menampilkan: "Local: http://localhost:3001"
- [ ] Tidak ada error di console

### Step 4: Test Frontend
- [ ] Buka: http://localhost:3001
- [ ] Halaman loading muncul
- [ ] Auto redirect ke `/login`

---

## 🔐 Authentication Test

### Step 1: Login Page
- [ ] Halaman login muncul dengan benar
- [ ] Form email & password ada
- [ ] Tombol "Masuk" ada

### Step 2: Login Process
- [ ] Masukkan email: `ahmad.fauzi@student.cpl.ac.id`
- [ ] Masukkan password: `admin123`
- [ ] Klik tombol "Masuk"
- [ ] Loading spinner muncul

### Step 3: Verify Console (F12)
- [ ] Buka DevTools → Console
- [ ] Ada log: `🔐 Login attempt: ahmad.fauzi@student.cpl.ac.id`
- [ ] Ada log: `✅ Login response: {...}`
- [ ] Ada log: `🎫 Decoded token: {id: "...", role: "Mahasiswa", ...}`
- [ ] Ada log: `➡️ Redirecting to /mahasiswa`
- [ ] Tidak ada error merah

### Step 4: Verify Redirect
- [ ] URL berubah ke: `http://localhost:3001/mahasiswa`
- [ ] Halaman dashboard mahasiswa muncul
- [ ] Sidebar kiri muncul
- [ ] Header atas muncul

### Step 5: Verify Storage
**LocalStorage:**
- [ ] Buka DevTools → Application → Local Storage
- [ ] Ada key `auth_token`
- [ ] Value berisi JWT token

**Cookies:**
- [ ] Buka DevTools → Application → Cookies
- [ ] Ada cookie `auth_token`
- [ ] Value berisi JWT token

---

## 🎨 UI/UX Test

### Sidebar
- [ ] Logo "Sistem CPL" muncul
- [ ] User info muncul (Mahasiswa, ID: xxx)
- [ ] 5 menu muncul:
  - [ ] Dashboard
  - [ ] Capaian CPL Saya
  - [ ] Program Studi & CPL
  - [ ] Mata Kuliah
  - [ ] Sub-CPMK
- [ ] Tombol Logout di bawah

### Header
- [ ] Text "Portal Mahasiswa" muncul
- [ ] Badge "Mahasiswa" muncul
- [ ] Hamburger menu (mobile) berfungsi

### Dashboard Content
- [ ] Welcome banner muncul
- [ ] 4 stats cards muncul:
  - [ ] Total CPL
  - [ ] CPL Tercapai
  - [ ] Program Studi
  - [ ] User ID
- [ ] Section "Ringkasan Capaian CPL Saya"
- [ ] Section "Hak Akses Anda"

---

## 🧪 Feature Test

### Test 1: Navigasi
- [ ] Klik menu "Capaian CPL Saya" → Halaman capaian muncul
- [ ] Klik menu "Program Studi & CPL" → Halaman prodi muncul
- [ ] Klik menu "Mata Kuliah" → Halaman MK muncul
- [ ] Klik menu "Sub-CPMK" → Halaman sub-CPMK muncul
- [ ] Klik menu "Dashboard" → Kembali ke dashboard

### Test 2: Capaian CPL
- [ ] Tab "Ringkasan per CPL" bisa diklik
- [ ] Tab "Detail per Mata Kuliah" bisa diklik
- [ ] Jika ada data: Progress bar muncul
- [ ] Jika tidak ada data: Pesan "Belum ada data" muncul

### Test 3: Program Studi & CPL
- [ ] Daftar program studi muncul
- [ ] Klik prodi → CPL prodi muncul di sebelah kanan
- [ ] Tabel "Semua CPL" di bawah muncul

### Test 4: Mata Kuliah
- [ ] Daftar mata kuliah muncul
- [ ] Search box berfungsi
- [ ] Klik mata kuliah → Sub-CPMK muncul di sebelah kanan

### Test 5: Sub-CPMK
- [ ] Tabel Sub-CPMK muncul
- [ ] Search box berfungsi
- [ ] Filter CPL berfungsi (jika ada data)

### Test 6: Logout
- [ ] Klik tombol "Logout" di sidebar
- [ ] Redirect ke `/login`
- [ ] Token dihapus dari localStorage
- [ ] Token dihapus dari cookies
- [ ] Tidak bisa akses `/mahasiswa` lagi (redirect ke login)

---

## 📱 Responsive Test

### Desktop (>1024px)
- [ ] Sidebar selalu visible
- [ ] Content full width
- [ ] Semua fitur accessible

### Tablet (768px - 1024px)
- [ ] Sidebar collapsible
- [ ] Hamburger menu muncul
- [ ] Content responsive

### Mobile (<768px)
- [ ] Sidebar hidden by default
- [ ] Hamburger menu berfungsi
- [ ] Cards stack vertical
- [ ] Table scrollable horizontal

---

## 🔒 Security Test

### Authorization
- [ ] Tidak bisa akses `/dashboard` (role lain)
- [ ] Tidak bisa akses `/admin` (role lain)
- [ ] Hanya bisa akses `/mahasiswa`

### Token Expiry
- [ ] Token expired → Auto logout
- [ ] Token invalid → Auto logout
- [ ] No token → Redirect to login

---

## 🐛 Error Handling Test

### Network Error
- [ ] Backend mati → Error message muncul
- [ ] Slow network → Loading spinner muncul

### Invalid Credentials
- [ ] Email salah → Error "User tidak ditemukan"
- [ ] Password salah → Error "Password salah"

### Empty Data
- [ ] Tidak ada capaian → Pesan "Belum ada data"
- [ ] Tidak ada prodi → Pesan "Tidak ada data"

---

## 📊 Performance Test

- [ ] Halaman load < 3 detik
- [ ] Navigasi antar halaman smooth
- [ ] Tidak ada lag saat scroll
- [ ] Tidak ada memory leak (cek DevTools → Performance)

---

## 🎯 Final Verification

### Functionality
- [ ] ✅ Login berhasil
- [ ] ✅ Redirect ke `/mahasiswa` otomatis
- [ ] ✅ Dashboard menampilkan data
- [ ] ✅ Semua menu accessible
- [ ] ✅ Logout berhasil

### UI/UX
- [ ] ✅ Design modern & clean
- [ ] ✅ Responsive di semua device
- [ ] ✅ Color scheme konsisten
- [ ] ✅ Typography readable

### Security
- [ ] ✅ JWT authentication
- [ ] ✅ Role-based access control
- [ ] ✅ Token stored securely
- [ ] ✅ Auto logout on token expiry

### Documentation
- [ ] ✅ README lengkap
- [ ] ✅ Setup guide jelas
- [ ] ✅ Troubleshooting guide ada
- [ ] ✅ Code comments adequate

---

## 🎉 Success Criteria

Jika semua checklist di atas ✅, maka:

**✅ Portal Mahasiswa SIAP DIGUNAKAN!**

---

## 📝 Notes

Catat masalah yang ditemukan:

```
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________
```

---

## 🚀 Next Steps

Setelah semua checklist ✅:

1. [ ] Demo ke dosen/tim
2. [ ] Collect feedback
3. [ ] Fix bugs (jika ada)
4. [ ] Deploy ke production (optional)
5. [ ] Training user (optional)

---

**Good luck! 🎓**
