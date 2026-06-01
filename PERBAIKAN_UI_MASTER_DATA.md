# Perbaikan UI Master Data - Table Layout

## Tanggal: 1 Juni 2026

## Masalah yang Diperbaiki (Update)

Berdasarkan screenshot yang diberikan, ada masalah **KRITIS** pada table layout:

### ❌ **Masalah Utama:**
1. **CPL**: Kolom "Deskripsi" terlalu panjang dan menutupi kolom "Program Studi" dan "Status"
2. **Mahasiswa**: Kolom "Program Studi" terlalu panjang dan menutupi kolom "Angkatan"
3. **Mata Kuliah**: Kolom "Nama Mata Kuliah" terlalu panjang dan menutupi kolom lainnya
4. **Table tidak memiliki fixed width** - Kolom melebar tanpa batas
5. **Text overflow tidak ditangani** - Text panjang tidak di-truncate

### 🎯 **Root Cause:**
- Tidak ada `width` atau `minWidth` pada kolom table
- Tidak ada `text-overflow: ellipsis` untuk text panjang
- Tidak ada `whiteSpace: nowrap` untuk mencegah text wrap

---

## Solusi yang Diterapkan

### 1. **Program Studi**

#### Table Column Width
```tsx
<th style={{ width: '60px' }}>#</th>
<th style={{ width: '120px' }}>Kode</th>
<th style={{ minWidth: '200px' }}>Nama Program Studi</th>
<th style={{ width: '100px' }}>Jenjang</th>
<th style={{ width: '120px' }}>Dibuat</th>
<th style={{ width: '140px', textAlign: 'center' }}>Aksi</th>
```

**Total Width:** ~740px (responsive dengan minWidth pada nama)

---

### 2. **CPL**

#### Table Column Width
```tsx
<th style={{ width: '60px' }}>#</th>
<th style={{ width: '120px' }}>Kode CPL</th>
<th style={{ minWidth: '300px' }}>Deskripsi</th>
<th style={{ width: '180px' }}>Program Studi</th>
<th style={{ width: '100px' }}>Status</th>
<th style={{ width: '140px', textAlign: 'center' }}>Aksi</th>
```

#### Text Truncation
```tsx
<td style={{ 
  maxWidth: '400px', 
  fontSize: '13px', 
  overflow: 'hidden', 
  textOverflow: 'ellipsis', 
  whiteSpace: 'nowrap' 
}} title={item.deskripsi}>
  {item.deskripsi}
</td>
```

**Total Width:** ~900px (responsive dengan minWidth pada deskripsi)

---

### 3. **Dosen**

#### Table Column Width
```tsx
<th style={{ width: '60px' }}>#</th>
<th style={{ width: '140px' }}>NIDN</th>
<th style={{ minWidth: '200px' }}>Nama Lengkap</th>
<th style={{ width: '140px', textAlign: 'center' }}>Aksi</th>
```

**Total Width:** ~540px (simple table)

---

### 4. **Mahasiswa**

#### Table Column Width
```tsx
<th style={{ width: '60px' }}>#</th>
<th style={{ width: '140px' }}>NIM</th>
<th style={{ minWidth: '180px' }}>Nama</th>
<th style={{ width: '200px' }}>Program Studi</th>
<th style={{ width: '100px' }}>Angkatan</th>
<th style={{ width: '140px', textAlign: 'center' }}>Aksi</th>
```

#### Text Truncation for Prodi
```tsx
<td>
  <div style={{ 
    fontSize: '13px', 
    overflow: 'hidden', 
    textOverflow: 'ellipsis', 
    whiteSpace: 'nowrap' 
  }} title={getProdiName(item.prodi_id)}>
    {getProdiName(item.prodi_id)}
  </div>
  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
    {getProdiCode(item.prodi_id)}
  </div>
</td>
```

**Total Width:** ~820px

---

### 5. **Mata Kuliah Master**

#### Table Column Width
```tsx
<th style={{ width: '60px' }}>#</th>
<th style={{ width: '120px' }}>Kode MK</th>
<th style={{ minWidth: '250px' }}>Nama Mata Kuliah</th>
<th style={{ width: '80px' }}>Prodi</th>
<th style={{ width: '80px' }}>SKS</th>
<th style={{ width: '100px' }}>Semester</th>
<th style={{ width: '140px' }}>CPL Terpetakan</th>
<th style={{ width: '140px', textAlign: 'center' }}>Aksi</th>
```

