# ✅ Fix: Mata Kuliah Mahasiswa - Akses Ditolak

## 🐛 Masalah

**Error:** Akses ditolak di halaman Mata Kuliah mahasiswa
**Penyebab:** Menggunakan endpoint `/kelas/dosen/my-classes` yang hanya bisa diakses dosen

## ✅ Solusi

### 1. Update API Endpoint

**File:** `services/api.js`

**Sebelum:**
```javascript
getMyKelas: async () => {
    try {
        // Coba endpoint dosen dulu
        return await apiFetch('/kelas/dosen/my-classes'); // ❌ Hanya untuk dosen!
    } catch (error) {
        // Fallback ke endpoint kelas umum
        return await apiFetch('/kelas');
    }
},
```

**Sesudah:**
```javascript
getMyKelas: () => apiFetch('/kelas'), // ✅ Endpoint umum untuk mahasiswa
```

### 2. Update MataKuliahScreen

**File:** `screens/mahasiswa/MataKuliahScreen.js`

**Sebelum:**
```javascript
import { kelasApi } from '../../services/api';

useEffect(() => {
    kelasApi.getMyClasses() // ❌ Endpoint dosen
        .then(res => setKelasList(res.data || []))
        .catch(() => setKelasList([]))
        .finally(() => setLoading(false));
}, []);
```

**Sesudah:**
```javascript
import { mahasiswaApi } from '../../services/api';

useEffect(() => {
    mahasiswaApi.getAllKelas() // ✅ Endpoint mahasiswa
        .then(res => setKelasList(res.data || []))
        .catch(() => setKelasList([]))
        .finally(() => setLoading(false));
}, []);
```

## 🎯 Endpoint yang Benar untuk Mahasiswa

### ✅ Endpoint yang Bisa Diakses Mahasiswa

```javascript
// Prodi & CPL
GET /api/v1/m2/prodi                    // ✅ Semua prodi
GET /api/v1/m2/cpl                      // ✅ Semua CPL
GET /api/v1/m2/cpl/prodi/:prodiId       // ✅ CPL per prodi

// Kelas & Mata Kuliah
GET /api/v1/m2/kelas                    // ✅ Semua kelas (READ ONLY)

// Sub-CPMK
GET /api/v1/m2/sub-cpmk                 // ✅ Semua Sub-CPMK
GET /api/v1/m2/sub-cpmk/mk/:mkId        // ✅ Sub-CPMK per MK

// Profile
GET /api/v1/m2/profile/me               // ✅ Profil sendiri
```

### ❌ Endpoint yang TIDAK Bisa Diakses Mahasiswa

```javascript
// Endpoint khusus dosen
GET /api/v1/m2/kelas/dosen/my-classes   // ❌ Hanya dosen
GET /api/v1/m2/dashboard/dosen          // ❌ Hanya dosen
POST /api/v1/m2/nilai                   // ❌ Hanya dosen (input nilai)
PUT /api/v1/m2/sub-cpmk/:id             // ❌ Hanya dosen (edit)
DELETE /api/v1/m2/sub-cpmk/:id          // ❌ Hanya dosen (delete)
```

## 🔄 Testing

### 1. Restart Expo
```bash
# Stop Expo (Ctrl+C)
# Start lagi:
npm start
```

### 2. Login sebagai Mahasiswa
```
Email: mahasiswa@example.com
Password: password123
```

### 3. Buka Mata Kuliah

Harus muncul:
- ✅ Daftar mata kuliah dari database
- ✅ Search berfungsi
- ✅ Filter semester berfungsi
- ✅ Summary total MK dan SKS

### 4. Cek Console Log

Harus muncul:
```
🌐 API Call: http://YOUR_IP:3000/api/v1/m2/kelas
✅ API Success: /kelas
```

**Tidak boleh muncul:**
```
❌ API Error: 403 Forbidden
❌ Akses ditolak
```

## 📊 Perbedaan Web vs Mobile

### Web Mahasiswa
```typescript
// File: apps/web/module2/lib/api.ts
export const mahasiswaApi = {
  getAllKelas: () => apiFetch('/kelas'), // ✅ Endpoint umum
};
```

### Mobile Mahasiswa (Sekarang Sudah Fix)
```javascript
// File: apps/mobile/module2/services/api.js
export const mahasiswaApi = {
  getAllKelas: () => apiFetch('/kelas'), // ✅ Sama dengan web
  getMyKelas: () => apiFetch('/kelas'),  // ✅ Sama dengan web
};
```

## ✅ Summary

**Masalah:** Endpoint `/kelas/dosen/my-classes` hanya untuk dosen
**Solusi:** Gunakan endpoint `/kelas` untuk mahasiswa
**Status:** ✅ **FIXED!**

**Sekarang mahasiswa bisa akses Mata Kuliah dengan lancar!** 🎉

---

**Note:** Endpoint `/kelas` menampilkan semua kelas yang ada di database. Jika ingin filter kelas per mahasiswa (enrollment), perlu endpoint khusus dari backend seperti `/kelas/mahasiswa/my-classes` atau `/enrollment/mahasiswa/me`.
