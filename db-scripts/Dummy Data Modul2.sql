-- =============================================
-- DUMMY DATA KOMPLEKS - MANUAL INSERT
-- 3 Prodi, 3 MK per Prodi, 2 Dosen, 15 Mahasiswa per Prodi
-- 3 CPL per Prodi, 3 Sub-CPMK per CPL, User untuk semua entity
-- =============================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- DOSEN (8 ORANG - 2 PER PRODI + 2 UMUM)
-- =====================================================

-- Dosen Umum
INSERT INTO dosen(nidn, nama) VALUES
('NIDN00001', 'Dr. Ahmad Fauzi, M.Kom'),
('NIDN00002', 'Dr. Siti Nurhaliza, M.T');

-- Dosen Teknik Informatika
INSERT INTO dosen(nidn, nama) VALUES
('NIDN00101', 'Dr. Budi Raharjo, M.Kom'),
('NIDN00102', 'Dr. Dewi Sartika, M.T');

-- Dosen Sistem Informasi
INSERT INTO dosen(nidn, nama) VALUES
('NIDN00201', 'Dr. Eko Wijayanto, M.Kom'),
('NIDN00202', 'Dr. Fitri Handayani, M.SI');

-- Dosen Teknologi Informasi
INSERT INTO dosen(nidn, nama) VALUES
('NIDN00301', 'Dr. Gunawan Saputra, M.T'),
('NIDN00302', 'Dr. Hani Puspita, M.Kom');

-- =====================================================
-- PROGRAM STUDI (3 PRODI)
-- =====================================================

INSERT INTO program_studi(kode_prodi, nama_prodi, jenjang) VALUES
('IF', 'Teknik Informatika', 'S1'),
('SI', 'Sistem Informasi', 'S1'),
('TI', 'Teknologi Informasi', 'S1');

-- =====================================================
-- CPL - TEKNIK INFORMATIKA
-- =====================================================

INSERT INTO cpl(prodi_id, kode_cpl, deskripsi, is_active) 
SELECT 
    ps.id,
    'CPL-IF-01',
    'Mampu menerapkan pemikiran logis, kritis, sistematis, dan inovatif dalam konteks pengembangan atau implementasi ilmu pengetahuan dan teknologi',
    TRUE
FROM program_studi ps WHERE ps.kode_prodi = 'IF';

INSERT INTO cpl(prodi_id, kode_cpl, deskripsi, is_active) 
SELECT 
    ps.id,
    'CPL-IF-02',
    'Mampu menunjukkan kinerja mandiri, bermutu, dan terukur dalam mengembangkan perangkat lunak',
    TRUE
FROM program_studi ps WHERE ps.kode_prodi = 'IF';

INSERT INTO cpl(prodi_id, kode_cpl, deskripsi, is_active) 
SELECT 
    ps.id,
    'CPL-IF-03',
    'Mampu mengkaji implikasi pengembangan atau implementasi ilmu pengetahuan teknologi informasi',
    TRUE
FROM program_studi ps WHERE ps.kode_prodi = 'IF';

-- =====================================================
-- CPL - SISTEM INFORMASI
-- =====================================================

INSERT INTO cpl(prodi_id, kode_cpl, deskripsi, is_active) 
SELECT 
    ps.id,
    'CPL-SI-01',
    'Mampu menganalisis kebutuhan sistem informasi organisasi untuk menghasilkan spesifikasi sistem',
    TRUE
FROM program_studi ps WHERE ps.kode_prodi = 'SI';

INSERT INTO cpl(prodi_id, kode_cpl, deskripsi, is_active) 
SELECT 
    ps.id,
    'CPL-SI-02',
    'Mampu merancang dan mengimplementasikan sistem informasi yang memenuhi kebutuhan organisasi',
    TRUE
FROM program_studi ps WHERE ps.kode_prodi = 'SI';

INSERT INTO cpl(prodi_id, kode_cpl, deskripsi, is_active) 
SELECT 
    ps.id,
    'CPL-SI-03',
    'Mampu mengelola proyek sistem informasi dengan mempertimbangkan aspek manajerial dan teknis',
    TRUE
FROM program_studi ps WHERE ps.kode_prodi = 'SI';

-- =====================================================
-- CPL - TEKNOLOGI INFORMASI
-- =====================================================

INSERT INTO cpl(prodi_id, kode_cpl, deskripsi, is_active) 
SELECT 
    ps.id,
    'CPL-TI-01',
    'Mampu merancang, mengimplementasikan, dan mengelola infrastruktur teknologi informasi',
    TRUE
FROM program_studi ps WHERE ps.kode_prodi = 'TI';

INSERT INTO cpl(prodi_id, kode_cpl, deskripsi, is_active) 
SELECT 
    ps.id,
    'CPL-TI-02',
    'Mampu mengintegrasikan solusi teknologi informasi untuk mendukung proses bisnis organisasi',
    TRUE
FROM program_studi ps WHERE ps.kode_prodi = 'TI';

INSERT INTO cpl(prodi_id, kode_cpl, deskripsi, is_active) 
SELECT 
    ps.id,
    'CPL-TI-03',
    'Mampu menerapkan keamanan dan tata kelola teknologi informasi sesuai standar industri',
    TRUE
FROM program_studi ps WHERE ps.kode_prodi = 'TI';

-- =====================================================
-- THRESHOLD STATUS - SEMUA PRODI
-- =====================================================

INSERT INTO threshold_status(prodi_id, nama_status, nilai_min, nilai_max)
SELECT 
    ps.id,
    status.nama_status,
    status.nilai_min,
    status.nilai_max
FROM program_studi ps
CROSS JOIN (
    VALUES 
    ('Excellence', 85.00, 100.00),
    ('Satisfactory', 70.00, 84.99),
    ('Competent', 55.00, 69.99),
    ('Developing', 40.00, 54.99),
    ('Not Competent', 0.00, 39.99)
) AS status(nama_status, nilai_min, nilai_max);

-- =====================================================
-- MATA KULIAH - TEKNIK INFORMATIKA
-- =====================================================

INSERT INTO mata_kuliah(prodi_id, kode_mk, nama_mk, sks, semester)
SELECT ps.id, 'IF101', 'Algoritma dan Pemrograman', 3, 1
FROM program_studi ps WHERE ps.kode_prodi = 'IF';

INSERT INTO mata_kuliah(prodi_id, kode_mk, nama_mk, sks, semester)
SELECT ps.id, 'IF102', 'Struktur Data', 3, 2
FROM program_studi ps WHERE ps.kode_prodi = 'IF';

INSERT INTO mata_kuliah(prodi_id, kode_mk, nama_mk, sks, semester)
SELECT ps.id, 'IF103', 'Basis Data', 3, 3
FROM program_studi ps WHERE ps.kode_prodi = 'IF';

-- =====================================================
-- MATA KULIAH - SISTEM INFORMASI
-- =====================================================

INSERT INTO mata_kuliah(prodi_id, kode_mk, nama_mk, sks, semester)
SELECT ps.id, 'SI101', 'Pengantar Sistem Informasi', 3, 1
FROM program_studi ps WHERE ps.kode_prodi = 'SI';

INSERT INTO mata_kuliah(prodi_id, kode_mk, nama_mk, sks, semester)
SELECT ps.id, 'SI102', 'Analisis dan Perancangan Sistem', 3, 2
FROM program_studi ps WHERE ps.kode_prodi = 'SI';

INSERT INTO mata_kuliah(prodi_id, kode_mk, nama_mk, sks, semester)
SELECT ps.id, 'SI103', 'Manajemen Proyek Sistem Informasi', 3, 3
FROM program_studi ps WHERE ps.kode_prodi = 'SI';

