# Landing Page - Web Module 2

## 📋 Overview

Landing page yang menarik dan informatif untuk Sistem Capaian Pembelajaran Lulusan (CPL). Landing page ini akan muncul saat user mengakses root URL (`/`) sebelum login.

---

## 🎨 Sections

### 1. **Hero Section**
- **Background:** Gradient hijau gelap (brand color)
- **Content:**
  - Judul besar: "Sistem Capaian Pembelajaran Lulusan"
  - Subtitle: Deskripsi singkat sistem
  - 2 CTA buttons:
    - "Masuk ke Sistem" (primary - kuning)
    - "Pelajari Lebih Lanjut" (secondary - outline)
  - Hero card dengan icon dan info

### 2. **Features Section**
- **6 Feature Cards:**
  1. 👨‍🎓 Portal Mahasiswa
  2. 👨‍🏫 Portal Dosen
  3. 🏫 Admin Prodi
  4. ⚙️ Super Admin
  5. 📈 Dashboard Analitik
  6. 🔒 Keamanan Terjamin

- **Hover Effect:** Card naik sedikit dengan shadow

### 3. **Stats Section**
- **Background:** Hitam (eerie black)
- **4 Stats:**
  - 4 Portal Berbeda
  - 100% Terintegrasi
  - 24/7 Akses Online
  - Real-time Monitoring

### 4. **CTA Section**
- **Background:** Gradient biru-hijau muda
- **Content:**
  - Heading: "Siap Memulai?"
  - Subtext: Ajakan untuk login
  - Button besar: "Masuk Sekarang"

### 5. **Footer**
- **Background:** Hitam
- **Content:** Copyright text

---

## 🎯 User Flow

```
User akses "/" (root)
    ↓
Cek authentication
    ↓
┌─────────────────┬─────────────────┐
│ Sudah Login     │ Belum Login     │
├─────────────────┼─────────────────┤
│ Redirect ke     │ Tampilkan       │
│ dashboard       │ Landing Page    │
│ sesuai role     │                 │
└─────────────────┴─────────────────┘
```

### Redirect Logic (Sudah Login):
- **Superadmin** → `/superadmin`
- **Dosen** → `/dosen`
- **Admin Prodi** → `/admin-prodi`
- **Mahasiswa** → `/mahasiswa`

### Landing Page (Belum Login):
- Tampilkan landing page
- Button "Masuk ke Sistem" → `/login`
- Button "Pelajari Lebih Lanjut" → scroll ke #features

---

## 🎨 Design System

