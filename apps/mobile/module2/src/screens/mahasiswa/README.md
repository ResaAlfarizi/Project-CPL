# Mahasiswa Screens - Mobile Module 2

Folder ini berisi semua screen untuk portal mahasiswa di aplikasi mobile module 2, yang disinkronisasikan dengan web module 2.

## 📁 Struktur File

```
mahasiswa/
├── DashboardScreen.js       # Dashboard utama mahasiswa
├── ProgramStudiScreen.js    # Daftar program studi & CPL
├── MataKuliahScreen.js      # Daftar mata kuliah
├── SubCpmkScreen.js         # Daftar Sub-CPMK
├── CapaianScreen.js         # Capaian CPL mahasiswa
├── ProfileScreen.js         # Profil mahasiswa
└── README.md                # Dokumentasi ini
```

## 🎯 Fitur Setiap Screen

### 1. DashboardScreen.js
**Fungsi:** Halaman utama mahasiswa setelah login
- Greeting dengan nama mahasiswa
- Quick access menu (Capaian CPL, Mata Kuliah, Program Studi, Sub-CPMK)
- Preview daftar program studi (3 teratas)
- Navigasi ke halaman lain

**Props:**
- `user` - Data user yang sedang login
- `onNavigate` - Function untuk navigasi antar screen

### 2. ProgramStudiScreen.js
**Fungsi:** Menampilkan daftar program studi dan CPL
- Search program studi
- List program studi dengan badge kode & jenjang
- Toggle untuk melihat CPL per prodi
- Detail CPL (kode, nama, deskripsi)

**API:**
- `prodiApi.getAll()` - Ambil semua program studi
- `cplApi.getByProdi(prodiId)` - Ambil CPL berdasarkan prodi

### 3. MataKuliahScreen.js
**Fungsi:** Menampilkan daftar mata kuliah yang tersedia
- Search mata kuliah
- Filter berdasarkan semester
- Card list dengan info lengkap (kode MK, nama, kelas, SKS, semester, TA, dosen)
- Summary total mata kuliah dan SKS

**API:**
- `kelasApi.getMyClasses()` - Ambil kelas mahasiswa

### 4. SubCpmkScreen.js
**Fungsi:** Menampilkan daftar Sub-CPMK
- Search Sub-CPMK atau mata kuliah
- Card list dengan badge (kode, mata kuliah, bobot)
- Expand/collapse untuk melihat deskripsi lengkap
- Summary total Sub-CPMK

**API:**
- `subCpmkApi.getAll()` - Ambil semua Sub-CPMK

### 5. CapaianScreen.js
**Fungsi:** Menampilkan capaian CPL mahasiswa
- Ringkasan capaian per CPL
- Progress bar dengan target
- Status badge (Tercapai/Belum Tercapai)
- Detail capaian per mata kuliah (toggle)
- Nilai dan persentase capaian

**API:**
- `mahasiswaApi.getMyCapaian()` - Ambil capaian mahasiswa
- `mahasiswaApi.getMyCapaianDetail()` - Ambil detail capaian per MK

**Note:** Saat ini menggunakan dummy data, perlu diintegrasikan dengan API backend yang sebenarnya.

### 6. ProfileScreen.js
**Fungsi:** Menampilkan profil mahasiswa
- Avatar dengan initial nama
- Informasi pribadi (nama, NIM, email)
- Informasi akademik (prodi, kode prodi, jenjang, angkatan)
- Statistik akademik (total kelas, total nilai)
- Info note (read-only)
- Tombol logout

**API:**
- `mahasiswaApi.getMyProfile()` - Ambil profil mahasiswa

**Note:** Saat ini menggunakan data dari user login, perlu diintegrasikan dengan API backend yang sebenarnya.

## 🎨 Design System

Semua screen menggunakan design system yang konsisten:

### Color Palette
- **Alice Blue**: `#D8DFE9` - Badge secondary
- **Honeydew**: `#CFDECA` - Badge success/green
- **Vanilla**: `#EFF0A3` - Badge warning/yellow
- **Eerie Black**: `#212121` - Primary text & dark badge
- **Ghost White**: `#F6F5FA` - Background

### Typography
- **Font Family**: Urbanist (Light, Regular, Medium, SemiBold, Bold, ExtraBold)
- **Hero Title**: 22px, Bold, White
- **Card Title**: 14-16px, Bold, Eerie Black
- **Body Text**: 12-13px, Medium, Gray