-- =====================================================
-- MATA KULIAH - TEKNOLOGI INFORMASI
-- =====================================================

INSERT INTO mata_kuliah(prodi_id, kode_mk, nama_mk, sks, semester)
SELECT ps.id, 'TI101', 'Jaringan Komputer', 3, 1
FROM program_studi ps WHERE ps.kode_prodi = 'TI';

INSERT INTO mata_kuliah(prodi_id, kode_mk, nama_mk, sks, semester)
SELECT ps.id, 'TI102', 'Administrasi Sistem', 3, 2
FROM program_studi ps WHERE ps.kode_prodi = 'TI';

INSERT INTO mata_kuliah(prodi_id, kode_mk, nama_mk, sks, semester)
SELECT ps.id, 'TI103', 'Keamanan Informasi', 3, 3
FROM program_studi ps WHERE ps.kode_prodi = 'TI';

-- =====================================================
-- MK_CPL - TEKNIK INFORMATIKA
-- =====================================================

-- Algoritma dan Pemrograman -> CPL
INSERT INTO mk_cpl(mk_id, cpl_id, bobot)
SELECT mk.id, c.id, 0.4000
FROM mata_kuliah mk, cpl c, program_studi ps
WHERE mk.prodi_id = ps.id AND c.prodi_id = ps.id 
  AND ps.kode_prodi = 'IF' AND mk.kode_mk = 'IF101' AND c.kode_cpl = 'CPL-IF-01';

INSERT INTO mk_cpl(mk_id, cpl_id, bobot)
SELECT mk.id, c.id, 0.3500
FROM mata_kuliah mk, cpl c, program_studi ps
WHERE mk.prodi_id = ps.id AND c.prodi_id = ps.id 
  AND ps.kode_prodi = 'IF' AND mk.kode_mk = 'IF101' AND c.kode_cpl = 'CPL-IF-02';

INSERT INTO mk_cpl(mk_id, cpl_id, bobot)
SELECT mk.id, c.id, 0.2500
FROM mata_kuliah mk, cpl c, program_studi ps
WHERE mk.prodi_id = ps.id AND c.prodi_id = ps.id 
  AND ps.kode_prodi = 'IF' AND mk.kode_mk = 'IF101' AND c.kode_cpl = 'CPL-IF-03';

-- Struktur Data -> CPL
INSERT INTO mk_cpl(mk_id, cpl_id, bobot)
SELECT mk.id, c.id, 0.3500
FROM mata_kuliah mk, cpl c, program_studi ps
WHERE mk.prodi_id = ps.id AND c.prodi_id = ps.id 
  AND ps.kode_prodi = 'IF' AND mk.kode_mk = 'IF102' AND c.kode_cpl = 'CPL-IF-01';

INSERT INTO mk_cpl(mk_id, cpl_id, bobot)
SELECT mk.id, c.id, 0.4000
FROM mata_kuliah mk, cpl c, program_studi ps
WHERE mk.prodi_id = ps.id AND c.prodi_id = ps.id 
  AND ps.kode_prodi = 'IF' AND mk.kode_mk = 'IF102' AND c.kode_cpl = 'CPL-IF-02';

INSERT INTO mk_cpl(mk_id, cpl_id, bobot)
SELECT mk.id, c.id, 0.2500
FROM mata_kuliah mk, cpl c, program_studi ps
WHERE mk.prodi_id = ps.id AND c.prodi_id = ps.id 
  AND ps.kode_prodi = 'IF' AND mk.kode_mk = 'IF102' AND c.kode_cpl = 'CPL-IF-03';

-- Basis Data -> CPL
INSERT INTO mk_cpl(mk_id, cpl_id, bobot)
SELECT mk.id, c.id, 0.3000
FROM mata_kuliah mk, cpl c, program_studi ps
WHERE mk.prodi_id = ps.id AND c.prodi_id = ps.id 
  AND ps.kode_prodi = 'IF' AND mk.kode_mk = 'IF103' AND c.kode_cpl = 'CPL-IF-01';

INSERT INTO mk_cpl(mk_id, cpl_id, bobot)
SELECT mk.id, c.id, 0.3500
FROM mata_kuliah mk, cpl c, program_studi ps
WHERE mk.prodi_id = ps.id AND c.prodi_id = ps.id 
  AND ps.kode_prodi = 'IF' AND mk.kode_mk = 'IF103' AND c.kode_cpl = 'CPL-IF-02';

INSERT INTO mk_cpl(mk_id, cpl_id, bobot)
SELECT mk.id, c.id, 0.3500
FROM mata_kuliah mk, cpl c, program_studi ps
WHERE mk.prodi_id = ps.id AND c.prodi_id = ps.id 
  AND ps.kode_prodi = 'IF' AND mk.kode_mk = 'IF103' AND c.kode_cpl = 'CPL-IF-03';

-- =====================================================
-- MK_CPL - SISTEM INFORMASI
-- =====================================================

-- Pengantar Sistem Informasi -> CPL
INSERT INTO mk_cpl(mk_id, cpl_id, bobot)
SELECT mk.id, c.id, 0.4000
FROM mata_kuliah mk, cpl c, program_studi ps
WHERE mk.prodi_id = ps.id AND c.prodi_id = ps.id 
  AND ps.kode_prodi = 'SI' AND mk.kode_mk = 'SI101' AND c.kode_cpl = 'CPL-SI-01';

INSERT INTO mk_cpl(mk_id, cpl_id, bobot)
SELECT mk.id, c.id, 0.3000
FROM mata_kuliah mk, cpl c, program_studi ps
WHERE mk.prodi_id = ps.id AND c.prodi_id = ps.id 
  AND ps.kode_prodi = 'SI' AND mk.kode_mk = 'SI101' AND c.kode_cpl = 'CPL-SI-02';

INSERT INTO mk_cpl(mk_id, cpl_id, bobot)
SELECT mk.id, c.id, 0.3000
FROM mata_kuliah mk, cpl c, program_studi ps
WHERE mk.prodi_id = ps.id AND c.prodi_id = ps.id 
  AND ps.kode_prodi = 'SI' AND mk.kode_mk = 'SI101' AND c.kode_cpl = 'CPL-SI-03';

-- Analisis dan Perancangan Sistem -> CPL
INSERT INTO mk_cpl(mk_id, cpl_id, bobot)
SELECT mk.id, c.id, 0.3500
FROM mata_kuliah mk, cpl c, program_studi ps
WHERE mk.prodi_id = ps.id AND c.prodi_id = ps.id 
  AND ps.kode_prodi = 'SI' AND mk.kode_mk = 'SI102' AND c.kode_cpl = 'CPL-SI-01';

INSERT INTO mk_cpl(mk_id, cpl_id, bobot)
SELECT mk.id, c.id, 0.4000
FROM mata_kuliah mk, cpl c, program_studi ps
WHERE mk.prodi_id = ps.id AND c.prodi_id = ps.id 
  AND ps.kode_prodi = 'SI' AND mk.kode_mk = 'SI102' AND c.kode_cpl = 'CPL-SI-02';

INSERT INTO mk_cpl(mk_id, cpl_id, bobot)
SELECT mk.id, c.id, 0.2500
FROM mata_kuliah mk, cpl c, program_studi ps
WHERE mk.prodi_id = ps.id AND c.prodi_id = ps.id 
  AND ps.kode_prodi = 'SI' AND mk.kode_mk = 'SI102' AND c.kode_cpl = 'CPL-SI-03';

