# Update Bottom Navigation & Remove CPL Detail

## 📋 Perubahan

### 1. ✅ Tambah Bottom Navigation Bar
**Masalah:** Ketika klik fitur, tombol back keluar dari aplikasi (tidak ada cara kembali ke dashboard)

**Solusi:** Tambahkan bottom navigation bar dengan 4 menu utama:
- 🏠 Dashboard
- 🏫 Prodi (Program Studi)
- 📚 Mata Kuliah
- 📊 Capaian

**Fitur:**
- Icon berubah warna saat aktif (hitam #212121)
- Label berubah bold saat aktif
- Selalu visible di semua screen (kecuali profile)
- Mudah navigasi antar screen tanpa perlu back button

### 2. ✅ Hapus Detail/Deskripsi CPL
**Masalah:** Di screen Program Studi, CPL menampilkan deskripsi yang panjang

**Solusi:** Hapus field `cpl.deskripsi` dari tampilan
- Hanya tampilkan kode CPL dan nama CPL
- Tampilan lebih ringkas dan clean

---

## 🎨 UI Bottom Navigation

```
┌─────────────────────────────────────────┐
│                                         │
│         CONTENT AREA                    │
│                                         │
├─────────────────────────────────────────┤
│  [🏠]    [🏫]    [📚]    [📊]          │
│Dashboard  Prodi  Mata   Capaian        │
│                  Kuliah                 │
└─────────────────────────────────────────┘
```

**Active State:**
- Icon: Hitam (#212121)
- Label: Bold, Hitam (#212121)

**Inactive State:**
- Icon: Abu-abu (#94A3B8)
- Label: Regular, Abu-abu (#94A3B8)

---

## 📁 File yang Diubah

### 1. `src/screens/mahasiswa/MahasiswaMainScreen.js`

**Tambahan:**
```javascript
{/* BOTTOM NAVIGATION */}
<View style={styles.bottomNav}>
    <TouchableOpacity style={styles.navItem} onPress={() => handleNavigation('dashboard')}>
        <MaterialCommunityIcons name="view-dashboard" size={24} color={...} />
        <Text style={styles.navLabel}>Dashboard</Text>
    </TouchableOpacity>
    // ... 3 menu lainnya
</View>
```

**Styles Baru:**
- `bottomNav` - Container bottom navigation
- `navItem` - Item menu navigation
- `navLabel` - Label text menu
- `navLabelActive` - Label saat menu aktif

### 2. `src/screens/mahasiswa/ProgramStudiScreen.js`

**Dihapus:**
```javascript
// SEBELUM
{cpl.deskripsi && (
    <Text style={styles.cplDescription}>{cpl.deskripsi}</Text>
)}

// SESUDAH
// Dihapus, hanya tampilkan kode dan nama CPL
```

**Style Dihapus:**
- `cplDescription` - tidak digunakan lagi

---

## 🔄 Cara Kerja Navigation

### State Management
```javascript
const [currentScreen, setCurrentScreen] = useState('dashboard');

const handleNavigation = (screenKey) => {
    setCurrentScreen(screenKey);
    setProfileDropdownOpen(false);
};
```

### Screen Mapping
- `dashboard` → DashboardScreen
- `program_studi` → ProgramStudiScreen
- `mata_kuliah` → MataKuliahScreen
- `capaian` → CapaianScreen
- `profile` → ProfileScreen (dari dropdown)

### Navigation Flow
```
User klik menu → handleNavigation(screenKey) → setCurrentScreen → renderActiveScreen()
```

---

## ✅ Hasil Akhir

### Bottom Navigation
- ✅ Selalu visible di bottom screen
- ✅ 4 menu utama: Dashboard, Prodi, Mata Kuliah, Capaian
- ✅ Active state dengan warna hitam dan bold
- ✅ Smooth transition antar screen
- ✅ Tidak keluar dari aplikasi saat navigasi

### CPL Display
- ✅ Hanya tampilkan kode CPL (badge)
- ✅ Hanya tampilkan nama CPL
- ✅ Tidak ada deskripsi panjang
- ✅ Tampilan lebih ringkas

---

## 🧪 Testing Checklist

### Bottom Navigation
- [ ] Bottom nav muncul di semua screen (kecuali profile)
- [ ] Klik Dashboard → pindah ke dashboard
- [ ] Klik Prodi → pindah ke program studi
- [ ] Klik Mata Kuliah → pindah ke mata kuliah
- [ ] Klik Capaian → pindah ke capaian
- [ ] Icon dan label berubah warna saat aktif
- [ ] Tidak keluar dari aplikasi saat navigasi

### CPL Display
- [ ] Buka screen Program Studi
- [ ] Klik "Lihat CPL" atau auto-load CPL
- [ ] CPL hanya menampilkan kode dan nama
- [ ] Tidak ada deskripsi panjang
- [ ] Tampilan lebih ringkas

---

## 📝 Catatan

### Bottom Navigation
- Bottom nav tidak muncul di screen Profile (akses via dropdown)
- Sub-CPMK tidak ada di bottom nav (akses via quick action di dashboard)
- Padding bottom disesuaikan untuk iOS (safe area)

### CPL Display
- Deskripsi CPL masih ada di database
- Hanya tidak ditampilkan di mobile
- Web masih bisa menampilkan deskripsi lengkap

---

**Status:** ✅ SELESAI
**Tanggal:** 2026-05-30
**Ready for Testing:** Ya
