# Testing Login System

## 🧪 Panduan Testing

### Persiapan Testing

#### 1. Pastikan Backend Berjalan
```bash
cd apps/backend
node app.js
```
Cek di terminal, seharusnya muncul:
```
Server running on port 3000
Database connected
```

#### 2. Pastikan Database Memiliki User
Jalankan query ini di PostgreSQL untuk membuat user test:

```sql
-- Cek apakah ada user
SELECT * FROM users;

-- Jika belum ada, buat user test (password: test123)
-- Hash untuk 'test123' menggunakan bcrypt
INSERT INTO users (email, password_hash, role_id, created_at, updated_at)
VALUES (
  'test@example.com',
  '$2b$10$YourHashedPasswordHere',
  1,
  NOW(),
  NOW()
);
```

Atau gunakan endpoint register jika sudah tersedia:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "role_id": 1
  }'
```

#### 3. Jalankan Frontend
```bash
cd apps/web/module2
npm run dev
```

### Test Cases

#### ✅ Test 1: Akses Halaman Login
1. Buka browser: `http://localhost:3001`
2. **Expected**: Otomatis redirect ke `/login`
3. **Verify**: URL berubah menjadi `http://localhost:3001/login`

#### ✅ Test 2: Login dengan Kredensial Valid
1. Di halaman login, masukkan:
   - Email: `test@example.com`
   - Password: `test123`
2. Klik tombol "Masuk"
3. **Expected**: 
   - Loading spinner muncul
   - Redirect ke `/dashboard`
   - Dashboard menampilkan info user
4. **Verify**:
   - Cek localStorage: `auth_token` ada
   - Cek console: tidak ada error
   - User info ditampilkan di dashboard

#### ✅ Test 3: Login dengan Email Salah
1. Di halaman login, masukkan:
   - Email: `wrong@example.com`
   - Password: `test123`
2. Klik tombol "Masuk"
3. **Expected**: 
   - Error message: "User tidak ditemukan"
   - Tetap di halaman login
4. **Verify**: Tidak ada token di localStorage

#### ✅ Test 4: Login dengan Password Salah
1. Di halaman login, masukkan:
   - Email: `test@example.com`
   - Password: `wrongpassword`
2. Klik tombol "Masuk"
3. **Expected**: 
   - Error message: "Password salah"
   - Tetap di halaman login
4. **Verify**: Tidak ada token di localStorage

#### ✅ Test 5: Validasi Form
1. Di halaman login, coba submit form kosong
2. **Expected**: Browser validation muncul
3. Coba masukkan email tidak valid (tanpa @)
4. **Expected**: Browser validation muncul

#### ✅ Test 6: Logout
1. Setelah login berhasil, di dashboard
2. Klik tombol "Logout"
3. **Expected**: 
   - Redirect ke `/login`
   - Token dihapus dari localStorage
4. **Verify**: 
   - Cek localStorage: `auth_token` tidak ada
   - Tidak bisa akses `/dashboard` lagi

#### ✅ Test 7: Protected Route
1. Logout terlebih dahulu
2. Coba akses langsung: `http://localhost:3001/dashboard`
3. **Expected**: Otomatis redirect ke `/login`
4. **Verify**: Tidak bisa akses dashboard tanpa login

#### ✅ Test 8: Token Persistence
1. Login dengan kredensial valid
2. Refresh halaman (F5)
3. **Expected**: 
   - Tetap login
   - Tidak redirect ke login
   - Dashboard tetap menampilkan data user
4. **Verify**: Token masih ada di localStorage

#### ✅ Test 9: Akses Login Saat Sudah Login
1. Login dengan kredensial valid
2. Coba akses: `http://localhost:3001/login`
3. **Expected**: Otomatis redirect ke `/dashboard`
4. **Verify**: Tidak bisa akses halaman login saat sudah login

#### ✅ Test 10: Network Error Handling
1. Matikan backend server
2. Coba login
3. **Expected**: Error message muncul
4. **Verify**: Aplikasi tidak crash

### Testing dengan Browser DevTools

