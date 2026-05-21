# 🧪 Test Login Mahasiswa

## Langkah-langkah Debugging

### 1. Cek Backend Running

```bash
cd apps/backend/module2
npm start
```

Expected output:
```
Server running on port 3000
Database connected
```

### 2. Test Login API Langsung

Buka browser console atau gunakan curl:

```bash
curl -X POST http://localhost:3000/api/v1/m2/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"mhs1@if.ac.id\",\"password\":\"123456\"}"
```

Expected response:
```json
{
  "message": "Login berhasil",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Decode Token

Copy token dari response, lalu decode di https://jwt.io

Expected payload:
```json
{
  "id": "uuid-mahasiswa",
  "role": "Mahasiswa",
  "iat": 1234567890,
  "exp": 1234567890
}
```

**PENTING:** Pastikan `role` adalah **"Mahasiswa"** (huruf besar M)

### 4. Cek Console Browser

1. Buka browser DevTools (F12)
2. Buka tab **Console**
3. Login dengan:
   - Email: `mhs1@if.ac.id`
   - Password: `123456`

Expected console output:
```
🔐 Login attempt: mhs1@if.ac.id
✅ Login response: {message: "Login berhasil", token: "..."}
🎫 Decoded token: {id: "...", role: "Mahasiswa", iat: ..., exp: ...}
➡️ Redirecting to /mahasiswa
```

### 5. Cek Network Tab

1. Buka tab **Network**
2. Login
3. Cek request ke `/api/v1/m2/auth/login`
4. Lihat Response

### 6. Cek LocalStorage

1. Buka tab **Application** (Chrome) atau **Storage** (Firefox)
2. Expand **Local Storage** → `http://localhost:3001`
3. Cek apakah ada key `auth_token`

---

## Kemungkinan Masalah

### Problem 1: Backend tidak running

**Solusi:**
```bash
cd apps/backend/module2
npm install
npm start
```

### Problem 2: Database tidak ada user mahasiswa

**Solusi:**
```bash
cd database
psql -U postgres -d sistem_cpl -f check-users.sql
```

Jika tidak ada user mahasiswa, jalankan:
```bash
psql -U postgres -d sistem_cpl -f 05_insert_test_users.sql
```

### Problem 3: Role tidak match

Cek di database:
```sql
SELECT u.email, r.nama_role 
FROM users u 
JOIN roles r ON u.role_id = r.id 
WHERE u.email = 'mhs1@if.ac.id';
```

Expected: `nama_role` = **"Mahasiswa"** (bukan "mahasiswa")

### Problem 4: Token tidak valid

Cek JWT_SECRET di `.env`:
```env
JWT_SECRET=your_secret_key_here
```

Pastikan sama di backend dan frontend.

### Problem 5: CORS Error

Cek backend `app.js`, pastikan ada:
```javascript
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));
```

### Problem 6: Redirect tidak jalan

Cek file:
- `contexts/AuthContext.tsx` - line ~35
- `middleware.ts` - line ~15
- `app/page.tsx` - line ~15

Pastikan ada logic redirect ke `/mahasiswa` untuk role "Mahasiswa"

---

## Quick Fix

Jika masih stuck, coba:

1. **Clear browser cache & localStorage:**
   - Chrome: Ctrl+Shift+Delete → Clear browsing data
   - Atau manual: DevTools → Application → Clear storage

2. **Restart dev server:**
   ```bash
   # Terminal 1 - Backend
   cd apps/backend/module2
   npm start
   
   # Terminal 2 - Frontend
   cd apps/web/module2
   npm run dev
   ```

3. **Hard refresh browser:**
   - Windows: Ctrl+Shift+R
   - Mac: Cmd+Shift+R

---

## Test Credentials

| Email | Password | Role | Should Redirect To |
|-------|----------|------|-------------------|
| mhs1@if.ac.id | 123456 | Mahasiswa | `/mahasiswa` |
| admin@cpl.ac.id | admin123 | Superadmin | `/dashboard` |
| dosen1@if.ac.id | 123456 | Dosen | `/dashboard` |

---

## Jika Masih Gagal

Screenshot dan kirim:
1. Console browser (tab Console)
2. Network tab (request login)
3. Application tab (localStorage)
4. Backend terminal output
