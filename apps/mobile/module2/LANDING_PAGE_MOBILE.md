# Landing Page - Mobile Module 2

## 📋 Overview

Landing page yang menarik dan informatif untuk aplikasi mobile Sistem CPL. Landing page ini akan muncul sebagai screen pertama saat aplikasi dibuka, sebelum user login.

---

## 🎨 Design

### Sections:

#### 1. **Hero Section**
- **Background:** Image UINSA dengan overlay hijau gelap
- **Logo:** Icon sekolah dengan border kuning
- **Title:** "Sistem Capaian Pembelajaran Lulusan" (36px, bold)
- **Subtitle:** Deskripsi singkat sistem
- **CTA Button:** "Masuk ke Sistem" (kuning dengan icon arrow)

#### 2. **Features Section**
- **4 Feature Cards:**
  1. 👨‍🎓 Portal Mahasiswa
  2. 👨‍🏫 Portal Dosen
  3. 🏫 Admin Prodi
  4. 🛡️ Super Admin
- **Style:** White cards dengan icon kuning, shadow, rounded corners

#### 3. **Stats Section**
- **Background:** Hitam (#212121)
- **3 Stats dengan divider:**
  - 4 Portal
  - 100% Terintegrasi
  - 24/7 Online
- **Color:** Angka kuning, label putih

#### 4. **CTA Section**
- **Background:** Hijau muda (#CFDECA)
- **Title:** "Siap Memulai?"
- **Subtitle:** Ajakan untuk login
- **Button:** "Masuk Sekarang" (hitam dengan icon login)

#### 5. **Footer**
- **Background:** Hitam
- **Content:** Copyright text

---

## 🎯 User Flow

```
App dibuka
    ↓
Landing Screen (initial route)
    ↓
User klik "Masuk ke Sistem" atau "Masuk Sekarang"
    ↓
Navigate ke Login Screen
    ↓
User login
    ↓
Navigate ke Main Screen sesuai role
```

---

## 🎨 Color Palette

- **Primary (Kuning):** #EFF0A3
- **Background:** #F6F5FA
- **Text Dark:** #212121
- **Text Muted:** #64748B
- **Hero Overlay:** rgba(15, 40, 25, 0.92)
- **Stats BG:** #212121
- **CTA BG:** #CFDECA (Honeydew)

---

## 📱 Layout

### Hero Section:
```
┌─────────────────────────────────────┐
│  [Background Image dengan Overlay]  │
│                                     │
│         ┌──────────┐                │
│         │   🏫     │                │
│         │  LOGO    │                │
│         └──────────┘                │
│                                     │
│    Sistem Capaian                   │
│    Pembelajaran Lulusan             │
│                                     │
│  Platform terintegrasi untuk...     │
│                                     │
│    [Masuk ke Sistem →]              │
│                                     │
└─────────────────────────────────────┘
```

### Features Section:
```
┌─────────────────────────────────────┐
│        Fitur Unggulan               │
│  Sistem yang dirancang untuk...    │
│                                     │
│  ┌───────────────────────────┐     │
│  │   👨‍🎓                      │     │
│  │   Portal Mahasiswa        │     │
│  │   Akses capaian CPL...    │     │
│  └───────────────────────────┘     │
│                                     │
│  ┌───────────────────────────┐     │
│  │   👨‍🏫                      │     │
│  │   Portal Dosen            │     │
│  │   Kelola mata kuliah...   │     │
│  └───────────────────────────┘     │
│                                     │
│  ... (2 cards lagi)                 │
└─────────────────────────────────────┘
```

### Stats Section:
```
┌─────────────────────────────────────┐
│  [Background Hitam]                 │
│                                     │
│    4      │   100%   │   24/7      │
│  Portal   │Terintegrasi│ Online    │
│                                     │
└─────────────────────────────────────┘
```

---

## 📁 File Structure

```
apps/mobile/module2/
├── src/
│   ├── screens/
│   │   ├── LandingScreen.js       ← NEW (Landing Page)
│   │   ├── auth/
│   │   │   └── LoginScreen.js
│   │   ├── mahasiswa/
│   │   ├── dosen/
│   │   ├── admin-prodi/
│   │   └── super-admin/
│   └── navigation/
│       └── AppNavigator.js        ← UPDATED (add Landing route)
└── LANDING_PAGE_MOBILE.md         ← Documentation
```

---

## 🔧 Implementation Details

### Navigation Setup:
```javascript
// AppNavigator.js
<Stack.Navigator initialRouteName="Landing">
    <Stack.Screen name="Landing" component={LandingScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    // ... other screens
</Stack.Navigator>
```

### Button Actions:
```javascript
// Navigate to Login
onPress={() => navigation.navigate('Login')}
```

### Styling:
- **Font Family:** Urbanist (Light, Regular, Medium, SemiBold, Bold, ExtraBold)
- **Border Radius:** 16px (buttons), 20px (cards)
- **Shadows:** elevation + shadowColor for depth
- **Spacing:** 24px horizontal padding, 60px vertical padding

---

## ✨ Features

### 1. **Smooth Scrolling**
- ScrollView dengan smooth scroll
- No scroll indicator

### 2. **Status Bar**
- Light content (white icons)
- Translucent background
- Integrated with hero section

### 3. **Image Background**
- UINSA logo as background
- Opacity 0.15 untuk subtle effect
- Overlay untuk readability

### 4. **Responsive Layout**
- Adapts to different screen sizes
- Proper padding for Android notch
- Safe area handling

### 5. **Icons**
- Material Community Icons
- Consistent sizing
- Proper alignment

---

## 🧪 Testing Checklist

### Visual:
- [ ] Hero section tampil dengan background image
- [ ] Logo icon dengan border kuning
- [ ] Title dan subtitle readable
- [ ] Button "Masuk ke Sistem" tampil dengan icon
- [ ] 4 feature cards tampil dalam list
- [ ] Stats section dengan 3 stats dan divider
- [ ] CTA section dengan background hijau
- [ ] Footer dengan copyright

### Functionality:
- [ ] Button "Masuk ke Sistem" → navigate ke Login
- [ ] Button "Masuk Sekarang" → navigate ke Login
- [ ] Scroll smooth tanpa lag
- [ ] Status bar light content
- [ ] No layout issues di Android/iOS

### Typography:
- [ ] All fonts loaded (Urbanist)
- [ ] Font sizes appropriate
- [ ] Text alignment correct
- [ ] Line heights comfortable

### Colors:
- [ ] Hero overlay hijau gelap
- [ ] Button kuning (#EFF0A3)
- [ ] Stats section hitam
- [ ] CTA section hijau muda
- [ ] Text colors contrast well

---

## 🚀 Usage

### Development:
```bash
cd apps/mobile/module2
npx expo start
```

### Testing:
1. Buka aplikasi di Expo Go
2. Harus tampil Landing Page
3. Klik "Masuk ke Sistem" → pindah ke Login
4. Scroll ke bawah → lihat semua sections
5. Klik "Masuk Sekarang" → pindah ke Login

---

## 🎯 Next Steps (Optional Enhancements)

### 1. **Add Animations**
- Fade in on mount
- Slide in for cards
- Button press animation

### 2. **Add More Content**
- Testimonials section
- Screenshots carousel
- FAQ section

### 3. **Add Gestures**
- Swipe to navigate
- Pull to refresh
- Parallax scroll

### 4. **Add Video**
- Background video
- Demo video
- Tutorial video

### 5. **Add Onboarding**
- First-time user tutorial
- Feature highlights
- Swipeable intro screens

---

## 📝 Notes

### Assets Used:
- `assets/uinsa2.jpeg` - Background image
- Material Community Icons - All icons

### Dependencies:
- `@react-navigation/native` - Navigation
- `@react-navigation/native-stack` - Stack navigator
- `@expo/vector-icons` - Icons
- `expo-status-bar` - Status bar control

### Performance:
- Image optimized with `imageStyle` opacity
- No heavy animations
- Efficient ScrollView
- Minimal re-renders

---

## 🎨 Preview

### Mobile View:
```
┌─────────────────────────────────────┐
│  [Hero dengan Background Image]     │
│         [Logo Icon]                 │
│   Sistem Capaian Pembelajaran       │
│        [Button Kuning]              │
├─────────────────────────────────────┤
│      Fitur Unggulan                 │
│  [Card 1] [Card 2] [Card 3] [Card 4]│
├─────────────────────────────────────┤
│  [Stats Section - Hitam]            │
│   4  │  100%  │  24/7               │
├─────────────────────────────────────┤
│  [CTA Section - Hijau]              │
│   Siap Memulai?                     │
│   [Button Hitam]                    │
├─────────────────────────────────────┤
│  [Footer - Hitam]                   │
│   © 2024 Sistem CPL                 │
└─────────────────────────────────────┘
```

---

**Status:** ✅ COMPLETE
**Files Created:** 1 (LandingScreen.js)
**Files Updated:** 1 (AppNavigator.js)
**Lines of Code:** ~400 lines
**Ready for Testing:** YES 🎉
