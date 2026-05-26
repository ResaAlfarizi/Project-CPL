# Panduan CRUD Capaian CPL Mahasiswa

## Perubahan yang Dilakukan

### 1. Backend - Model (capaianModel.js)
Ditambahkan fungsi CRUD:
- `createCapaian()` - Menambah capaian manual
- `updateCapaian()` - Edit capaian manual
- `deleteCapaian()` - Hapus capaian manual
- `checkCapaianExists()` - Cek apakah capaian sudah ada

### 2. Backend - Controller (capaianController.js)
Ditambahkan handler:
- `createCapaianHandler` - POST /api/v1/m2/capaian
- `updateCapaianHandler` - PUT /api/v1/m2/capaian/:mahasiswa_id/:cpl_id
- `deleteCapaianHandler` - DELETE /api/v1/m2/capaian/:mahasiswa_id/:cpl_id

Validasi:
- Nilai harus antara 0-100
- Cek duplikasi saat create
- Cek keberadaan data saat update/delete

### 3. Backend - Routes (capaianRoutes.js)
Ditambahkan endpoint:
```javascript
POST   /api/v1/m2/capaian                      // Tambah capaian
PUT    /api/v1/m2/capaian/:mahasiswa_id/:cpl_id // Edit capaian
DELETE /api/v1/m2/capaian/:mahasiswa_id/:cpl_id // Hapus capaian
```

Hak akses: **Superadmin** dan **Admin Prodi**

### 4. Frontend - Capaian Page (page.tsx)
Fitur baru:
- ✅ Tombol "Tambah Capaian Manual"
- ✅ Modal form untuk tambah/edit
- ✅ Dropdown mahasiswa dan CPL
- ✅ Input nilai capaian (0-100)
- ✅ Tombol Edit pada setiap row
- ✅ Tombol Hapus dengan konfirmasi
- ✅ Auto refresh setelah CRUD

### 5. Bug Fix - Token Authentication
Diperbaiki penggunaan token key dari `'token'` menjadi `'auth_token'` di:
- capaian/page.tsx
- settings/page.tsx
- input-nilai/page.tsx

## Cara Menggunakan

### Tambah Capaian Manual
1. Pilih Program Studi
2. Klik tombol "Tambah Capaian Manual"
3. Pilih Mahasiswa dari dropdown
4. Pilih CPL dari dropdown
5. Masukkan nilai capaian (0-100)
6. Klik "Simpan"

### Edit Capaian
1. Klik tombol "Edit" pada row yang ingin diubah
2. Ubah nilai capaian
3. Klik "Update"

**Note:** Mahasiswa dan CPL tidak bisa diubah saat edit. Jika ingin mengubah, hapus dan buat baru.

### Hapus Capaian
1. Klik tombol "Hapus" pada row yang ingin dihapus
2. Konfirmasi penghapusan
3. Data akan terhapus dari database

## Testing dengan Postman

### 1. Login dulu untuk mendapatkan token
```
POST http://localhost:3000/api/v1/m2/auth/login
Body: {
  "email": "superadmin@example.com",
  "password": "password123"
}
```

### 2. Tambah Capaian
```
POST http://localhost:3000/api/v1/m2/capaian
Headers: Authorization: Bearer <token>
Body: {
  "mahasiswa_id": "bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1",
  "cpl_id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  "nilai_cpl_total": 85.5
}
```

### 3. Edit Capaian
```
PUT http://localhost:3000/api/v1/m2/capaian/bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
Headers: Authorization: Bearer <token>
Body: {
  "nilai_cpl_total": 90.0
}
```

### 4. Hapus Capaian
```
DELETE http://localhost:3000/api/v1/m2/capaian/bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
Headers: Authorization: Bearer <token>
```

## Catatan Penting

1. **Capaian Manual vs Otomatis**
   - Capaian manual disimpan di tabel `capaian_cpl_mahasiswa`
   - Capaian otomatis dihitung dari VIEW `v_capaian_cpl_mahasiswa`
   - Keduanya akan muncul di halaman capaian

2. **Validasi**
   - Nilai harus 0-100
   - Tidak boleh duplikasi (mahasiswa + CPL yang sama)
   - Hanya Superadmin dan Admin Prodi yang bisa CRUD

3. **Status Capaian**
   - Excellence: ≥ 85
   - Satisfactory: 70-84
   - Competent: 55-69
   - Developing: 40-54
   - Not Competent: < 40

## Troubleshooting

### Error 401 Unauthorized
- Pastikan sudah login dan token valid
- Cek token key menggunakan `'auth_token'` bukan `'token'`
- Token mungkin expired, logout dan login ulang

### Error 409 Conflict
- Capaian untuk mahasiswa dan CPL tersebut sudah ada
- Gunakan fitur Edit untuk mengubah nilai

### Error 404 Not Found
- Data capaian tidak ditemukan
- Pastikan mahasiswa_id dan cpl_id benar

### Data tidak muncul
- Refresh halaman
- Cek console browser untuk error
- Pastikan program studi sudah dipilih
