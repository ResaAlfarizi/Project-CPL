# 🎓 Sistem Manajemen CPL (Capaian Pembelajaran Lulusan)
**Program Studi Sistem Informasi - Fakultas Sains dan Teknologi, UIN Sunan Ampel Surabaya**

Repositori utama untuk pengembangan Sistem Manajemen CPL. Proyek ini menggunakan arsitektur **Monorepo** untuk mengintegrasikan layanan *Backend* (REST API), *Web Dashboard* (Admin/Dosen), dan *Mobile App* (Mahasiswa) dalam satu basis kode yang terpusat.

## 🏗️ Tech Stack
* **Database:** PostgreSQL (UUID-based architecture)
* **Backend API:** Node.js
* **Frontend Web:** Next.js (React)
* **Frontend Mobile:** React Native (Expo)
* **Manajemen Repositori:** Git dan GitHub

## 📂 Struktur Direktori
```text
Project-CPL/
├── apps/
│   ├── backend/    # Logika bisnis dan REST API
│   ├── web/        # Antarmuka dashboard Web (Dosen dan Admin)
│   └── mobile/     # Antarmuka aplikasi Mobile (Mahasiswa)
├── db-scripts/     # Skrip DDL (Skema) dan DML (Seeding) untuk PostgreSQL
├── .gitignore      # Pengecualian node_modules, build output, dan file .env
└── package.json    # Konfigurasi root workspace monorepo

🚀 Panduan Setup Lokal (Development)
1. Kloning Repositori
Jalankan perintah berikut di terminal Anda untuk mengunduh proyek:

Bash
git clone https://github.com/ResaAlfarizi/Project-CPL.git
cd Project-CPL

2. Inisialisasi Database (Wajib)
Sebelum menyalakan server backend atau frontend, pangkalan data lokal harus disiapkan terlebih dahulu:
    1. Buka aplikasi pgAdmin dan buat database baru (misal: db_cpl_fst_uinsa).
    2. Buka file SQL yang ada di dalam folder db-scripts/ (contoh: 01_modul1_schema_and_seeding.sql).
    3. Eksekusi (Execute/F5) seluruh isi file tersebut di dalam Query Tool pgAdmin.
    4. Pastikan tabel master data (program_studi, cpl, dosen, mahasiswa, mata_kuliah, mk_cpl, sub_cpmk, threshold_status) berhasil terbuat dan data seeding sudah masuk dengan format UUID.

3. Instalasi Dependensi
(Instruksi untuk menginstal node_modules dan menjalankan server pengembangan akan diperbarui secara berkala oleh tim Backend/Frontend).

📋 Protokol Kolaborasi Tim (Git Workflow)
Untuk menjaga integritas source code dan mencegah merge conflict, seluruh anggota tim diwajibkan mematuhi aturan berikut:
1. Sinkronisasi Kode: Selalu jalankan git pull origin main sebelum mulai menulis baris kode baru di komputer masing-masing.
2. Standardisasi Commit: Gunakan penamaan commit yang deskriptif dan terstruktur. 
Contoh:
    1. feat(db): inisialisasi skema database modul 1
    2. feat(web): membuat halaman dashboard kaprodi
    3. fix(backend): memperbaiki kalkulasi bobot sub-cpmk
    4. docs: memperbarui dokumentasi readme
3. Keamanan Kredensial: Dilarang melakukan commit atau push file lingkungan (seperti .env) yang berisi kata sandi database, API keys, atau kredensial sensitif lainnya.

Dikembangkan oleh Kelompok 3 dan 4 - Sistem Informasi UINSA
