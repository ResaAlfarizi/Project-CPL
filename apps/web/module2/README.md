# 🌐 WEB MODULE 2 - SISTEM CPL FRONTEND

Frontend web application untuk Sistem Capaian Pembelajaran Lulusan (CPL) menggunakan **Next.js 16** dengan **TypeScript** dan **Tailwind CSS**.

---

## 🚀 TEKNOLOGI

- **Framework:** Next.js 16.2.6 (App Router)
- **UI Library:** React 19.2.4
- **Styling:** Tailwind CSS 4
- **Language:** TypeScript 5
- **Icons:** Lucide React 1.16.0
- **Auth:** JWT Decode 4.0.0

---

## 📁 STRUKTUR FOLDER

```
web/module2/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth layout group
│   │   ├── login/
│   │   └── register/
│   │
│   ├── admin-prodi/              # Admin Prodi Dashboard
│   │   ├── dashboard/
│   │   ├── mata-kuliah/
│   │   ├── dosen/
│   │   ├── mahasiswa/
│   │   ├── cpl/
│   │   └── capaian/
│   │
│   ├── dosen/                    # Dosen Dashboard
│   │   ├── dashboard/
│   │   ├── kelas/
│   │   ├── nilai/
│   │   └── capaian/
│   │
│   ├── mahasiswa/                # Mahasiswa Dashboard
│   │   ├── dashboard/
│   │   ├── kelas/
│   │   └── capaian/
│   │
│   ├── superadmin/               # Superadmin Dashboard
│   │   ├── dashboard/
│   │   ├── users/
│   │   ├── prodi/
│   │   └── access-matrix/
│   │
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
│
├── components/                   # Reusable components
│   ├── admin-prodi/              # Admin Prodi specific components
│   ├── dosen/                    # Dosen specific components
│   ├── mahasiswa/                # Mahasiswa specific components
│   ├── superadmin/               # Superadmin specific components
│   └── ui/                       # Shared UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Table.tsx
│       └── Modal.tsx
│
├── lib/                          # Utility functions
│   ├── api.ts                    # API client configuration
│   ├── auth.ts                   # Authentication helpers
│   └── utils.ts                  # Common utilities
│
├── types/                        # TypeScript type definitions
│   ├── auth.ts
│   ├── user.ts
│   ├── kelas.ts
│   └── cpl.ts
│
├── public/                       # Static assets
│   ├── images/
│   └── fonts/
│
└── package.json
```

---

## 🔐 ROLE & AKSES

### **1. Superadmin**
- Manajemen semua user sistem
- Manajemen program studi
- Konfigurasi sistem
- Audit log

### **2. Admin Prodi**
- Dashboard statistik prodi
- Manajemen mata kuliah
- Manajemen dosen
- Manajemen mahasiswa
- Manajemen CPL
- Analisis capaian CPL prodi

### **3. Dosen**
- Dashboard kelas yang diampu
- Input nilai sub-CPMK mahasiswa
- Lihat capaian CPL per kelas
- Lihat daftar mahasiswa

### **4. Mahasiswa**
- Dashboard capaian CPL pribadi
- Lihat nilai per mata kuliah
- Lihat progress capaian pembelajaran
- Lihat kelas yang diambil

---

## 🎨 DESIGN SYSTEM

### **Color Palette**
```css
/* Primary */
--primary: #CFDECA;       /* Hijau muda */
--primary-dark: #A8C5A0;  /* Hijau gelap */

/* Secondary */
--secondary: #EFFDA3;     /* Kuning terang */
--secondary-dark: #D8E88B; /* Kuning gelap */

/* Accent */
--accent: #D8DFE9;        /* Biru muda */
--accent-dark: #B8C5D9;   /* Biru gelap */

/* Neutral */
--background: #1a1a1a;    /* Hitam */
--surface: #2a2a2a;       /* Abu gelap */
--text: #F6F5FA;          /* Putih */
--text-muted: #D8DFE9;    /* Abu terang */
```

### **Typography**
- **Font Family:** Urbanist, sans-serif
- **Heading:** Bold, 24-32px
- **Body:** Regular, 14-16px
- **Caption:** Regular, 12-14px

### **Spacing**
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

---

## 🔧 INSTALASI & MENJALANKAN

### **1. Install Dependencies**
```bash
npm install
```

### **2. Setup Environment**
Buat file `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### **3. Jalankan Development Server**
```bash
npm run dev
```
Server akan berjalan di: http://localhost:3000

### **4. Build untuk Production**
```bash
npm run build
npm run start
```

### **5. Linting**
```bash
npm run lint
```

---

## 🌐 API INTEGRATION

### **Base Configuration**
File: `lib/api.ts`
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = {
  get: async (endpoint: string) => { /* ... */ },
  post: async (endpoint: string, data: any) => { /* ... */ },
  put: async (endpoint: string, data: any) => { /* ... */ },
  delete: async (endpoint: string) => { /* ... */ },
};
```