-- Manajemen Proyek SI -> CPL
INSERT INTO mk_cpl(mk_id, cpl_id, bobot)
SELECT mk.id, c.id, 0.2500
FROM mata_kuliah mk, cpl c, program_studi ps
WHERE mk.prodi_id = ps.id AND c.prodi_id = ps.id 
  AND ps.kode_prodi = 'SI' AND mk.kode_mk = 'SI103' AND c.kode_cpl = 'CPL-SI-01';

INSERT INTO mk_cpl(mk_id, cpl_id, bobot)
SELECT mk.id, c.id, 0.3000
FROM mata_kuliah mk, cpl c, program_studi ps
WHERE mk.prodi_id = ps.id AND c.prodi_id = ps.id 
  AND ps.kode_prodi = 'SI' AND mk.kode_mk = 'SI103' AND c.kode_cpl = 'CPL-SI-02';

INSERT INTO mk_cpl(mk_id, cpl_id, bobot)
SELECT mk.id, c.id, 0.4500
FROM mata_kuliah mk, cpl c, program_studi ps
WHERE mk.prodi_id = ps.id AND c.prodi_id = ps.id 
  AND ps.kode_prodi = 'SI' AND mk.kode_mk = 'SI103' AND c.kode_cpl = 'CPL-SI-03';

-- =====================================================
-- MK_CPL - TEKNOLOGI INFORMASI
-- =====================================================

-- Jaringan Komputer -> CPL
INSERT INTO mk_cpl(mk_id, cpl_id, bobot)
SELECT mk.id, c.id, 0.4500
FROM mata_kuliah mk, cpl c, program_studi ps
WHERE mk.prodi_id = ps.id AND c.prodi_id = ps.id 
  AND ps.kode_prodi = 'TI' AND mk.kode_mk = 'TI101' AND c.kode_cpl = 'CPL-TI-01';

INSERT INTO mk_cpl(mk_id, cpl_id, bobot)
SELECT mk.id, c.id, 0.3000
FROM mata_kuliah mk, cpl c, program_studi ps
WHERE mk.prodi_id = ps.id AND c.prodi_id = ps.id 
  AND ps.kode_prodi = 'TI' AND mk.kode_mk = 'TI101' AND c.kode_cpl = 'CPL-TI-02';

INSERT INTO mk_cpl(mk_id, cpl_id, bobot)
SELECT mk.id, c.id, 0.2500
FROM mata_kuliah mk, cpl c, program_studi ps
WHERE mk.prodi_id = ps.id AND c.prodi_id = ps.id 
  AND ps.kode_prodi = 'TI' AND mk.kode_mk = 'TI101' AND c.kode_cpl = 'CPL-TI-03';

-- Administrasi Sistem -> CPL
INSERT INTO mk_cpl(mk_id, cpl_id, bobot)
SELECT mk.id, c.id, 0.4000
FROM mata_kuliah mk, cpl c, program_studi ps
WHERE mk.prodi_id = ps.id AND c.prodi_id = ps.id 
  AND ps.kode_prodi = 'TI' AND mk.kode_mk = 'TI102' AND c.kode_cpl = 'CPL-TI-01';

INSERT INTO mk_cpl(mk_id, cpl_id, bobot)
SELECT mk.id, c.id, 0.3500
FROM mata_kuliah mk, cpl c, program_studi ps
WHERE mk.prodi_id = ps.id AND c.prodi_id = ps.id 
  AND ps.kode_prodi = 'TI' AND mk.kode_mk = 'TI102' AND c.kode_cpl = 'CPL-TI-02';

INSERT INTO mk_cpl(mk_id, cpl_id, bobot)
SELECT mk.id, c.id, 0.2500
FROM mata_kuliah mk, cpl c, program_studi ps
WHERE mk.prodi_id = ps.id AND c.prodi_id = ps.id 
  AND ps.kode_prodi = 'TI' AND mk.kode_mk = 'TI102' AND c.kode_cpl = 'CPL-TI-03';

-- Keamanan Informasi -> CPL
INSERT INTO mk_cpl(mk_id, cpl_id, bobot)
SELECT mk.id, c.id, 0.2500
FROM mata_kuliah mk, cpl c, program_studi ps
WHERE mk.prodi_id = ps.id AND c.prodi_id = ps.id 
  AND ps.kode_prodi = 'TI' AND mk.kode_mk = 'TI103' AND c.kode_cpl = 'CPL-TI-01';

INSERT INTO mk_cpl(mk_id, cpl_id, bobot)
SELECT mk.id, c.id, 0.3000
FROM mata_kuliah mk, cpl c, program_studi ps
WHERE mk.prodi_id = ps.id AND c.prodi_id = ps.id 
  AND ps.kode_prodi = 'TI' AND mk.kode_mk = 'TI103' AND c.kode_cpl = 'CPL-TI-02';

INSERT INTO mk_cpl(mk_id, cpl_id, bobot)
SELECT mk.id, c.id, 0.4500
FROM mata_kuliah mk, cpl c, program_studi ps
WHERE mk.prodi_id = ps.id AND c.prodi_id = ps.id 
  AND ps.kode_prodi = 'TI' AND mk.kode_mk = 'TI103' AND c.kode_cpl = 'CPL-TI-03';

-- =====================================================
-- SUB-CPMK - 3 SUB-CPMK PER MK-CPL (SEMUA PRODI)
-- =====================================================

INSERT INTO sub_cpmk(mk_cpl_id, kode_sub_cpmk, deskripsi, bobot)
SELECT 
    mc.id,
    'SUB-01',
    'Pemahaman dasar konsep',
    0.3333
FROM mk_cpl mc;

INSERT INTO sub_cpmk(mk_cpl_id, kode_sub_cpmk, deskripsi, bobot)
SELECT 
    mc.id,
    'SUB-02',
    'Implementasi dan aplikasi',
    0.3334
FROM mk_cpl mc;

INSERT INTO sub_cpmk(mk_cpl_id, kode_sub_cpmk, deskripsi, bobot)
SELECT 
    mc.id,
    'SUB-03',
    'Analisis dan evaluasi',
    0.3333
FROM mk_cpl mc;

-- =====================================================
-- MAHASISWA - 15 PER PRODI (TOTAL 45)
-- =====================================================

-- Teknik Informatika
INSERT INTO mahasiswa(prodi_id, nim, nama, angkatan)
SELECT ps.id, 'IF2023001', 'Andi Pratama', 2023 FROM program_studi ps WHERE ps.kode_prodi = 'IF'
UNION ALL
SELECT ps.id, 'IF2023002', 'Budi Santoso', 2023 FROM program_studi ps WHERE ps.kode_prodi = 'IF'
UNION ALL
SELECT ps.id, 'IF2023003', 'Citra Dewi', 2023 FROM program_studi ps WHERE ps.kode_prodi = 'IF'
UNION ALL
SELECT ps.id, 'IF2023004', 'Dian Purnama', 2023 FROM program_studi ps WHERE ps.kode_prodi = 'IF'
UNION ALL
SELECT ps.id, 'IF2023005', 'Eka Wijaya', 2023 FROM program_studi ps WHERE ps.kode_prodi = 'IF'
UNION ALL
SELECT ps.id, 'IF2023006', 'Fajar Ramadhan', 2023 FROM program_studi ps WHERE ps.kode_prodi = 'IF'
UNION ALL
SELECT ps.id, 'IF2023007', 'Gita Sari', 2023 FROM program_studi ps WHERE ps.kode_prodi = 'IF'
UNION ALL
SELECT ps.id, 'IF2023008', 'Hendra Kusuma', 2023 FROM program_studi ps WHERE ps.kode_prodi = 'IF'
UNION ALL
SELECT ps.id, 'IF2023009', 'Indah Permata', 2023 FROM program_studi ps WHERE ps.kode_prodi = 'IF'
UNION ALL
SELECT ps.id, 'IF2023010', 'Joko Widodo', 2023 FROM program_studi ps WHERE ps.kode_prodi = 'IF'
UNION ALL
SELECT ps.id, 'IF2023011', 'Kartika Putri', 2023 FROM program_studi ps WHERE ps.kode_prodi = 'IF'
UNION ALL
SELECT ps.id, 'IF2023012', 'Lukman Hakim', 2023 FROM program_studi ps WHERE ps.kode_prodi = 'IF'
UNION ALL
SELECT ps.id, 'IF2023013', 'Maya Anggraini', 2023 FROM program_studi ps WHERE ps.kode_prodi = 'IF'
UNION ALL
SELECT ps.id, 'IF2023014', 'Nanda Pratama', 2023 FROM program_studi ps WHERE ps.kode_prodi = 'IF'
UNION ALL
SELECT ps.id, 'IF2023015', 'Olivia Rahmawati', 2023 FROM program_studi ps WHERE ps.kode_prodi = 'IF';

