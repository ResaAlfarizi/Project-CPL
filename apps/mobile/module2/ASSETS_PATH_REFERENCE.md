# 📁 Assets Path Reference

## ✅ Path yang Benar untuk Assets

Setelah struktur folder menggunakan `src/`, berikut adalah path yang benar untuk mengakses assets:

---

## 📂 Struktur Folder

```
apps/mobile/module2/
├── assets/
│   └── uinsa2.jpeg
└── src/
    ├── components/
    │   └── ScreenBackground.js
    ├── screens/
    │   ├── auth/
    │   │   └── LoginScreen.js
    │   ├── dosen/
    │   │   └── ProdiCplScreen.js
    │   └── mahasiswa/
    │       └── ...
    └── ...
```

---

## ✅ Path yang Benar

### 1. Dari `src/components/ScreenBackground.js`
```javascript
const BG_IMAGE = require('../../assets/uinsa2.jpeg');
```
**Penjelasan**: 
- `../` → keluar dari `components/`
- `../` → keluar dari `src/`
- `assets/uinsa2.jpeg` → masuk ke folder `assets/`

---

### 2. Dari `src/screens/auth/LoginScreen.js`
```javascript
const BG_IMAGE = require('../../../assets/uinsa2.jpeg');
```
**Penjelasan**:
- `../` → keluar dari `auth/`
- `../` → keluar dari `screens/`
- `../` → keluar dari `src/`
- `assets/uinsa2.jpeg` → masuk ke folder `assets/`

---

### 3. Dari `src/screens/dosen/ProdiCplScreen.js`
```javascript
const BG_IMAGE = require('../../../assets/uinsa2.jpeg');
```
**Penjelasan**:
- `../` → keluar dari `dosen/`
- `../` → keluar dari `screens/`
- `../` → keluar dari `src/`
- `assets/uinsa2.jpeg` → masuk ke folder `assets/`

---

### 4. Dari `src/screens/mahasiswa/...`
```javascript
const BG_IMAGE = require('../../../assets/uinsa2.jpeg');
```
**Penjelasan**: Sama seperti dosen (level folder yang sama)

---

## 📊 Ringkasan Path

| File Location | Path ke Assets |
|---------------|----------------|
| `src/components/` | `../../assets/` |
| `src/screens/auth/` | `../../../assets/` |
| `src/screens/dosen/` | `../../../assets/` |
| `src/screens/mahasiswa/` | `../../../assets/` |

---

## 🎯 Cara Menghitung Path

### Formula:
```
Hitung berapa level folder dari file ke root, lalu tambahkan assets/
```

### Contoh:
```
File: src/screens/dosen/ProdiCplScreen.js
      └── level 1: dosen/
          └── level 2: screens/
              └── level 3: src/

Path: ../../../assets/uinsa2.jpeg
      └── 3x ../ untuk keluar 3 level
```

---

## ✅ Status Semua File

| File | Path | Status |
|------|------|--------|
| `src/components/ScreenBackground.js` | `../../assets/uinsa2.jpeg` | ✅ Fixed |
| `src/screens/auth/LoginScreen.js` | `../../../assets/uinsa2.jpeg` | ✅ Fixed |
| `src/screens/dosen/ProdiCplScreen.js` | `../../../assets/uinsa2.jpeg` | ✅ Fixed |

---

## 🚀 Cara Menjalankan Setelah Fix

```bash
# Stop Metro bundler (Ctrl+C)

# Clear cache dan restart
npx expo start --clear

# Scan QR code lagi
```

---

**Semua path sudah diperbaiki! 🎉**