#### Cek Token di LocalStorage
1. Buka DevTools (F12)
2. Tab "Application" → "Local Storage"
3. Cek key `auth_token`
4. Copy token dan decode di [jwt.io](https://jwt.io)
5. **Verify**: Token berisi `id` dan `role`

#### Cek Network Request
1. Buka DevTools (F12)
2. Tab "Network"
3. Login dengan kredensial valid
4. Cek request ke `/api/auth/login`
5. **Verify**:
   - Request method: POST
   - Request body: email & password
   - Response: token
   - Status: 200

#### Cek Console Errors
1. Buka DevTools (F12)
2. Tab "Console"
3. Lakukan berbagai aksi (login, logout, navigate)
4. **Verify**: Tidak ada error merah

### Testing dengan cURL

#### Test Login API Langsung
```bash
# Test login berhasil
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'

# Expected response:
# {
#   "message": "Login berhasil",
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
# }
```

```bash
# Test login gagal (email salah)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "wrong@example.com",
    "password": "test123"
  }'

# Expected response:
# {
#   "message": "User tidak ditemukan"
# }
```

```bash
# Test login gagal (password salah)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "wrongpassword"
  }'

# Expected response:
# {
#   "message": "Password salah"
# }
```

### Automated Testing (Optional)

Jika ingin membuat automated test, bisa menggunakan:

#### Jest + React Testing Library
```typescript
// __tests__/login.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '@/app/login/page';

describe('Login Page', () => {
  it('should render login form', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('should show error on invalid credentials', async () => {
    render(<LoginPage />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'wrong@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpass' }
    });
    fireEvent.click(screen.getByText(/masuk/i));

    await waitFor(() => {
      expect(screen.getByText(/tidak ditemukan/i)).toBeInTheDocument();
    });
  });
});
```

#### Playwright E2E Testing
```typescript
// e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test('should login successfully', async ({ page }) => {
  await page.goto('http://localhost:3001');
  
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'test123');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL(/dashboard/);
  await expect(page.locator('text=Dashboard')).toBeVisible();
});
```

## 📊 Test Results Checklist

Gunakan checklist ini untuk memastikan semua test passed:

- [ ] ✅ Test 1: Akses Halaman Login
- [ ] ✅ Test 2: Login dengan Kredensial Valid
- [ ] ✅ Test 3: Login dengan Email Salah
- [ ] ✅ Test 4: Login dengan Password Salah
- [ ] ✅ Test 5: Validasi Form
- [ ] ✅ Test 6: Logout
- [ ] ✅ Test 7: Protected Route
- [ ] ✅ Test 8: Token Persistence
- [ ] ✅ Test 9: Akses Login Saat Sudah Login
- [ ] ✅ Test 10: Network Error Handling

## 🐛 Common Issues

### Issue: "Cannot connect to backend"
**Solution**: 
- Pastikan backend berjalan di port 3000
- Cek `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:3000`

### Issue: "Token tidak valid"
**Solution**:
- Clear localStorage
- Pastikan JWT_SECRET di backend benar
- Cek apakah token expired

### Issue: "CORS error"
**Solution**:
- Tambahkan CORS middleware di backend
- Pastikan backend mengizinkan origin `http://localhost:3001`

### Issue: "User tidak ditemukan"
**Solution**:
- Cek database apakah user ada
- Pastikan email yang digunakan benar
- Buat user baru jika perlu

## 📝 Test Report Template

```
=== LOGIN SYSTEM TEST REPORT ===
Date: [Date]
Tester: [Name]
Environment: Development

Test Results:
1. Akses Halaman Login: [PASS/FAIL]
2. Login Valid: [PASS/FAIL]
3. Login Email Salah: [PASS/FAIL]
4. Login Password Salah: [PASS/FAIL]
5. Validasi Form: [PASS/FAIL]
6. Logout: [PASS/FAIL]
7. Protected Route: [PASS/FAIL]
8. Token Persistence: [PASS/FAIL]
9. Akses Login Saat Login: [PASS/FAIL]
10. Network Error: [PASS/FAIL]

Overall Status: [PASS/FAIL]
Notes: [Any additional notes]
```

---

**Happy Testing! 🚀**
