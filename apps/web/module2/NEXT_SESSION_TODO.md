# 📋 TODO: Session Berikutnya - Portal Mahasiswa Enhancement

## 🎯 Tujuan Session Berikutnya

Menambahkan fitur-fitur baru pada Portal Mahasiswa:
1. Sidebar toggle dengan hamburger menu
2. Profil dipindah ke kanan atas dengan dropdown
3. Halaman profil mahasiswa (read-only)
4. Insert dummy data ke database

---

## ✅ Status Saat Ini (Sudah Selesai)

### Portal Mahasiswa
- ✅ 5 Halaman lengkap: Dashboard, Program Studi & CPL, Mata Kuliah, Sub-CPMK, Capaian
- ✅ Design system: Sidebar dark (#1a1a1a), accent kuning (#FFF063)
- ✅ Authentication & role-based redirect (Mahasiswa → `/mahasiswa`)
- ✅ Logout functionality
- ✅ API integration dengan backend module 2
- ✅ Responsive design (mobile + desktop)

### Files yang Sudah Dibuat
```
apps/web/module2/
├── app/
│   ├── mahasiswa/
│   │   ├── layout.tsx          ✅ Sidebar + Layout
│   │   ├── page.tsx            ✅ Dashboard
│   │   ├── program-studi/page.tsx  ✅ Program Studi & CPL
│   │   ├── mata-kuliah/page.tsx    ✅ Mata Kuliah
│   │   ├── sub-cpmk/page.tsx       ✅ Sub-CPMK
│   │   └── capaian/page.tsx        ✅ Capaian Mahasiswa
│   ├── layout.tsx              ✅ Root layout (Urbanist font)
│   ├── page.tsx                ✅ Root redirect
│   ├── login/page.tsx          ✅ Login page
│   └── globals.css             ✅ Global styles
├── contexts/
│   └── AuthContext.tsx         ✅ Auth context
├── lib/
│   ├── api.ts                  ✅ API functions (mahasiswaApi)
│   └── auth.ts                 ✅ Auth storage
└── middleware.ts               ✅ Route protection
```

---

## 🚀 Task untuk Session Berikutnya

### 1. Sidebar Toggle (Hamburger Menu)

**File yang perlu diubah:**
- `app/mahasiswa/layout.tsx`

**Yang perlu ditambahkan:**
```typescript
// State untuk sidebar
const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

// Hamburger button di header
<button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
  <svg>...</svg> {/* Icon hamburger */}
</button>

// Sidebar dengan conditional width
<aside className={sidebarCollapsed ? 'w-20' : 'w-64'}>
  {/* Logo dan menu items */}
</aside>
```

**Behavior:**
- Desktop: Sidebar bisa collapse jadi icon-only (width: 80px)
- Mobile: Sidebar tetap overlay (sudah ada)
- Smooth transition animation
- Icon hamburger berubah jadi X saat sidebar terbuka (mobile)

---

### 2. Profil di Kanan Atas dengan Dropdown

**File yang perlu diubah:**
- `app/mahasiswa/layout.tsx`

**Yang perlu ditambahkan:**
```typescript
// State untuk dropdown
const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

// Profil di header (kanan atas)
<div className="relative">
  <button onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}>
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 rounded-full bg-yellow">M</div>
      <span>Nama Mahasiswa</span>
      <svg>...</svg> {/* Chevron down */}
    </div>
  </button>
  
  {/* Dropdown menu */}
  {profileDropdownOpen && (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg">
      <Link href="/mahasiswa/profil">
        <svg>...</svg> Lihat Profil
      </Link>
      <button onClick={logout}>
        <svg>...</svg> Logout
      </button>
    </div>
  )}
</div>
```

**Behavior:**
- Klik avatar/nama → dropdown muncul
- Klik di luar → dropdown hilang (useEffect + ref)
- 2 menu items:
  - 👤 Lihat Profil → navigate ke `/mahasiswa/profil`
  - 🚪 Logout → logout dan redirect ke `/login`

---

### 3. Halaman Profil Mahasiswa

**File baru yang perlu dibuat:**
- `app/mahasiswa/profil/page.tsx`

**API endpoint yang perlu ditambahkan di `lib/api.ts`:**
```typescript
export const mahasiswaApi = {
  // ... existing endpoints
  
  // Profile
  getMyProfile: () => apiFetch('/mahasiswa/profile'), // atau endpoint yang sesuai
};
```

**Struktur halaman profil:**
```typescript
interface MahasiswaProfile {
  id: string;
  nim: string;
  nama: string;
  email: string;
  prodi_id: string;
  nama_prodi: string;
  kode_prodi: string;
  jenjang: string;
  angkatan: number;
}

// Layout profil:
// - Header dengan foto profil besar
// - Card informasi pribadi (read-only)
// - Card informasi akademik (read-only)
```

**Design:**
```
┌─────────────────────────────────────┐
│  [Avatar]  Nama Mahasiswa           │
│            NIM: 23010001            │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  📋 Informasi Pribadi               │
│  ─────────────────────────────────  │
│  Nama Lengkap: Rizky Kurniawan      │
│  NIM: 23010001                      │
│  Email: rizky@student.ac.id         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  🎓 Informasi Akademik              │
│  ─────────────────────────────────  │
│  Program Studi: Teknik Lingkungan   │
│  Kode Prodi: TL                     │
│  Jenjang: S1                        │
│  Angkatan: 2023                     │
└─────────────────────────────────────┘
```

---

### 4. Backend API untuk Profil

**File backend yang perlu diubah/dibuat:**
- `apps/backend/module2/src/routes/mahasiswaRoutes.js` (buat baru jika belum ada)
- `apps/backend/module2/src/controllers/mahasiswaController.js`
- `apps/backend/module2/src/models/mahasiswaModel.js`

**Endpoint yang perlu dibuat:**
```javascript
// GET /api/v1/m2/mahasiswa/profile
// Headers: Authorization: Bearer <token>
// Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "nim": "23010001",
    "nama": "Rizky Kurniawan",
    "email": "rizky@student.ac.id",
    "prodi_id": "uuid",
    "nama_prodi": "Teknik Lingkungan",
    "kode_prodi": "TL",
    "jenjang": "S1",
    "angkatan": 2023
  }
}
```

**Query SQL:**
```sql
SELECT 
  m.id,
  m.nim,
  m.nama,
  u.email,
  m.prodi_id,
  p.nama_prodi,
  p.kode_prodi,
  p.jenjang,
  m.angkatan
FROM mahasiswa m
JOIN users u ON u.entity_id = m.id AND u.entity_type = 'mahasiswa'
JOIN program_studi p ON m.prodi_id = p.id
WHERE m.id = $1
```

---

### 5. Insert Dummy Data ke Database

**File SQL yang sudah disiapkan user:**
- Data sudah ada di chat (baris 7-392 dan 396-536)

**Langkah-langkah:**
1. Buat file baru: `database/06_dummy_data.sql`
2. Copy data dari chat user
3. Jalankan di PostgreSQL:
   ```bash
   psql -U postgres -d cpl_db -f database/06_dummy_data.sql
   ```

**Data yang akan di-insert:**
- 4 Program Studi (TL, TM, HK, DKV)
- 23 CPL
- 10 Dosen
- 40 Mahasiswa
- 30 Mata Kuliah
- 60 Pemetaan MK-CPL
- 120 Sub-CPMK
- 20 Threshold Status

---

## 🎨 Design Reference

### Sidebar Collapsed (Desktop)
```
┌──┐  ┌────────────────────────────┐
│ ☰│  │  [Avatar] Nama ▼          │
│  │  └────────────────────────────┘
│ 🏠│  
│ 📚│  Content Area
│ 📖│
│ 📝│
│ 📊│
│  │
│ M│
└──┘
```

### Sidebar Expanded (Desktop)
```
┌──────────────┐  ┌────────────────────────────┐
│ ☰ Sistem CPL │  │  [Avatar] Nama ▼          │
│              │  └────────────────────────────┘
│ 🏠 Dashboard │  
│ 📚 Program.. │  Content Area
│ 📖 Mata Kul..│
│ 📝 Sub-CPMK  │
│ 📊 Capaian   │
│              │
│ [M] mahasiswa│
└──────────────┘
```

### Profile Dropdown
```
┌────────────────────────────┐
│  [Avatar] Nama Mahasiswa ▼ │
│  ┌──────────────────────┐  │
│  │ 👤 Lihat Profil      │  │
│  │ 🚪 Logout            │  │
│  └──────────────────────┘  │
└────────────────────────────┘
```

---

## 📝 Checklist untuk Session Berikutnya

### Persiapan
- [ ] Pastikan backend module 2 running
- [ ] Pastikan database sudah setup
- [ ] Pastikan frontend module 2 running
- [ ] Buka file `NEXT_SESSION_TODO.md` ini

### Implementation Order
1. [ ] **Insert dummy data ke database** (paling penting!)
2. [ ] **Buat backend API untuk profil mahasiswa**
3. [ ] **Update `lib/api.ts`** - tambah `getMyProfile()`
4. [ ] **Buat halaman profil** - `app/mahasiswa/profil/page.tsx`
5. [ ] **Update layout mahasiswa** - tambah sidebar toggle
6. [ ] **Update layout mahasiswa** - pindah profil ke kanan atas
7. [ ] **Tambah dropdown menu** - Lihat Profil & Logout
8. [ ] **Testing semua fitur**

### Testing Checklist
- [ ] Sidebar toggle berfungsi (desktop)
- [ ] Sidebar overlay berfungsi (mobile)
- [ ] Profil dropdown muncul saat diklik
- [ ] Dropdown hilang saat klik di luar
- [ ] Menu "Lihat Profil" navigate ke `/mahasiswa/profil`
- [ ] Menu "Logout" berhasil logout dan redirect
- [ ] Halaman profil menampilkan data yang benar
- [ ] Data profil sesuai dengan user yang login
- [ ] Semua data dummy muncul di halaman-halaman lain

---

## 🔗 Files Reference

### Files yang akan diubah:
1. `apps/web/module2/app/mahasiswa/layout.tsx` - Sidebar toggle + profil dropdown
2. `apps/web/module2/lib/api.ts` - Tambah `getMyProfile()`

### Files yang akan dibuat:
1. `apps/web/module2/app/mahasiswa/profil/page.tsx` - Halaman profil
2. `database/06_dummy_data.sql` - Dummy data
3. `apps/backend/module2/src/routes/mahasiswaRoutes.js` - Routes mahasiswa
4. `apps/backend/module2/src/controllers/mahasiswaController.js` - Controller
5. `apps/backend/module2/src/models/mahasiswaModel.js` - Model

---

## 💡 Tips untuk Session Berikutnya

1. **Mulai dengan dummy data** - Ini paling penting agar ada data untuk testing
2. **Backend dulu, frontend kemudian** - Pastikan API profil jalan dulu
3. **Test incremental** - Test setiap fitur setelah selesai dibuat
4. **Gunakan console.log** - Untuk debug data yang diterima dari API
5. **Restart TypeScript Server** - Jika ada error merah yang aneh

---

## 🎯 Expected Result

Setelah session berikutnya selesai:
- ✅ Sidebar bisa di-toggle (collapse/expand)
- ✅ Profil ada di kanan atas dengan dropdown
- ✅ Halaman profil menampilkan data mahasiswa
- ✅ Database terisi dengan 40 mahasiswa dummy
- ✅ Semua fitur berfungsi dengan baik
- ✅ Design konsisten dan responsive

---

**Dibuat**: Session 1 - May 21, 2026
**Untuk**: Session 2 - Portal Mahasiswa Enhancement
**Status**: Ready to implement 🚀
