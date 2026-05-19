# Panduan Login Web Module 2

## 📋 Deskripsi
Sistem login Next.js yang terintegrasi dengan backend module2 menggunakan JWT authentication.

## 🚀 Fitur

### ✅ Yang Sudah Dibuat:
1. **Halaman Login** (`/login`)
   - Form login dengan email dan password
   - Validasi input
   - Error handling
   - Loading state
   - UI modern dengan Tailwind CSS

2. **Dashboard** (`/dashboard`)
   - Menampilkan informasi user yang login
   - Tombol logout
   - Protected route (hanya bisa diakses setelah login)
   - Statistik placeholder

3. **Authentication System**
   - JWT token management
   - LocalStorage untuk menyimpan token
   - Token validation dan expiry check
   - Auto redirect berdasarkan status login

4. **Context API**
   - AuthContext untuk state management global
   - useAuth hook untuk akses mudah ke auth state

5. **Protected Routes**
   - Middleware untuk route protection
   - Component ProtectedRoute untuk role-based access
   - Halaman unauthorized

## 📁 Struktur File

```
apps/web/module2/
├── app/
│   ├── login/
│   │   └── page.tsx          # Halaman login
│   ├── dashboard/
│   │   └── page.tsx          # Dashboard setelah login
│   ├── unauthorized/
│   │   └── page.tsx          # Halaman akses ditolak
│   ├── layout.tsx            # Root layout dengan AuthProvider
│   └── page.tsx              # Home page (redirect)
├── components/
│   └── ProtectedRoute.tsx    # Component untuk protected routes
├── contexts/
│   └── AuthContext.tsx       # Auth context & provider
├── lib/
│   ├── api.ts                # API functions untuk backend
│   └── auth.ts               # Auth utilities (token management)
├── middleware.ts             # Next.js middleware untuk route protection
└── .env.local                # Environment variables
```

## 🔧 Konfigurasi

### 1. Environment Variables
File: `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 2. Backend API Endpoint
Sistem ini terhubung ke backend module2 di endpoint:
- **Login**: `POST http://localhost:3000/api/auth/login`
- **Register**: `POST http://localhost:3000/api/auth/register`

## 🎯 Cara Menggunakan

### 1. Jalankan Backend Module2
```bash
cd apps/backend
node app.js
```
Backend akan berjalan di `http://localhost:3000`

### 2. Jalankan Frontend Module2
```bash
cd apps/web/module2
npm run dev
```
Frontend akan berjalan di `http://localhost:3001` (atau port lain jika 3000 sudah digunakan)

### 3. Akses Aplikasi
- Buka browser: `http://localhost:3001`
- Akan otomatis redirect ke `/login`
- Login dengan kredensial yang ada di database
- Setelah login berhasil, akan redirect ke `/dashboard`

## 🔐 Flow Authentication

### Login Flow:
1. User mengisi form login (email & password)
2. Frontend mengirim POST request ke `/api/auth/login`
3. Backend memvalidasi kredensial
4. Jika valid, backend mengembalikan JWT token
5. Frontend menyimpan token di localStorage
6. Frontend decode token untuk mendapatkan user info
7. Redirect ke dashboard

### Token Management:
- Token disimpan di localStorage dengan key `auth_token`
- Token di-decode untuk mendapatkan user ID dan role
- Token divalidasi setiap kali aplikasi dimuat
- Jika token expired, user akan di-redirect ke login

### Logout Flow:
1. User klik tombol logout
2. Token dihapus dari localStorage
3. Auth state di-reset
4. Redirect ke halaman login

## 📝 API Integration

### Login Request
```typescript
POST /api/v1/m2/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Login Response (Success)
```typescript
{
  "message": "Login berhasil",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login Response (Error)
```typescript
{
  "message": "User tidak ditemukan"
}
// atau
{
  "message": "Password salah"
}
```

## 🎨 UI Components

### Login Page Features:
- ✅ Responsive design
- ✅ Form validation
- ✅ Error messages
- ✅ Loading spinner
- ✅ Remember me checkbox
- ✅ Forgot password link (placeholder)
- ✅ Modern gradient background

### Dashboard Features:
- ✅ User info display
- ✅ Logout button
- ✅ Statistics cards (placeholder)
- ✅ Responsive layout

## 🔒 Security Features

1. **JWT Token Validation**
   - Token expiry check
   - Automatic token removal jika expired

2. **Protected Routes**
   - Middleware untuk cek authentication
   - Component-level protection
   - Role-based access control (siap digunakan)

3. **Error Handling**
   - Proper error messages
   - Network error handling
   - Invalid credentials handling

## 🛠️ Customization

### Menambah Role-Based Access:
```typescript
// Di dashboard page
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={['SuperAdmin', 'Admin']}>
      <div>Admin Content</div>
    </ProtectedRoute>
  );
}
```

### Menambah API Endpoint Baru:
```typescript
// Di lib/api.ts
export const userApi = {
  getProfile: async () => {
    const token = authStorage.getToken();
    const response = await fetch(`${API_URL}/api/users/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
};
```

## 📦 Dependencies

```json
{
  "next": "16.2.6",
  "react": "19.2.4",
  "react-dom": "19.2.4",
  "jwt-decode": "^4.0.0",
  "tailwindcss": "^4"
}
```

## 🐛 Troubleshooting

### Token tidak valid
- Pastikan JWT_SECRET di backend sama
- Cek apakah token sudah expired
- Clear localStorage dan login ulang

### CORS Error
- Pastikan backend mengizinkan origin frontend
- Tambahkan CORS middleware di backend jika belum ada

### Redirect Loop
- Clear localStorage
- Cek middleware configuration
- Pastikan token validation logic benar

## 📚 Next Steps

Fitur yang bisa ditambahkan:
1. ✅ Forgot password functionality
2. ✅ Registration page
3. ✅ Email verification
4. ✅ Refresh token mechanism
5. ✅ Remember me functionality
6. ✅ Social login (Google, etc.)
7. ✅ Two-factor authentication
8. ✅ Session management
9. ✅ Activity logging
10. ✅ Profile management

## 📞 Support

Jika ada pertanyaan atau masalah, silakan hubungi tim development.

---

**Created**: May 19, 2026
**Version**: 1.0.0
**Status**: ✅ Production Ready
