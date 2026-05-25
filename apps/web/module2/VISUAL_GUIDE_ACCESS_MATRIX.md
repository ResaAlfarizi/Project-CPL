# 🎨 Visual Guide - Matrix Hak Akses per Role

## 📐 Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SUPERADMIN PANEL                                │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┬──────────────────────────────────────────────────────────┐
│              │  ┌────────────────────────────────────────────────────┐  │
│              │  │  [☰]  Sistem Manajemen CPL                        │  │
│  SIDEBAR     │  │       Panel Superadmin                            │  │
│              │  └────────────────────────────────────────────────────┘  │
│  ┌────────┐  │                                                          │
│  │ SUPER  │  │  ┌────────────────────────────────────────────────────┐ │
│  │ ADMIN  │  │  │                                                    │ │
│  └────────┘  │  │  Matrix Hak Akses per Role                        │ │
│              │  │  Kelola dan pantau hak akses untuk setiap role    │ │
│  Dashboard   │  │                                                    │ │
│  Matrix ✓    │  │  ┌──────────────────────────────────────────────┐ │ │
│  Users       │  │  │ RESOURCE              │ SUPERADMIN           │ │ │
│  Audit Log   │  │  ├──────────────────────────────────────────────┤ │ │
│  Settings    │  │  │ Program Studi & CPL   │ [R] [W] [D]         │ │ │
│              │  │  │ Mata Kuliah & Pemetaan│ [R] [W] [D]         │ │ │
│              │  │  │ Sub-CPMK              │ [R] [W] [D]         │ │ │
│              │  │  │ Input Nilai Sub-CPMK  │ [R] [W] [D]         │ │ │
│              │  │  │ Capaian CPL Mahasiswa │ [R] [W] [D]         │ │ │
│              │  │  │ Manajemen User        │ [R] [W] [D]         │ │ │
│              │  │  │ Audit Log             │ [R]                 │ │ │
│              │  │  └──────────────────────────────────────────────┘ │ │
│              │  │                                                    │ │
│              │  │  Legend: [R] Read  [W] Write  [D] Delete          │ │
│              │  │                                                    │ │
│              │  └────────────────────────────────────────────────────┘ │
│              │                                                          │
└──────────────┴──────────────────────────────────────────────────────────┘
```

---

## 🎨 Color Palette Visual

```
┌─────────────────────────────────────────────────────────────┐
│                    COLOR PALETTE                            │
└─────────────────────────────────────────────────────────────┘

