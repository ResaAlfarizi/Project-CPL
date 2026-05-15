# 🎨 VISUAL GUIDE - MODULE 2 SETUP & TESTING

Panduan visual step-by-step untuk setup dan testing Module 2.

---

## 🚀 SETUP BACKEND (5 STEPS)

### **Step 1: Update Password Database**

```bash
psql -U postgres -d projectcpl -f UPDATE_PASSWORD.sql
```

**Output yang benar:**
```
UPDATE 3
```

✅ Password sudah diupdate untuk 3 user

---

### **Step 2: Install Dependencies**

```bash
cd apps/backend
npm install
```

**Output yang benar:**
```
added 150 packages in 45s
```

✅ Dependencies sudah terinstall

---

### **Step 3: Jalankan Backend**

```bash
npm start
```

**Output yang benar:**
```
Backend Modul 1 dan Modul 2 aktif di port 3000
```

✅ Backend sudah running

---

### **Step 4: Buka Postman**

Buka aplikasi Postman atau akses di browser: https://www.postman.com/

✅ Postman sudah siap

---

### **Step 5: Login**

**Request:**
```
POST http://localhost:3000/api/v1/m2/auth/login
Content-Type: application/json

{
  "email": "admin@if.ac.id",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login berhasil",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

✅ Login berhasil, dapat token

---

## 🧪 TESTING ENDPOINT (3 STEPS)

### **Step 1: Copy Token**

Dari response login, copy token:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFhYWFhYWExLWFhYWEtYWFhYS1hYWFhLWFhYWFhYWFhYWFhMSIsImVtYWlsIjoiYWRtaW5AaWYuYWMuaWQiLCJyb2xlIjoic3VwZXJhZG1pbiIsImlhdCI6MTcxNjAxMjM0NSwiZXhwIjoxNzE2MDk4NzQ1fQ.abc123...
```

✅ Token sudah dicopy

---

### **Step 2: Setup Authorization Header**

Di Postman, buat request baru:

```
GET http://localhost:3000/api/v1/m2/kelas
```

Klik tab **"Headers"**:

| Key | Value |
|-----|-------|
| Authorization | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... |

✅ Authorization header sudah disetup

---

### **Step 3: Test Endpoint**

Klik **"Send"**

**Response (200 OK):**
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

✅ Endpoint berhasil ditest

---

## 🔧 TROUBLESHOOTING VISUAL

### **Error: 401 Unauthorized**

```
❌ SALAH - Token di Query Params
GET http://localhost:3000/api/v1/m2/kelas?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

```
✅ BENAR - Token di Authorization Header
GET http://localhost:3000/api/v1/m2/kelas
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### **Error: Database Connection Failed**

```
❌ PostgreSQL tidak running
```

**Solusi:**
1. Buka Services (Windows)
2. Cari "PostgreSQL"
3. Klik "Start"

```
✅ PostgreSQL sudah running
```

---

### **Error: Cannot find module**

```
❌ Dependencies belum diinstall
```

**Solusi:**
```bash
npm install
```

```
✅ Dependencies sudah diinstall
```

---

## 📊 POSTMAN ENVIRONMENT SETUP

### **Cara Setup Environment (Recommended)**

**Step 1: Buat Environment**

```
Klik "Environments" → "+" → Nama: "Module2 Dev" → Create
```

**Step 2: Tambah Variables**

```
Variable: token
Initial Value: (kosong)
Current Value: (kosong)

Variable: base_url
Initial Value: http://localhost:3000/api/v1/m2
Current Value: http://localhost:3000/api/v1/m2
```

**Step 3: Login dan Copy Token**

```
POST {{base_url}}/auth/login
{
  "email": "admin@if.ac.id",
  "password": "password123"
}
```

**Step 4: Update Environment**

Copy token dari response, paste di "Current Value" untuk variable `token`

**Step 5: Gunakan di Request**

```
GET {{base_url}}/kelas
Authorization: Bearer {{token}}
```

---

## 🎯 ENDPOINT TESTING CHECKLIST

### **Kelas Endpoints**

- [ ] GET `/kelas` - Semua kelas
- [ ] GET `/kelas/:id` - Detail kelas
- [ ] GET `/kelas/dosen/my-classes` - Kelas dosen
- [ ] POST `/kelas` - Buat kelas
- [ ] PUT `/kelas/:id` - Update kelas
- [ ] DELETE `/kelas/:id` - Hapus kelas

### **Enrollment Endpoints**

- [ ] GET `/enrollment` - Semua enrollment
- [ ] GET `/enrollment/:id` - Detail enrollment
- [ ] GET `/enrollment/kelas/:kelas_id` - Mahasiswa di kelas
- [ ] GET `/enrollment/mahasiswa/my-enrollment` - KRS mahasiswa
- [ ] POST `/enrollment` - Daftar kelas
- [ ] DELETE `/enrollment/:id` - Drop kelas

### **Nilai Endpoints**

- [ ] GET `/nilai` - Semua nilai
- [ ] GET `/nilai/:id` - Detail nilai
- [ ] GET `/nilai/kelas/:kelas_id` - Nilai kelas
- [ ] GET `/nilai/mahasiswa/my-nilai` - Nilai mahasiswa
- [ ] POST `/nilai` - Input nilai
- [ ] PUT `/nilai/:id` - Update nilai
- [ ] DELETE `/nilai/:id` - Hapus nilai

