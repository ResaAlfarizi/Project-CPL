# 🔧 Fix: Redirect ke /admin (404)

## 🐛 Masalah

Ketika buka `localhost:3001`, langsung redirect ke `localhost:3001/admin` yang 404.

## 🔍 Penyebab

1. ❌ Token lama di localStorage masih ada
2. ❌ Root page (`page.tsx`) redirect salah
3. ❌ AuthContext redirect salah

## ✅ Solusi (Sudah Diperbaiki)

### 1. **Root Page** ✅
File: `apps/web/module2/app/page.tsx`

**Sebelum:**
```typescript
else if (role === 'admin' || role === 'admin_prodi') {
  router.push('/admin');  // ❌ Salah
}
```

**Sesudah:**
```typescript
else if (role === 'admin prodi' || role === 'admin_prodi') {
  router.push('/admin-prodi');  // ✅ Benar
}
```

### 2. **AuthContext** ✅
File: `apps/web/module2/contexts/AuthContext.tsx`

Sudah diperbaiki di langkah sebelumnya.

## 🚀 Cara Mengatasi

### **Opsi 1: Clear Token di Browser (RECOMMENDED)**

1. **Buka Console Browser (F12)**
2. **Paste dan Enter:**
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

3. **Atau manual:**
   - F12 → Application tab
   - Storage → Local Storage → `http://localhost:3001`
   - Klik kanan → Clear
   - Refresh (F5)

### **Opsi 2: Clear Browser Data**

```
Ctrl + Shift + Delete
→ Pilih "Cookies and other site data"
→ Pilih "Cached images and files"
→ Clear data
```

### **Opsi 3: Incognito Mode**

```
Ctrl + Shift + N
→ Buka: http://localhost:3001
→ Akan redirect ke /login
```

## 📝 Langkah Lengkap

### **1. Clear Token**

Pilih salah satu opsi di atas (Opsi 1 paling cepat)

### **2. Restart Server (Opsional)**

```bash
# Stop (Ctrl+C)
cd apps/web/module2
rm -rf .next
npm run dev
```

### **3. Akses Root URL**

```
http://localhost:3001
```

**Expected:** Redirect ke `http://localhost:3001/login`

### **4. Login**

```
Email:    admin@if.ac.id
Password: (password Anda)
```

**Expected:** Redirect ke `http://localhost:3001/admin-prodi`

## ✅ Flow yang Benar

```
1. Buka: http://localhost:3001
   ↓
2. Cek token di localStorage
   ↓
3a. Jika TIDAK ada token → Redirect ke /login
3b. Jika ADA token → Cek role:
    - Superadmin → /superadmin
    - Admin Prodi → /admin-prodi  ← BENAR
    - Dosen → /dosen
    - Mahasiswa → /mahasiswa
   ↓
4. Login dengan admin@if.ac.id
   ↓
5. Redirect ke /admin-prodi
```

## 🔍 Verifikasi

### **Cek Token di Console:**

```javascript
// Buka Console (F12)
const token = localStorage.getItem('auth_token');
if (token) {
  const decoded = JSON.parse(atob(token.split('.')[1]));
  console.log('Email:', decoded.email);
  console.log('Role:', decoded.role);
  console.log('Exp:', new Date(decoded.exp * 1000));
} else {
  console.log('No token found');
}
```

### **Cek Redirect di Network Tab:**

1. F12 → Network tab
2. Buka `http://localhost:3001`
3. Lihat redirect chain:
   - `localhost:3001` → `localhost:3001/login` ✅
   - Atau `localhost:3001` → `localhost:3001/admin-prodi` ✅ (jika sudah login)

## 🆘 Jika Masih Error

### **1. Hard Refresh**

```
Ctrl + Shift + R
```

### **2. Clear Everything**

```javascript
// Console (F12)
localStorage.clear();
sessionStorage.clear();
indexedDB.deleteDatabase('keyval-store');
location.reload();
```

### **3. Restart Browser**

Tutup semua tab browser, buka ulang.

### **4. Check File Changes**

Pastikan file sudah tersimpan:
```bash
# Cek git status
git status

# Lihat perubahan
git diff apps/web/module2/app/page.tsx
git diff apps/web/module2/contexts/AuthContext.tsx
```

## 📋 Checklist

- [ ] Token lama sudah dihapus (localStorage.clear())
- [ ] File `page.tsx` sudah diperbaiki
- [ ] File `AuthContext.tsx` sudah diperbaiki
- [ ] Server sudah direstart
- [ ] Browser cache sudah dihapus
- [ ] Buka `localhost:3001` redirect ke `/login`
- [ ] Login dengan `admin@if.ac.id`
- [ ] Redirect ke `/admin-prodi`

## 🎯 Quick Fix Command

```javascript
// Paste di Console Browser (F12):
localStorage.clear();
sessionStorage.clear();
alert('Token cleared! Refresh page now.');
location.reload();
```

---

**Status:** ✅ Fixed  
**Action:** Clear token & refresh
