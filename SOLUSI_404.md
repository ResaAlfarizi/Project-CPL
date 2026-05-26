# Solusi 404 Setelah Git Pull

## Masalah
Setelah melakukan `git commit` dan `git pull`, semua halaman superadmin (kecuali dashboard) menampilkan error **404 This page could not be found**.

## Penyebab
- Next.js cache yang tidak sinkron setelah git pull
- Build cache yang masih menggunakan versi lama
- Turbopack cache yang perlu di-refresh

## Solusi

### Langkah 1: Stop Development Server
Tekan `Ctrl + C` di terminal untuk menghentikan server yang sedang berjalan.

### Langkah 2: Hapus Cache Next.js
Jalankan perintah berikut di folder `apps/web/module2`:

```cmd
cd d:\TUGAS KULIAH FAZA\SEMESTER 4\webmobile\UAS NEW\Project-CPL\apps\web\module2
rmdir /s /q .next
```

### Langkah 3: Restart Development Server
```cmd
npm run dev
```

### Langkah 4: Hard Refresh Browser
Setelah server berjalan, buka browser dan tekan:
- **Chrome/Edge**: `Ctrl + Shift + R` atau `Ctrl + F5`
- Atau buka DevTools (`F12`) → klik kanan tombol refresh → pilih "Empty Cache and Hard Reload"

## Verifikasi
Coba akses halaman-halaman berikut:
- ✅ http://localhost:3001/superadmin (Dashboard)
- ✅ http://localhost:3001/superadmin/users (Manajemen User)
- ✅ http://localhost:3001/superadmin/prodi-cpl (Program Studi & CPL)
- ✅ http://localhost:3001/superadmin/mata-kuliah (Mata Kuliah & Pemetaan)
- ✅ http://localhost:3001/superadmin/audit-log (Audit Log)
- ✅ http://localhost:3001/superadmin/sub-cpmk (Sub CPMK)
- ✅ http://localhost:3001/superadmin/input-nilai (Input Nilai)
- ✅ http://localhost:3001/superadmin/capaian (Capaian)

## Catatan
- Semua file page.tsx sudah ada dan lengkap
- globals.css sudah diperbaiki dengan semua class yang diperlukan
- Masalah ini murni cache Next.js, bukan kode yang hilang

## Jika Masih 404
Jika setelah langkah di atas masih 404, coba:

```cmd
cd d:\TUGAS KULIAH FAZA\SEMESTER 4\webmobile\UAS NEW\Project-CPL\apps\web\module2
rmdir /s /q .next
rmdir /s /q node_modules\.cache
npm run dev
```

Atau install ulang dependencies:
```cmd
rmdir /s /q node_modules
npm install
npm run dev
```
