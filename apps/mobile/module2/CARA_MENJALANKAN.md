# 🚀 Cara Menjalankan Mobile Module 2

## ⚡ Quick Start

### 1️⃣ Update IP Address
Buka `src/services/api.js` line 7:
```javascript
const API_BASE = 'http://192.168.1.XXX:3000/api';  // Ganti dengan IP Anda
```

**Cara cek IP:**
```bash
ipconfig
# Cari "IPv4 Address"
```

### 2️⃣ Install Dependencies
```bash
cd apps/mobile/module2
npm install
```

### 3️⃣ Jalankan Backend
```bash
cd apps/backend
node app.js
```

### 4️⃣ Jalankan Mobile App
```bash
cd apps/mobile/module2
npx expo start
```

### 5️⃣ Scan QR Code
- Android: Pakai Expo Go app
- iOS: Pakai Camera app

### 6️⃣ Login
```
Email: mahasiswa@test.com
Password: password123
```

---

## 🐛 Jika Ada Error

### Error: "Unable to resolve module"
**Solusi**: Restart Metro bundler
```bash
# Tekan Ctrl+C untuk stop
# Lalu jalankan lagi:
npx expo start --clear
```

### Error: "Cannot connect to backend"
**Solusi**: 
1. Pastikan backend running
2. Cek IP di `src/services/api.js`
3. HP dan komputer harus di WiFi yang sama

### Error: "Module not found"
**Solusi**:
```bash
npm install
npx expo start --clear
```

---

## ✅ Checklist

- [ ] IP address sudah benar di `src/services/api.js`
- [ ] `npm install` sudah dijalankan
- [ ] Backend running di port 3000
- [ ] Mobile app running (`npx expo start`)
- [ ] HP dan komputer di WiFi yang sama
- [ ] Sudah scan QR code
- [ ] Bisa login

---

**Selamat mencoba! 🎉**
