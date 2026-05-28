# 🔌 API Endpoints Reference

## ✅ Endpoint yang Benar untuk Mobile Module 2

Berikut adalah endpoint yang benar untuk setiap role:

---

## 👨‍🎓 Mahasiswa Endpoints

### Profile
```javascript
GET /profile/mahasiswa/me
```
**Akses**: Mahasiswa only  
**Digunakan di**: `ProfileScreen.js`  
**API Function**: `mahasiswaApi.getMyProfile()`  
**Note**: Prefix `/profile` + path `/mahasiswa/me` dari route file

### Kelas & Mata Kuliah
```javascript
GET /kelas
```
**Akses**: Mahasiswa & Dosen  
**Digunakan di**: `MataKuliahScreen.js`  
**API Function**: `mahasiswaApi.getMyKelas()`

### Program Studi & CPL
```javascript
GET /prodi
GET /cpl
GET /cpl/prodi/:prodiId
```
**Akses**: Public/All roles  
**Digunakan di**: `ProgramStudiScreen.js`

### Sub-CPMK
```javascript
GET /sub-cpmk
GET /sub-cpmk/mk/:mkId
```
**Akses**: All roles  
**Digunakan di**: `SubCpmkScreen.js`

---

## 👨‍🏫 Dosen Endpoints

### Profile
```javascript
GET /profile/me
```
**Akses**: Dosen only  
**Digunakan di**: `ProfilDetailScreen.js`  
**API Function**: `dosenApi.getMyProfile()`  
**Note**: Prefix `/profile` + path `/me` dari route file

### Dashboard
```javascript
GET /dashboard/dosen
```
**Akses**: Dosen only  
**Digunakan di**: `DashboardScreen.js`  
**API Function**: `dashboardApi.getDosen()`

### Kelas (My Classes)
```javascript
GET /kelas/dosen/my-classes
```
**Akses**: Dosen only  
**Digunakan di**: `MataKuliahScreen.js`  
**API Function**: `kelasApi.getMyClasses()`

### Sub-CPMK Management
```javascript
GET    /sub-cpmk
POST   /sub-cpmk
PUT    /sub-cpmk/:id
DELETE /sub-cpmk/:id
```
**Akses**: Dosen only  
**Digunakan di**: `SubCpmkScreen.js`

### Nilai (Grades)
```javascript
GET    /nilai
POST   /nilai
PUT    /nilai/:id
DELETE /nilai/:id
```
**Akses**: Dosen only  
**Digunakan di**: `InputNilaiScreen.js`

---

## 🔐 Authentication Endpoints

### Login
```javascript
POST /auth/login
```
**Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response**:
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "nama": "User Name",
    "email": "user@example.com",
    "role": "mahasiswa",
    "entity_id": 1,
    "entity_type": "mahasiswa"
  }
}
```

---

## 📊 Endpoint Summary

| Endpoint | Method | Mahasiswa | Dosen | Admin |
|----------|--------|-----------|-------|-------|
| `/auth/login` | POST | ✅ | ✅ | ✅ |
| `/profile/mahasiswa/me` | GET | ✅ | ❌ | ❌ |
| `/profile/me` | GET | ❌ | ✅ | ❌ |
| `/kelas` | GET | ✅ | ✅ | ✅ |
| `/kelas/dosen/my-classes` | GET | ❌ | ✅ | ❌ |
| `/prodi` | GET | ✅ | ✅ | ✅ |
| `/cpl` | GET | ✅ | ✅ | ✅ |
| `/sub-cpmk` | GET | ✅ | ✅ | ✅ |
| `/sub-cpmk` | POST/PUT/DELETE | ❌ | ✅ | ✅ |
| `/nilai` | GET | ✅ | ✅ | ✅ |
| `/nilai` | POST/PUT/DELETE | ❌ | ✅ | ✅ |
| `/dashboard/dosen` | GET | ❌ | ✅ | ❌ |

---

## 🔍 Penjelasan Routing Backend

Backend menggunakan **prefix routing** di `routes/index.js`:

```javascript
// Prefix: /profile
router.use("/profile", dosenProfileRoutes);      // → /profile/me
router.use("/profile", mahasiswaProfileRoutes);  // → /profile/mahasiswa/me
```

Jadi:
- **Dosen**: `/profile` + `/me` = `/profile/me` ✅
- **Mahasiswa**: `/profile` + `/mahasiswa/me` = `/profile/mahasiswa/me` ✅

---

## 🐛 Common Errors

### Error 403: Akses Ditolak
**Penyebab**: Role tidak punya akses ke endpoint tersebut  
**Contoh**: Mahasiswa mencoba akses `/profile/me` (endpoint dosen)  
**Solusi**: Gunakan endpoint yang sesuai dengan role

### Error 401: Unauthorized
**Penyebab**: Token tidak valid atau expired  
**Solusi**: Login ulang

### Error 404: Route tidak ditemukan
**Penyebab**: Endpoint path salah  
**Contoh**: Menggunakan `/mahasiswa/me` padahal seharusnya `/profile/mahasiswa/me`  
**Solusi**: Cek prefix routing di backend

---

## ✅ Yang Sudah Diperbaiki

| File | Endpoint Lama | Endpoint Baru | Status |
|------|---------------|---------------|--------|
| `mahasiswaApi.getMyProfile()` | `/profile/me` ❌ | `/profile/mahasiswa/me` ✅ | Fixed |
| `mahasiswaApi.getMyProfile()` | `/mahasiswa/me` ❌ | `/profile/mahasiswa/me` ✅ | Fixed |

---

## 🚀 Cara Test Endpoint

### 1. Test dengan Postman
```
POST http://YOUR_IP:3000/api/auth/login
Body: { "email": "mahasiswa@test.com", "password": "password123" }

GET http://YOUR_IP:3000/api/profile/mahasiswa/me
Headers: { "Authorization": "Bearer YOUR_TOKEN" }
```

### 2. Test di Mobile App
```javascript
// Login
const res = await authApi.login({ email, password });

// Get Profile (Mahasiswa)
const profile = await mahasiswaApi.getMyProfile();
// Akan call: /profile/mahasiswa/me

// Get Profile (Dosen)
const profile = await dosenApi.getMyProfile();
// Akan call: /profile/me
```

---

**Endpoint sudah diperbaiki dengan benar! 🎉**
