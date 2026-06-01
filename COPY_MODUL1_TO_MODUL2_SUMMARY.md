# Summary: Copy Modul 1 ke Modul 2 Superadmin

## ✅ File yang Sudah Dibuat:
1. ✅ **Prodi** - `apps/web/module2/app/superadmin/prodi/page.tsx` (sudah dibuat manual dengan UI modul 2)

## 📋 File yang Perlu Di-copy dan Diadaptasi:

### Dari Modul 1 → Modul 2:

| No | Modul 1 Source | Modul 2 Destination | Status |
|----|---------------|---------------------|--------|
| 1 | `(dashboard)/prodi/page.jsx` | `superadmin/prodi/page.tsx` | ✅ Done |
| 2 | `(dashboard)/dosen/page.jsx` | `superadmin/dosen/page.tsx` | ❌ Todo |
| 3 | `(dashboard)/mahasiswa/page.jsx` | `superadmin/mahasiswa/page.tsx` | ❌ Todo |
| 4 | `(dashboard)/cpl/page.jsx` | `superadmin/cpl/page.tsx` | ❌ Todo |
| 5 | `(dashboard)/matakuliah/page.jsx` | `superadmin/mata-kuliah-master/page.tsx` | ❌ Todo |
| 6 | `(dashboard)/mapping/page.jsx` | `superadmin/mapping/page.tsx` | ❌ Todo |
| 7 | `(dashboard)/sub-cpmk/page.jsx` | Skip (sudah ada) | ✅ Skip |
| 8 | `(dashboard)/threshold/page.jsx` | `superadmin/threshold/page.tsx` | ❌ Todo |
| 9 | `(dashboard)/dashboard/page.jsx` | Update `superadmin/page.tsx` | ❌ Todo |

---

## 🔄 Adaptasi yang Perlu Dilakukan:

### 1. **Konversi JSX → TSX**
- Ubah `.jsx` menjadi `.tsx`
- Tambahkan type definitions untuk semua interface
- Tambahkan type untuk props, state, dan function parameters

### 2. **Update Import Statements**
```typescript
// DARI (Modul 1):
import { CPLAPI, ProdiAPI } from '@/lib/api';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

// MENJADI (Modul 2):
import ToastContainer, { showToast } from '@/components/Toast';
// Tidak ada Modal component, gunakan inline modal
// API calls menggunakan fetch langsung
```

### 3. **Update UI Components**
- **Hapus emoji** dari UI (🔍, ✏️, 🗑️, dll)
- **Gunakan SVG icons** untuk semua icon
- **Update class names** sesuai modul 2
- **Gunakan Urbanist font**
- **Update color palette**

### 4. **Update API Calls**
```typescript
// DARI (Modul 1):
const data = await CPLAPI.list();

// MENJADI (Modul 2):
const response = await fetch('http://localhost:3000/api/v1/m1/kurikulum/cpl', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
  },
});
const data = await response.json();
```

### 5. **Update Toast Notifications**
```typescript
// DARI (Modul 1):
toast('Berhasil!', 'success');

// MENJADI (Modul 2):
showToast('Berhasil!', 'success');
```

### 6. **Update Modal**
Modul 2 tidak punya komponen Modal terpisah, jadi buat inline:
```tsx
{showModal && (
  <div className="modal-overlay" onClick={handleClose}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      {/* Modal content */}
    </div>
  </div>
)}
```

---

## 📝 Checklist Adaptasi Per File:

### Dosen:
- [ ] Convert JSX → TSX
- [ ] Add interface Dosen
- [ ] Update imports
- [ ] Replace emoji with SVG
- [ ] Update API calls
- [ ] Update toast
- [ ] Create inline modal
- [ ] Test functionality

### Mahasiswa:
- [ ] Convert JSX → TSX
- [ ] Add interface Mahasiswa
- [ ] Update imports
- [ ] Replace emoji with SVG
- [ ] Update API calls
- [ ] Update toast
- [ ] Create inline modal
- [ ] Add filter dropdowns (Prodi, Angkatan)
- [ ] Test functionality

### CPL:
- [ ] Convert JSX → TSX
- [ ] Add interface CPL
- [ ] Update imports
- [ ] Replace emoji with SVG
- [ ] Update API calls
- [ ] Update toast
- [ ] Create inline modal
- [ ] Add toggle active/inactive
- [ ] Test functionality

### Mata Kuliah Master:
- [ ] Convert JSX → TSX
- [ ] Add interface MataKuliah
- [ ] Update imports
- [ ] Replace emoji with SVG
- [ ] Update API calls
- [ ] Update toast
- [ ] Create inline modal
- [ ] Test functionality

### Mapping (MK-CPL):
- [ ] Convert JSX → TSX
- [ ] Add interfaces (MkCpl, Mapping)
- [ ] Update imports
- [ ] Replace emoji with SVG
- [ ] Update API calls
- [ ] Update toast
- [ ] Create inline modal
- [ ] Implement draft system
- [ ] Add weight bar component
- [ ] Add matrix view
- [ ] Test functionality

### Threshold:
- [ ] Convert JSX → TSX
- [ ] Add interface Threshold
- [ ] Update imports
- [ ] Replace emoji with SVG
- [ ] Update API calls
- [ ] Update toast
- [ ] Create status cards
- [ ] Add visual bar
- [ ] Add preview table
- [ ] Test functionality

### Dashboard:
- [ ] Convert JSX → TSX
- [ ] Add statistics cards
- [ ] Add charts (if any)
- [ ] Update API calls
- [ ] Test functionality

---

## 🎨 UI Style Guide:

### Colors:
```css
--eerie-black: #232321
--ghost-white: #F7F5FA
--alice-blue: #E4EAEF
--honeydew: #CFE3CA
--vanilla: #EFFDA3
```

### Typography:
```css
font-family: 'Urbanist', sans-serif;
```

### Badges:
```tsx
<span className="badge badge-blue">Text</span>
<span className="badge badge-green">Text</span>
<span className="badge badge-yellow">Text</span>
<span className="badge badge-red">Text</span>
<span className="badge badge-gray">Text</span>
```

### Buttons:
```tsx
<button className="btn btn-primary">Primary</button>
<button className="btn btn-secondary">Secondary</button>
<button className="btn btn-ghost">Ghost</button>
<button className="btn btn-sm">Small</button>
```

### Icons (SVG):
```tsx
// Search
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
</svg>

// Edit
<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
</svg>

// Delete
<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
  <polyline points="3 6 5 6 21 6"/>
  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
</svg>

// Plus
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
</svg>
```

---

## 🚀 Execution Plan:

1. ✅ Prodi (Done)
2. ⏭️ Dosen (Next)
3. ⏭️ Mahasiswa
4. ⏭️ CPL
5. ⏭️ Mapping
6. ⏭️ Threshold
7. ⏭️ Dashboard
8. ⏭️ Update Sidebar

---

**Status:** 🔄 In Progress (1/8 completed)
**Estimated Time:** ~2-3 hours for all pages
