# Web Module 2 - Sistem CPL

Aplikasi web frontend untuk Sistem Capaian Pembelajaran Lulusan (CPL) Module 2, dibangun dengan Next.js 16 dan terintegrasi dengan backend Express.js.

## 🚀 Fitur

- ✅ **Authentication System** - Login dengan JWT
- ✅ **Protected Routes** - Route protection dengan middleware
- ✅ **Role-Based Access** - Akses berdasarkan role user
- ✅ **Dashboard** - Dashboard user setelah login
- ✅ **Modern UI** - Tailwind CSS dengan design modern
- ✅ **TypeScript** - Type-safe development

## 📋 Prerequisites

- Node.js 20+
- npm atau yarn
- Backend module2 harus berjalan di port 3000
- PostgreSQL database dengan user yang sudah dibuat

## 🔧 Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
Buat file `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Generate Password Hash untuk Test User
```bash
# Install bcrypt jika belum ada
npm install bcrypt

# Generate hash untuk password 'test123'
node generate-hash.js test123
```

### 4. Buat Test User di Database
Jalankan SQL query yang dihasilkan dari script di atas, atau gunakan file `CREATE_TEST_USER.sql`

## 🎯 Getting Started

### Development Mode
```bash
npm run dev
```

Aplikasi akan berjalan di [http://localhost:3001](http://localhost:3001)

### Production Build
```bash
npm run build
npm start
```

## 📚 Dokumentasi

- **[LOGIN_GUIDE.md](./LOGIN_GUIDE.md)** - Panduan lengkap sistem login
- **[TESTING_LOGIN.md](./TESTING_LOGIN.md)** - Panduan testing login system
- **[CREATE_TEST_USER.sql](./CREATE_TEST_USER.sql)** - Script SQL untuk membuat test user

## 🏗️ Struktur Aplikasi

```
apps/web/module2/
├── app/                      # Next.js App Router
│   ├── login/               # Halaman login
│   ├── dashboard/           # Dashboard (protected)
│   ├── unauthorized/        # Halaman akses ditolak
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/              # Reusable components
│   └── ProtectedRoute.tsx   # Protected route wrapper
├── contexts/                # React contexts
│   └── AuthContext.tsx      # Authentication context
├── lib/                     # Utilities
│   ├── api.ts              # API functions
│   └── auth.ts             # Auth utilities
├── middleware.ts            # Next.js middleware
└── .env.local              # Environment variables
```

## 🔐 Authentication Flow

1. User mengakses aplikasi → redirect ke `/login`
2. User login dengan email & password
3. Backend validasi dan return JWT token
4. Token disimpan di localStorage
5. Token digunakan untuk akses protected routes
6. Token di-decode untuk mendapatkan user info

## 🧪 Testing

### Manual Testing
Lihat [TESTING_LOGIN.md](./TESTING_LOGIN.md) untuk panduan lengkap

### Quick Test
1. Jalankan backend: `cd apps/backend && node app.js`
2. Jalankan frontend: `npm run dev`
3. Buka browser: `http://localhost:3001`
4. Login dengan:
   - Email: `test@example.com`
   - Password: `test123`

## 🛠️ Tech Stack

- **Framework**: Next.js 16.2.6
- **React**: 19.2.4
- **TypeScript**: 5.x
- **Styling**: Tailwind CSS 4
- **Authentication**: JWT (jwt-decode)
- **HTTP Client**: Fetch API

## 📦 Dependencies

```json
{
  "next": "16.2.6",
  "react": "19.2.4",
  "react-dom": "19.2.4",
  "jwt-decode": "^4.0.0"
}
```

## 🔗 API Integration

### Backend Endpoints
- `POST /api/v1/m2/auth/login` - Login user
- `POST /api/v1/m2/auth/register` - Register user baru (hanya untuk superadmin)

### API Configuration
Base URL dikonfigurasi di `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Endpoint lengkap akan menjadi:
- Login: `http://localhost:3000/api/v1/m2/auth/login`
- Register: `http://localhost:3000/api/v1/m2/auth/register`

## 🎨 UI/UX

- Modern gradient design
- Responsive layout (mobile-friendly)
- Loading states
- Error handling dengan user-friendly messages
- Smooth transitions dan animations

## 🚧 Roadmap

- [ ] Forgot password functionality
- [ ] Email verification
- [ ] Refresh token mechanism
- [ ] Profile management
- [ ] User settings
- [ ] Activity logs
- [ ] Multi-language support

## 🐛 Troubleshooting

### "Cannot connect to backend"
- Pastikan backend berjalan di port 3000
- Cek `.env.local` configuration

### "Token tidak valid"
- Clear localStorage dan login ulang
- Pastikan JWT_SECRET di backend benar

### "User tidak ditemukan"
- Pastikan user sudah dibuat di database
- Gunakan script `generate-hash.js` untuk membuat user

## 📄 License

This project is part of Project CPL.

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
