-- =============================================
-- SEED DATA (CONTOH DATA UNTUK TESTING)
-- =============================================

-- =============================================
-- 1. PROGRAM STUDI
-- =============================================

INSERT INTO program_studi (kode_prodi, nama_prodi, jenjang) VALUES
    ('TI', 'Teknik Informatika', 'S1'),
    ('SI', 'Sistem Informasi', 'S1'),
    ('IF', 'Informatika', 'D3')
RETURNING id, kode_prodi, nama_prodi;

-- Simpan UUID prodi untuk digunakan di query berikutnya
-- Contoh: prodi_ti_id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'

-- =============================================
-- 2. THRESHOLD STATUS (Ganti <prodi_id>)
-- =============================================

-- Untuk Teknik Informatika (ganti dengan UUID aktual)
-- INSERT INTO threshold_status (prodi_id, nama_status, nilai_min, nilai_max) VALUES
--     ('<prodi_ti_id>', 'Excellence',    85.00, 100.00),
--     ('<prodi_ti_id>', 'Satisfactory',  70.00,  84.99),
--     ('<prodi_ti_id>', 'Competent',     55.00,  69.99),
--     ('<prodi_ti_id>', 'Developing',    40.00,  54.99),
--     ('<prodi_ti_id>', 'Not Competent',  0.00,  39.99);

-- =============================================
-- 3. CPL (Ganti <prodi_id>)
-- =============================================

-- INSERT INTO cpl (prodi_id, kode_cpl, deskripsi) VALUES
--     ('<prodi_ti_id>', 'CPL-01', 'Mampu menerapkan pemikiran logis, kritis, sistematis, dan inovatif'),
--     ('<prodi_ti_id>', 'CPL-02', 'Mampu menunjukkan kinerja mandiri, bermutu, dan terukur'),
--     ('<prodi_ti_id>', 'CPL-03', 'Mampu mengkaji implikasi pengembangan atau implementasi ilmu pengetahuan teknologi');

-- =============================================
-- 4. DOSEN
-- =============================================

INSERT INTO dosen (nidn, nama) VALUES
    ('0123456789', 'Dr. Budi Santoso, M.Kom'),
    ('0987654321', 'Prof. Ani Wijaya, Ph.D'),
    ('1122334455', 'Ir. Candra Pratama, M.T')
RETURNING id, nidn, nama;

-- =============================================
-- 5. MAHASISWA (Ganti <prodi_id>)
-- =============================================

-- INSERT INTO mahasiswa (prodi_id, nim, nama, angkatan) VALUES
--     ('<prodi_ti_id>', '2021001', 'Ahmad Fauzi', 2021),
--     ('<prodi_ti_id>', '2021002', 'Siti Nurhaliza', 2021),
--     ('<prodi_ti_id>', '2022001', 'Budi Setiawan', 2022);

-- =============================================
-- 6. MATA KULIAH (Ganti <prodi_id>)
-- =============================================

-- INSERT INTO mata_kuliah (prodi_id, kode_mk, nama_mk, sks, semester) VALUES
--     ('<prodi_ti_id>', 'TIF101', 'Pemrograman Dasar', 3, 1),
--     ('<prodi_ti_id>', 'TIF102', 'Struktur Data', 3, 2),
--     ('<prodi_ti_id>', 'TIF201', 'Basis Data', 3, 3);

-- =============================================
-- 7. MK_CPL (Pemetaan MK ke CPL)
-- =============================================

-- Contoh: Pemrograman Dasar berkontribusi ke CPL-01 (60%) dan CPL-02 (40%)
-- INSERT INTO mk_cpl (mk_id, cpl_id, bobot) VALUES
--     ('<mk_pemrograman_id>', '<cpl_01_id>', 0.6),
--     ('<mk_pemrograman_id>', '<cpl_02_id>', 0.4);

-- =============================================
-- 8. SUB-CPMK
-- =============================================

-- Contoh: Sub-CPMK untuk Pemrograman Dasar -> CPL-01
-- INSERT INTO sub_cpmk (mk_cpl_id, kode_sub_cpmk, deskripsi, bobot) VALUES
--     ('<mk_cpl_id>', 'CPMK-1.1', 'Memahami konsep variabel dan tipe data', 0.3),
--     ('<mk_cpl_id>', 'CPMK-1.2', 'Mampu membuat program sederhana', 0.4),
--     ('<mk_cpl_id>', 'CPMK-1.3', 'Mampu melakukan debugging', 0.3);

-- =============================================
-- 9. USER TESTING
-- =============================================

-- Ambil role_id terlebih dahulu
-- SELECT id, nama_role FROM roles;

-- Buat user Superadmin (password: admin123)
-- Password hash untuk 'admin123' (gunakan bcrypt dengan cost 10)
-- INSERT INTO users (email, password_hash, role_id, entity_type) VALUES
--     ('admin@cpl.ac.id', '$2b$10$...hash...', '<superadmin_role_id>', 'admin');

-- Buat user Mahasiswa (password: mhs123)
-- INSERT INTO users (email, password_hash, role_id, entity_type, entity_id, prodi_id) VALUES
--     ('ahmad.fauzi@student.ac.id', '$2b$10$...hash...', '<mahasiswa_role_id>', 'mahasiswa', '<mahasiswa_id>', '<prodi_id>');

-- Buat user Dosen (password: dosen123)
-- INSERT INTO users (email, password_hash, role_id, entity_type, entity_id) VALUES
--     ('budi.santoso@lecturer.ac.id', '$2b$10$...hash...', '<dosen_role_id>', 'dosen', '<dosen_id>');

-- =============================================
-- CATATAN PENTING
-- =============================================
-- 1. Ganti semua <placeholder_id> dengan UUID aktual dari hasil INSERT
-- 2. Untuk generate password hash, gunakan bcrypt:
--    - Node.js: const bcrypt = require('bcrypt'); bcrypt.hashSync('password', 10);
--    - Online tool: https://bcrypt-generator.com/ (cost: 10)
-- 3. Pastikan total bobot per mk_id di mk_cpl = 1.0
-- 4. Pastikan total bobot per mk_cpl_id di sub_cpmk = 1.0
