# 🔧 CARA FIX ERROR: "Property THEME_COLOR doesn't exist"

## ⚠️ MASALAH
Error ini terjadi karena **Metro bundler masih menggunakan cache lama** dari sebelum revisi UI. File sudah benar, tapi cache belum di-refresh.

---

## ✅ SOLUSI - PILIH SALAH SATU

### SOLUSI 1: Quick Fix (RECOMMENDED) ⚡

#### Windows:
1. **Stop** semua terminal/Metro bundler yang running
2. **Double-click** file `FIX_ERROR_CACHE.bat`
3. Tunggu sampai Metro bundler start ulang
4. Scan QR code atau press 'a' untuk Android / 'i' untuk iOS
5. Test login dengan salah satu role

### SOLUSI 2: Manual Clear Cache 🔧

Jalankan command ini **satu per satu** di terminal:

```bash
# 1. Stop Metro bundler (Ctrl+C di terminal yang running Metro)

# 2. Pindah ke folder mobile module 2
cd apps/mobile/module2

# 3. Clear semua cache
npx expo start --clear

# ATAU jika masih error, clear lebih aggressive:
rmdir /s /q .expo
rmdir /s /q node_modules\.cache
npx expo start --clear
```

### SOLUSI 3: Nuclear Option 💣

Jika masih error setelah clear cache, lakukan **full reset**:

```bash
cd apps/mobile/module2

# 1. Stop Metro bundler

# 2. Hapus semua cache dan dependencies
rmdir /s /q .expo
rmdir /s /q node_modules
del package-lock.json

# 3. Reinstall dependencies
npm install

# 4. Start dengan clear cache
npx expo start --clear
```

---

## 🧪 TESTING SETELAH FIX

### 1. Test Login Admin Prodi:
```
Email: adminprodi@kampus.ac.id (sesuaikan dengan database Anda)
Password: (password yang Anda set)
```
✅ Harus muncul **Sky Blue theme**
✅ Dashboard harus load tanpa error
✅ Semua menu harus accessible

### 2. Test Login Dosen:
```
Email: dosen@kampus.ac.id
Password: (password yang Anda set)
```
✅ Harus muncul **Green theme**
✅ Main screen harus load tanpa error

### 3. Test Login Mahasiswa:
```
Email: mahasiswa@kampus.ac.id
Password: (password yang Anda set)
```
✅ Harus muncul **Orange theme**
✅ Dashboard harus load tanpa error

### 4. Test Login Superadmin:
```
Email: superadmin@kampus.ac.id
Password: (password yang Anda set)
```
✅ Harus muncul **Lavender theme**
✅ Dashboard harus load tanpa error

---

## 🔍 VERIFY FILES (Optional)

Jika masih ada error setelah clear cache, verify bahwa files sudah benar:

```bash
# Run verification script
node verify-imports.js
```

Expected output:
```
✅ Success: 43 (93%)
⚠️  Warnings: 3 (7%)
❌ Errors: 0 (0%)
```

---

## 🐛 TROUBLESHOOTING

### Error masih muncul setelah clear cache?

#### Check 1: Pastikan Metro bundler benar-benar stop
```bash
# Windows - kill all node processes
taskkill /F /IM node.exe

# Tunggu 3 detik, lalu start lagi
npx expo start --clear
```

#### Check 2: Pastikan tidak ada typo di file theme
Buka file: `src/theme/colors.js`

Pastikan ada exports ini:
```javascript
export const BASE = { ... }
export const ROLE_THEMES = { ... }
export const COLORS = { ... }
export const PRIMARY_BLUE = BASE.primaryLight;
export const PRIMARY_DARK = BASE.primary;
```

#### Check 3: Check import di screen files
Contoh di Admin Prodi dashboard:
```javascript
import { BASE, ROLE_THEMES } from '../../theme/colors';

const THEME = ROLE_THEMES.adminProdi;
```

#### Check 4: Restart Expo Go app di phone
1. Force close Expo Go app di phone
2. Open lagi dan scan QR code baru

---

## 📱 JIKA TESTING DI DEVICE

### Android:
1. Pastikan phone dan laptop di network yang sama
2. Scan QR code dari Metro bundler
3. Jika error "Unable to connect", coba:
   - Restart Expo Go app
   - Restart Metro bundler dengan `--clear`
   - Check firewall settings

### iOS:
1. Pastikan device dan Mac di network yang sama
2. Scan QR code atau press 'i' di terminal untuk iOS simulator
3. Jika error, restart Expo Go dan scan ulang

---

## ✨ EXPECTED RESULT

Setelah clear cache dan restart, Anda harus bisa:

✅ Login dengan semua role tanpa error
✅ Melihat theme colors yang berbeda per role:
   - Admin Prodi: Sky Blue (#d4e4f7)
   - Dosen: Green (#d1f4e0)
   - Mahasiswa: Orange (#fff4e6)
   - Superadmin: Lavender (#cdddf4)
✅ Navigate ke semua screens tanpa error
✅ Tidak ada error "THEME_COLOR doesn't exist" di console

---

## 💡 CATATAN PENTING

### Kenapa Error Ini Terjadi?

Metro bundler (React Native's JavaScript bundler) **caches compiled modules** untuk mempercepat development. Ketika kita update banyak file sekaligus (seperti revisi UI ini), cache lama bisa **conflict** dengan code baru.

### Kapan Perlu Clear Cache?

Clear cache diperlukan saat:
- Update banyak files sekaligus
- Change imports/exports
- Refactor code structure
- Error yang tidak masuk akal (file sudah benar tapi tetap error)
- After git pull yang banyak changes

### Best Practice:

Setiap kali update dependencies atau refactor besar:
```bash
npx expo start --clear
```

---

## 🆘 MASIH ERROR?

Jika masih error setelah semua langkah di atas:

1. **Screenshot error message** yang muncul
2. **Copy console logs** (bukan hanya screenshot)
3. **Share file yang error** dengan line number
4. Saya akan bantu debug lebih detail

---

**Last Updated:** June 7, 2026  
**Status:** Ready to fix ✅
