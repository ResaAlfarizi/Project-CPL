# 🚀 Quick Start - React Navigation

## ⚡ TL;DR
Mobile Module 2 sekarang menggunakan **React Navigation**. Tidak ada perubahan backend, hanya cara navigasi di mobile yang lebih baik.

---

## 🎯 Cara Menjalankan

### 1. Pastikan Dependencies Terinstall
```bash
cd apps/mobile/module2
npm install
```

### 2. Update IP Address di API
Buka `services/api.js` dan update IP address di line 7:
```javascript
const API_BASE = 'http://192.168.1.XXX:3000/api';  // Ganti dengan IP komputer Anda
```

### 3. Jalankan Backend
```bash
cd apps/backend
node app.js
```

### 4. Jalankan Mobile App
```bash
cd apps/mobile/module2
npx expo start
```

### 5. Login
- Gunakan credentials mahasiswa atau dosen yang sudah ada di database
- Contoh: `mahasiswa@test.com` / `password123`

---

## ✅ Apa yang Berubah?

### Sebelum:
```
Login → App.js (state-based) → Semua screen di satu file
```

### Sekarang:
```
Login → AppNavigator → DosenMain/MahasiswaMain → Individual screens
```

---

## 🎨 Fitur Baru

✅ **Back Button**: Tombol back Android sekarang berfungsi  
✅ **Animasi**: Transisi antar screen lebih smooth  
✅ **Gesture**: Swipe back di iOS  
✅ **Memory**: Screen yang tidak terlihat di-unmount (lebih hemat memory)  

---

## 🔧 Struktur File Baru

```
apps/mobile/module2/
├── App.js                          ← Simplified (hanya load fonts + navigator)
├── App.old.js                      ← Backup (state-based navigation)
├── navigation/
│   └── AppNavigator.js             ← Navigation configuration
├── screens/
│   ├── auth/
│   │   └── LoginScreen.js          ← Updated (uses navigation prop)
│   ├── dosen/
│   │   ├── DosenMainScreen.js      ← NEW (wrapper for dosen portal)
│   │   ├── DashboardScreen.js
│   │   ├── MataKuliahScreen.js
│   │   └── ...
│   └── mahasiswa/
│       ├── MahasiswaMainScreen.js  ← NEW (wrapper for mahasiswa portal)
│       ├── DashboardScreen.js
│       ├── MataKuliahScreen.js
│       └── ...
└── services/
    └── api.js                      ← Unchanged
```

---

## 🎯 Testing

### Test Login Flow:
1. Buka app → Tampil LoginScreen
2. Login dengan credentials mahasiswa → Redirect ke MahasiswaMain
3. Logout → Kembali ke LoginScreen
4. Login dengan credentials dosen → Redirect ke DosenMain

### Test Navigation:
1. Buka sidebar → Klik menu → Screen berubah dengan animasi
2. Tekan back button (Android) → Tidak kembali ke login (expected)
3. Logout → Kembali ke login screen

### Test Features:
1. Dashboard → Tampil stats dan quick actions
2. Mata Kuliah → Tampil list kelas
3. Sub-CPMK → Tampil list sub-cpmk
4. Profile → Tampil user info
5. Logout → Berhasil keluar

---

## 🐛 Troubleshooting

### Error: "Cannot find module '@react-navigation/native'"
```bash
npm install
```

### Error: "Cannot read property 'replace' of undefined"
Pastikan screen component menerima `navigation` prop dari React Navigation.

### Login lambat / tidak masuk
1. Cek IP address di `services/api.js`
2. Pastikan backend running di `http://IP:3000`
3. Cek console log untuk error

### Fonts tidak load
```bash
npx expo install @expo-google-fonts/urbanist
```

---

## 📝 Catatan Penting

### ✅ Yang TIDAK Berubah:
- Backend API endpoints
- Database structure
- Screen components (Dashboard, MataKuliah, dll)
- API service (`services/api.js`)
- Styling dan design

### ✅ Yang Berubah:
- Cara navigasi antar screen
- App.js structure (lebih simple)
- LoginScreen (uses navigation prop)
- Added wrapper screens (DosenMain, MahasiswaMain)

---

## 🔄 Rollback ke State-Based Navigation

Jika ada masalah dan ingin kembali ke versi lama:

```bash
cd apps/mobile/module2
cp App.old.js App.js
```

Lalu restart app.

---

## 📚 Dokumentasi Lengkap

Lihat `REACT_NAVIGATION_MIGRATION.md` untuk dokumentasi lengkap tentang:
- Technical details
- Navigation flow
- Code examples
- Advanced troubleshooting

---

## ✅ Status

- **Migration**: ✅ COMPLETED
- **Testing**: ✅ PASSED
- **Backend Changes**: ❌ NONE
- **Ready to Use**: ✅ YES

---

**Selamat mencoba! 🎉**

Jika ada pertanyaan atau masalah, cek dokumentasi lengkap atau console log untuk error details.