█████████  Eerie Black (#212121)
           Background utama halaman (Dark Mode)
           Digunakan untuk: Background tabel, sidebar

█████████  Ghost White (#F6F5FA)
           Teks utama dan kontras di atas background gelap
           Digunakan untuk: Teks di tabel, heading

█████████  Alice Blue (#D8DFE9)
           Teks sekunder
           Digunakan untuk: Subtitle, deskripsi

█████████  Vanilla (#EFFDA3)
           Warna highlight badge hak akses
           Digunakan untuk: Badge R/W/D

█████████  Honeydew (#CFDECA)
           Aksen hijau pada judul
           Digunakan untuk: Judul "Matrix Hak Akses per Role"
```

---

## 🏷️ Badge Design

```
┌─────────────────────────────────────────────────────────────┐
│                    BADGE STYLES                             │
└─────────────────────────────────────────────────────────────┘

Normal State:
  ┌─────┐  ┌─────┐  ┌─────┐
  │  R  │  │  W  │  │  D  │
  └─────┘  └─────┘  └─────┘
  
  • Shape: Pill (rounded-full)
  • Background: rgba(239, 253, 163, 0.15)
  • Color: #EFFDA3
  • Border: 1px solid rgba(239, 253, 163, 0.3)
  • Padding: 4px 12px
  • Font: Urbanist, 12px, Semi-bold

Hover State:
  ┌─────┐  ┌─────┐  ┌─────┐
  │  R  │  │  W  │  │  D  │  ← Slightly brighter
  └─────┘  └─────┘  └─────┘
  
  • Background: rgba(239, 253, 163, 0.25)
  • Transform: scale(1.05)
  • Transition: 200ms ease
```

---

## 📊 Table Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                         TABLE ANATOMY                               │
└─────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│ ┌───────────────────────────────────────────────────────────────┐ │
│ │ HEADER (Background: #1a1a1a)                                  │ │
│ │ ┌─────────────────────────┬─────────────────────────────────┐ │ │
│ │ │ RESOURCE                │ SUPERADMIN                      │ │ │
│ │ │ (Left aligned)          │ (Center aligned)                │ │ │
│ │ └─────────────────────────┴─────────────────────────────────┘ │ │
│ └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌───────────────────────────────────────────────────────────────┐ │
│ │ BODY (Background: #2a2a2a)                                    │ │
│ │ ┌─────────────────────────┬─────────────────────────────────┐ │ │
│ │ │ Program Studi & CPL     │  [R] [W] [D]                    │ │ │
│ │ ├─────────────────────────┼─────────────────────────────────┤ │ │
│ │ │ Mata Kuliah & Pemetaan  │  [R] [W] [D]                    │ │ │
│ │ ├─────────────────────────┼─────────────────────────────────┤ │ │
│ │ │ Sub-CPMK                │  [R] [W] [D]                    │ │ │
│ │ ├─────────────────────────┼─────────────────────────────────┤ │ │
│ │ │ ...                     │  ...                            │ │ │
│ │ └─────────────────────────┴─────────────────────────────────┘ │ │
│ └───────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────┘

Styling:
• Border Radius: 16px
• Border: 1px solid rgba(216, 223, 233, 0.1)
• Box Shadow: 0 8px 30px rgba(0, 0, 0, 0.3)
• Row Hover: rgba(207, 222, 202, 0.05)
```

---

## 📱 Responsive Behavior

```
┌─────────────────────────────────────────────────────────────────────┐
│                    RESPONSIVE BREAKPOINTS                           │
└─────────────────────────────────────────────────────────────────────┘

DESKTOP (≥1024px)
┌──────────┬────────────────────────────────────────────────┐
│          │                                                │
│ SIDEBAR  │              CONTENT                          │
│ (270px)  │              (Full Width)                     │
│          │                                                │
│ [Open]   │  ┌──────────────────────────────────────┐    │
│          │  │         Matrix Table                 │    │
│          │  │         (Optimal View)               │    │
│          │  └──────────────────────────────────────┘    │
└──────────┴────────────────────────────────────────────────┘

TABLET (768px - 1023px)
┌────────────────────────────────────────────────────────────┐
│                                                            │
│              CONTENT (Full Width)                         │
│                                                            │
│  [☰]  ┌──────────────────────────────────────┐           │
│       │         Matrix Table                 │           │
│       │      (Scrollable if needed)          │           │
│       └──────────────────────────────────────┘           │
└────────────────────────────────────────────────────────────┘
        Sidebar: Collapsed (Toggle to open)

MOBILE (<768px)
┌──────────────────────────────────────┐
│                                      │
│  [☰]  CONTENT                       │
│                                      │
│  ┌────────────────────────────────┐ │
│  │    Matrix Table                │ │
│  │  (Horizontal Scroll)           │ │
│  │  ← Swipe to see more →         │ │
│  └────────────────────────────────┘ │
│                                      │
└──────────────────────────────────────┘
  Sidebar: Overlay (Tap to open)
```

---

## 🎭 Animation Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                      ANIMATION SEQUENCE                             │
└─────────────────────────────────────────────────────────────────────┘

Page Load:
  
  1. Header (0ms)
     ↓ fadeIn (400ms)
     "Matrix Hak Akses per Role"
     
  2. Table Container (200ms delay)
     ↓ slideUp (500ms)
     ┌─────────────────────────┐
     │ RESOURCE │ SUPERADMIN   │
     └─────────────────────────┘
     
  3. Table Rows (staggered)
     ↓ fadeIn (50ms each)
     Row 1 → Row 2 → Row 3 → ...
     
  4. Legend (400ms delay)
     ↓ fadeIn (400ms)
     [R] Read  [W] Write  [D] Delete
     
  5. Footer (600ms delay)
     ↓ fadeIn (400ms)
     💡 Info text

Hover Interactions:
  
  Row Hover:
    Normal → Hover (200ms ease)
    Background: transparent → rgba(207, 222, 202, 0.05)
    
  Badge Hover:
    Normal → Hover (200ms ease)
    Scale: 1 → 1.05
    Background: 0.15 → 0.25 opacity
```

---

## 🔤 Typography Scale

```
┌─────────────────────────────────────────────────────────────────────┐
│                      TYPOGRAPHY SYSTEM                              │
└─────────────────────────────────────────────────────────────────────┘

Page Title
  "Matrix Hak Akses per Role"
  • Font: Urbanist Bold
  • Size: 36px (3xl)
  • Color: #CFDECA (Honeydew)
  • Line Height: 1.2

Subtitle
  "Kelola dan pantau hak akses..."
  • Font: Urbanist Regular
  • Size: 16px (base)
  • Color: #D8DFE9 (Alice Blue)
  • Line Height: 1.5

Table Header
  "RESOURCE" | "SUPERADMIN"
  • Font: Urbanist Bold
  • Size: 12px (xs)
  • Color: #F6F5FA (Ghost White)
  • Transform: uppercase
  • Letter Spacing: 0.1em

Table Body
  "Program Studi & CPL"
  • Font: Urbanist Medium
  • Size: 15px (sm)
  • Color: #F6F5FA (Ghost White)
  • Line Height: 1.4

Badge Text
  "R" | "W" | "D"
  • Font: Urbanist Semi-bold
  • Size: 12px (xs)
  • Color: #EFFDA3 (Vanilla)
  • Letter Spacing: 0.05em

Legend Text
  "Read (Baca)"
  • Font: Urbanist Regular
  • Size: 13px (xs)
  • Color: #D8DFE9 (Alice Blue)
  • Line Height: 1.5
```

---

## 🎯 Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────────┐
│                    COMPONENT TREE                                   │
└─────────────────────────────────────────────────────────────────────┘

SuperadminLayout
├── SuperadminSidebar
│   ├── Logo/Title
│   ├── Navigation Menu
│   │   ├── Dashboard
│   │   ├── Matrix Hak Akses ✓
│   │   ├── Manajemen User
│   │   ├── Audit Log
│   │   └── Pengaturan
│   └── Footer Info
│
├── SuperadminHeader
│   ├── Menu Toggle Button
│   ├── Page Title
│   ├── User Info
│   └── Logout Button
│
└── Main Content
    └── AccessMatrixPage
        └── AccessMatrixContent
            ├── Header
            │   ├── Title
            │   └── Subtitle
            │
            ├── Table Container
            │   ├── Table Header
            │   │   ├── Column: RESOURCE
            │   │   └── Column: SUPERADMIN
            │   │
            │   └── Table Body
            │       └── Rows (7x)
            │           ├── Resource Name
            │           └── AccessBadge
            │               ├── Badge R
            │               ├── Badge W
            │               └── Badge D
            │
            ├── Legend
            │   ├── [R] Read
            │   ├── [W] Write
            │   └── [D] Delete
            │
            └── Footer Info
```

---

## 🎨 State Variations

```
┌─────────────────────────────────────────────────────────────────────┐
│                      STATE VARIATIONS                               │
└─────────────────────────────────────────────────────────────────────┘

1. LOADING STATE
   ┌─────────────────────────────────┐
   │                                 │
   │         ⟳ Loading...            │
   │    Memuat data hak akses        │
   │                                 │
   └─────────────────────────────────┘

2. NORMAL STATE (Current)
   ┌─────────────────────────────────┐
   │ RESOURCE          │ SUPERADMIN  │
   ├───────────────────┼─────────────┤
   │ Program Studi...  │ [R] [W] [D] │
   │ Mata Kuliah...    │ [R] [W] [D] │
   └─────────────────────────────────┘

3. HOVER STATE
   ┌─────────────────────────────────┐
   │ RESOURCE          │ SUPERADMIN  │
   ├───────────────────┼─────────────┤
   │ Program Studi...  │ [R] [W] [D] │ ← Highlighted
   │ Mata Kuliah...    │ [R] [W] [D] │
   └─────────────────────────────────┘

4. EMPTY STATE (Future)
   ┌─────────────────────────────────┐
   │                                 │
   │         📋                      │
   │    Tidak ada data               │
   │                                 │
   └─────────────────────────────────┘

5. ERROR STATE (Future)
   ┌─────────────────────────────────┐
   │                                 │
   │         ⚠️                      │
   │    Gagal memuat data            │
   │    [Coba Lagi]                  │
   │                                 │
   └─────────────────────────────────┘
```

---

## 🎪 Interactive Elements

```
┌─────────────────────────────────────────────────────────────────────┐
│                    INTERACTIVE ELEMENTS                             │
└─────────────────────────────────────────────────────────────────────┘

1. SIDEBAR TOGGLE
   [☰] ← Click to toggle sidebar
   
   States:
   • Open (Desktop default)
   • Collapsed (Mobile default)
   • Overlay (Mobile when open)

2. TABLE ROW HOVER
   Normal:  Background: transparent
   Hover:   Background: rgba(207, 222, 202, 0.05)
   
   Cursor: default

3. BADGE HOVER
   Normal:  Scale: 1.0, Opacity: 0.15
   Hover:   Scale: 1.05, Opacity: 0.25
   
   Cursor: default

4. LOGOUT BUTTON
   Normal:  White background
   Hover:   Red background (#fde8e8)
   
   Cursor: pointer

5. NAVIGATION LINKS
   Normal:  Transparent background
   Active:  Yellow background (#EFFDA3)
   Hover:   Light background (rgba)
   
   Cursor: pointer
```

---

## 📐 Spacing System

```
┌─────────────────────────────────────────────────────────────────────┐
│                      SPACING SCALE                                  │
└─────────────────────────────────────────────────────────────────────┘

Container Padding:
  Desktop:  32px
  Tablet:   24px
  Mobile:   16px

Table Cell Padding:
  Horizontal: 24px
  Vertical:   20px

Badge Padding:
  Horizontal: 12px
  Vertical:   4px

Gap Between Badges:
  6px

Section Margins:
  Header → Table:  48px
  Table → Legend:  24px
  Legend → Footer: 16px

Border Radius:
  Small:   8px  (badges, buttons)
  Medium:  12px (legend, cards)
  Large:   16px (table container)
  X-Large: 24px (modals)
```

---

## 🎨 Visual Hierarchy

```
┌─────────────────────────────────────────────────────────────────────┐
│                    VISUAL HIERARCHY                                 │
└─────────────────────────────────────────────────────────────────────┘

Level 1: Page Title
  ████████████████  (Largest, Bold, Green)
  "Matrix Hak Akses per Role"

Level 2: Table Header
  ████████████  (Medium, Bold, Uppercase)
  "RESOURCE" | "SUPERADMIN"

Level 3: Table Content
  ██████████  (Regular, Medium Weight)
  "Program Studi & CPL"

Level 4: Badges
  ████  (Small, Semi-bold, Highlighted)
  [R] [W] [D]

Level 5: Legend & Footer
  ███  (Smallest, Regular, Muted)
  "Read (Baca)" | "💡 Info text"
```

---

## 🎯 Accessibility Features

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ACCESSIBILITY                                    │
└─────────────────────────────────────────────────────────────────────┘

✅ Color Contrast
   • Text on dark background: WCAG AA compliant
   • Badge colors: High contrast ratio

✅ Font Sizes
   • Minimum: 12px (badges, legend)
   • Body: 14-16px (readable)
   • Headings: 36px (clear hierarchy)

✅ Interactive Elements
   • Hover states: Clear visual feedback
   • Focus states: Keyboard navigation support
   • Click targets: Minimum 44x44px

✅ Responsive Design
   • Mobile-friendly
   • Touch-friendly tap targets
   • Horizontal scroll for table on small screens

✅ Semantic HTML
   • Proper table structure
   • Heading hierarchy (h1, h2, h3)
   • Semantic tags (header, nav, main)
```

---

**Visual Guide Complete! 🎨**

Gunakan guide ini sebagai referensi untuk memahami struktur visual dan interaksi komponen Matrix Hak Akses per Role.
