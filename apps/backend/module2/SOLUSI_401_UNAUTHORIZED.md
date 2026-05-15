# 🔧 SOLUSI: 401 Unauthorized Error

Panduan untuk mengatasi error 401 Unauthorized saat testing API.

---

## ❌ MASALAH

Ketika mencoba test endpoint `/kelas` di Postman, mendapat error:

```json
{
  "message": "Token tidak ada"
}
```

**HTTP Status:** 401 Unauthorized

---

## 🔍 PENYEBAB

Token ditempatkan di **Query Params** atau **Body**, padahal seharusnya di **Authorization Header**.

### **Contoh Salah:**

```
GET http://localhost:3000/api/v1/m2/kelas?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

atau

```
GET http://localhost:3000/api/v1/m2/kelas
Body: {
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## ✅ SOLUSI

### **Cara 1: Manual di Setiap Request (Cepat)**

1. **Buka Postman**
2. **Buat request baru:**
   ```
   GET http://localhost:3000/api/v1/m2/kelas
   ```

3. **Klik tab "Headers"**

4. **Tambah header baru:**
   - **Key:** `Authorization`
   - **Value:** `Bearer <paste_token_here>`

5. **Contoh lengkap:**
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFhYWFhYWExLWFhYWEtYWFhYS1hYWFhLWFhYWFhYWFhYWFhMSIsImVtYWlsIjoiYWRtaW5AaWYuYWMuaWQiLCJyb2xlIjoic3VwZXJhZG1pbiIsImlhdCI6MTcxNjAxMjM0NSwiZXhwIjoxNzE2MDk4NzQ1fQ.abc123...
   ```

6. **Klik Send** ✅

---

### **Cara 2: Gunakan Postman Environment (Recommended)**

Lebih mudah dan tidak perlu copy-paste token di setiap request.

#### **Step 1: Buat Environment**

1. Klik **"Environments"** di sidebar kiri
2. Klik **"+"** untuk buat environment baru
3. Nama: `Module2 Dev`
4. Klik **"Create"**

#### **Step 2: Tambah Variable**

Di environment yang baru dibuat, tambah variable:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `token` | (kosong) | (kosong) |
| `base_url` | http://localhost:3000/api/v1/m2 | http://localhost:3000/api/v1/m2 |

#### **Step 3: Login dan Copy Token**

1. **Buat request login:**
   ```http
   POST {{base_url}}/auth/login
   Content-Type: application/json

   {
     "email": "admin@if.ac.id",
     "password": "password123"
   }
   ```

2. **Klik Send**

3. **Copy token dari response:**
   ```json
   {
     "message": "Login berhasil",
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   }
   ```

4. **Update environment:**
   - Klik "Environments" → "Module2 Dev"
   - Paste token di kolom "Current Value" untuk variable `token`
   - Klik **"Save"**

#### **Step 4: Gunakan di Request**

Sekarang di setiap request, gunakan:

```http
GET {{base_url}}/kelas
Authorization: Bearer {{token}}
```

Postman akan otomatis replace `{{base_url}}` dan `{{token}}` dengan nilai dari environment.

---

## 📋 CHECKLIST PERBAIKAN

- [ ] Buka Postman
- [ ] Login ke `/auth/login` dan dapatkan token
- [ ] Buat request GET `/kelas`
- [ ] Klik tab "Headers"
- [ ] Tambah header: `Authorization: Bearer <token>`
- [ ] Klik Send
- [ ] Verifikasi response 200 OK ✅

---

## 🧪 TEST SETELAH PERBAIKAN

### **Request:**
```http
GET http://localhost:3000/api/v1/m2/kelas
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Response (200 OK):**
```json
{
  "success": true,
  "message": "Berhasil mengambil data kelas",
  "data": [
    {
      "id": "fffffff1-ffff-ffff-ffff-fffffffffff1",
      "kode_mk": "IF101",
      "nama_mk": "Pemrograman Dasar",
      "nama_dosen": "Dr. Budi Santoso",
      "tahun_akademik": "2024/2025",
      "semester_aktif": 1,
      "sks": 3
    }
  ]
}
```

---

## 🔐 CARA KERJA AUTHENTICATION

### **Flow:**

```
1. User login dengan email & password
   ↓
2. Backend verify password
   ↓
3. Backend generate JWT token
   ↓
4. Return token ke client
   ↓
5. Client simpan token
   ↓
6. Client kirim token di Authorization header
   ↓
7. Backend verify token
   ↓
8. Jika valid → Lanjut ke endpoint
   ↓
9. Jika tidak valid → Return 401 Unauthorized
```

### **Format Authorization Header:**

```
Authorization: Bearer <JWT_TOKEN>
```

**Contoh:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFhYWFhYWExLWFhYWEtYWFhYS1hYWFhLWFhYWFhYWFhYWFhMSIsImVtYWlsIjoiYWRtaW5AaWYuYWMuaWQiLCJyb2xlIjoic3VwZXJhZG1pbiIsImlhdCI6MTcxNjAxMjM0NSwiZXhwIjoxNzE2MDk4NzQ1fQ.abc123...
```

---

## ⚠️ ERROR YANG MUNGKIN TERJADI

### **1. 401 - Token tidak ada**
```json
{
  "message": "Token tidak ada"
}
```
**Penyebab:** Authorization header tidak ada atau format salah
**Solusi:** Tambah header `Authorization: Bearer <token>`

### **2. 401 - Token tidak valid**
```json
{
  "message": "Token tidak valid"
}
```
**Penyebab:** Token sudah expired atau JWT_SECRET tidak cocok
**Solusi:** Login ulang untuk dapatkan token baru

### **3. 403 - Akses ditolak**
```json
{
  "message": "Akses ditolak"
}
```
**Penyebab:** Role user tidak sesuai dengan endpoint
**Solusi:** Gunakan user dengan role yang tepat

---

## 📚 REFERENSI

- **JWT (JSON Web Token):** https://jwt.io/
- **HTTP Authorization Header:** https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization
- **Postman Documentation:** https://learning.postman.com/

---

## 💡 TIPS

1. **Gunakan Postman Environment** untuk manage token lebih mudah
2. **Jangan share token** ke orang lain
3. **Token akan expired** setelah beberapa jam, login ulang jika perlu
4. **Selalu gunakan HTTPS** di production (bukan HTTP)

---

**Sekarang kamu siap testing API dengan benar!** 🚀

Untuk panduan lengkap testing, baca: **POSTMAN_TESTING_GUIDE.md**