-- Sistem Informasi
INSERT INTO mahasiswa(prodi_id, nim, nama, angkatan)
SELECT ps.id, 'SI2023001', 'Putra Aditya', 2023 FROM program_studi ps WHERE ps.kode_prodi = 'SI'
UNION ALL
SELECT ps.id, 'SI2023002', 'Qori Amalia', 2023 FROM program_studi ps WHERE ps.kode_prodi = 'SI'
UNION ALL
SELECT ps.id, 'SI2023003', 'Reza Firmansyah', 2023 FROM program_studi ps WHERE ps.kode_prodi = 'SI'
UNION ALL
SELECT ps.id, 'SI2023004', 'Sari Wulandari', 2023 FROM program_studi ps WHERE ps.kode_prodi = 'SI'
UNION ALL
SELECT ps.id, 'SI2023005', 'Taufik Hidayat', 2023 FROM program_studi ps WHERE ps.kode_prodi = 'SI'
UNION ALL
SELECT ps.id, 'SI2023006', 'Umi Kalsum', 2023 FROM program_studi ps WHERE ps.kode_prodi = 'SI'
UNION ALL
SELECT ps.id, 'SI2023007', 'Vina Melati', 2023 FROM program_studi ps WHERE ps.kode_prodi = 'SI'
UNION ALL
SELECT ps.id, 'SI2023008', 'Wahyu Nugroho', 2023 FROM program_studi ps WHERE ps.kode_prodi = 'SI'
UNION ALL
SELECT ps.id, 'SI2023009', 'Xena Puspita', 2023 FROM program_studi ps WHERE ps.kode_prodi = 'SI'
UNION ALL
SELECT ps.id, 'SI2023010', 'Yudi Setiawan', 2023 FROM program_studi ps WHERE ps.kode_prodi = 'SI'
UNION ALL
SELECT ps.id, 'SI2023011', 'Zahra Aulia', 2023 FROM program_studi ps WHERE ps.kode_prodi = 'SI'
UNION ALL
SELECT ps.id, 'SI2023012', 'Agus Salim', 2023 FROM program_studi ps WHERE ps.kode_prodi = 'SI'
UNION ALL
SELECT ps.id, 'SI2023013', 'Bella Safitri', 2023 FROM program_studi ps WHERE ps.kode_prodi = 'SI'
UNION ALL
SELECT ps.id, 'SI2023014', 'Cahyo Baskoro', 2023 FROM program_studi ps WHERE ps.kode_prodi = 'SI'
UNION ALL
SELECT ps.id, 'SI2023015', 'Dewi Lestari', 2023 FROM program_studi ps WHERE ps.kode_prodi = 'SI';

-- Teknologi Informasi
INSERT INTO mahasiswa(prodi_id, nim, nama, angkatan)
SELECT ps.id, 'TI2023001', 'Eko Prasetyo', 2023 FROM program_studi ps WHERE ps.kode_prodi = 'TI'
UNION ALL
SELECT ps.id, 'TI2023002', 'Fitri Handayani', 2023 FROM program_studi ps WHERE ps.kode_prodi = 'TI'
UNION ALL
SELECT ps.id, 'TI2023003', 'Gilang Ramadhan', 2023 FROM program_studi ps WHERE ps.kode_prodi = 'TI'
UNION ALL
SELECT ps.id, 'TI2023004', 'Hani Maulida', 2023 FROM program_studi ps WHERE ps.kode_prodi = 'TI'
UNION ALL
SELECT ps.id, 'TI2023005', 'Irfan Hakim', 2023 FROM program_studi ps WHERE ps.kode_prodi = 'TI'
UNION ALL
SELECT ps.id, 'TI2023006', 'Julia Maharani', 2023 FROM program_studi ps WHERE ps.kode_prodi = 'TI'
UNION ALL
SELECT ps.id, 'TI2023007', 'Kevin Ananda', 2023 FROM program_studi ps WHERE ps.kode_prodi = 'TI'
UNION ALL
SELECT ps.id, 'TI2023008', 'Linda Susanti', 2023 FROM program_studi ps WHERE ps.kode_prodi = 'TI'
UNION ALL
SELECT ps.id, 'TI2023009', 'Muhammad Rizki', 2023 FROM program_studi ps WHERE ps.kode_prodi = 'TI'
UNION ALL
SELECT ps.id, 'TI2023010', 'Nisa Amelia', 2023 FROM program_studi ps WHERE ps.kode_prodi = 'TI'
UNION ALL
SELECT ps.id, 'TI2023011', 'Oscar Wijaya', 2023 FROM program_studi ps WHERE ps.kode_prodi = 'TI'
UNION ALL
SELECT ps.id, 'TI2023012', 'Putri Ayu', 2023 FROM program_studi ps WHERE ps.kode_prodi = 'TI'
UNION ALL
SELECT ps.id, 'TI2023013', 'Qomar Zaman', 2023 FROM program_studi ps WHERE ps.kode_prodi = 'TI'
UNION ALL
SELECT ps.id, 'TI2023014', 'Rina Marlina', 2023 FROM program_studi ps WHERE ps.kode_prodi = 'TI'
UNION ALL
SELECT ps.id, 'TI2023015', 'Sandi Permana', 2023 FROM program_studi ps WHERE ps.kode_prodi = 'TI';

-- =====================================================
-- USERS - SUPERADMIN (1 ORANG)
-- =====================================================

INSERT INTO users(email, password_hash, role_id, prodi_id, entity_type, entity_id)
SELECT 
    'superadmin@kampus.ac.id',
    crypt('password123', gen_salt('bf')),
    r.id,
    NULL,
    'admin',
    NULL
FROM roles r
WHERE r.nama_role = 'superadmin';

-- =====================================================
-- USERS - ADMIN PRODI (3 ORANG)
-- =====================================================

INSERT INTO users(email, password_hash, role_id, prodi_id, entity_type, entity_id)
SELECT 
    'admin.if@kampus.ac.id',
    crypt('password123', gen_salt('bf')),
    r.id,
    ps.id,
    'admin',
    NULL
FROM roles r, program_studi ps
WHERE r.nama_role = 'admin_prodi' AND ps.kode_prodi = 'IF';

INSERT INTO users(email, password_hash, role_id, prodi_id, entity_type, entity_id)
SELECT 
    'admin.si@kampus.ac.id',
    crypt('password123', gen_salt('bf')),
    r.id,
    ps.id,
    'admin',
    NULL
