# 🔧 Troubleshooting: Login Lama/Stuck

## ❗ Masalah: Login Lama, Tidak Masuk-Masuk

### 🎯 Solusi Cepat (5 Menit)

#### 1️⃣ CEK IP ADDRESS (PALING SERING!)

**Buka file:** `services/api.js` baris 7

```javascript
const API_BASE = 'http://192.168.1.100:3000/api/v1/m2'; // GANTI IP INI!
```

**Cara cek IP komputer Anda:**

**Windows:**
```bash
ipconfig
```
Cari **IPv4 Address**, contoh: `192.168.1.100`

**Mac/Linux:**
```bash
ifconfig
```
Cari **inet**, contoh: `192.168.1.100`

**GANTI IP di `api.js` dengan IP Anda!**

#### 2️⃣ RESTART EXPO

```bash
# Stop Expo (Ctrl+C)
# Lalu jalankan dengan clear cache:
expo start -c
```

#### 3️⃣ CEK BACKEND RUNNING

```bash
cd apps/backend
npm start

# Harus muncul:
# Server running on port 3000
```

#### 4️⃣ TEST KONEKSI

**Di browser komputer:**
```
http://localhost:3000/api/v1/m2/prodi
```
Harus muncul data JSON.

**Di browser smartphone:**
```
http://192.168.1.100:3000/api/v1/m2/prodi
```
(Ganti IP dengan IP Anda)

Harus muncul data JSON yang sama.

**Jika tidak bisa akses → IP salah atau firewall block!**

---

## 🔍 Debug Detail

### Lihat Console Log di Terminal Expo

Setelah tap "Masuk", lihat terminal Expo. Harus muncul:

**✅ Login Berhasil:**
```
🔐 Login attempt: mahasiswa@example.com
🌐 Login URL: http://192.168.1.100:3000/api/v1/m2/auth/login
📡 Login response status: 200
✅ Login success: Mahasiswa Demo
✅ Token saved successfully
```

**❌ Login Gagal - Network Error:**
```
🔐 Login attempt: mahasiswa@example.com
🌐 Login URL: http://192.168.1.100:3000/api/v1/m2/auth/login
❌ Login error: Network request failed
```
→ **Solusi:** IP salah atau backend tidak bisa diakses

**❌ Login Gagal - Invalid Credentials:**
```
🔐 Login attempt: mahasiswa@example.com
🌐 Login URL: http://192.168.1.100:3000/api/v1/m2/auth/login
📡 Login response status: 401
❌ Login failed: Invalid credentials
```
→ **Solusi:** Email/password salah, cek database

**❌ Login Gagal - Timeout:**
```
🔐 Login attempt: mahasiswa@example.com
🌐 Login URL: http://192.168.1.100:3000/api/v1/m2/auth/login
(tidak ada response)
```
→ **Solusi:** Backend tidak running atau firewall block

---

## 🛠️ Solusi Berdasarkan Error

### Error: "Network request failed"

**Penyebab:**
- IP address salah
- Backend tidak running
- Firewall block port 3000
- Smartphone dan komputer beda jaringan

**Solusi:**
1. **Cek IP di `api.js` sudah benar**
2. **Pastikan backend running:**
   ```bash
   cd apps/backend
   npm start
   ```
3. **Test di browser smartphone:**
   ```
   http://YOUR_IP:3000/api/v1/m2/prodi
   ```
4. **Matikan firewall sementara** (untuk testing)
5. **Pastikan WiFi sama** di smartphone dan komputer

### Error: "Invalid credentials"

**Penyebab:**
- Email salah
- Password salah
- User tidak ada di database

**Solusi:**
1. **Cek user di database:**
   ```sql
   SELECT * FROM users WHERE email = 'mahasiswa@example.com';
   ```
2. **Pastikan role = 'mahasiswa'**
3. **Pastikan password sudah di-hash dengan bcrypt**
4. **Test login di Postman dulu:**
   ```
   POST http://localhost:3000/api/v1/m2/auth/login
   {
     "email": "mahasiswa@example.com",
     "password": "password123"
   }
   ```

### Error: Stuck di Loading (Tidak Ada Error)

**Penyebab:**
- API call timeout
- Infinite loop
- Data loading terlalu lama

**Solusi:**
1. **Cek console log** di terminal Expo
2. **Restart app:**
   - Shake device
   - Tap "Reload"
3. **Clear AsyncStorage:**
   - Shake device
   - Tap "Clear AsyncStorage"
   - Reload app
4. **Restart Expo dengan clear cache:**
   ```bash
   expo start -c
   ```

---

## 🚀 Quick Fix Checklist

Lakukan step by step:

- [ ] **Step 1:** Cek IP di `api.js` sudah benar
- [ ] **Step 2:** Backend running di port 3000
- [ ] **Step 3:** Browser komputer bisa akses `http://localhost:3000/api/v1/m2/prodi`
- [ ] **Step 4:** Browser smartphone bisa akses `http://YOUR_IP:3000/api/v1/m2/prodi`
- [ ] **Step 5:** Smartphone dan komputer di WiFi yang sama
- [ ] **Step 6:** Firewall allow port 3000
- [ ] **Step 7:** User mahasiswa ada di database dengan role `'mahasiswa'`
- [ ] **Step 8:** Restart Expo dengan `expo start -c`
- [ ] **Step 9:** Clear AsyncStorage di app
- [ ] **Step 10:** Test login lagi

---

## 💡 Tips Debugging

### 1. Gunakan Expo DevTools

Buka browser: `http://localhost:19002`
- Tab **Logs**: Lihat console.log
- Tab **Network**: Lihat API calls
- Tab **Performance**: Lihat loading time

### 2. Test Backend Manual

**Postman/Thunder Client:**
```
POST http://localhost:3000/api/v1/m2/auth/login
Content-Type: application/json

{
  "email": "mahasiswa@example.com",
  "password": "password123"
}
```

**Expected Response:**
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

### 3. Check Backend Logs

Di terminal backend, harus muncul:
```
POST /api/v1/m2/auth/login 200 - 123ms
```

Jika tidak muncul → Request tidak sampai ke backend

### 4. Test dari Smartphone Browser

Buka browser di smartphone, akses:
```
http://YOUR_IP:3000/api/v1/m2/prodi
```

Jika tidak bisa akses → Network issue!

---

## 🔥 Nuclear Option (Jika Semua Gagal)

```bash
# 1. Stop semua
Ctrl+C (backend)
Ctrl+C (Expo)

# 2. Clear cache
cd apps/mobile/module2
rm -rf node_modules
npm install

# 3. Clear Expo cache
expo start -c

# 4. Di smartphone:
# - Shake device
# - Clear AsyncStorage
# - Reload app

# 5. Start backend
cd apps/backend
npm start

# 6. Start Expo (terminal baru)
cd apps/mobile/module2
npm start

# 7. Test login lagi
```

---

## 📞 Masih Stuck?

**Kirim info berikut:**
1. Console log dari terminal Expo (copy semua)
2. IP address di `api.js`
3. Output dari `ipconfig` (Windows) atau `ifconfig` (Mac/Linux)
4. Screenshot error di app
5. Backend terminal log

**Atau coba:**
1. Gunakan `localhost` jika test di emulator
2. Gunakan IP `10.0.2.2` jika test di Android emulator
3. Gunakan ngrok untuk expose backend

---

**Good Luck! 🍀**