#### Text Truncation for Nama MK
```tsx
<td style={{ 
  fontWeight: '600', 
  overflow: 'hidden', 
  textOverflow: 'ellipsis', 
  whiteSpace: 'nowrap', 
  maxWidth: '300px' 
}} title={row.nama_mk}>
  {row.nama_mk}
</td>
```

**Total Width:** ~970px

---

## Prinsip Table Layout

### 1. **Fixed Width untuk Kolom Kecil**
- Nomor: `60px`
- Kode/Badge: `120-140px`
- Status/Jenjang: `100px`
- Aksi: `140px`

### 2. **Min Width untuk Kolom Utama**
- Nama/Deskripsi: `minWidth: 200-300px`
- Memungkinkan kolom melebar jika ada space
- Tidak akan mengecil di bawah min width

### 3. **Text Truncation**
```tsx
overflow: 'hidden'
textOverflow: 'ellipsis'
whiteSpace: 'nowrap'
maxWidth: 'XXXpx'
title={fullText} // Tooltip untuk text lengkap
```

### 4. **Responsive Behavior**
- Fixed width untuk kolom kecil
- Min width untuk kolom utama
- Table akan scroll horizontal jika container terlalu kecil
- Text akan truncate dengan ellipsis (...)

---

## Hasil

✅ **Kolom tidak saling menutupi** - Setiap kolom memiliki width yang jelas
✅ **Text panjang di-truncate** - Menggunakan ellipsis (...) dengan tooltip
✅ **Layout konsisten** - Semua table mengikuti prinsip yang sama
✅ **Responsive** - Table tetap rapi di berbagai ukuran layar
✅ **Button Edit/Hapus terlihat** - Kolom Aksi memiliki width fixed 140px
✅ **Data tidak tertutup** - Semua data terlihat dengan jelas

---

## Before vs After

### Before:
```tsx
<th>Deskripsi</th>  // No width, melebar tanpa batas
<td>{item.deskripsi}</td>  // Text panjang menutupi kolom lain
```

### After:
```tsx
<th style={{ minWidth: '300px' }}>Deskripsi</th>
<td style={{ 
  maxWidth: '400px', 
  overflow: 'hidden', 
  textOverflow: 'ellipsis', 
  whiteSpace: 'nowrap' 
}} title={item.deskripsi}>
  {item.deskripsi}
</td>
```

---

## Testing

Untuk testing, pastikan:
1. ✅ Buka setiap halaman Master Data
2. ✅ Periksa semua kolom terlihat dengan jelas
3. ✅ Hover pada text yang di-truncate untuk melihat tooltip
4. ✅ Button Edit/Hapus tidak tertutup
5. ✅ Resize browser window untuk test responsive
6. ✅ Scroll horizontal jika table terlalu lebar

**Test Case:**
1. **Program Studi** - Nama prodi panjang tidak menutupi kolom lain
2. **CPL** - Deskripsi panjang di-truncate dengan ellipsis
3. **Dosen** - Layout simple dan rapi
4. **Mahasiswa** - Nama prodi panjang di-truncate
5. **Mata Kuliah** - Nama MK panjang di-truncate

---

## File yang Diubah

1. ✅ `apps/web/module2/app/superadmin/prodi/page.tsx`
2. ✅ `apps/web/module2/app/superadmin/cpl/page.tsx`
3. ✅ `apps/web/module2/app/superadmin/dosen/page.tsx`
4. ✅ `apps/web/module2/app/superadmin/mahasiswa/page.tsx`
5. ✅ `apps/web/module2/app/superadmin/mata-kuliah-master/page.tsx`
6. ✅ `apps/web/module2/app/superadmin/mapping/page.tsx` (sudah diperbaiki sebelumnya)

---

## Catatan Penting

### ⚠️ **Jangan Gunakan:**
```tsx
<th>Kolom</th>  // ❌ No width
<td>{longText}</td>  // ❌ No truncation
```

### ✅ **Gunakan:**
```tsx
<th style={{ width: '120px' }}>Kolom</th>  // ✅ Fixed width
<th style={{ minWidth: '200px' }}>Kolom</th>  // ✅ Min width
<td style={{ 
  overflow: 'hidden', 
  textOverflow: 'ellipsis', 
  whiteSpace: 'nowrap',
  maxWidth: '300px'
}} title={longText}>
  {longText}
</td>  // ✅ Truncated with tooltip
```

---

## Summary

Perbaikan ini menyelesaikan masalah **KRITIS** dimana data tertutup oleh button Edit/Hapus. Sekarang:

