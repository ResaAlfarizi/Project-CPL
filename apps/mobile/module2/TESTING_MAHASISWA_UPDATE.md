# Testing Guide - Mahasiswa UI Update

## 🧪 Cara Testing

### 1. Persiapan
```bash
cd c:\projectcpl\Project-CPL\apps\mobile\module2
npx expo start
```

### 2. Login sebagai Mahasiswa
- Buka Expo Go di Android
- Scan QR code
- Login dengan akun mahasiswa yang memiliki `prodi_id`

### 3. Checklist Testing

#### ✅ Header
- [ ] Logo "Sistem CPL" muncul di kiri dengan icon sekolah
- [ ] Text "Portal Mahasiswa" muncul di bawah logo
- [ ] Profile button berwarna hitam dengan text putih di kanan
- [ ] Tidak ada hamburger menu / sidebar
- [ ] Klik profile button → dropdown muncul
- [ ] Dropdown avatar berwarna hitam dengan text putih

#### ✅ Dashboard
- [ ] Section "Program Studi Saya" muncul
- [ ] Hanya menampilkan 1 prodi (prodi mahasiswa sendiri)
- [ ] Tidak ada prodi lain yang muncul
- [ ] Button "Lihat Detail" berfungsi
- [ ] Quick access cards berfungsi normal

#### ✅ Program Studi & CPL
- [ ] Tidak ada search bar
- [ ] Hanya menampilkan 1 prodi (prodi mahasiswa sendiri)
- [ ] CPL langsung ditampilkan (auto-load)
- [ ] Bisa toggle untuk tutup/buka CPL
- [ ] Subtitle: "Informasi program studi dan Capaian Pembelajaran Lulusan Anda"

#### ✅ Navigation
- [ ] Klik "Program Studi" dari dashboard → pindah ke screen program studi
- [ ] Klik "Mata Kuliah" → pindah ke screen mata kuliah
- [ ] Klik "Capaian" → pindah ke screen capaian
- [ ] Klik "Sub-CPMK" → pindah ke screen sub-cpmk
- [ ] Klik "Profil Saya" dari dropdown → pindah ke screen profile

#### ✅ Profile Dropdown
- [ ] Klik profile button → dropdown muncul
- [ ] Nama mahasiswa muncul
- [ ] Email mahasiswa muncul
- [ ] Badge "Mahasiswa" muncul
- [ ] Klik "Profil Saya" → pindah ke profile screen
- [ ] Klik "Keluar" → logout dan kembali ke login screen

---

## 🐛 Troubleshooting

### Error: "Cannot read property 'prodi_id' of undefined"
**Solusi:** User object tidak memiliki `prodi_id`. Pastikan:
1. Login dengan akun mahasiswa yang valid
2. Backend mengirim `prodi_id` dalam response login
3. Check di `src/services/api.js` apakah user data ter-parse dengan benar

### Prodi tidak muncul di dashboard
**Solusi:**
1. Check console log untuk error API
2. Pastikan backend endpoint `/prodi` berfungsi
3. Pastikan `user.prodi_id` sesuai dengan ID prodi di database
4. Check filter logic di `DashboardScreen.js`

### CPL tidak auto-load
**Solusi:**
1. Check console log untuk error API
2. Pastikan backend endpoint `/cpl/prodi/:id` berfungsi
3. Check `loadCplForProdi()` function di `ProgramStudiScreen.js`

### Header tidak sesuai (masih ada sidebar)
**Solusi:**
1. Pastikan file `MahasiswaMainScreen.js` sudah ter-update
2. Reload Expo app (shake device → Reload)
3. Clear cache: `npx expo start -c`

---

## 📊 Expected Results

### Dashboard
```
┌─────────────────────────────────────────┐
│ [🏫] Sistem CPL        [M]              │
│      Portal Mahasiswa                   │
├─────────────────────────────────────────┤
│                                         │
│ Selamat Datang 👋                       │
│ [Nama Mahasiswa]                        │
│ Berikut ringkasan aktivitas Anda       │
│                                         │
│ ┌─────────┐ ┌─────────┐                │
│ │ Capaian │ │ Mata    │                │
│ │ CPL     │ │ Kuliah  │                │
│ └─────────┘ └─────────┘                │
│ ┌─────────┐ ┌─────────┐                │
│ │ Program │ │ Sub-    │                │
│ │ Studi   │ │ CPMK    │                │
│ └─────────┘ └─────────┘                │
│                                         │
│ Program Studi Saya    [Lihat Detail]   │
│ ┌─────────────────────────────────┐    │
│ │ Teknik Informatika              │    │
│ │ [TI] [S1]          [Lihat CPL]  │    │
│ └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

### Program Studi & CPL
```
┌─────────────────────────────────────────┐
│ [🏫] Sistem CPL        [M]              │
│      Portal Mahasiswa                   │
├─────────────────────────────────────────┤
│                                         │
│ Program Studi & CPL                     │
│ Informasi program studi dan CPL Anda   │
│                                         │
│ ┌─────────────────────────────────┐    │
│ │ Teknik Informatika         [🏫] │    │
│ │ [TI] [S1]                       │    │
│ │ [Tutup CPL ▲]                   │    │
│ │                                 │    │
│ │ CAPAIAN PEMBELAJARAN LULUSAN    │    │
│ │ ┌─────────────────────────┐     │    │
│ │ │ [CPL-01]                │     │    │
│ │ │ Mampu menerapkan...     │     │    │
│ │ └─────────────────────────┘     │    │
│ │ ┌─────────────────────────┐     │    │
│ │ │ [CPL-02]                │     │    │
│ │ │ Mampu menganalisis...   │     │    │
│ │ └─────────────────────────┘     │    │
│ └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

---

## ✅ Success Criteria

Testing dianggap berhasil jika:
1. ✅ Header tidak ada sidebar, logo di kiri, profile di kanan
2. ✅ Dashboard hanya menampilkan prodi mahasiswa sendiri
3. ✅ Program Studi hanya menampilkan prodi mahasiswa sendiri
4. ✅ CPL auto-load saat buka screen program studi
5. ✅ Tidak ada search bar di program studi
6. ✅ Profile button dan dropdown berwarna hitam dengan text putih
7. ✅ Semua navigation berfungsi normal
8. ✅ Logout berfungsi normal

---

## 📝 Notes

- Pastikan backend sudah running di `http://[IP]:5000`
- Pastikan IP address di `src/services/api.js` sudah benar
- Pastikan database memiliki data mahasiswa dengan `prodi_id`
- Jika ada error, check console log di Expo Go

---

**Happy Testing! 🚀**