FROM roles r, program_studi ps
WHERE r.nama_role = 'admin_prodi' AND ps.kode_prodi = 'SI';

INSERT INTO users(email, password_hash, role_id, prodi_id, entity_type, entity_id)
SELECT 
    'admin.ti@kampus.ac.id',
    crypt('password123', gen_salt('bf')),
    r.id,
    ps.id,
    'admin',
    NULL
FROM roles r, program_studi ps
WHERE r.nama_role = 'admin_prodi' AND ps.kode_prodi = 'TI';

-- =====================================================
-- USERS - DOSEN (8 ORANG)
-- =====================================================

-- Dosen Umum (NULL prodi karena bisa mengajar di berbagai prodi)
INSERT INTO users(email, password_hash, role_id, prodi_id, entity_type, entity_id)
SELECT 
    'ahmad.fauzi@kampus.ac.id',
    crypt('password123', gen_salt('bf')),
    r.id,
    NULL,
    'dosen',
    d.id
FROM roles r, dosen d
WHERE r.nama_role = 'dosen' AND d.nidn = 'NIDN00001';

INSERT INTO users(email, password_hash, role_id, prodi_id, entity_type, entity_id)
SELECT 
    'siti.nurhaliza@kampus.ac.id',
    crypt('password123', gen_salt('bf')),
    r.id,
    NULL,
    'dosen',
    d.id
FROM roles r, dosen d
WHERE r.nama_role = 'dosen' AND d.nidn = 'NIDN00002';

-- Dosen Teknik Informatika
INSERT INTO users(email, password_hash, role_id, prodi_id, entity_type, entity_id)
SELECT 
    'budi.raharjo@kampus.ac.id',
    crypt('password123', gen_salt('bf')),
    r.id,
    ps.id,
    'dosen',
    d.id
FROM roles r, dosen d, program_studi ps
WHERE r.nama_role = 'dosen' AND d.nidn = 'NIDN00101' AND ps.kode_prodi = 'IF';

INSERT INTO users(email, password_hash, role_id, prodi_id, entity_type, entity_id)
SELECT 
    'dewi.sartika@kampus.ac.id',
    crypt('password123', gen_salt('bf')),
    r.id,
    ps.id,
    'dosen',
    d.id
FROM roles r, dosen d, program_studi ps
WHERE r.nama_role = 'dosen' AND d.nidn = 'NIDN00102' AND ps.kode_prodi = 'IF';

-- Dosen Sistem Informasi
INSERT INTO users(email, password_hash, role_id, prodi_id, entity_type, entity_id)
SELECT 
    'eko.wijayanto@kampus.ac.id',
    crypt('password123', gen_salt('bf')),
    r.id,
    ps.id,
    'dosen',
    d.id
FROM roles r, dosen d, program_studi ps
WHERE r.nama_role = 'dosen' AND d.nidn = 'NIDN00201' AND ps.kode_prodi = 'SI';

INSERT INTO users(email, password_hash, role_id, prodi_id, entity_type, entity_id)
SELECT 
    'fitri.handayani@kampus.ac.id',
    crypt('password123', gen_salt('bf')),
    r.id,
    ps.id,
    'dosen',
    d.id
FROM roles r, dosen d, program_studi ps
WHERE r.nama_role = 'dosen' AND d.nidn = 'NIDN00202' AND ps.kode_prodi = 'SI';

-- Dosen Teknologi Informasi
INSERT INTO users(email, password_hash, role_id, prodi_id, entity_type, entity_id)
SELECT 
    'gunawan.saputra@kampus.ac.id',
    crypt('password123', gen_salt('bf')),
    r.id,
    ps.id,
    'dosen',
    d.id
FROM roles r, dosen d, program_studi ps
WHERE r.nama_role = 'dosen' AND d.nidn = 'NIDN00301' AND ps.kode_prodi = 'TI';

INSERT INTO users(email, password_hash, role_id, prodi_id, entity_type, entity_id)
SELECT 
    'hani.puspita@kampus.ac.id',
    crypt('password123', gen_salt('bf')),
    r.id,
    ps.id,
    'dosen',
    d.id
FROM roles r, dosen d, program_studi ps
WHERE r.nama_role = 'dosen' AND d.nidn = 'NIDN00302' AND ps.kode_prodi = 'TI';

-- =====================================================
-- USERS - MAHASISWA (45 ORANG)
-- =====================================================

INSERT INTO users(email, password_hash, role_id, prodi_id, entity_type, entity_id)
SELECT 
    LOWER(m.nim) || '@student.ac.id',
    crypt('password123', gen_salt('bf')),
    r.id,
    m.prodi_id,
    'mahasiswa',
    m.id
FROM mahasiswa m, roles r
WHERE r.nama_role = 'mahasiswa';

-- =====================================================
-- KELAS (9 KELAS - 3 PER PRODI)
-- =====================================================

-- Kelas Teknik Informatika (menggunakan dosen IF)
INSERT INTO kelas(mk_id, dosen_id, tahun_akademik, semester_aktif, nama_kelas)
SELECT mk.id, d.id, '2024/2025', 1, 'A'
FROM mata_kuliah mk, dosen d, program_studi ps
WHERE mk.prodi_id = ps.id AND ps.kode_prodi = 'IF' AND mk.kode_mk = 'IF101' AND d.nidn = 'NIDN00101';

INSERT INTO kelas(mk_id, dosen_id, tahun_akademik, semester_aktif, nama_kelas)
SELECT mk.id, d.id, '2024/2025', 1, 'A'
FROM mata_kuliah mk, dosen d, program_studi ps
WHERE mk.prodi_id = ps.id AND ps.kode_prodi = 'IF' AND mk.kode_mk = 'IF102' AND d.nidn = 'NIDN00102';

INSERT INTO kelas(mk_id, dosen_id, tahun_akademik, semester_aktif, nama_kelas)
SELECT mk.id, d.id, '2024/2025', 1, 'A'
FROM mata_kuliah mk, dosen d, program_studi ps
WHERE mk.prodi_id = ps.id AND ps.kode_prodi = 'IF' AND mk.kode_mk = 'IF103' AND d.nidn = 'NIDN00101';

-- Kelas Sistem Informasi (menggunakan dosen SI)
INSERT INTO kelas(mk_id, dosen_id, tahun_akademik, semester_aktif, nama_kelas)
SELECT mk.id, d.id, '2024/2025', 1, 'A'
FROM mata_kuliah mk, dosen d, program_studi ps
WHERE mk.prodi_id = ps.id AND ps.kode_prodi = 'SI' AND mk.kode_mk = 'SI101' AND d.nidn = 'NIDN00201';

INSERT INTO kelas(mk_id, dosen_id, tahun_akademik, semester_aktif, nama_kelas)
SELECT mk.id, d.id, '2024/2025', 1, 'A'
FROM mata_kuliah mk, dosen d, program_studi ps
WHERE mk.prodi_id = ps.id AND ps.kode_prodi = 'SI' AND mk.kode_mk = 'SI102' AND d.nidn = 'NIDN00202';

INSERT INTO kelas(mk_id, dosen_id, tahun_akademik, semester_aktif, nama_kelas)
SELECT mk.id, d.id, '2024/2025', 1, 'A'
FROM mata_kuliah mk, dosen d, program_studi ps
WHERE mk.prodi_id = ps.id AND ps.kode_prodi = 'SI' AND mk.kode_mk = 'SI103' AND d.nidn = 'NIDN00201';

