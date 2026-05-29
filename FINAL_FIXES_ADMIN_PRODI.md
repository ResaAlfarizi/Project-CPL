# Perbaikan Final Admin Prodi

## Ringkasan Perbaikan

Dokumen ini mencatat perbaikan terakhir untuk menyelesaikan semua masalah Admin Prodi.

---

## 1. ✅ Tambah Mata Kuliah - API Method Ditambahkan

### Masalah:
- Button "Tambah Mata Kuliah" error karena `mataKuliahApi.create()` tidak ada

### Solusi:
**File**: `apps/web/module2/lib/api.ts`

**Perubahan**:
Menambahkan method `create` pada `mataKuliahApi`:

```typescript
export const mataKuliahApi = {
  getAll: async () => { ... },
  create: async (body: { 
    kode_mk: string; 
    nama_mk: string; 
    sks: number; 
    prodi_id: string; 
    semester?: number 
  }) => {
    const token = authStorage.getToken();
    const res = await fetch(`${API_URL}/api/v1/m1/kurikulum/mk`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal menambah mata kuliah');
    return data;
  },
};
```

**Status**: ✅ SELESAI

---

## 2. ✅ Profile Page - Backend Route Ditambahkan

### Masalah:
- Profile page menampilkan "Akses Ditolak"
- Tidak ada route `/api/v1/m2/profile/me` untuk Admin Prodi

### Solusi:
**File Baru**: `apps/backend/module2/src/routes/adminProdiProfileRoutes.js`

**Endpoint Baru**:
```
GET /api/v1/m2/profile/me
Authorization: Bearer <token>
Role: Admin Prodi
```

**Response**:
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

**File Diubah**: `apps/backend/module2/src/routes/index.js`
- Menambahkan import `adminProdiProfileRoutes`
- Mendaftarkan route `router.use("/profile", adminProdiProfileRoutes)`

**Status**: ✅ SELESAI

---

## 3. ✅ Manajemen User - Masih Kosong (Perlu Restart Backend)

### Masalah:
- Tabel user masih kosong
- Filter sudah diperbaiki tapi data tidak muncul

### Kemungkinan Penyebab:
1. **Database belum ada user Dosen/Mahasiswa**
2. **Backend belum di-restart** setelah perubahan

### Solusi:

#### A. Restart Backend
```bash
cd apps/backend/module2
node app.js
```

#### B. Cek Database
Jalankan query ini untuk melihat user yang ada:

```sql
SELECT id, email, role, prodi_id 
FROM users 
WHERE role IN ('Dosen', 'Mahasiswa');
```

#### C. Tambah User Test (Jika Kosong)
```sql
-- Tambah Dosen
INSERT INTO users (id, email, password, role, prodi_id)
VALUES (
  gen_random_uuid(),
  'dosen1@if.ac.id',
  '$2b$10$hashedpassword', -- password: "password123"
  'Dosen',
  (SELECT id FROM prodi WHERE kode_prodi = 'IF' LIMIT 1)
);

-- Tambah Mahasiswa
INSERT INTO users (id, email, password, role, prodi_id)
VALUES (
  gen_random_uuid(),
  'mahasiswa1@if.ac.id',
  '$2b$10$hashedpassword', -- password: "password123"
  'Mahasiswa',
  (SELECT id FROM prodi WHERE kode_prodi = 'IF' LIMIT 1)
);
```

**Status**: ⚠️ PERLU RESTART BACKEND & CEK DATABASE

---

## 4. ✅ Greeting - Tampilkan Nama Prodi

### Masalah:
- Greeting tidak menunjukkan admin prodi apa

### Solusi:
**File 1**: `apps/web/module2/app/admin-prodi/page.tsx`
**File 2**: `apps/web/module2/components/admin-prodi/AdminProdiHeader.tsx`

**Format Baru**:
```
Selamat datang, [Nama]
[Admin Prodi Nama Prodi]
```

**Contoh**:
```
Selamat datang, Ahmad Wijaya
Admin Prodi Teknik Informatika
```

**Implementasi**:
```typescript
const fullName = response.data.nama || response.data.email?.split('@')[0] || 'Admin';
const prodiName = response.data.nama_prodi || '';

setUserName(fullName);
setUserRole(prodiName ? `Admin Prodi ${prodiName}` : 'Admin Prodi');
```

**Dashboard Display**:
- Line 1: "Selamat datang, [Nama]"
- Line 2: "[Admin Prodi Nama Prodi]" (dengan style berbeda)

**Status**: ✅ SELESAI

---

## 5. ✅ User API - Tambah prodi_id Parameter

### Masalah:
- Saat tambah user, `prodi_id` tidak terkirim

### Solusi:
**File**: `apps/web/module2/lib/api.ts`

