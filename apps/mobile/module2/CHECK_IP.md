# 🌐 Cara Cek dan Set IP Address Backend

## ❗ PENTING: Ganti IP Address di `services/api.js`

File: `services/api.js` baris 7:
```javascript
const API_BASE = 'http://192.168.1.100:3000/api/v1/m2'; // GANTI IP INI!
```

## 🔍 Cara Cek IP Address Komputer Anda

### Windows (CMD atau PowerShell)
```bash
ipconfig
```

Cari bagian **IPv4 Address**, contoh:
```
Wireless LAN adapter Wi-Fi:
   IPv4 Address. . . . . . . . . . . : 192.168.1.100
```

### Mac/Linux (Terminal)
```bash
ifconfig
# atau
ip addr show
```

Cari **inet**, contoh:
```
en0: flags=8863<UP,BROADCAST,SMART,RUNNING>
    inet 192.168.1.100 netmask 0xffffff00
```

## ✏️ Update IP di `services/api.js`

1. Buka file `services/api.js`
2. Ganti baris 7:
```javascript
// SEBELUM (contoh IP lama)
const API_BASE = 'http://172.30.100.119:3000/api/v1/m2';

// SESUDAH (ganti dengan IP Anda)
const API_BASE = 'http://192.168.1.100:3000/api/v1/m2';
```

3. Save file
4. Restart Expo server:
```bash
# Tekan Ctrl+C di terminal Expo
# Lalu jalankan lagi:
npm start
```

## 🧪 Test Koneksi

### 1. Test dari Browser
Buka browser di komputer, akses:
```
http://localhost:3000/api/v1/m2/prodi
```

Harus muncul data JSON.

### 2. Test dari Smartphone
Buka browser di smartphone, akses:
```
http://192.168.1.100:3000/api/v1/m2/prodi
```
(Ganti IP dengan IP komputer Anda)

Harus muncul data JSON yang sama.

### 3. Jika Tidak Bisa Akses

**Cek firewall:**
```bash
# Windows: Allow port 3000
# Control Panel → Windows Defender Firewall → Advanced Settings
# Inbound Rules → New Rule → Port → TCP 3000 → Allow

# Atau matikan firewall sementara untuk testing
```

**Cek backend running:**
```bash
cd apps/backend
npm start

# Harus muncul:
# Server running on port 3000
```

**Cek smartphone dan komputer di jaringan yang sama:**
- Pastikan keduanya connect ke WiFi yang sama
- Jangan gunakan mobile data di smartphone

## 🐛 Debug Login Issue

### Jika Login Lama/Stuck

**1. Cek Console Log di Terminal Expo**

Lihat output seperti:
```
🔐 Login attempt: mahasiswa@example.com
🌐 Login URL: http://192.168.1.100:3000/api/v1/m2/auth/login
📡 Login response status: 200
✅ Login success: Mahasiswa Demo
```

**Jika muncul error:**
```
❌ Login error: Network request failed
```
→ IP address salah atau backend tidak bisa diakses

```
❌ Login failed: Invalid credentials
```
→ Email/password salah

```
❌ API Error: 401 Unauthorized
```
→ Kredensial tidak valid

**2. Cek Network di Expo DevTools**

- Buka browser: `http://localhost:19002`
- Klik tab "Network"
- Lihat request ke `/auth/login`
- Cek status code dan response

**3. Test Manual dengan Postman/Thunder Client**

```
POST http://192.168.1.100:3000/api/v1/m2/auth/login
Content-Type: application/json

{
  "email": "mahasiswa@example.com",
  "password": "password123"
}
```

Harus return:
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "nama": "Mahasiswa Demo",
    "email": "mahasiswa@example.com",
    "role": "mahasiswa"
  }
}
```

## ✅ Checklist Troubleshooting

- [ ] Backend running di port 3000
- [ ] IP address di `api.js` sudah benar
- [ ] Smartphone dan komputer di WiFi yang sama
- [ ] Firewall allow port 3000
- [ ] Browser bisa akses `http://IP:3000/api/v1/m2/prodi`
- [ ] Smartphone browser bisa akses URL yang sama
- [ ] User mahasiswa ada di database
- [ ] Role di database adalah `'mahasiswa'`
- [ ] Password benar
- [ ] Expo server sudah restart setelah ubah IP

## 🚀 Quick Fix

Jika masih stuck di login:

**1. Restart Everything**
```bash
# Stop backend
Ctrl+C

# Stop Expo
Ctrl+C

# Clear Expo cache
cd apps/mobile/module2
expo start -c

# Start backend
cd apps/backend
npm start

# Di terminal baru, start Expo
cd apps/mobile/module2
npm start
```

**2. Clear App Data**
- Di Expo Go app, shake device
- Tap "Clear AsyncStorage"
- Reload app

**3. Check Logs**
- Terminal Expo: Lihat console.log
- Expo DevTools: Lihat Network tab
- Backend terminal: Lihat request log

## 💡 Common Issues

### Issue: "Network request failed"
**Cause:** IP salah atau backend tidak bisa diakses
**Fix:** Cek IP dan firewall

### Issue: "Invalid credentials"
**Cause:** Email/password salah
**Fix:** Cek database, pastikan user ada

### Issue: "401 Unauthorized"
**Cause:** Token invalid atau expired
**Fix:** Logout dan login ulang

### Issue: Stuck di loading
**Cause:** API call timeout atau infinite loop
**Fix:** Cek console log, restart app

---

**Need Help?**
Cek console log di terminal Expo untuk detail error!
