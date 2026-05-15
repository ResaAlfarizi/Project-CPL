# ⚡ QUICK FIX: Token Tidak Valid

## Masalah
```
Error: "Token tidak valid"
```

## Solusi Cepat (3 Langkah)

### **1. Restart Backend**
```bash
# Stop backend (Ctrl+C)
# Lalu jalankan ulang:
npm start
```

### **2. Login Ulang**
```http
POST http://localhost:3000/api/v1/m2/auth/login
Content-Type: application/json

{
  "email": "admin@if.ac.id",
  "password": "password123"
}
```

Copy token dari response.

### **3. Gunakan Token dengan Format Benar**

**Di Postman:**
1. Tab **Authorization**
2. Type: **Bearer Token**
3. Paste token di field **Token**
4. Klik **Send**

**Atau manual di Header:**
```
Authorization: Bearer <paste_token_di_sini>
```

---

## Checklist

- [ ] Backend sudah di-restart
- [ ] Login berhasil dapat token baru
- [ ] Format header: `Authorization: Bearer <token>` (bukan Query Params)
- [ ] Token belum expired (berlaku 1 jam)
- [ ] JWT_SECRET di `.env` = `secret123`

---

## Jika Masih Error

Baca: **SOLUSI_TOKEN_TIDAK_VALID.md**