-- Kelas Teknologi Informasi (menggunakan dosen TI)
INSERT INTO kelas(mk_id, dosen_id, tahun_akademik, semester_aktif, nama_kelas)
SELECT mk.id, d.id, '2024/2025', 1, 'A'
FROM mata_kuliah mk, dosen d, program_studi ps
WHERE mk.prodi_id = ps.id AND ps.kode_prodi = 'TI' AND mk.kode_mk = 'TI101' AND d.nidn = 'NIDN00301';

INSERT INTO kelas(mk_id, dosen_id, tahun_akademik, semester_aktif, nama_kelas)
SELECT mk.id, d.id, '2024/2025', 1, 'A'
FROM mata_kuliah mk, dosen d, program_studi ps
WHERE mk.prodi_id = ps.id AND ps.kode_prodi = 'TI' AND mk.kode_mk = 'TI102' AND d.nidn = 'NIDN00302';

INSERT INTO kelas(mk_id, dosen_id, tahun_akademik, semester_aktif, nama_kelas)
SELECT mk.id, d.id, '2024/2025', 1, 'A'
FROM mata_kuliah mk, dosen d, program_studi ps
WHERE mk.prodi_id = ps.id AND ps.kode_prodi = 'TI' AND mk.kode_mk = 'TI103' AND d.nidn = 'NIDN00301';

-- =====================================================
-- ENROLLMENT - SEMUA MAHASISWA KE KELAS SESUAI PRODI
-- Total: 135 enrollment (45 mahasiswa x 3 kelas)
-- =====================================================

INSERT INTO enrollment(kelas_id, mahasiswa_id)
SELECT k.id, m.id
FROM kelas k
JOIN mata_kuliah mk ON mk.id = k.mk_id
JOIN mahasiswa m ON m.prodi_id = mk.prodi_id;

-- =====================================================
-- ROLE PERMISSIONS
-- =====================================================

-- Superadmin - Full Access
INSERT INTO role_permissions(role_id, resource, can_read, can_write, can_delete)
SELECT 
    (SELECT id FROM roles WHERE nama_role='superadmin'),
    resource,
    TRUE,
    TRUE,
    TRUE
FROM (VALUES 
    ('program_studi'),
    ('cpl'),
    ('dosen'),
    ('mahasiswa'),
    ('mata_kuliah'),
    ('mk_cpl'),
    ('sub_cpmk'),
    ('threshold_status'),
    ('kelas'),
    ('enrollment'),
    ('nilai_sub_cpmk'),
    ('capaian_cpl_mk'),
    ('capaian_cpl_mahasiswa'),
    ('users'),
    ('roles'),
    ('role_permissions')
) AS t(resource);

-- Admin Prodi - Manage Prodi Data
INSERT INTO role_permissions(role_id, resource, can_read, can_write, can_delete) VALUES
((SELECT id FROM roles WHERE nama_role='admin_prodi'), 'program_studi', TRUE, TRUE, FALSE),
((SELECT id FROM roles WHERE nama_role='admin_prodi'), 'cpl', TRUE, TRUE, TRUE),
((SELECT id FROM roles WHERE nama_role='admin_prodi'), 'dosen', TRUE, TRUE, FALSE),
((SELECT id FROM roles WHERE nama_role='admin_prodi'), 'mahasiswa', TRUE, TRUE, TRUE),
((SELECT id FROM roles WHERE nama_role='admin_prodi'), 'mata_kuliah', TRUE, TRUE, TRUE),
((SELECT id FROM roles WHERE nama_role='admin_prodi'), 'mk_cpl', TRUE, TRUE, TRUE),
((SELECT id FROM roles WHERE nama_role='admin_prodi'), 'sub_cpmk', TRUE, TRUE, TRUE),
((SELECT id FROM roles WHERE nama_role='admin_prodi'), 'threshold_status', TRUE, TRUE, TRUE),
((SELECT id FROM roles WHERE nama_role='admin_prodi'), 'kelas', TRUE, TRUE, TRUE),
((SELECT id FROM roles WHERE nama_role='admin_prodi'), 'enrollment', TRUE, TRUE, TRUE),
((SELECT id FROM roles WHERE nama_role='admin_prodi'), 'nilai_sub_cpmk', TRUE, FALSE, FALSE),
((SELECT id FROM roles WHERE nama_role='admin_prodi'), 'capaian_cpl_mk', TRUE, FALSE, FALSE),
((SELECT id FROM roles WHERE nama_role='admin_prodi'), 'capaian_cpl_mahasiswa', TRUE, FALSE, FALSE);

-- Dosen - Manage Own Classes
INSERT INTO role_permissions(role_id, resource, can_read, can_write, can_delete) VALUES
((SELECT id FROM roles WHERE nama_role='dosen'), 'kelas', TRUE, FALSE, FALSE),
((SELECT id FROM roles WHERE nama_role='dosen'), 'enrollment', TRUE, FALSE, FALSE),
((SELECT id FROM roles WHERE nama_role='dosen'), 'mahasiswa', TRUE, FALSE, FALSE),
((SELECT id FROM roles WHERE nama_role='dosen'), 'mata_kuliah', TRUE, FALSE, FALSE),
((SELECT id FROM roles WHERE nama_role='dosen'), 'sub_cpmk', TRUE, FALSE, FALSE),
((SELECT id FROM roles WHERE nama_role='dosen'), 'nilai_sub_cpmk', TRUE, TRUE, TRUE),
((SELECT id FROM roles WHERE nama_role='dosen'), 'capaian_cpl_mk', TRUE, FALSE, FALSE),
((SELECT id FROM roles WHERE nama_role='dosen'), 'capaian_cpl_mahasiswa', TRUE, FALSE, FALSE);

-- Mahasiswa - View Own Data
INSERT INTO role_permissions(role_id, resource, can_read, can_write, can_delete) VALUES
((SELECT id FROM roles WHERE nama_role='mahasiswa'), 'kelas', TRUE, FALSE, FALSE),
((SELECT id FROM roles WHERE nama_role='mahasiswa'), 'enrollment', TRUE, FALSE, FALSE),
((SELECT id FROM roles WHERE nama_role='mahasiswa'), 'mata_kuliah', TRUE, FALSE, FALSE),
((SELECT id FROM roles WHERE nama_role='mahasiswa'), 'nilai_sub_cpmk', TRUE, FALSE, FALSE),
((SELECT id FROM roles WHERE nama_role='mahasiswa'), 'capaian_cpl_mk', TRUE, FALSE, FALSE),
((SELECT id FROM roles WHERE nama_role='mahasiswa'), 'capaian_cpl_mahasiswa', TRUE, FALSE, FALSE),
((SELECT id FROM roles WHERE nama_role='mahasiswa'), 'cpl', TRUE, FALSE, FALSE);

-- =====================================================
-- NILAI SUB CPMK - LENGKAP UNTUK SEMUA ENROLLMENT
-- Total: 135 enrollment x 9 sub_cpmk = 1215 nilai
-- =====================================================

-- Generate nilai untuk semua enrollment dan sub_cpmk
INSERT INTO nilai_sub_cpmk(enrollment_id, sub_cpmk_id, nilai)
SELECT
    e.id AS enrollment_id,
    s.id AS sub_cpmk_id,
    ROUND((60 + random() * 40)::NUMERIC, 2) AS nilai
FROM enrollment e
JOIN kelas k ON k.id = e.kelas_id
JOIN mata_kuliah mk ON mk.id = k.mk_id
JOIN mk_cpl mc ON mc.mk_id = mk.id
JOIN sub_cpmk s ON s.mk_cpl_id = mc.id
ORDER BY e.id, s.id;

-- =====================================================
-- CAPAIAN CPL MK - DIHITUNG DARI NILAI SUB CPMK
-- =====================================================

