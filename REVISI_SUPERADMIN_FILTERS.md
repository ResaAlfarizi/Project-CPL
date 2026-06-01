# Revisi Superadmin - Filter & Delete Features

## 📋 Ringkasan Perubahan

### 1. **Sub-CPMK Page** ✅
- ✅ Tambah tombol **Delete** pada setiap baris
- ✅ Tambah filter **Per Prodi** (dropdown)
- ✅ Tambah filter **Per Mata Kuliah** (dropdown dengan format: "IF-101 - Algoritma dan Pemrograman")
- ✅ Filter "Semua Mata Kuliah" sebagai default

**Fitur:**
- Dropdown Prodi menampilkan semua prodi dari database
- Dropdown Mata Kuliah menampilkan format: `{kode_mk} - {nama_mk}`
- Ketika prodi dipilih, filter MK akan di-reset
- Tombol Delete dengan konfirmasi sebelum menghapus

### 2. **Mata Kuliah & Pemetaan Page** ✅
- ✅ Ubah searching menjadi **Filter Per Prodi** (dropdown)
- ✅ Tambah **Filter Per Semester** (dropdown 1-8)
- ✅ Tetap ada search box untuk pencarian teks

**Fitur:**
- Filter Prodi: Dropdown dengan semua prodi
- Filter Semester: Dropdown Semester 1-8
- Search box tetap berfungsi untuk pencarian nama/kode MK
- Kombinasi filter: Search + Prodi + Semester

### 3. **Input Nilai Page** ✅
- ✅ Tambah filter **Per Prodi** (dropdown)
- ✅ Tambah filter **Per Semester** (dropdown 1-8)
- ✅ Tetap ada search box untuk pencarian mahasiswa

**Fitur:**
- Filter Prodi: Dropdown dengan semua prodi
- Filter Semester: Dropdown Semester 1-8
- Search box tetap berfungsi untuk pencarian NIM/Nama Mahasiswa
- Kombinasi filter: Search + Prodi + Semester

### 4. **Database Check - Keamanan Informasi** ✅
- ✅ Dibuat script SQL untuk cek data mata kuliah "Keamanan Informasi"
- ✅ Dibuat script SQL untuk fix semester (dari 1 ke 3)
- ✅ Script mencakup verifikasi sebelum dan sesudah update

**File SQL:**
- `CHECK_KEAMANAN_INFORMASI.sql` - Untuk cek data
- `FIX_KEAMANAN_INFORMASI_SEMESTER.sql` - Untuk fix semester

---

## 🎨 UI/UX Changes

### Layout Filter
Semua halaman sekarang memiliki struktur yang konsisten:

```
┌─────────────────────────────────────────────────────┐
│  [Search Box]                    [Tambah Button]    │
├─────────────────────────────────────────────────────┤
│  [Filter Prodi ▼]  [Filter Semester/MK ▼]          │
└─────────────────────────────────────────────────────┘
```

