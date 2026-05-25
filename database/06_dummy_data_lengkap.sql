-- ============================================
-- DUMMY DATA LENGKAP UNTUK SISTEM CPL
-- File: 06_dummy_data_lengkap.sql
-- Deskripsi: Data lengkap untuk testing semua fitur
-- ============================================

-- Hapus data lama (jika ada)
-- JANGAN truncate roles karena sudah ada seed data dari DDL
TRUNCATE TABLE nilai_sub_cpmk CASCADE;
TRUNCATE TABLE enrollment CASCADE;
TRUNCATE TABLE sub_cpmk CASCADE;
TRUNCATE TABLE mk_cpl CASCADE;
TRUNCATE TABLE kelas CASCADE;
TRUNCATE TABLE mata_kuliah CASCADE;
TRUNCATE TABLE cpl CASCADE;
TRUNCATE TABLE threshold_status CASCADE;
TRUNCATE TABLE mahasiswa CASCADE;
TRUNCATE TABLE dosen CASCADE;
TRUNCATE TABLE program_studi CASCADE;
-- Hapus users tapi jangan cascade ke roles
DELETE FROM users;

-- ============================================
-- 1. PROGRAM STUDI (4 Prodi)
-- ============================================
INSERT INTO program_studi (id, kode_prodi, nama_prodi, jenjang) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'TL', 'Teknik Lingkungan', 'S1'),
('550e8400-e29b-41d4-a716-446655440002', 'TM', 'Teknik Mesin', 'S1'),
('550e8400-e29b-41d4-a716-446655440003', 'HK', 'Hukum', 'S1'),
('550e8400-e29b-41d4-a716-446655440004', 'DKV', 'Desain Komunikasi Visual', 'S1');

