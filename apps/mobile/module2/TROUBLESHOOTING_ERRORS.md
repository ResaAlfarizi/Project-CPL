# 🐛 Troubleshooting Errors - Mobile Module 2

## Error yang Muncul

Berdasarkan screenshot, ada 3 error yang muncul:
1. "Fetch Error: Route tidak ditemukan"
2. "API Error: 404 Route tidak ditemukan"
3. "API Error: Route tidak ditemukan"

---

## 🔍 Cara Debug

### 1. Cek Console Log
Sekarang API sudah ditambahkan console.log. Cek di terminal Metro bundler untuk melihat endpoint mana yang dipanggil:

```
📡 Calling: /profile/mahasiswa/me
✅ Success: /profile/mahasiswa/me
```

Atau jika error:
```
❌ API Error: 404 Route tidak ditemukan
```

### 2. Cek Backend Running
Pastikan backend berjalan tanpa error:
```bash
cd apps/backend
node app.js

# Output yang benar:
# Server running on port 3000
# Database connected successfully
```

### 3. Cek IP Address
Pastikan IP di `src/services/api.js` sudah benar:
```javascript
const API_BASE = 'http://192.168.1.XXX:3000/api';  // Ganti dengan IP Anda
```

Cara cek IP:
```bash
ipconfig
# Cari "IPv4 Address"
```

---

## 🔧 Solusi Berdasarkan Error

### Error: "Route tidak ditemukan" di Profile
**Endpoint**: `/profile/mahasiswa/me`  
**Status**: ✅ Sudah diperbaiki  
**Solusi**: Sudah menggunakan endpoint yang benar

### Error: "Route tidak ditemukan" di Mata Kuliah
**Endpoint**: `/kelas`  
**Kemungkinan Penyebab**:
1. Backend tidak running
2. IP address salah
3. Endpoint belum terdaftar di backend

**Solusi**:
1. Pastikan backend running
2. Cek IP address
3. Test endpoint dengan Postman

### Error: "Route tidak ditemukan" di Screen Lain
**Kemungkinan Screen**:
- Dashboard → `/prodi`
- Program Studi → `/prodi`, `/cpl`
- Sub-CPMK → `/sub-cpmk`
- Capaian → Dummy data (tidak call API)

**Solusi**: Cek console log untuk tahu endpoint mana yang error

---

## 📋 Checklist Debugging

- [ ] Backend running di port 3000
- [ ] IP address sudah benar di `src/services/api.js`
- [ ] HP dan komputer di WiFi yang sama
- [ ] Token masih valid (coba login ulang)
- [ ] Cek console log di Metro bundler
- [ ] Test endpoint dengan Postman

---

## 🧪 Test Endpoint dengan Postman

### 1. Login
```
POST http://YOUR_IP:3000/api/auth/login
Body (JSON):
{
  "email": "mahasiswa@test.com",
  "password": "password123"
}
```

Copy token dari response.

### 2. Test Profile Mahasiswa
```
GET http://YOUR_IP:3000/api/profile/mahasiswa/me
Headers:
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nim": "123456789",
    "nama": "Nama Mahasiswa",
    "email": "mahasiswa@test.com",
    ...
  }
}
```

### 3. Test Kelas
```
GET http://YOUR_IP:3000/api/kelas
Headers:
Authorization: Bearer YOUR_TOKEN_HERE
```

### 4. Test Prodi
```
GET http://YOUR_IP:3000/api/prodi
Headers:
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 🔍 Cara Melihat Console Log

### Di Terminal (Metro Bundler)
Saat menjalankan `npx expo start`, semua console.log akan muncul di terminal.

### Di Expo Go App
1. Shake HP
2. Pilih "Show Dev Menu"
3. Pilih "Debug Remote JS"
4. Buka Chrome DevTools

---

## 💡 Tips Debugging

### 1. Reload App
Setelah fix code, reload app:
- Shake HP → Reload
- Atau di terminal: tekan `r`

### 2. Clear Cache
Jika masih error setelah fix:
```bash
npx expo start --clear
```

### 3. Restart Backend
Kadang backend perlu direstart:
```bash
# Stop: Ctrl+C
# Start lagi:
node app.js
```

### 4. Check Network
Pastikan HP dan komputer di WiFi yang sama:
- Buka Settings → WiFi di HP
- Cek nama WiFi sama dengan komputer

---

## 📊 Endpoint Summary

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/auth/login` | POST | ✅ | Login |
| `/profile/mahasiswa/me` | GET | ✅ | Profile mahasiswa |
| `/kelas` | GET | ✅ | List kelas |
| `/prodi` | GET | ✅ | List prodi |
| `/cpl` | GET | ✅ | List CPL |
| `/sub-cpmk` | GET | ✅ | List Sub-CPMK |

---

## 🚀 Langkah-langkah Fix

### 1. Stop Semua
```bash
# Stop Metro bundler: Ctrl+C
# Stop backend: Ctrl+C
```

### 2. Update IP
Edit `src/services/api.js` line 7:
```javascript
const API_BASE = 'http://YOUR_IP:3000/api';
```

### 3. Start Backend
```bash
cd apps/backend
node app.js
```

### 4. Start Mobile
```bash
cd apps/mobile/module2
npx expo start --clear
```

### 5. Test
- Scan QR code
- Login
- Cek console log di terminal
- Jika ada error, screenshot dan cek endpoint mana yang error

---

## 📞 Jika Masih Error

Jika masih error setelah semua langkah di atas:

1. **Screenshot console log** di terminal Metro bundler
2. **Screenshot error** di HP
3. **Cek endpoint mana** yang error dari console log
4. **Test endpoint** dengan Postman
5. **Tanya lagi** dengan info lengkap

---

**Good luck debugging! 🎉**