-- Hitung capaian CPL per MK untuk setiap enrollment
INSERT INTO capaian_cpl_mk(enrollment_id, mk_cpl_id, nilai_capaian, status, calculated_at)
SELECT
    e.id AS enrollment_id,
    mc.id AS mk_cpl_id,
    ROUND(SUM(n.nilai * s.bobot)::NUMERIC, 2) AS nilai_capaian,
    get_status_cpl(
        m.prodi_id, 
        ROUND(SUM(n.nilai * s.bobot)::NUMERIC, 2)
    ) AS status,
    NOW() AS calculated_at
FROM enrollment e
JOIN kelas k ON k.id = e.kelas_id
JOIN mata_kuliah mk ON mk.id = k.mk_id
JOIN mahasiswa m ON m.id = e.mahasiswa_id
JOIN mk_cpl mc ON mc.mk_id = mk.id
JOIN sub_cpmk s ON s.mk_cpl_id = mc.id
LEFT JOIN nilai_sub_cpmk n ON n.enrollment_id = e.id AND n.sub_cpmk_id = s.id
GROUP BY e.id, mc.id, m.prodi_id
ORDER BY e.id, mc.id;

-- =====================================================
-- CAPAIAN CPL MAHASISWA - AGREGASI DARI CAPAIAN CPL MK
-- =====================================================

-- Hitung capaian CPL total per mahasiswa
INSERT INTO capaian_cpl_mahasiswa(mahasiswa_id, cpl_id, tahun_akademik, nilai_capaian, status, calculated_at)
SELECT
    m.id AS mahasiswa_id,
    c.id AS cpl_id,
    '2024/2025' AS tahun_akademik,
    ROUND(
        SUM(ccm.nilai_capaian * mc.bobot) / NULLIF(SUM(mc.bobot), 0)::NUMERIC, 2
    ) AS nilai_capaian,
    get_status_cpl(
        m.prodi_id, 
        ROUND(SUM(ccm.nilai_capaian * mc.bobot) / NULLIF(SUM(mc.bobot), 0)::NUMERIC, 2)
    ) AS status,
    NOW() AS calculated_at
FROM mahasiswa m
JOIN cpl c ON c.prodi_id = m.prodi_id
JOIN mk_cpl mc ON mc.cpl_id = c.id
JOIN capaian_cpl_mk ccm ON ccm.mk_cpl_id = mc.id
JOIN enrollment e ON e.id = ccm.enrollment_id
WHERE e.mahasiswa_id = m.id
GROUP BY m.id, c.id, m.prodi_id
ORDER BY m.id, c.id;

-- =====================================================
-- SAMPLE AUTH AUDIT LOG (Optional - untuk testing)
-- =====================================================