-- ============================================
-- 2. CPL (Capaian Pembelajaran Lulusan)
-- ============================================
-- CPL untuk Teknik Lingkungan
INSERT INTO cpl (id, prodi_id, kode_cpl, deskripsi) VALUES
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'CPL-TL-01', 'Mampu menganalisis permasalahan lingkungan'),
('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'CPL-TL-02', 'Mampu merancang sistem pengelolaan limbah'),
('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'CPL-TL-03', 'Mampu menerapkan teknologi ramah lingkungan'),
('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'CPL-TL-04', 'Mampu berkomunikasi efektif dalam tim'),
('650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 'CPL-TL-05', 'Mampu berpikir kritis dan inovatif');

-- CPL untuk Teknik Mesin
INSERT INTO cpl (id, prodi_id, kode_cpl, deskripsi) VALUES
('650e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 'CPL-TM-01', 'Mampu merancang sistem mekanik'),
('650e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', 'CPL-TM-02', 'Mampu menganalisis kekuatan material'),
('650e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440002', 'CPL-TM-03', 'Mampu mengoperasikan mesin produksi'),
('650e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440002', 'CPL-TM-04', 'Mampu melakukan maintenance mesin');

-- CPL untuk Hukum
INSERT INTO cpl (id, prodi_id, kode_cpl, deskripsi) VALUES
('650e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440003', 'CPL-HK-01', 'Mampu menganalisis kasus hukum'),
('650e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440003', 'CPL-HK-02', 'Mampu menyusun dokumen hukum'),
('650e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440003', 'CPL-HK-03', 'Mampu berargumentasi di pengadilan');

-- CPL untuk DKV
INSERT INTO cpl (id, prodi_id, kode_cpl, deskripsi) VALUES
('650e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440004', 'CPL-DKV-01', 'Mampu merancang identitas visual'),
('650e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440004', 'CPL-DKV-02', 'Mampu membuat ilustrasi digital'),
('650e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440004', 'CPL-DKV-03', 'Mampu mengoperasikan software desain');

-- ============================================
-- 3. THRESHOLD STATUS
-- ============================================
INSERT INTO threshold_status (id, prodi_id, nama_status, nilai_min, nilai_max) VALUES
('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Sangat Baik', 80.0, 100.0),
('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Baik', 70.0, 79.99),
('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Cukup', 60.0, 69.99),
('750e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'Kurang', 0.0, 59.99);

-- ============================================
-- 4. DOSEN (10 Dosen)
-- ============================================
INSERT INTO dosen (id, nidn, nama) VALUES
('850e8400-e29b-41d4-a716-446655440001', '0101018801', 'Dr. Ahmad Fauzi, M.T.'),
('850e8400-e29b-41d4-a716-446655440002', '0102028802', 'Dr. Siti Nurhaliza, M.Eng.'),
('850e8400-e29b-41d4-a716-446655440003', '0103038803', 'Prof. Budi Santoso, Ph.D.'),
('850e8400-e29b-41d4-a716-446655440004', '0104048804', 'Dr. Rina Wijaya, M.Sc.'),
('850e8400-e29b-41d4-a716-446655440005', '0105058805', 'Dr. Hendra Gunawan, M.T.'),
('850e8400-e29b-41d4-a716-446655440006', '0106068806', 'Dr. Maya Sari, M.Kom.'),
('850e8400-e29b-41d4-a716-446655440007', '0107078807', 'Prof. Agus Setiawan, Ph.D.'),
('850e8400-e29b-41d4-a716-446655440008', '0108088808', 'Dr. Dewi Lestari, M.Si.'),
('850e8400-e29b-41d4-a716-446655440009', '0109098809', 'Dr. Rudi Hartono, M.T.'),
('850e8400-e29b-41d4-a716-446655440010', '0110108810', 'Dr. Ani Kusuma, M.Pd.');

-- ============================================
-- 5. MAHASISWA (10 Mahasiswa untuk testing)
-- ============================================
INSERT INTO mahasiswa (id, nim, nama, prodi_id, angkatan) VALUES
('950e8400-e29b-41d4-a716-446655440001', '23010001', 'Rizky Kurniawan', '550e8400-e29b-41d4-a716-446655440001', 2023),
('950e8400-e29b-41d4-a716-446655440002', '23010002', 'Siti Aminah', '550e8400-e29b-41d4-a716-446655440001', 2023),
('950e8400-e29b-41d4-a716-446655440003', '23010003', 'Budi Prasetyo', '550e8400-e29b-41d4-a716-446655440001', 2023),
('950e8400-e29b-41d4-a716-446655440004', '23020001', 'Dewi Sartika', '550e8400-e29b-41d4-a716-446655440002', 2023),
('950e8400-e29b-41d4-a716-446655440005', '23020002', 'Andi Wijaya', '550e8400-e29b-41d4-a716-446655440002', 2023),
('950e8400-e29b-41d4-a716-446655440006', '23030001', 'Rina Marlina', '550e8400-e29b-41d4-a716-446655440003', 2023),
('950e8400-e29b-41d4-a716-446655440007', '23030002', 'Hendra Kusuma', '550e8400-e29b-41d4-a716-446655440003', 2023),
('950e8400-e29b-41d4-a716-446655440008', '23040001', 'Maya Anggraini', '550e8400-e29b-41d4-a716-446655440004', 2023),
('950e8400-e29b-41d4-a716-446655440009', '23040002', 'Rudi Hermawan', '550e8400-e29b-41d4-a716-446655440004', 2023),
('950e8400-e29b-41d4-a716-446655440010', '23010004', 'Ani Suryani', '550e8400-e29b-41d4-a716-446655440001', 2023);

-- ============================================
-- 6. USERS (untuk login)
-- ============================================
-- Password untuk semua user: admin123
-- Hash: $2b$10$rHZSqJZ5vZ5qZ5qZ5qZ5qOqZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5q

-- Pastikan roles ada, kalau belum ada insert dulu
INSERT INTO roles (nama_role, deskripsi) VALUES
    ('Superadmin',  'Akses penuh seluruh sistem'),
    ('Admin Prodi', 'Kelola data satu program studi'),
    ('Dosen',       'Input nilai kelas sendiri'),
    ('Mahasiswa',   'Lihat capaian CPL diri sendiri')
ON CONFLICT (nama_role) DO NOTHING;

-- Ambil role_id untuk Mahasiswa dan Dosen
DO $$
DECLARE
    v_role_mahasiswa UUID;
    v_role_dosen UUID;
BEGIN
    SELECT id INTO v_role_mahasiswa FROM roles WHERE nama_role = 'Mahasiswa';
    SELECT id INTO v_role_dosen FROM roles WHERE nama_role = 'Dosen';

    -- User Mahasiswa
    INSERT INTO users (id, email, password_hash, role_id, entity_type, entity_id) VALUES
    ('a50e8400-e29b-41d4-a716-446655440001', 'mhs1@if.ac.id', '$2b$10$rHZSqJZ5vZ5qZ5qZ5qZ5qOqZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5q', v_role_mahasiswa, 'mahasiswa', '950e8400-e29b-41d4-a716-446655440001'),
    ('a50e8400-e29b-41d4-a716-446655440002', 'mhs2@if.ac.id', '$2b$10$rHZSqJZ5vZ5qZ5qZ5qZ5qOqZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5q', v_role_mahasiswa, 'mahasiswa', '950e8400-e29b-41d4-a716-446655440002'),
    ('a50e8400-e29b-41d4-a716-446655440003', 'mhs3@if.ac.id', '$2b$10$rHZSqJZ5vZ5qZ5qZ5qZ5qOqZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5q', v_role_mahasiswa, 'mahasiswa', '950e8400-e29b-41d4-a716-446655440003'),
    ('a50e8400-e29b-41d4-a716-446655440004', 'mhs4@if.ac.id', '$2b$10$rHZSqJZ5vZ5qZ5qZ5qZ5qOqZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5q', v_role_mahasiswa, 'mahasiswa', '950e8400-e29b-41d4-a716-446655440004'),
    ('a50e8400-e29b-41d4-a716-446655440005', 'mhs5@if.ac.id', '$2b$10$rHZSqJZ5vZ5qZ5qZ5qZ5qOqZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5q', v_role_mahasiswa, 'mahasiswa', '950e8400-e29b-41d4-a716-446655440005');

    -- User Dosen
    INSERT INTO users (id, email, password_hash, role_id, entity_type, entity_id) VALUES
    ('a50e8400-e29b-41d4-a716-446655440011', 'dosen1@if.ac.id', '$2b$10$rHZSqJZ5vZ5qZ5qZ5qZ5qOqZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5q', v_role_dosen, 'dosen', '850e8400-e29b-41d4-a716-446655440001'),
    ('a50e8400-e29b-41d4-a716-446655440012', 'dosen2@if.ac.id', '$2b$10$rHZSqJZ5vZ5qZ5qZ5qZ5qOqZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5q', v_role_dosen, 'dosen', '850e8400-e29b-41d4-a716-446655440002');
END $$;

-- ============================================
-- 7. MATA KULIAH (15 Mata Kuliah)
-- ============================================
INSERT INTO mata_kuliah (id, prodi_id, kode_mk, nama_mk, sks, semester) VALUES
-- Teknik Lingkungan
('b50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'TL101', 'Pengantar Teknik Lingkungan', 3, 1),
('b50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'TL102', 'Kimia Lingkungan', 3, 1),
('b50e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'TL201', 'Pengelolaan Limbah', 4, 3),
('b50e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'TL202', 'Teknologi Air Bersih', 3, 3),
('b50e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 'TL301', 'Analisis Dampak Lingkungan', 4, 5),
-- Teknik Mesin
('b50e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 'TM101', 'Gambar Teknik', 3, 1),
('b50e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', 'TM102', 'Mekanika Teknik', 4, 1),
('b50e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440002', 'TM201', 'Termodinamika', 3, 3),
-- Hukum
('b50e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440003', 'HK101', 'Pengantar Ilmu Hukum', 3, 1),
('b50e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440003', 'HK102', 'Hukum Perdata', 4, 1),
('b50e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440003', 'HK201', 'Hukum Pidana', 4, 3),
-- DKV
('b50e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440004', 'DKV101', 'Dasar Desain', 3, 1),
('b50e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440004', 'DKV102', 'Tipografi', 3, 1),
('b50e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440004', 'DKV201', 'Ilustrasi Digital', 4, 3),
('b50e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440004', 'DKV202', 'Branding', 3, 3);

-- ============================================
-- 8. KELAS (15 Kelas)
-- ============================================
INSERT INTO kelas (id, mk_id, dosen_id, nama_kelas, tahun_akademik, semester_aktif) VALUES
-- Kelas Teknik Lingkungan
('c50e8400-e29b-41d4-a716-446655440001', 'b50e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', 'TL-A', '2023/2024', 1),
('c50e8400-e29b-41d4-a716-446655440002', 'b50e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440002', 'TL-A', '2023/2024', 1),
('c50e8400-e29b-41d4-a716-446655440003', 'b50e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440001', 'TL-A', '2024/2025', 1),
('c50e8400-e29b-41d4-a716-446655440004', 'b50e8400-e29b-41d4-a716-446655440004', '850e8400-e29b-41d4-a716-446655440002', 'TL-A', '2024/2025', 1),
('c50e8400-e29b-41d4-a716-446655440005', 'b50e8400-e29b-41d4-a716-446655440005', '850e8400-e29b-41d4-a716-446655440003', 'TL-A', '2025/2026', 1),
-- Kelas Teknik Mesin
('c50e8400-e29b-41d4-a716-446655440006', 'b50e8400-e29b-41d4-a716-446655440006', '850e8400-e29b-41d4-a716-446655440004', 'TM-A', '2023/2024', 1),
('c50e8400-e29b-41d4-a716-446655440007', 'b50e8400-e29b-41d4-a716-446655440007', '850e8400-e29b-41d4-a716-446655440005', 'TM-A', '2023/2024', 1),
('c50e8400-e29b-41d4-a716-446655440008', 'b50e8400-e29b-41d4-a716-446655440008', '850e8400-e29b-41d4-a716-446655440004', 'TM-A', '2024/2025', 1),
-- Kelas Hukum
('c50e8400-e29b-41d4-a716-446655440009', 'b50e8400-e29b-41d4-a716-446655440009', '850e8400-e29b-41d4-a716-446655440006', 'HK-A', '2023/2024', 1),
('c50e8400-e29b-41d4-a716-446655440010', 'b50e8400-e29b-41d4-a716-446655440010', '850e8400-e29b-41d4-a716-446655440007', 'HK-A', '2023/2024', 1),
('c50e8400-e29b-41d4-a716-446655440011', 'b50e8400-e29b-41d4-a716-446655440011', '850e8400-e29b-41d4-a716-446655440006', 'HK-A', '2024/2025', 1),
-- Kelas DKV
('c50e8400-e29b-41d4-a716-446655440012', 'b50e8400-e29b-41d4-a716-446655440012', '850e8400-e29b-41d4-a716-446655440008', 'DKV-A', '2023/2024', 1),
('c50e8400-e29b-41d4-a716-446655440013', 'b50e8400-e29b-41d4-a716-446655440013', '850e8400-e29b-41d4-a716-446655440009', 'DKV-A', '2023/2024', 1),
('c50e8400-e29b-41d4-a716-446655440014', 'b50e8400-e29b-41d4-a716-446655440014', '850e8400-e29b-41d4-a716-446655440008', 'DKV-A', '2024/2025', 1),
('c50e8400-e29b-41d4-a716-446655440015', 'b50e8400-e29b-41d4-a716-446655440015', '850e8400-e29b-41d4-a716-446655440010', 'DKV-A', '2024/2025', 1);

-- ============================================
-- 9. ENROLLMENT (Mahasiswa mengambil kelas)
-- ============================================
-- Mahasiswa 1 (Rizky - TL) mengambil 5 kelas
INSERT INTO enrollment (id, mahasiswa_id, kelas_id) VALUES
('d50e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', 'c50e8400-e29b-41d4-a716-446655440001'),
('d50e8400-e29b-41d4-a716-446655440002', '950e8400-e29b-41d4-a716-446655440001', 'c50e8400-e29b-41d4-a716-446655440002'),
('d50e8400-e29b-41d4-a716-446655440003', '950e8400-e29b-41d4-a716-446655440001', 'c50e8400-e29b-41d4-a716-446655440003'),
('d50e8400-e29b-41d4-a716-446655440004', '950e8400-e29b-41d4-a716-446655440001', 'c50e8400-e29b-41d4-a716-446655440004'),
('d50e8400-e29b-41d4-a716-446655440005', '950e8400-e29b-41d4-a716-446655440001', 'c50e8400-e29b-41d4-a716-446655440005');

-- Mahasiswa 2 (Siti - TL) mengambil 3 kelas
INSERT INTO enrollment (id, mahasiswa_id, kelas_id) VALUES
('d50e8400-e29b-41d4-a716-446655440006', '950e8400-e29b-41d4-a716-446655440002', 'c50e8400-e29b-41d4-a716-446655440001'),
('d50e8400-e29b-41d4-a716-446655440007', '950e8400-e29b-41d4-a716-446655440002', 'c50e8400-e29b-41d4-a716-446655440002'),
('d50e8400-e29b-41d4-a716-446655440008', '950e8400-e29b-41d4-a716-446655440002', 'c50e8400-e29b-41d4-a716-446655440003');

-- Mahasiswa 3 (Budi - TL) mengambil 2 kelas
INSERT INTO enrollment (id, mahasiswa_id, kelas_id) VALUES
('d50e8400-e29b-41d4-a716-446655440009', '950e8400-e29b-41d4-a716-446655440003', 'c50e8400-e29b-41d4-a716-446655440001'),
('d50e8400-e29b-41d4-a716-446655440010', '950e8400-e29b-41d4-a716-446655440003', 'c50e8400-e29b-41d4-a716-446655440002');

-- ============================================
-- 10. MK_CPL (Pemetaan Mata Kuliah ke CPL)
-- ============================================
-- TL101 -> CPL-TL-01, CPL-TL-04
INSERT INTO mk_cpl (id, mk_id, cpl_id, bobot) VALUES
('e50e8400-e29b-41d4-a716-446655440001', 'b50e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 0.5),
('e50e8400-e29b-41d4-a716-446655440002', 'b50e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440004', 0.5);

-- TL102 -> CPL-TL-01, CPL-TL-05
INSERT INTO mk_cpl (id, mk_id, cpl_id, bobot) VALUES
('e50e8400-e29b-41d4-a716-446655440003', 'b50e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', 0.5),
('e50e8400-e29b-41d4-a716-446655440004', 'b50e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440005', 0.5);

-- TL201 -> CPL-TL-02, CPL-TL-03
INSERT INTO mk_cpl (id, mk_id, cpl_id, bobot) VALUES
('e50e8400-e29b-41d4-a716-446655440005', 'b50e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440002', 0.5),
('e50e8400-e29b-41d4-a716-446655440006', 'b50e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440003', 0.5);

-- TL202 -> CPL-TL-02, CPL-TL-03
INSERT INTO mk_cpl (id, mk_id, cpl_id, bobot) VALUES
('e50e8400-e29b-41d4-a716-446655440007', 'b50e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440002', 0.5),
('e50e8400-e29b-41d4-a716-446655440008', 'b50e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440003', 0.5);

-- TL301 -> CPL-TL-01, CPL-TL-05
INSERT INTO mk_cpl (id, mk_id, cpl_id, bobot) VALUES
('e50e8400-e29b-41d4-a716-446655440009', 'b50e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440001', 0.5),
('e50e8400-e29b-41d4-a716-446655440010', 'b50e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440005', 0.5);

-- ============================================
-- 11. SUB-CPMK (Sub Capaian Pembelajaran MK)
-- ============================================
-- Sub-CPMK untuk TL101 (mk_cpl_id: e50e8400-e29b-41d4-a716-446655440001)
INSERT INTO sub_cpmk (id, mk_cpl_id, kode_sub_cpmk, deskripsi, bobot) VALUES
('f50e8400-e29b-41d4-a716-446655440001', 'e50e8400-e29b-41d4-a716-446655440001', 'TL101-CPMK-01', 'Memahami konsep dasar teknik lingkungan', 0.25),
('f50e8400-e29b-41d4-a716-446655440002', 'e50e8400-e29b-41d4-a716-446655440001', 'TL101-CPMK-02', 'Mengidentifikasi masalah lingkungan', 0.25),
('f50e8400-e29b-41d4-a716-446655440003', 'e50e8400-e29b-41d4-a716-446655440001', 'TL101-CPMK-03', 'Menganalisis dampak lingkungan', 0.25),
('f50e8400-e29b-41d4-a716-446655440004', 'e50e8400-e29b-41d4-a716-446655440001', 'TL101-CPMK-04', 'Menyusun laporan analisis', 0.25);

-- Sub-CPMK untuk TL102 (mk_cpl_id: e50e8400-e29b-41d4-a716-446655440003)
INSERT INTO sub_cpmk (id, mk_cpl_id, kode_sub_cpmk, deskripsi, bobot) VALUES
('f50e8400-e29b-41d4-a716-446655440005', 'e50e8400-e29b-41d4-a716-446655440003', 'TL102-CPMK-01', 'Memahami reaksi kimia lingkungan', 0.30),
('f50e8400-e29b-41d4-a716-446655440006', 'e50e8400-e29b-41d4-a716-446655440003', 'TL102-CPMK-02', 'Melakukan analisis laboratorium', 0.30),
('f50e8400-e29b-41d4-a716-446655440007', 'e50e8400-e29b-41d4-a716-446655440003', 'TL102-CPMK-03', 'Menginterpretasi hasil analisis', 0.40);

-- Sub-CPMK untuk TL201 (mk_cpl_id: e50e8400-e29b-41d4-a716-446655440005)
INSERT INTO sub_cpmk (id, mk_cpl_id, kode_sub_cpmk, deskripsi, bobot) VALUES
('f50e8400-e29b-41d4-a716-446655440008', 'e50e8400-e29b-41d4-a716-446655440005', 'TL201-CPMK-01', 'Merancang sistem pengelolaan limbah', 0.35),
('f50e8400-e29b-41d4-a716-446655440009', 'e50e8400-e29b-41d4-a716-446655440005', 'TL201-CPMK-02', 'Menghitung efisiensi pengolahan', 0.35),
('f50e8400-e29b-41d4-a716-446655440010', 'e50e8400-e29b-41d4-a716-446655440005', 'TL201-CPMK-03', 'Mengevaluasi sistem yang ada', 0.30);

-- Sub-CPMK untuk TL202 (mk_cpl_id: e50e8400-e29b-41d4-a716-446655440007)
INSERT INTO sub_cpmk (id, mk_cpl_id, kode_sub_cpmk, deskripsi, bobot) VALUES
('f50e8400-e29b-41d4-a716-446655440011', 'e50e8400-e29b-41d4-a716-446655440007', 'TL202-CPMK-01', 'Merancang sistem distribusi air', 0.40),
('f50e8400-e29b-41d4-a716-446655440012', 'e50e8400-e29b-41d4-a716-446655440007', 'TL202-CPMK-02', 'Menghitung kebutuhan air', 0.30),
('f50e8400-e29b-41d4-a716-446655440013', 'e50e8400-e29b-41d4-a716-446655440007', 'TL202-CPMK-03', 'Menganalisis kualitas air', 0.30);

-- Sub-CPMK untuk TL301 (mk_cpl_id: e50e8400-e29b-41d4-a716-446655440009)
INSERT INTO sub_cpmk (id, mk_cpl_id, kode_sub_cpmk, deskripsi, bobot) VALUES
('f50e8400-e29b-41d4-a716-446655440014', 'e50e8400-e29b-41d4-a716-446655440009', 'TL301-CPMK-01', 'Melakukan studi AMDAL', 0.40),
('f50e8400-e29b-41d4-a716-446655440015', 'e50e8400-e29b-41d4-a716-446655440009', 'TL301-CPMK-02', 'Menyusun dokumen lingkungan', 0.30),
('f50e8400-e29b-41d4-a716-446655440016', 'e50e8400-e29b-41d4-a716-446655440009', 'TL301-CPMK-03', 'Mempresentasikan hasil kajian', 0.30);

-- ============================================
-- 12. NILAI (Nilai mahasiswa untuk setiap Sub-CPMK)
-- ============================================
-- Nilai untuk Mahasiswa 1 (Rizky) - TL101
INSERT INTO nilai_sub_cpmk (id, enrollment_id, sub_cpmk_id, nilai) VALUES
('f150e840-0e29-41d4-a716-446655440001', 'd50e8400-e29b-41d4-a716-446655440001', 'f50e8400-e29b-41d4-a716-446655440001', 85.5),
('f150e840-0e29-41d4-a716-446655440002', 'd50e8400-e29b-41d4-a716-446655440001', 'f50e8400-e29b-41d4-a716-446655440002', 88.0),
('f150e840-0e29-41d4-a716-446655440003', 'd50e8400-e29b-41d4-a716-446655440001', 'f50e8400-e29b-41d4-a716-446655440003', 82.5),
('f150e840-0e29-41d4-a716-446655440004', 'd50e8400-e29b-41d4-a716-446655440001', 'f50e8400-e29b-41d4-a716-446655440004', 90.0);

-- Nilai untuk Mahasiswa 1 (Rizky) - TL102
INSERT INTO nilai_sub_cpmk (id, enrollment_id, sub_cpmk_id, nilai) VALUES
('f150e840-0e29-41d4-a716-446655440005', 'd50e8400-e29b-41d4-a716-446655440002', 'f50e8400-e29b-41d4-a716-446655440005', 78.0),
('f150e840-0e29-41d4-a716-446655440006', 'd50e8400-e29b-41d4-a716-446655440002', 'f50e8400-e29b-41d4-a716-446655440006', 82.5),
('f150e840-0e29-41d4-a716-446655440007', 'd50e8400-e29b-41d4-a716-446655440002', 'f50e8400-e29b-41d4-a716-446655440007', 85.0);

-- Nilai untuk Mahasiswa 1 (Rizky) - TL201
INSERT INTO nilai_sub_cpmk (id, enrollment_id, sub_cpmk_id, nilai) VALUES
('f150e840-0e29-41d4-a716-446655440008', 'd50e8400-e29b-41d4-a716-446655440003', 'f50e8400-e29b-41d4-a716-446655440008', 88.5),
('f150e840-0e29-41d4-a716-446655440009', 'd50e8400-e29b-41d4-a716-446655440003', 'f50e8400-e29b-41d4-a716-446655440009', 86.0),
('f150e840-0e29-41d4-a716-446655440010', 'd50e8400-e29b-41d4-a716-446655440003', 'f50e8400-e29b-41d4-a716-446655440010', 84.5);

-- Nilai untuk Mahasiswa 1 (Rizky) - TL202
INSERT INTO nilai_sub_cpmk (id, enrollment_id, sub_cpmk_id, nilai) VALUES
('f150e840-0e29-41d4-a716-446655440011', 'd50e8400-e29b-41d4-a716-446655440004', 'f50e8400-e29b-41d4-a716-446655440011', 90.0),
('f150e840-0e29-41d4-a716-446655440012', 'd50e8400-e29b-41d4-a716-446655440004', 'f50e8400-e29b-41d4-a716-446655440012', 87.5),
('f150e840-0e29-41d4-a716-446655440013', 'd50e8400-e29b-41d4-a716-446655440004', 'f50e8400-e29b-41d4-a716-446655440013', 89.0);

-- Nilai untuk Mahasiswa 1 (Rizky) - TL301
INSERT INTO nilai_sub_cpmk (id, enrollment_id, sub_cpmk_id, nilai) VALUES
('f150e840-0e29-41d4-a716-446655440014', 'd50e8400-e29b-41d4-a716-446655440005', 'f50e8400-e29b-41d4-a716-446655440014', 92.0),
('f150e840-0e29-41d4-a716-446655440015', 'd50e8400-e29b-41d4-a716-446655440005', 'f50e8400-e29b-41d4-a716-446655440015', 88.5),
('f150e840-0e29-41d4-a716-446655440016', 'd50e8400-e29b-41d4-a716-446655440005', 'f50e8400-e29b-41d4-a716-446655440016', 90.5);

-- Nilai untuk Mahasiswa 2 (Siti) - TL101
INSERT INTO nilai_sub_cpmk (id, enrollment_id, sub_cpmk_id, nilai) VALUES
('f150e840-0e29-41d4-a716-446655440017', 'd50e8400-e29b-41d4-a716-446655440006', 'f50e8400-e29b-41d4-a716-446655440001', 75.0),
('f150e840-0e29-41d4-a716-446655440018', 'd50e8400-e29b-41d4-a716-446655440006', 'f50e8400-e29b-41d4-a716-446655440002', 78.5),
('f150e840-0e29-41d4-a716-446655440019', 'd50e8400-e29b-41d4-a716-446655440006', 'f50e8400-e29b-41d4-a716-446655440003', 72.0),
('f150e840-0e29-41d4-a716-446655440020', 'd50e8400-e29b-41d4-a716-446655440006', 'f50e8400-e29b-41d4-a716-446655440004', 80.0);

-- Nilai untuk Mahasiswa 2 (Siti) - TL102
INSERT INTO nilai_sub_cpmk (id, enrollment_id, sub_cpmk_id, nilai) VALUES
('f150e840-0e29-41d4-a716-446655440021', 'd50e8400-e29b-41d4-a716-446655440007', 'f50e8400-e29b-41d4-a716-446655440005', 70.0),
('f150e840-0e29-41d4-a716-446655440022', 'd50e8400-e29b-41d4-a716-446655440007', 'f50e8400-e29b-41d4-a716-446655440006', 73.5),
('f150e840-0e29-41d4-a716-446655440023', 'd50e8400-e29b-41d4-a716-446655440007', 'f50e8400-e29b-41d4-a716-446655440007', 76.0);

-- Nilai untuk Mahasiswa 2 (Siti) - TL201
INSERT INTO nilai_sub_cpmk (id, enrollment_id, sub_cpmk_id, nilai) VALUES
('f150e840-0e29-41d4-a716-446655440024', 'd50e8400-e29b-41d4-a716-446655440008', 'f50e8400-e29b-41d4-a716-446655440008', 78.0),
('f150e840-0e29-41d4-a716-446655440025', 'd50e8400-e29b-41d4-a716-446655440008', 'f50e8400-e29b-41d4-a716-446655440009', 75.5),
('f150e840-0e29-41d4-a716-446655440026', 'd50e8400-e29b-41d4-a716-446655440008', 'f50e8400-e29b-41d4-a716-446655440010', 77.0);

-- Nilai untuk Mahasiswa 3 (Budi) - TL101
INSERT INTO nilai_sub_cpmk (id, enrollment_id, sub_cpmk_id, nilai) VALUES
('f150e840-0e29-41d4-a716-446655440027', 'd50e8400-e29b-41d4-a716-446655440009', 'f50e8400-e29b-41d4-a716-446655440001', 65.0),
('f150e840-0e29-41d4-a716-446655440028', 'd50e8400-e29b-41d4-a716-446655440009', 'f50e8400-e29b-41d4-a716-446655440002', 68.5),
('f150e840-0e29-41d4-a716-446655440029', 'd50e8400-e29b-41d4-a716-446655440009', 'f50e8400-e29b-41d4-a716-446655440003', 62.0),
('f150e840-0e29-41d4-a716-446655440030', 'd50e8400-e29b-41d4-a716-446655440009', 'f50e8400-e29b-41d4-a716-446655440004', 70.0);

-- Nilai untuk Mahasiswa 3 (Budi) - TL102
INSERT INTO nilai_sub_cpmk (id, enrollment_id, sub_cpmk_id, nilai) VALUES
('f150e840-0e29-41d4-a716-446655440031', 'd50e8400-e29b-41d4-a716-446655440010', 'f50e8400-e29b-41d4-a716-446655440005', 60.0),
('f150e840-0e29-41d4-a716-446655440032', 'd50e8400-e29b-41d4-a716-446655440010', 'f50e8400-e29b-41d4-a716-446655440006', 63.5),
('f150e840-0e29-41d4-a716-446655440033', 'd50e8400-e29b-41d4-a716-446655440010', 'f50e8400-e29b-41d4-a716-446655440007', 66.0);

-- ============================================
-- SELESAI - DUMMY DATA LENGKAP
-- ============================================

-- Verifikasi data
SELECT 'Program Studi' as tabel, COUNT(*) as jumlah FROM program_studi
UNION ALL
SELECT 'CPL', COUNT(*) FROM cpl
UNION ALL
SELECT 'Dosen', COUNT(*) FROM dosen
UNION ALL
SELECT 'Mahasiswa', COUNT(*) FROM mahasiswa
UNION ALL
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'Mata Kuliah', COUNT(*) FROM mata_kuliah
UNION ALL
SELECT 'Kelas', COUNT(*) FROM kelas
UNION ALL
SELECT 'Enrollment', COUNT(*) FROM enrollment
UNION ALL
SELECT 'MK-CPL', COUNT(*) FROM mk_cpl
UNION ALL
SELECT 'Sub-CPMK', COUNT(*) FROM sub_cpmk
UNION ALL
SELECT 'Nilai', COUNT(*) FROM nilai_sub_cpmk;




