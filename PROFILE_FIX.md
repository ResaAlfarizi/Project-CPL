# Fix Profile "Akses Ditolak"

## Masalah
Profile page menampilkan "Akses ditolak" untuk Admin Prodi.

## Penyebab
Route profile menggunakan `authorize("Admin Prodi")` yang terlalu ketat.

## Solusi

### 1. Buat Universal Profile Route
**File**: `apps/backend/module2/src/routes/profileRoutes.js`

Route ini bisa diakses oleh **SEMUA role yang authenticated** (tidak perlu authorize middleware).

**Endpoint**:
```
GET /api/v1/m2/profile/me
Authorization: Bearer <token>
```

**Fitur**:
- Mengambil data user dari tabel `users`
- Join dengan tabel `prodi` untuk mendapatkan nama prodi
- Mencoba mengambil nama dari tabel `dosen` atau `mahasiswa` jika ada
- Fallback ke email jika nama tidak ditemukan

### 2. Daftarkan Route di Index
**File**: `apps/backend/module2/src/routes/index.js`

**Urutan Penting**:
```javascript
router.use("/profile", profileRoutes);        // ← HARUS PERTAMA (universal)
router.use("/profile", dosenProfileRoutes);   // Specific untuk Dosen
router.use("/profile", mahasiswaProfileRoutes); // Specific untuk Mahasiswa
```

Route universal harus didaftarkan **PERTAMA** agar bisa catch request `/me` sebelum route specific lainnya.

## Testing

### 1. Restart Backend
```bash
cd apps/backend/module2
node app.js
```

### 2. Test Profile
1. Login sebagai Admin Prodi
2. Klik "Profil Saya"
3. Seharusnya tidak ada error "Akses ditolak"
4. Data profil muncul dengan:
   - Nama (dari email)
   - Email
   - Role: Admin Prodi
   - Program Studi

### 3. Verifikasi Response
Buka Network tab (F12) dan lihat response dari `/api/v1/m2/profile/me`:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "admin@if.ac.id",
    "nama": "admin",
    "role": "Admin Prodi",
    "prodi_id": "uuid",
    "nama_prodi": "Teknik Informatika",
    "kode_prodi": "IF",
    "jenjang": "S1"
  }
}
```

## File yang Diubah

1. ✅ `apps/backend/module2/src/routes/profileRoutes.js` (NEW)
   - Universal profile route untuk semua role

2. ✅ `apps/backend/module2/src/routes/index.js`
   - Import dan daftarkan profileRoutes
   - Urutan route diperbaiki

## Status
✅ SELESAI - Perlu restart backend untuk apply changes

---

**RESTART BACKEND SEKARANG!**
```bash
cd apps/backend/module2
node app.js
```