-- Sample login success untuk beberapa user
INSERT INTO auth_audit_log(user_id, event_type, ip_address, user_agent, detail, created_at) VALUES
-- Admin IF login
((SELECT id FROM users WHERE email='admin.if@kampus.ac.id'), 'login_success', '192.168.1.100'::INET, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', '{"device": "Desktop", "browser": "Chrome"}'::JSONB, NOW() - INTERVAL '2 days'),
-- Dosen 1 login
((SELECT id FROM users WHERE email='ahmad.fauzi@kampus.ac.id'), 'login_success', '192.168.1.101'::INET, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', '{"device": "Desktop", "browser": "Firefox"}'::JSONB, NOW() - INTERVAL '1 day'),
-- Mahasiswa login
((SELECT id FROM users WHERE email='if2023001@student.ac.id'), 'login_success', '192.168.1.102'::INET, 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)', '{"device": "Mobile", "browser": "Safari"}'::JSONB, NOW() - INTERVAL '12 hours'),
-- Failed login attempt
((SELECT id FROM users WHERE email='if2023002@student.ac.id'), 'login_failed', '192.168.1.103'::INET, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', '{"reason": "wrong_password"}'::JSONB, NOW() - INTERVAL '6 hours');

-- =====================================================
-- SAMPLE REFRESH TOKENS (Optional - untuk testing)
-- =====================================================

-- Sample active refresh tokens untuk beberapa user
INSERT INTO refresh_tokens(user_id, token_hash, device_info, ip_address, expires_at, created_at) VALUES
-- Admin IF token
((SELECT id FROM users WHERE email='admin.if@kampus.ac.id'), 
 encode(digest('admin_if_token_' || NOW()::TEXT, 'sha256'), 'hex'),
 'Chrome on Windows 10',
 '192.168.1.100'::INET,
 NOW() + INTERVAL '7 days',
 NOW() - INTERVAL '2 days'),
-- Dosen 1 token
((SELECT id FROM users WHERE email='ahmad.fauzi@kampus.ac.id'),
 encode(digest('dosen1_token_' || NOW()::TEXT, 'sha256'), 'hex'),
 'Firefox on Windows 10',
 '192.168.1.101'::INET,
 NOW() + INTERVAL '7 days',
 NOW() - INTERVAL '1 day'),
-- Mahasiswa token
((SELECT id FROM users WHERE email='if2023001@student.ac.id'),
 encode(digest('mhs_token_' || NOW()::TEXT, 'sha256'), 'hex'),
 'Safari on iPhone',
 '192.168.1.102'::INET,
 NOW() + INTERVAL '7 days',
 NOW() - INTERVAL '12 hours');

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verifikasi jumlah data per tabel
DO $$
DECLARE
    v_count INT;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFIKASI DATA DUMMY';
    RAISE NOTICE '========================================';
    
    SELECT COUNT(*) INTO v_count FROM roles;
    RAISE NOTICE 'roles: % records', v_count;
    
    SELECT COUNT(*) INTO v_count FROM program_studi;
    RAISE NOTICE 'program_studi: % records', v_count;
    
    SELECT COUNT(*) INTO v_count FROM cpl;
    RAISE NOTICE 'cpl: % records', v_count;
    
    SELECT COUNT(*) INTO v_count FROM dosen;
    RAISE NOTICE 'dosen: % records', v_count;
    
    SELECT COUNT(*) INTO v_count FROM mahasiswa;
    RAISE NOTICE 'mahasiswa: % records', v_count;
    
    SELECT COUNT(*) INTO v_count FROM mata_kuliah;
    RAISE NOTICE 'mata_kuliah: % records', v_count;
    
    SELECT COUNT(*) INTO v_count FROM mk_cpl;
    RAISE NOTICE 'mk_cpl: % records', v_count;
    
    SELECT COUNT(*) INTO v_count FROM sub_cpmk;
    RAISE NOTICE 'sub_cpmk: % records', v_count;
    
    SELECT COUNT(*) INTO v_count FROM threshold_status;
    RAISE NOTICE 'threshold_status: % records', v_count;
    
    SELECT COUNT(*) INTO v_count FROM users;
    RAISE NOTICE 'users: % records', v_count;
    
    SELECT COUNT(*) INTO v_count FROM role_permissions;
    RAISE NOTICE 'role_permissions: % records', v_count;
    
    SELECT COUNT(*) INTO v_count FROM kelas;
    RAISE NOTICE 'kelas: % records', v_count;
    
    SELECT COUNT(*) INTO v_count FROM enrollment;
    RAISE NOTICE 'enrollment: % records', v_count;
    
    SELECT COUNT(*) INTO v_count FROM nilai_sub_cpmk;
    RAISE NOTICE 'nilai_sub_cpmk: % records', v_count;
    
    SELECT COUNT(*) INTO v_count FROM capaian_cpl_mk;
    RAISE NOTICE 'capaian_cpl_mk: % records', v_count;
    
    SELECT COUNT(*) INTO v_count FROM capaian_cpl_mahasiswa;
    RAISE NOTICE 'capaian_cpl_mahasiswa: % records', v_count;
    
    SELECT COUNT(*) INTO v_count FROM refresh_tokens;
    RAISE NOTICE 'refresh_tokens: % records', v_count;
    
    SELECT COUNT(*) INTO v_count FROM auth_audit_log;
    RAISE NOTICE 'auth_audit_log: % records', v_count;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RELASI DATA';
    RAISE NOTICE '========================================';
    
    -- Verifikasi relasi
    SELECT COUNT(DISTINCT m.prodi_id) INTO v_count FROM mahasiswa m;
    RAISE NOTICE 'Mahasiswa tersebar di % prodi', v_count;
    
    SELECT COUNT(DISTINCT k.dosen_id) INTO v_count FROM kelas k;
    RAISE NOTICE 'Kelas diampu oleh % dosen', v_count;
    
    SELECT COUNT(*) INTO v_count 
    FROM enrollment e
    JOIN kelas k ON k.id = e.kelas_id
    JOIN mahasiswa m ON m.id = e.mahasiswa_id
    JOIN mata_kuliah mk ON mk.id = k.mk_id
    WHERE m.prodi_id = mk.prodi_id;
    RAISE NOTICE 'Enrollment valid (mahasiswa sesuai prodi): % records', v_count;
    
    SELECT COUNT(*) INTO v_count
    FROM nilai_sub_cpmk n
    JOIN enrollment e ON e.id = n.enrollment_id
    JOIN sub_cpmk s ON s.id = n.sub_cpmk_id;
    RAISE NOTICE 'Nilai sub_cpmk dengan relasi valid: % records', v_count;
    
    SELECT COUNT(*) INTO v_count
    FROM capaian_cpl_mk ccm
    JOIN enrollment e ON e.id = ccm.enrollment_id
    JOIN mk_cpl mc ON mc.id = ccm.mk_cpl_id;
    RAISE NOTICE 'Capaian CPL MK dengan relasi valid: % records', v_count;
    
    SELECT COUNT(*) INTO v_count
    FROM capaian_cpl_mahasiswa ccm
    JOIN mahasiswa m ON m.id = ccm.mahasiswa_id
    JOIN cpl c ON c.id = ccm.cpl_id
    WHERE m.prodi_id = c.prodi_id;
    RAISE NOTICE 'Capaian CPL Mahasiswa dengan relasi valid: % records', v_count;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SAMPLE DATA';
    RAISE NOTICE '========================================';
    
    -- Sample mahasiswa dengan capaian tertinggi
    RAISE NOTICE 'Top 3 Mahasiswa dengan Capaian CPL Tertinggi:';
    FOR v_count IN 1..3 LOOP
        DECLARE
            v_nama VARCHAR(150);
            v_nim VARCHAR(20);
            v_avg_nilai NUMERIC(6,2);
        BEGIN
            SELECT m.nama, m.nim, AVG(ccm.nilai_capaian)
            INTO v_nama, v_nim, v_avg_nilai
            FROM mahasiswa m
            JOIN capaian_cpl_mahasiswa ccm ON ccm.mahasiswa_id = m.id
            GROUP BY m.id, m.nama, m.nim
            ORDER BY AVG(ccm.nilai_capaian) DESC
            LIMIT 1 OFFSET v_count - 1;
            
            IF v_nama IS NOT NULL THEN
                RAISE NOTICE '  %. % (%) - Avg: %', v_count, v_nama, v_nim, v_avg_nilai;
            END IF;
        END;
    END LOOP;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DATA DUMMY BERHASIL DIBUAT DAN DIVERIFIKASI!';
    RAISE NOTICE '========================================';
END $$;

-- =====================================================
-- FINAL SUMMARY
-- =====================================================

/*
RINGKASAN DATA YANG DIBUAT:

MASTER DATA:
- 4 Roles (superadmin, admin_prodi, dosen, mahasiswa)
- 3 Program Studi (Teknik Informatika, Sistem Informasi, Teknologi Informasi)
- 8 Dosen (2 umum + 2 per prodi: 2 IF, 2 SI, 2 TI)
- 45 Mahasiswa (15 per prodi)
- 9 Mata Kuliah (3 per prodi)
- 9 CPL (3 per prodi)
- 27 MK-CPL Mapping (setiap MK ke 3 CPL)
- 81 Sub-CPMK (3 per MK-CPL)
- 15 Threshold Status (5 per prodi)

OPERATIONAL DATA:
- 9 Kelas (3 per prodi dengan dosen sesuai prodi)
- 135 Enrollment (setiap mahasiswa ke 3 kelas di prodinya)
- 1,215 Nilai Sub-CPMK (135 enrollment × 9 sub-cpmk)
- 405 Capaian CPL MK (135 enrollment × 3 CPL)
- 135 Capaian CPL Mahasiswa (45 mahasiswa × 3 CPL)

AUTHENTICATION & AUTHORIZATION:
- 57 Users (1 superadmin + 3 admin + 8 dosen + 45 mahasiswa)
- 46 Role Permissions (untuk 4 roles)
- 3 Sample Refresh Tokens
- 4 Sample Auth Audit Logs

CREDENTIALS:
SUPERADMIN:
- Superadmin: superadmin@kampus.ac.id / password123

ADMIN PRODI:
- Admin IF: admin.if@kampus.ac.id / password123
- Admin SI: admin.si@kampus.ac.id / password123
- Admin TI: admin.ti@kampus.ac.id / password123

DOSEN:
- Dosen Umum 1: ahmad.fauzi@kampus.ac.id / password123 (NIDN00001)
- Dosen Umum 2: siti.nurhaliza@kampus.ac.id / password123 (NIDN00002)
- Dosen IF 1: budi.raharjo@kampus.ac.id / password123 (NIDN00101)
- Dosen IF 2: dewi.sartika@kampus.ac.id / password123 (NIDN00102)
- Dosen SI 1: eko.wijayanto@kampus.ac.id / password123 (NIDN00201)
- Dosen SI 2: fitri.handayani@kampus.ac.id / password123 (NIDN00202)
- Dosen TI 1: gunawan.saputra@kampus.ac.id / password123 (NIDN00301)
- Dosen TI 2: hani.puspita@kampus.ac.id / password123 (NIDN00302)

MAHASISWA:
- Mahasiswa IF: if2023001@student.ac.id / password123 (dan seterusnya sampai if2023015)
- Mahasiswa SI: si2023001@student.ac.id / password123 (dan seterusnya sampai si2023015)
- Mahasiswa TI: ti2023001@student.ac.id / password123 (dan seterusnya sampai ti2023015)

RELASI YANG DIJAGA:
✓ Setiap prodi memiliki 2 dosen khusus
✓ Kelas diampu oleh dosen sesuai prodinya
✓ Mahasiswa hanya enroll di kelas sesuai prodinya
✓ Nilai sub-cpmk hanya untuk sub-cpmk yang ada di kelas tersebut
✓ Capaian CPL MK dihitung dari nilai sub-cpmk
✓ Capaian CPL Mahasiswa dihitung dari capaian CPL MK
✓ User entity_id merujuk ke dosen/mahasiswa yang benar
✓ Role permissions sesuai dengan akses yang dibutuhkan

CARA MENJALANKAN:
1. Pastikan DDL (CREATE TABLE) sudah dijalankan terlebih dahulu
2. Jalankan file ini: psql -U username -d database_name -f seed_dummy_kompleks.sql
3. Verifikasi dengan query: SELECT * FROM program_studi;
4. Test login dengan credentials di atas

*/