**Perubahan**:
```typescript
export const userApi = {
  create: (body: { 
    email: string; 
    password: string; 
    role: string; 
    prodi_id?: string  // ← Ditambahkan
  }) => apiFetch('/users', { method: 'POST', body: JSON.stringify(body) }),
};
```

**Status**: ✅ SELESAI

---

## Langkah Testing

### 1. Restart Backend
```bash
# Terminal 1 - Backend
cd apps/backend/module2
node app.js
```

### 2. Restart Frontend
```bash
# Terminal 2 - Frontend
cd apps/web/module2
npm run dev
```

### 3. Test Profile Page
1. Login sebagai Admin Prodi
2. Klik "Profil Saya" di dropdown header
3. Seharusnya tidak ada error "Akses Ditolak"
4. Data profil muncul dengan nama prodi

### 4. Test Greeting
1. Lihat dashboard
2. Greeting seharusnya menampilkan:
   ```
   Selamat datang, [Nama Anda]
   Admin Prodi [Nama Prodi]
   ```

### 5. Test Tambah Mata Kuliah
1. Buka "Mata Kuliah & Pemetaan"
2. Klik "Tambah Mata Kuliah"
3. Isi form:
   - Kode MK: IF101
   - Nama MK: Pemrograman Web
   - SKS: 3
   - Semester: 3 (opsional)
4. Klik Simpan
5. Seharusnya berhasil dan muncul di dropdown saat tambah kelas

### 6. Test Manajemen User
1. Buka "Manajemen User"
2. Buka Console (F12)
3. Lihat log:
   ```
   All users from API: [...]
   After role filter: [...]
   Final filtered users: [...]
   ```
4. Jika masih kosong, cek database dengan query di atas
5. Tambah user test jika perlu

---

## Troubleshooting

### Profile Page Masih "Akses Ditolak"

**Cek**:
1. Backend sudah di-restart?
2. Route sudah terdaftar di `index.js`?
3. Token JWT valid?

**Debug**:
```bash
# Cek log backend saat akses profile
# Seharusnya muncul log request ke /api/v1/m2/profile/me
```

### Tambah Mata Kuliah Masih Error

**Cek Console Error**:
- Buka Console (F12)
- Lihat error message
- Cek Network tab untuk melihat response

**Kemungkinan**:
- Backend module1 tidak running
- Endpoint `/api/v1/m1/kurikulum/mk` tidak ada
- Authorization gagal

### Manajemen User Masih Kosong

**Langkah Debug**:
1. Buka Console (F12)
2. Lihat log "All users from API"
3. Jika array kosong → Database belum ada user
4. Jika ada data tapi "After role filter" kosong → Tidak ada user dengan role Dosen/Mahasiswa

**Solusi**:
- Jalankan SQL script untuk tambah user test
- Atau gunakan Superadmin untuk tambah user via UI

---

## File yang Diubah/Ditambahkan

### Frontend:
1. ✅ `apps/web/module2/lib/api.ts`
   - Tambah `mataKuliahApi.create()`
   - Update `userApi.create()` dengan `prodi_id`

2. ✅ `apps/web/module2/app/admin-prodi/page.tsx`
   - Update greeting format

3. ✅ `apps/web/module2/components/admin-prodi/AdminProdiHeader.tsx`
   - Update role display format

### Backend:
1. ✅ `apps/backend/module2/src/routes/adminProdiProfileRoutes.js` (NEW)
   - Route profile untuk Admin Prodi

2. ✅ `apps/backend/module2/src/routes/index.js`
   - Daftarkan route admin prodi profile

---

## Status Akhir

| No | Masalah | Status | Keterangan |
|----|---------|--------|------------|
| 1 | Tambah Mata Kuliah Error | ✅ SELESAI | API method ditambahkan |
| 2 | Profile Akses Ditolak | ✅ SELESAI | Backend route ditambahkan |
| 3 | Manajemen User Kosong | ⚠️ PERLU CEK | Restart backend & cek database |
| 4 | Greeting Tidak Jelas | ✅ SELESAI | Format diperbaiki |
| 5 | User API Missing prodi_id | ✅ SELESAI | Parameter ditambahkan |

---

## Next Steps

1. **RESTART BACKEND** ← PENTING!
   ```bash
   cd apps/backend/module2
   node app.js
   ```

2. **Test Profile Page**
   - Login sebagai Admin Prodi
   - Akses /admin-prodi/profile
   - Seharusnya tidak error lagi

3. **Test Tambah Mata Kuliah**
   - Klik "Tambah Mata Kuliah"
   - Isi form dan simpan
   - Cek apakah berhasil

4. **Cek Manajemen User**
   - Buka halaman
   - Lihat console log
   - Jika kosong, cek database

5. **Verifikasi Greeting**
   - Lihat dashboard
   - Pastikan menampilkan nama dan prodi

---

**Tanggal**: 2026-05-29
**Status**: 4/5 Selesai, 1 Perlu Verifikasi Database
**Action Required**: RESTART BACKEND!