### Components
- **Hero Banner**: Hijau gelap dengan border radius bawah
- **Cards**: White dengan shadow, border radius 20-24px
- **Badges**: Rounded dengan padding kecil
- **Buttons**: Rounded dengan icon + text

## 🔗 Integrasi dengan App.js

Screens ini sudah terintegrasi dengan `App.js` melalui:

1. **Import Statements**
```javascript
import MahasiswaDashboardScreen from './screens/mahasiswa/DashboardScreen';
import MahasiswaProgramStudiScreen from './screens/mahasiswa/ProgramStudiScreen';
// ... dst
```

2. **Sidebar Menu** (getSidebarMenu)
```javascript
if (r === 'mahasiswa') {
    return [
        { key: 'dashboard', icon: 'monitor-dashboard', label: 'Dashboard' },
        { key: 'program_studi', icon: 'school-outline', label: 'Program Studi' },
        { key: 'mata_kuliah', icon: 'book-open-outline', label: 'Mata Kuliah' },
        { key: 'sub_cpmk', icon: 'clipboard-text-outline', label: 'Sub-CPMK' },
        { key: 'capaian', icon: 'chart-bell-curve-cumulative', label: 'Capaian Saya' },
    ];
}
```

3. **Screen Router** (renderActiveScreen)
```javascript
if (r === 'mahasiswa') {
    switch (currentScreen) {
        case 'dashboard': return <MahasiswaDashboardScreen ... />;
        case 'program_studi': return <MahasiswaProgramStudiScreen />;
        // ... dst
    }
}
```

## 📡 API Endpoints

API endpoints untuk mahasiswa sudah ditambahkan di `services/api.js`:

```javascript
export const mahasiswaApi = {
    // Profile
    getMyProfile: () => apiFetch('/mahasiswa/profile/me'),
    
    // Prodi & CPL
    getAllProdi: () => apiFetch('/prodi'),
    getAllCPL: () => apiFetch('/cpl'),
    getCPLByProdi: (prodiId) => apiFetch(`/cpl/prodi/${prodiId}`),
    
    // Kelas & Mata Kuliah
    getAllKelas: () => apiFetch('/kelas'),
    getMyKelas: () => apiFetch('/mahasiswa/kelas/my-classes'),
    
    // Sub-CPMK
    getAllSubCpmk: () => apiFetch('/sub-cpmk'),
    getSubCpmkByMk: (mkId) => apiFetch(`/sub-cpmk/mk/${mkId}`),
    
    // Capaian
    getMyCapaian: () => apiFetch('/mahasiswa/capaian/me'),
    getMyCapaianDetail: () => apiFetch('/mahasiswa/capaian/me/detail'),
};
```

## 🚀 Cara Menggunakan

1. **Login sebagai mahasiswa** di LoginScreen
2. **Sistem akan otomatis mendeteksi role** dari JWT token
3. **Sidebar menu akan menyesuaikan** dengan menu mahasiswa
4. **Navigasi antar screen** menggunakan sidebar atau quick access

## ⚠️ Catatan Penting

1. **API Integration**: Beberapa screen masih menggunakan dummy data (CapaianScreen, ProfileScreen). Perlu diintegrasikan dengan backend API yang sebenarnya.

2. **Backend Endpoints**: Pastikan backend sudah menyediakan endpoint untuk mahasiswa:
   - `/api/v1/m2/mahasiswa/profile/me`
   - `/api/v1/m2/mahasiswa/kelas/my-classes`
   - `/api/v1/m2/mahasiswa/capaian/me`
   - `/api/v1/m2/mahasiswa/capaian/me/detail`

3. **JWT Token**: Role mahasiswa harus ada di JWT token dengan value `"mahasiswa"` (case-insensitive).

4. **Sinkronisasi dengan Web**: Struktur data dan fitur sudah disesuaikan dengan web module 2 mahasiswa portal.

## 📝 TODO

- [ ] Integrasikan CapaianScreen dengan API backend
- [ ] Integrasikan ProfileScreen dengan API backend
- [ ] Tambahkan error handling yang lebih baik
- [ ] Tambahkan loading state yang lebih informatif
- [ ] Tambahkan refresh/pull-to-refresh functionality
- [ ] Tambahkan offline mode dengan caching
- [ ] Tambahkan unit tests

## 🤝 Kontribusi

Jika ada perubahan di web module 2 mahasiswa, pastikan untuk menyinkronkan perubahan tersebut ke mobile screens ini.

---

**Last Updated:** 2024
**Version:** 1.0.0
**Maintainer:** Development Team