### **Authentication Flow**
1. User login → Terima JWT token
2. Token disimpan di `localStorage`
3. Setiap request include token di header: `Authorization: Bearer <token>`
4. Token decode untuk ambil user info (id, role, nama)

### **Protected Routes**
```typescript
// middleware.ts atau di component
const token = localStorage.getItem('token');
if (!token) {
  router.push('/login');
  return;
}

const user = jwtDecode(token);
if (user.role !== 'Dosen') {
  router.push('/unauthorized');
}
```

---

## 📱 FITUR UTAMA

### **1. Authentication**
- ✅ Login dengan email & password
- ✅ JWT token management
- ✅ Auto redirect based on role
- ✅ Protected routes
- ✅ Logout

### **2. Dashboard**
- ✅ Dashboard Admin Prodi (statistik prodi)
- ✅ Dashboard Dosen (kelas & mahasiswa)
- ✅ Dashboard Mahasiswa (capaian CPL)
- ✅ Dashboard Superadmin (manajemen sistem)

### **3. Manajemen Data**
- ✅ CRUD Mata Kuliah
- ✅ CRUD Dosen
- ✅ CRUD Mahasiswa
- ✅ CRUD CPL
- ✅ CRUD Kelas

### **4. Nilai & Capaian**
- ✅ Input nilai sub-CPMK
- ✅ Visualisasi capaian CPL
- ✅ Filter & export data
- ✅ Grafik progress mahasiswa

### **5. Access Matrix**
- ✅ Matrix hak akses per role
- ✅ Visual representation
- ✅ Legend & tooltip

---

## 🧩 KOMPONEN REUSABLE

### **1. Button**
```tsx
<Button variant="primary" size="md" onClick={handleClick}>
  Submit
</Button>
```

### **2. Card**
```tsx
<Card title="Dashboard" subtitle="Welcome back!">
  <p>Content here...</p>
</Card>
```

### **3. Table**
```tsx
<Table
  columns={columns}
  data={data}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

### **4. Modal**
```tsx
<Modal isOpen={isOpen} onClose={handleClose} title="Edit Data">
  <Form onSubmit={handleSubmit} />
</Modal>
```

---

## 🔄 STATE MANAGEMENT

Menggunakan **React Hooks** untuk state management lokal:
- `useState` - Local component state
- `useEffect` - Side effects & data fetching
- `useContext` - Global auth state
- `useRouter` - Navigation

Untuk state global yang lebih kompleks, bisa gunakan:
- Context API (built-in)
- Zustand (lightweight)
- Redux Toolkit (complex apps)

---

## 🎯 BEST PRACTICES

### **1. Component Structure**
```tsx
// Good: Single responsibility
function UserCard({ user }) {
  return <div>{user.name}</div>;
}

// Bad: Too many responsibilities
function Dashboard() {
  // Fetch data, render everything, handle all logic...
}
```

### **2. API Calls**
```tsx
// Good: Separate API logic
const fetchUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

// Bad: Direct fetch in component
fetch('http://localhost:5000/api/users').then(...)
```

### **3. Error Handling**
```tsx
try {
  const data = await api.get('/users');
  setUsers(data);
} catch (error) {
  console.error('Error:', error);
  toast.error('Gagal mengambil data');
}
```

### **4. Loading States**
```tsx
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    const data = await api.get('/users');
    setUsers(data);
  } finally {
    setLoading(false);
  }
};

return loading ? <Spinner /> : <Table data={users} />;
```

---

## 📝 CATATAN PENTING

1. **Next.js App Router** menggunakan Server Components by default
2. Gunakan `'use client'` untuk components yang butuh interactivity
3. **Environment variables** harus prefix `NEXT_PUBLIC_` untuk client-side
4. **TypeScript** wajib untuk type safety
5. **Tailwind CSS** untuk styling consistency
6. **JWT token** harus divalidasi di backend

---

## 🐛 TROUBLESHOOTING

### **Error: Cannot find module 'react'**
**Solusi:**
```bash
npm install
```

### **Error: CORS**
**Solusi:** Tambahkan di backend:
```javascript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

### **Error: Token tidak valid**
**Solusi:** 
- Logout dan login ulang
- Clear localStorage
- Check token expiry

### **Error: 401 Unauthorized**
**Solusi:**
- Pastikan token ada di header
- Format: `Authorization: Bearer <token>`
- Cek token belum expired

---

## 🚀 DEPLOYMENT

### **Vercel (Recommended)**
```bash
npm install -g vercel
vercel login
vercel --prod
```

### **Manual Deployment**
```bash
npm run build
# Upload folder .next dan public ke server
# Set environment variables di server
npm run start
```

---

## 📚 RESOURCES

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Lucide Icons](https://lucide.dev)

---

**Dibuat oleh:** Kiro AI Assistant  
**Tanggal:** 2026-06-11  
**Version:** 0.1.0
