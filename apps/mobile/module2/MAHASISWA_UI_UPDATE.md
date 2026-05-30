# Update UI Portal Mahasiswa - Mobile Module 2

## 📋 Ringkasan Perubahan

Update ini mengubah UI portal mahasiswa untuk:
1. ✅ Menghilangkan sidebar navigation (sesuai dengan UI dosen)
2. ✅ Mengubah header style menjadi logo + title di kiri, profile button di kanan
3. ✅ Filter data untuk hanya menampilkan prodi mahasiswa sendiri
4. ✅ Auto-load CPL untuk prodi mahasiswa

---

## 🎨 Perubahan UI

### 1. Header Style (MahasiswaMainScreen.js)
**Sebelum:**
- Sidebar navigation dengan hamburger menu
- Profile button dengan background kuning (#EFF0A3)
- Avatar text berwarna hitam

**Sesudah:**
- Header dengan logo + title di kiri (seperti dosen)
- Profile button dengan background hitam (#212121)
- Avatar text berwarna putih
- Logo icon: background hitam dengan border kuning
- Tidak ada sidebar

### 2. Dashboard (DashboardScreen.js)
**Perubahan:**
- Filter prodi list untuk hanya menampilkan prodi mahasiswa sendiri
- Menggunakan `user.prodi_id` untuk filtering
- Section title diubah dari "Program Studi" → "Program Studi Saya"
- Link text diubah dari "Lihat Semua" → "Lihat Detail"
- Menghapus `.slice(0, 3)` karena hanya ada 1 prodi yang ditampilkan

**Kode Filter:**
```javascript
useEffect(() => {
    prodiApi.getAll()
        .then(res => {
            const allProdi = res.data || [];
            // Filter: hanya tampilkan prodi mahasiswa sendiri
            const filtered = user?.prodi_id 
                ? allProdi.filter(p => p.id === user.prodi_id)
                : allProdi;
            setProdiList(filtered);
        })
        .catch(() => setProdiList([]))
        .finally(() => setLoading(false));
}, [user]);
```

### 3. Program Studi & CPL (ProgramStudiScreen.js)
**Perubahan:**
- Menghapus search bar (tidak diperlukan karena hanya 1 prodi)
- Filter prodi list untuk hanya menampilkan prodi mahasiswa sendiri
- Auto-load CPL saat screen dibuka (tidak perlu klik toggle)
- Subtitle diubah untuk lebih personal: "Informasi program studi dan Capaian Pembelajaran Lulusan Anda"

**Fitur Auto-Load CPL:**
```javascript
useEffect(() => {
    prodiApi.getAll()
        .then(res => {
            const allProdi = res.data || [];
            const filtered = user?.prodi_id 
                ? allProdi.filter(p => p.id === user.prodi_id)
                : allProdi;
            setProdiList(filtered);
            
            // Auto-load CPL untuk prodi mahasiswa
            if (filtered.length > 0 && user?.prodi_id) {
                setSelectedProdiId(user.prodi_id);
                loadCplForProdi(user.prodi_id);
            }
        })
        .catch(() => setProdiList([]))
        .finally(() => setLoading(false));
}, [user]);
```

---

## 📁 File yang Diubah

### 1. `src/screens/mahasiswa/MahasiswaMainScreen.js`
- ✅ Removed sidebar navigation
- ✅ Updated header layout (logo + title on left, profile on right)
- ✅ Changed profile button colors (black background, white text)
- ✅ Removed all sidebar-related styles
- ✅ Updated dropdown avatar colors to match

### 2. `src/screens/mahasiswa/DashboardScreen.js`
- ✅ Added prodi filtering based on `user.prodi_id`
- ✅ Updated section title and link text
- ✅ Removed `.slice(0, 3)` limit
- ✅ Added dependency `[user]` to useEffect

### 3. `src/screens/mahasiswa/ProgramStudiScreen.js`
- ✅ Added `user` prop to component
- ✅ Added prodi filtering based on `user.prodi_id`
- ✅ Removed search functionality (TextInput import and search state)
- ✅ Removed search bar UI
- ✅ Removed search-related styles
- ✅ Added auto-load CPL feature
- ✅ Updated subtitle text

---

## 🎯 Hasil Akhir

### Header Mahasiswa (Sekarang)
```
┌─────────────────────────────────────────┐
│ [🏫] Sistem CPL        [M] ← profile    │
│      Portal Mahasiswa                   │
└─────────────────────────────────────────┘
```

### Dashboard
- Hanya menampilkan prodi mahasiswa sendiri
- Tidak ada prodi lain yang ditampilkan
- Quick access cards tetap sama

### Program Studi & CPL
- Hanya menampilkan prodi mahasiswa sendiri
- CPL langsung ditampilkan (auto-load)
- Tidak ada search bar
- Mahasiswa bisa toggle untuk tutup/buka CPL

---

## 🔄 Cara Kerja Filter

1. **Data Flow:**
   ```
   API getAll() → Filter by user.prodi_id → Display only own prodi
   ```

2. **Kondisi Filter:**
   - Jika `user.prodi_id` ada → filter prodi list
   - Jika tidak ada → tampilkan semua (fallback)

3. **Auto-Load CPL:**
   - Setelah prodi di-filter
   - Jika ada prodi yang cocok
   - Langsung load CPL untuk prodi tersebut

---

## ✅ Checklist Selesai

- [x] Hilangkan sidebar di mahasiswa portal
- [x] Ubah header style sesuai dosen (logo + title di kiri)
- [x] Filter dashboard untuk hanya tampilkan prodi sendiri
- [x] Filter program studi untuk hanya tampilkan prodi sendiri
- [x] Filter CPL untuk hanya tampilkan CPL prodi sendiri
- [x] Hapus search bar di program studi (tidak diperlukan)
- [x] Auto-load CPL saat buka screen program studi
- [x] Update warna profile button (hitam dengan text putih)
- [x] Hapus semua style yang tidak terpakai (sidebar-related)

---

## 📝 Catatan

- Backend tidak diubah sama sekali
- Semua filtering dilakukan di frontend (mobile)
- User object harus memiliki `prodi_id` property
- Jika `prodi_id` tidak ada, akan fallback ke tampilkan semua prodi
- UI sekarang konsisten dengan portal dosen

---

**Status:** ✅ SELESAI
**Tanggal:** 2026-05-30
**Tested:** Siap untuk testing di Expo Go