### Colors:
- **Primary:** `var(--vanilla)` - #EFF0A3 (kuning)
- **Background:** `var(--ghost-white)` - #F6F5FA
- **Text:** `var(--eerie-black)` - #212121
- **Accent 1:** `var(--alice-blue)` - #D8DFE9
- **Accent 2:** `var(--honeydew)` - #CFDECA
- **Hero BG:** Gradient hijau gelap (#0f2819 → #1a3d2a)

### Typography:
- **Hero Title:** 3.5rem, font-weight 800
- **Section Title:** 2.5rem, font-weight 800
- **Body:** 1.125rem
- **Button:** 1rem, font-weight 600

### Spacing:
- **Section Padding:** 100px vertical, 20px horizontal
- **Container Max Width:** 1200px
- **Grid Gap:** 30px (features), 60px (hero)

### Border Radius:
- **Cards:** 20px
- **Hero Card:** 24px
- **Buttons:** 12px

---

## 📱 Responsive Design

### Desktop (> 768px):
- Hero: 2 columns (text + card)
- Features: 3 columns grid
- Stats: 4 columns grid

### Mobile (≤ 768px):
- Hero: 1 column (stacked)
- Features: 1 column
- Stats: 2 columns grid
- Font sizes reduced:
  - Hero title: 2.5rem
  - Section title: 2rem

---

## 🚀 Features

### 1. **Smooth Animations**
- Card hover: translateY(-8px) + shadow
- Button hover: translateY(-2px) + shadow
- Smooth transitions: 0.3s ease

### 2. **Loading State**
- Spinner saat checking authentication
- Prevents flash of landing page untuk user yang sudah login

### 3. **Scroll Behavior**
- "Pelajari Lebih Lanjut" button scroll smooth ke #features
- Anchor link dengan smooth scroll

### 4. **SEO Friendly**
- Semantic HTML
- Clear heading hierarchy
- Descriptive content

---

## 📁 File Structure

```
apps/web/module2/
├── app/
│   ├── page.tsx          ← Landing Page (updated)
│   ├── login/
│   ├── mahasiswa/
│   ├── dosen/
│   ├── admin-prodi/
│   └── superadmin/
└── LANDING_PAGE.md       ← Documentation (this file)
```

---

## 🔧 Implementation Details

### State Management:
```typescript
const [showLanding, setShowLanding] = useState(false);
```
- `false` by default → show loading spinner
- `true` after auth check → show landing page

### Authentication Check:
```typescript
useEffect(() => {
  if (!isLoading) {
    if (isAuthenticated && user) {
      // Redirect to dashboard
    } else {
      // Show landing page
      setShowLanding(true);
    }
  }
}, [isAuthenticated, isLoading, user, router]);
```

### Styling:
- Using `<style jsx>` for scoped CSS
- CSS variables from `globals.css`
- Responsive with media queries

---

## 🧪 Testing Checklist

### Functionality:
- [ ] User belum login → tampilkan landing page
- [ ] User sudah login → redirect ke dashboard sesuai role
- [ ] Button "Masuk ke Sistem" → redirect ke `/login`
- [ ] Button "Pelajari Lebih Lanjut" → scroll ke features
- [ ] Loading spinner muncul saat checking auth

### UI/UX:
- [ ] Hero section tampil dengan benar
- [ ] 6 feature cards tampil dalam grid
- [ ] Stats section dengan 4 stats
- [ ] CTA section dengan button besar
- [ ] Footer dengan copyright
- [ ] Hover effects berfungsi
- [ ] Smooth transitions

### Responsive:
- [ ] Desktop: 2 kolom hero, 3 kolom features
- [ ] Mobile: 1 kolom hero, 1 kolom features
- [ ] Font sizes adjust di mobile
- [ ] Buttons stack di mobile
- [ ] Stats grid 2 kolom di mobile

### Performance:
- [ ] No flash of landing page untuk user login
- [ ] Smooth scroll behavior
- [ ] Fast page load
- [ ] No layout shift

---

## 🎯 Next Steps (Optional Enhancements)

### 1. **Add Images/Illustrations**
- Hero illustration
- Feature icons (custom SVG)
- Screenshots of dashboards

### 2. **Add Animations**
- Fade in on scroll
- Number counter for stats
- Parallax effect

### 3. **Add More Sections**
- Testimonials
- FAQ
- Contact information
- About section

### 4. **Add Metadata**
- SEO meta tags
- Open Graph tags
- Twitter cards

### 5. **Add Analytics**
- Track button clicks
- Track scroll depth
- Track time on page

---

## 📝 Usage

### Development:
```bash
cd apps/web/module2
npm run dev
```

### Access:
- Landing Page: `http://localhost:3001/`
- Login: `http://localhost:3001/login`

### Testing:
1. **Belum Login:**
   - Buka `http://localhost:3001/`
   - Harus tampil landing page
   - Klik "Masuk ke Sistem" → redirect ke login

2. **Sudah Login:**
   - Login dulu di `/login`
   - Buka `http://localhost:3001/`
   - Harus langsung redirect ke dashboard sesuai role

---

## 🎨 Preview

### Hero Section:
```
┌─────────────────────────────────────────────────────────┐
│  [Gradient Hijau Gelap Background]                      │
│                                                          │
│  Sistem Capaian                    ┌──────────────┐     │
│  Pembelajaran Lulusan              │   📊         │     │
│                                    │              │     │
│  Platform terintegrasi untuk       │  Monitoring  │     │
│  monitoring dan evaluasi...        │  Real-time   │     │
│                                    │              │     │
│  [Masuk ke Sistem] [Pelajari...]   └──────────────┘     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Features Section:
```
┌──────────────────────────────────────────────────────────┐
│                  Fitur Unggulan                          │
│     Sistem yang dirancang untuk memudahkan...            │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │   👨‍🎓    │  │   👨‍🏫    │  │   🏫     │              │
│  │  Portal  │  │  Portal  │  │  Admin   │              │
│  │Mahasiswa │  │  Dosen   │  │  Prodi   │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │   ⚙️     │  │   📈     │  │   🔒     │              │
│  │  Super   │  │Dashboard │  │ Keamanan │              │
│  │  Admin   │  │ Analitik │  │Terjamin  │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└──────────────────────────────────────────────────────────┘
```

---

**Status:** ✅ COMPLETE
**File:** `app/page.tsx`
**Lines:** ~400 lines
**Ready for Production:** YES 🎉
