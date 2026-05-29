# Admin Prodi - Spacing & Layout Guide

## 📐 Spacing Structure

### Layout Hierarchy
```
┌─────────────────────────────────────────────────────────┐
│ Sidebar (270px fixed)                                   │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Logo & Title (padding: 24px 20px)                   │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ Navigation (padding: 20px 16px)                     │ │
│ │   - Menu items (gap: 6px)                           │ │
│ │   - Each item (padding: 14px 16px)                  │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ Footer Info (padding: 20px)                         │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Main Content Area (margin-left: 270px when expanded)   │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Header (sticky, padding: 16px 32px)                 │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ Page Content (padding: 32px)                        │ │
│ │   ┌───────────────────────────────────────────────┐ │ │
│ │   │ Page Header (margin-bottom: 32px)             │ │ │
│ │   │   - Title (font-size: 32px, margin-bottom: 8px)│ │
│ │   │   - Subtitle (font-size: 15px)                │ │ │
│ │   ├───────────────────────────────────────────────┤ │ │
│ │   │ Content Cards (gap: 20px)                     │ │ │
│ │   │   - Card padding: 28px                        │ │ │
│ │   │   - Card border-radius: 16px                  │ │ │
│ │   └───────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## 🎨 Spacing Values

### Desktop (> 1024px)
- **Sidebar Width**: 270px (fixed)
- **Main Content Margin**: 270px (left)
- **Page Content Padding**: 32px (all sides)
- **Header Padding**: 16px 32px
- **Page Header Margin Bottom**: 32px
- **Card Padding**: 28px
- **Card Gap**: 20px

### Tablet (640px - 1023px)
- **Sidebar**: Collapsed by default
- **Main Content Margin**: 0
- **Page Content Padding**: 20px (all sides)
- **Header Padding**: 16px 20px

### Mobile (< 640px)
- **Sidebar**: Overlay mode
- **Main Content Margin**: 0
- **Page Content Padding**: 16px (all sides)
- **Header Padding**: 12px 16px
- **Card Padding**: 20px

## 📏 Component Spacing

### Sidebar
```css
/* Logo Section */
padding: 24px 20px;
border-bottom: 1px solid rgba(255, 255, 255, 0.1);

/* Navigation */
padding: 20px 16px;
gap: 6px; /* between menu items */

/* Menu Item */
padding: 14px 16px;
border-radius: 12px;
gap: 12px; /* between icon and text */

/* Footer Info */
padding: 20px;
border-top: 1px solid rgba(255, 255, 255, 0.1);
```

### Main Content
```css
/* Main Container */
padding: 32px;
overflow-y: auto;

/* Page Header */
margin-bottom: 32px;

/* Page Title */
font-size: 32px;
margin-bottom: 8px;
letter-spacing: -0.02em;

/* Page Subtitle */
font-size: 15px;
font-weight: 500;
```

### Cards
```css
/* Card Container */
padding: 28px;
border-radius: 16px;
gap: 20px; /* between cards */
box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);

/* Card Hover */
transform: translateY(-4px);
box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
```

### Tables
```css
/* Table Container */
padding: 0; /* no padding on card for tables */
overflow: hidden;

/* Table Cell */
padding: 16px;
```

### Forms
```css
/* Form Group */
margin-bottom: 16px;

/* Label */
margin-bottom: 6px;
font-size: 13px;

/* Input/Select */
padding: 10px 14px;
border-radius: 8px;

/* Button Group */
gap: 8px;
margin-top: 24px;
```

## 🎯 Responsive Breakpoints

```css
/* Desktop First Approach */
@media (max-width: 1023px) {
  .main-wrapper {
    margin-left: 0 !important;
  }
  .main-content {
    padding: 20px !important;
  }
}

@media (max-width: 640px) {
  .main-content {
    padding: 16px !important;
  }
}
```

## 📱 Mobile Behavior

### Sidebar
- **Default State**: Collapsed (off-screen)
- **Position**: Fixed, left: -270px
- **Overlay**: Dark overlay when open
- **Animation**: Smooth slide-in (0.3s ease)

### Main Content
- **Margin**: Always 0 on mobile
- **Padding**: Reduced to 16px
- **Header**: Hamburger menu visible

## 🔧 Implementation

### Layout Component
```typescript
// apps/web/module2/app/admin-prodi/layout.tsx
<main
  style={{
    flex: 1,
    padding: '32px', // Main spacing
    minWidth: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
  }}
  className="main-content"
>
  {children}
</main>
```

### Responsive Styles
```css
@media (max-width: 1023px) {
  .main-wrapper {
    margin-left: 0 !important;
  }
  .main-content {
    padding: 20px !important;
  }
}

@media (max-width: 640px) {
  .main-content {
    padding: 16px !important;
  }
}
```

## ✅ Checklist

- [x] Sidebar width: 270px fixed
- [x] Main content padding: 32px (desktop)
- [x] Responsive padding: 20px (tablet), 16px (mobile)
- [x] Page header margin: 32px bottom
- [x] Card padding: 28px
- [x] Consistent spacing across all pages
- [x] Smooth transitions on sidebar toggle
- [x] Mobile overlay working correctly

## 📝 Best Practices

1. **Consistency**: Use the same spacing values across all pages
2. **Responsive**: Always test on mobile, tablet, and desktop
3. **Accessibility**: Ensure touch targets are at least 44x44px
4. **Performance**: Use CSS transitions for smooth animations
5. **Maintainability**: Use CSS variables for spacing values

## 🎨 Design Tokens

```css
/* Spacing Scale */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-2xl: 48px;

/* Component Spacing */
--sidebar-width: 270px;
--header-height: 72px;
--page-padding: 32px;
--card-padding: 28px;
--card-gap: 20px;

/* Border Radius */
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 20px;
```

## 🔍 Testing

### Desktop (1920x1080)
- ✅ Sidebar visible and fixed
- ✅ Content has proper margin-left
- ✅ Padding: 32px all sides
- ✅ Cards have proper spacing

### Tablet (768x1024)
- ✅ Sidebar collapsed by default
- ✅ Content margin-left: 0
- ✅ Padding: 20px all sides
- ✅ Hamburger menu works

### Mobile (375x667)
- ✅ Sidebar overlay mode
- ✅ Content full width
- ✅ Padding: 16px all sides
- ✅ Touch-friendly buttons

---

**Last Updated**: 29 Mei 2026
**Version**: 1.0.0
**Status**: ✅ Implemented & Tested