### **Capaian Endpoints**

- [ ] GET `/capaian/mahasiswa/my-capaian` - Capaian mahasiswa
- [ ] GET `/capaian/mahasiswa/my-capaian/detail` - Detail capaian
- [ ] GET `/capaian/mahasiswa/:mahasiswa_id` - Capaian mahasiswa tertentu
- [ ] GET `/capaian/prodi/:prodi_id` - Capaian prodi
- [ ] GET `/capaian/kelas/:kelas_id` - Capaian kelas
- [ ] GET `/capaian/belum-capai/:cpl_id/:prodi_id` - Mahasiswa belum capai

### **Dashboard Endpoints**

- [ ] GET `/dashboard/admin/:prodi_id` - Dashboard admin
- [ ] GET `/dashboard/dosen` - Dashboard dosen
- [ ] GET `/dashboard/mahasiswa` - Dashboard mahasiswa

---

## 📱 POSTMAN INTERFACE VISUAL

### **Tabs di Postman**

```
┌─────────────────────────────────────────────────────────┐
│ Params | Authorization | Headers | Body | Tests | ...  │
└─────────────────────────────────────────────────────────┘
```

### **Headers Tab (untuk Authorization)**

```
┌─────────────────────────────────────────────────────────┐
│ Key              │ Value                                 │
├──────────────────┼───────────────────────────────────────┤
│ Authorization    │ Bearer eyJhbGciOiJIUzI1NiIsInR5cCI... │
│ Content-Type     │ application/json                      │
└─────────────────────────────────────────────────────────┘
```

### **Body Tab (untuk POST/PUT)**

```
┌─────────────────────────────────────────────────────────┐
│ raw | JSON                                              │
├─────────────────────────────────────────────────────────┤
│ {                                                       │
│   "mk_id": "ccccccc1-cccc-cccc-cccc-ccccccccccc1",     │
│   "dosen_id": "aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1",  │
│   "tahun_akademik": "2024/2025",                       │
│   "semester_aktif": 1,                                 │
│   "nama_kelas": "A"                                    │
│ }                                                       │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 AUTHENTICATION FLOW VISUAL

```
┌─────────────────────────────────────────────────────────┐
│                    USER LOGIN                           │
│                                                         │
│  Email: admin@if.ac.id                                 │
│  Password: password123                                 │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│              BACKEND VERIFY PASSWORD                    │
│                                                         │
│  Hash password & compare dengan database               │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│            GENERATE JWT TOKEN                           │
│                                                         │
│  Token = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...      │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│           RETURN TOKEN TO CLIENT                        │
│                                                         │
│  {                                                      │
│    "message": "Login berhasil",                        │
│    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." │
│  }                                                      │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│         CLIENT SIMPAN TOKEN                             │
│                                                         │
│  Simpan di Postman Environment atau Local Storage      │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│      CLIENT KIRIM TOKEN DI SETIAP REQUEST               │
│                                                         │
│  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI... │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│         BACKEND VERIFY TOKEN                            │
│                                                         │
│  Cek signature & expiration                            │
└─────────────────────────────────────────────────────────┘
                        ↓
                   ┌────────┐
                   │ Valid? │
                   └────────┘
                    ↙      ↘
                  YES      NO
                   ↓        ↓
            ┌──────────┐  ┌──────────────┐
            │ Lanjut   │  │ 401 Unauth   │
            │ Endpoint │  │ Return Error │
            └──────────┘  └──────────────┘
```

---

## 📋 QUICK CHECKLIST

### **Setup**
- [ ] PostgreSQL running
- [ ] Database `projectcpl` ada
- [ ] Password sudah diupdate
- [ ] Dependencies sudah diinstall
- [ ] Backend running di port 3000

### **Testing**
- [ ] Login berhasil
- [ ] Token sudah dicopy
- [ ] Authorization header sudah disetup
- [ ] GET `/kelas` berhasil (200 OK)
- [ ] Semua endpoint sudah ditest

---

## 🎓 LEARNING PATH

```
1. Baca INDEX.md (5 min)
   ↓
2. Baca DOKUMENTASI_LENGKAP.md (30 min)
   ↓
3. Follow VISUAL_GUIDE.md ini (15 min)
   ↓
4. Setup backend (5 min)
   ↓
5. Test di Postman (10 min)
   ↓
6. Bookmark QUICK_REFERENCE.md
   ↓
SELESAI ✅
```

---

## 💡 TIPS

1. **Gunakan Postman Environment** - Lebih mudah manage token
2. **Bookmark QUICK_REFERENCE.md** - Untuk referensi cepat
3. **Print SOLUSI_401_UNAUTHORIZED.md** - Jika sering dapat error 401
4. **Gunakan Ctrl+F** - Untuk search di dokumentasi
5. **Ikuti checklist** - Untuk memastikan setup benar

---

**Selamat! Kamu sudah siap setup dan testing Module 2!** 🚀

**Next:** Baca DOKUMENTASI_LENGKAP.md untuk detail lengkap