1. ✅ Setiap kolom memiliki width yang jelas
2. ✅ Text panjang di-truncate dengan ellipsis
3. ✅ Tooltip menampilkan text lengkap saat hover
4. ✅ Button Edit/Hapus selalu terlihat
5. ✅ Layout konsisten di semua halaman
6. ✅ Responsive dan rapi

**Total perubahan:** 5 file table layout + 1 file sebelumnya (Pemetaan MK-CPL)

1. **Spacing tidak konsisten** - Jarak antar elemen terlalu rapat/renggang
2. **Badge terlalu besar** - Badge CPL, jenjang, dan lainnya terlalu besar
3. **Font size tidak konsisten** - Ukuran font bervariasi tanpa pola yang jelas
4. **Padding berlebihan** - Card dan table memiliki padding yang terlalu besar
5. **Button text terlalu panjang** - "Simpan ke Database" terlalu panjang

---

## Perubahan yang Dilakukan

### 1. **Program Studi (Prodi)**

#### Summary Cards
**Sebelum:**
```tsx
gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
gap: '16px'
padding: '16px 20px'
icon: width: '40px', height: '40px', fontSize: '14px'
count: fontSize: '24px', fontWeight: '800'
```

**Sesudah:**
```tsx
gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))'
gap: '12px'
padding: '14px 16px'
icon: width: '36px', height: '36px', fontSize: '12px'
count: fontSize: '20px', fontWeight: '700', lineHeight: '1.2'
label: fontSize: '11px', marginTop: '2px'
```

#### Spacing
- `marginBottom: '20px'` → `marginBottom: '24px'`

---

### 2. **CPL**

#### Warning Box
**Sebelum:**
```tsx
borderRadius: '10px'
padding: '14px 18px'
fontSize: '14px'
```

**Sesudah:**
```tsx
borderRadius: '8px'
padding: '12px 16px'
fontSize: '13px'
lineHeight: '1.6'
```

#### Spacing
- `marginBottom: '20px'` → `marginBottom: '24px'`

---

### 3. **Dosen**

#### Summary Cards
**Sebelum:**
```tsx
gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
padding: '18px 20px'
fontSize: '32px', fontWeight: '800'
```

**Sesudah:**
```tsx
gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))'
padding: '14px 16px'
fontSize: '24px', fontWeight: '700', lineHeight: '1.2'
label: fontSize: '11px', marginTop: '4px'
```

---

### 4. **Mahasiswa**

#### Warning Box & Spacing
- Sama seperti CPL
- `marginBottom: '20px'` → `marginBottom: '24px'`

---

### 5. **Mata Kuliah Master**

#### Semester Filter Cards
**Sebelum:**
```tsx
padding: '12px 18px'
gap: '10px'
fontWeight: '700'
badge: default size
```

**Sesudah:**
```tsx
padding: '10px 14px'
gap: '8px'
fontWeight: '600', fontSize: '13px'
badge: fontSize: '11px', padding: '3px 7px'
transition: 'all 0.2s'
```

---

### 6. **Pemetaan MK-CPL** (Paling Banyak Perubahan)

#### Info Box
**Sebelum:**
```tsx
borderRadius: '10px'
padding: '14px 18px'
fontSize: '13px'
```

**Sesudah:**
```tsx
borderRadius: '8px'
padding: '12px 16px'
fontSize: '13px'
lineHeight: '1.6'
```

#### Warning Message
**Sebelum:**
```tsx
padding: '12px 18px'
fontSize: '18px' (icon)
fontSize: '14px' (text)
text: "Peringatan: Total bobot Pemetaan MK–CPL melebihi 1.00 pada Mata Kuliah: ..."
```

**Sesudah:**
```tsx
padding: '10px 16px'
fontSize: '16px' (icon)
fontSize: '13px', lineHeight: '1.5' (text)
text: "Peringatan: Total bobot melebihi 1.00 pada MK: ..."
```

#### Card Header
**Sebelum:**
```tsx
marginBottom: '20px'
gap: '10px'
badge: default size
fontSize: '15px' (nama MK)
button: "💾 Simpan ke Database"
```

**Sesudah:**
```tsx
marginBottom: '16px'
padding: '16px 20px'
gap: '8px'
badge: fontSize: '11px', padding: '4px 8px'
fontSize: '14px', fontWeight: '600' (nama MK)
button: "💾 Simpan" (lebih pendek)
whiteSpace: 'nowrap'
```