### Tombol Delete
- Warna: Background merah muda (#fdecea), teks merah (#e74c3c)
- Icon: Trash/tempat sampah
- Posisi: Di sebelah tombol Edit
- Konfirmasi: Alert sebelum menghapus

---

## 🔧 Technical Details

### State Management
Setiap halaman menambahkan state baru:
```typescript
const [filterProdi, setFilterProdi] = useState('');
const [filterSemester, setFilterSemester] = useState(''); // untuk Mata Kuliah & Input Nilai
const [filterMK, setFilterMK] = useState(''); // untuk Sub-CPMK
const [prodiList, setProdiList] = useState<Array<{id: string; nama_prodi: string}>>([]);
```

### API Calls
Semua halaman memanggil API prodi:
```typescript
const loadProdi = async () => {
  const response = await fetch('http://localhost:3000/api/v1/m1/prodi', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
    },
  });
  const data = await response.json();
  setProdiList(data.data || []);
};
```

### Filter Logic

**Sub-CPMK:**
```typescript
const matchProdi = !filterProdi || (item.kode_mk && getProdiFromMK(item.kode_mk) === filterProdi);
const matchMK = !filterMK || item.kode_mk === filterMK;
```

**Mata Kuliah:**
```typescript
const matchProdi = !filterProdi || (item.nama_prodi && prodiList.find(p => p.id === filterProdi)?.nama_prodi === item.nama_prodi);
const matchSemester = !filterSemester || String(item.semester_aktif) === filterSemester;
```

**Input Nilai:**
```typescript
const matchProdi = !filterProdi || (nilai.kode_mk && prodiList.find(p => p.id === filterProdi)?.nama_prodi.includes(getProdiFromMK(nilai.kode_mk)));
const matchSemester = !filterSemester || (nilai.semester_aktif && String(nilai.semester_aktif) === filterSemester);
```

---

## 📝 Cara Menggunakan

### 1. Sub-CPMK
1. Pilih **Prodi** dari dropdown (opsional)
2. Pilih **Mata Kuliah** dari dropdown (opsional)
3. Gunakan search box untuk pencarian spesifik
4. Klik **Edit** untuk mengubah data
5. Klik **Hapus** untuk menghapus (akan ada konfirmasi)

### 2. Mata Kuliah
1. Pilih **Prodi** dari dropdown (opsional)
2. Pilih **Semester** dari dropdown (opsional)
3. Gunakan search box untuk pencarian nama/kode MK
4. Klik **Edit** atau **Hapus** pada card

### 3. Input Nilai
1. Pilih **Prodi** dari dropdown (opsional)
2. Pilih **Semester** dari dropdown (opsional)
3. Gunakan search box untuk pencarian mahasiswa
4. Data akan dikelompokkan per Mata Kuliah
5. Klik **Edit** atau **Hapus** pada baris nilai

---

## 🗄️ Database Fix

### Cek Data Keamanan Informasi
Jalankan script `CHECK_KEAMANAN_INFORMASI.sql` di database untuk melihat data saat ini.

### Fix Semester
Jika semester salah (semester 1 padahal seharusnya 3), jalankan:
```sql
UPDATE mata_kuliah 
SET semester = 3 
WHERE nama_mk LIKE '%Keamanan%Informasi%' 
  AND semester != 3;
```

### Verifikasi
Setelah update, cek kembali dengan:
```sql
SELECT kode_mk, nama_mk, semester 
FROM mata_kuliah 
WHERE nama_mk LIKE '%Keamanan%Informasi%';
```

---

## ✅ Testing Checklist

### Sub-CPMK
- [ ] Filter per prodi berfungsi
- [ ] Filter per mata kuliah berfungsi
- [ ] Kombinasi filter prodi + MK berfungsi
- [ ] Tombol delete muncul dan berfungsi
- [ ] Konfirmasi delete muncul
- [ ] Data terhapus dari database

### Mata Kuliah
- [ ] Filter per prodi berfungsi
- [ ] Filter per semester berfungsi
- [ ] Kombinasi filter prodi + semester berfungsi
- [ ] Search box tetap berfungsi
- [ ] Data terfilter dengan benar

### Input Nilai
- [ ] Filter per prodi berfungsi
- [ ] Filter per semester berfungsi
- [ ] Kombinasi filter prodi + semester berfungsi
- [ ] Search box tetap berfungsi
- [ ] Grouping per MK tetap berfungsi

### Database
- [ ] Mata kuliah "Keamanan Informasi" ada di database
- [ ] Semester sudah benar (semester 3)
- [ ] Tidak ada data yang corrupt

---

## 🚀 Deployment Notes

1. **Frontend**: Tidak perlu perubahan backend, hanya frontend
2. **Database**: Jalankan script SQL jika ada data yang salah
3. **Testing**: Test semua filter di environment development dulu
4. **Browser Cache**: Clear cache atau hard refresh (Ctrl+Shift+R)

---

## 📞 Support

Jika ada masalah:
1. Cek console browser untuk error
2. Cek network tab untuk API calls
3. Pastikan token auth valid
4. Pastikan backend running di port 3000
5. Pastikan frontend running di port 3001

---

**Tanggal Update:** 1 Juni 2026
**Status:** ✅ Completed
