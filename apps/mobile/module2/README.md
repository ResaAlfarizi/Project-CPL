# 📱 Mobile Module 2 - Sistem CPL

## 🎯 Overview

Mobile Module 2 adalah aplikasi mobile untuk Sistem Capaian Pembelajaran Lulusan (CPL) yang dibangun dengan **React Native** dan **Expo**. Aplikasi ini menggunakan **React Navigation** untuk navigasi antar screen.

---

## ✨ Features

### 👨‍🎓 Portal Mahasiswa
- ✅ Dashboard dengan statistik
- ✅ Program Studi & CPL
- ✅ Mata Kuliah
- ✅ Sub-CPMK
- ✅ Capaian CPL
- ✅ Profile

### 👨‍🏫 Portal Dosen
- ✅ Dashboard dengan statistik
- ✅ Program Studi & CPL
- ✅ Mata Kuliah
- ✅ Sub-CPMK Management
- ✅ Input Nilai
- ✅ Capaian Mahasiswa
- ✅ Profile

---

## 🛠️ Tech Stack

- **React Native** 0.81.0
- **Expo** ~54.0.0
- **React Navigation** 6.x
- **AsyncStorage** untuk token storage
- **Expo Google Fonts** (Urbanist)
- **Material Community Icons**

---

## 📁 Struktur Folder

```
apps/mobile/module2/
├── src/                            ← Source code
│   ├── navigation/                 ← React Navigation config
│   │   └── AppNavigator.js
│   ├── screens/                    ← All screens
│   │   ├── auth/
│   │   │   └── LoginScreen.js
│   │   ├── dosen/
│   │   │   ├── DosenMainScreen.js
│   │   │   ├── DashboardScreen.js
│   │   │   ├── ProdiCplScreen.js
│   │   │   ├── MataKuliahScreen.js
│   │   │   ├── SubCpmkScreen.js
│   │   │   ├── InputNilaiScreen.js
│   │   │   ├── CapaianScreen.js
│   │   │   └── ProfilDetailScreen.js
│   │   └── mahasiswa/
│   │       ├── MahasiswaMainScreen.js
│   │       ├── DashboardScreen.js
│   │       ├── ProgramStudiScreen.js
│   │       ├── MataKuliahScreen.js
│   │       ├── SubCpmkScreen.js
│   │       ├── CapaianScreen.js
│   │       └── ProfileScreen.js
│   ├── services/
│   │   └── api.js                  ← API configuration
│   └── components/
│       └── ScreenBackground.js
├── assets/
│   └── uinsa2.jpeg
├── App.js                          ← Entry point
├── package.json
└── app.json
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd apps/mobile/module2
npm install
```

### 2. Update IP Address
Edit `src/services/api.js` line 7:
```javascript
const API_BASE = 'http://192.168.1.XXX:3000/api';  // Ganti dengan IP Anda
```

**Cara cek IP:**
```bash
ipconfig
# Cari "IPv4 Address"
```

### 3. Start Backend
```bash
cd apps/backend
node app.js
```

### 4. Start Mobile App
```bash
cd apps/mobile/module2
npx expo start
```

### 5. Scan QR Code
- **Android**: Gunakan Expo Go app
- **iOS**: Gunakan Camera app

### 6. Login
```
Mahasiswa:
Email: mahasiswa@test.com
Password: password123

Dosen:
Email: dosen@test.com
Password: password123
```

---

## 📚 Dokumentasi

### 📖 Panduan Lengkap
- **[CARA_MENJALANKAN.md](CARA_MENJALANKAN.md)** - Cara menjalankan aplikasi
- **[PENJELASAN_REACT_NAVIGATION.md](PENJELASAN_REACT_NAVIGATION.md)** - Penjelasan React Navigation (Bahasa Indonesia)
- **[README_REACT_NAVIGATION.md](README_REACT_NAVIGATION.md)** - Complete guide React Navigation

### 🔧 Technical Documentation
- **[FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md)** - Struktur folder detail
- **[API_ENDPOINTS_REFERENCE.md](API_ENDPOINTS_REFERENCE.md)** - Daftar endpoint API
- **[ASSETS_PATH_REFERENCE.md](ASSETS_PATH_REFERENCE.md)** - Path untuk assets
- **[NAVIGATION_FLOW.md](NAVIGATION_FLOW.md)** - Diagram alur navigasi

### 🐛 Troubleshooting
- **[TROUBLESHOOTING_ERRORS.md](TROUBLESHOOTING_ERRORS.md)** - Cara debug error
- **[CHECK_IP.md](CHECK_IP.md)** - Cara cek IP address
- **[TROUBLESHOOTING_LOGIN.md](TROUBLESHOOTING_LOGIN.md)** - Troubleshoot login