#### Table
**Sebelum:**
```tsx
th: default padding
td: default padding
badge: default size
progress bar: width: '80px', height: '8px'
button width: '120px'
```

**Sesudah:**
```tsx
th: padding: '10px 12px', fontSize: '12px'
td: padding: '10px 12px'
badge: fontSize: '11px', padding: '4px 8px'
progress bar: width: '60px', height: '6px'
button width: '140px'
button: padding: '6px 10px'
percentage: fontSize: '12px', minWidth: '45px'
```

#### WeightBar Component
**Sebelum:**
```tsx
marginTop: '4px'
fontSize: '13px' (label)
fontSize: '16px', fontWeight: '800' (value)
height: '8px' (bar)
```

**Sesudah:**
```tsx
marginTop: '6px'
fontSize: '12px' (label)
fontSize: '14px', fontWeight: '700' (value)
height: '6px' (bar)
marginBottom: '4px'
```

#### Empty State
**Sebelum:**
```tsx
padding: '20px 24px'
```

**Sesudah:**
```tsx
padding: '16px 20px'
borderTop: '1px solid #f3f4f6'
```

---

## Prinsip Perbaikan

### 1. **Konsistensi Spacing**
- Small gap: `8px`
- Medium gap: `12px`
- Large gap: `16px`
- Section margin: `24px`

### 2. **Konsistensi Padding**
- Card: `14px 16px` atau `16px 20px`
- Table cell: `10px 12px`
- Button: `6px 10px` (small), `8px 16px` (regular)

### 3. **Konsistensi Font Size**
- Extra small: `11px` (label, caption)
- Small: `12px` (secondary text)
- Regular: `13px` (body text)
- Medium: `14px` (emphasis)
- Large: `20px-24px` (numbers, headings)

### 4. **Konsistensi Badge**
- Font size: `11px`
- Padding: `4px 8px` (small), `3px 7px` (extra small)
- Border radius: `6px`

### 5. **Konsistensi Border Radius**
- Small: `6px` (badge, progress bar)
- Medium: `8px` (card, input, button)
- Large: `10px` (modal)

### 6. **Line Height**
- Tight: `1.2` (numbers, headings)
- Normal: `1.5` (body text)
- Relaxed: `1.6` (paragraphs)

---

## Hasil

✅ **Spacing lebih konsisten** - Jarak antar elemen mengikuti pola 8px, 12px, 16px, 24px
✅ **Badge lebih proporsional** - Ukuran badge dikurangi dengan font 11px dan padding 4px 8px
✅ **Font size lebih konsisten** - Mengikuti skala 11px, 12px, 13px, 14px, 20px-24px
✅ **Padding lebih rapi** - Card dan table memiliki padding yang konsisten
✅ **Button text lebih ringkas** - "Simpan ke Database" → "Simpan"
✅ **UI lebih clean** - Tampilan lebih rapi dan profesional
✅ **Responsive tetap baik** - Flexbox dan grid tetap berfungsi dengan baik

---

## File yang Diubah

1. `apps/web/module2/app/superadmin/prodi/page.tsx`
2. `apps/web/module2/app/superadmin/cpl/page.tsx`
3. `apps/web/module2/app/superadmin/dosen/page.tsx`
4. `apps/web/module2/app/superadmin/mahasiswa/page.tsx`
5. `apps/web/module2/app/superadmin/mata-kuliah-master/page.tsx`
6. `apps/web/module2/app/superadmin/mapping/page.tsx`

---

## Testing

Untuk testing, pastikan:
1. Buka setiap halaman Master Data
2. Periksa spacing antar elemen
3. Periksa ukuran badge dan font
4. Periksa responsive layout di berbagai ukuran layar
5. Periksa button dan interaction states

**Test Case:**
1. Program Studi - Summary cards harus rapi dengan spacing konsisten
2. CPL - Warning box dan table harus rapi
3. Dosen - Summary cards harus proporsional
4. Mahasiswa - Filter dan table harus rapi
5. Mata Kuliah - Semester filter cards harus rapi
6. Pemetaan MK-CPL - Card header, table, dan WeightBar harus rapi dan proporsional

---

## Catatan

Semua perubahan fokus pada:
- **Mengurangi ukuran** yang terlalu besar (badge, font, padding)
- **Meningkatkan konsistensi** spacing dan sizing
- **Memperbaiki readability** dengan line-height yang tepat
- **Mempertahankan functionality** - tidak ada perubahan logic

Tidak ada perubahan pada:
- Backend API
- Data structure
- Business logic
- Functionality