### 📋 Migration & History
- **[REACT_NAVIGATION_MIGRATION.md](REACT_NAVIGATION_MIGRATION.md)** - Detail migrasi
- **[MIGRATION_SUMMARY.md](MIGRATION_SUMMARY.md)** - Ringkasan migrasi
- **[FILE_CLEANUP_SUMMARY.md](FILE_CLEANUP_SUMMARY.md)** - File yang dihapus
- **[CHANGES_SUMMARY.txt](CHANGES_SUMMARY.txt)** - Ringkasan perubahan

---

## 🎨 Design System

### Colors
- **Primary**: `#212121` (Eerie Black)
- **Background**: `#F6F5FA` (Alice Blue)
- **Accent Blue**: `#E8F3FF`
- **Accent Green**: `#CFDECA` (Honeydew)
- **Accent Yellow**: `#EFF0A3` (Vanilla)
- **Text**: `#212121`, `#64748B`

### Typography
- **Font Family**: Urbanist
- **Weights**: Light (300), Regular (400), Medium (500), SemiBold (600), Bold (700), ExtraBold (800)

---

## 🔌 API Endpoints

### Authentication
```
POST /auth/login
```

### Mahasiswa
```
GET /profile/mahasiswa/me    - Profile
GET /kelas                   - Mata Kuliah
GET /prodi                   - Program Studi
GET /cpl                     - CPL
GET /sub-cpmk                - Sub-CPMK
```

### Dosen
```
GET /profile/me              - Profile
GET /dashboard/dosen         - Dashboard
GET /kelas/dosen/my-classes  - My Classes
GET /sub-cpmk                - Sub-CPMK
POST /sub-cpmk               - Create Sub-CPMK
PUT /sub-cpmk/:id            - Update Sub-CPMK
DELETE /sub-cpmk/:id         - Delete Sub-CPMK
GET /nilai                   - Nilai
POST /nilai                  - Create Nilai
PUT /nilai/:id               - Update Nilai
```

Lihat **[API_ENDPOINTS_REFERENCE.md](API_ENDPOINTS_REFERENCE.md)** untuk detail lengkap.

---

## 🐛 Common Issues

### Issue: "Cannot connect to backend"
**Solution**: 
1. Pastikan backend running
2. Update IP di `src/services/api.js`
3. HP dan komputer di WiFi yang sama

### Issue: "Route tidak ditemukan"
**Solution**:
1. Cek endpoint di `API_ENDPOINTS_REFERENCE.md`
2. Pastikan backend running
3. Test dengan Postman

### Issue: "Module not found"
**Solution**:
```bash
npm install
npx expo start --clear
```

### Issue: "Fonts not loading"
**Solution**:
```bash
npx expo install @expo-google-fonts/urbanist
```

Lihat **[TROUBLESHOOTING_ERRORS.md](TROUBLESHOOTING_ERRORS.md)** untuk troubleshooting lengkap.

---

## 📊 Project Status

| Feature | Status |
|---------|--------|
| React Navigation | ✅ Implemented |
| Mahasiswa Portal | ✅ Complete |
| Dosen Portal | ✅ Complete |
| Authentication | ✅ Working |
| API Integration | ✅ Working |
| Folder Structure (`src/`) | ✅ Organized |
| Documentation | ✅ Complete |

---

## 🎯 Navigation Flow

```
App.js
  └── AppNavigator (React Navigation)
      └── Stack Navigator
          ├── LoginScreen
          ├── DosenMainScreen (Dosen Portal)
          │   ├── Dashboard
          │   ├── Prodi & CPL
          │   ├── Mata Kuliah
          │   ├── Sub-CPMK
          │   ├── Input Nilai
          │   ├── Capaian
          │   └── Profile
          └── MahasiswaMainScreen (Mahasiswa Portal)
              ├── Dashboard
              ├── Program Studi
              ├── Mata Kuliah
              ├── Sub-CPMK
              ├── Capaian
              └── Profile
```

---

## 🔧 Development

### Run in Development
```bash
npx expo start
```

### Clear Cache
```bash
npx expo start --clear
```

### Run on Specific Platform
```bash
npx expo start --android
npx expo start --ios
```

---

## 📝 Notes

### Backend
- Backend harus running di port 3000
- Database PostgreSQL harus accessible
- Pastikan semua route sudah terdaftar

### Mobile
- HP dan komputer harus di WiFi yang sama
- Update IP address sesuai dengan IP komputer
- Token disimpan di AsyncStorage

### Assets
- Background image: `assets/uinsa2.jpeg`
- Path dari `src/` folder: `../../assets/` atau `../../../assets/`

---

## 🎉 Credits

- **Framework**: React Native + Expo
- **Navigation**: React Navigation
- **Icons**: Material Community Icons
- **Fonts**: Urbanist (Google Fonts)
- **Backend**: Node.js + Express + PostgreSQL

---

## 📞 Support

Jika ada masalah:
1. Cek dokumentasi di folder ini
2. Cek console log untuk error details
3. Test endpoint dengan Postman
4. Lihat troubleshooting guide

---

**Version**: 2.0.0 (React Navigation)  
**Last Updated**: May 28, 2026  
**Status**: ✅ Production Ready

---

**Happy Coding! 🚀**
