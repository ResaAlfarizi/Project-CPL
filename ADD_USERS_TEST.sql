-- ============================================
-- TAMBAH USER TEST (DOSEN & MAHASISWA)
-- ============================================
-- Script ini akan menambah:
-- - 2 Dosen (dengan data di tabel dosen)
-- - 3 Mahasiswa (dengan data di tabel mahasiswa)
-- ============================================

-- ============================================
-- STEP 1: CEK ROLE ID
-- ============================================
SELECT id, nama_role FROM roles WHERE nama_role IN ('Dosen', 'Mahasiswa');

-- ============================================
-- STEP 2: CEK PRODI ID (Teknik Informatika)
-- ============================================
SELECT id, kode_prodi, nama_prodi FROM program_studi WHERE kode_prodi = 'IF';

-- ============================================
-- STEP 3: TAMBAH DOSEN
-- ============================================

-- Dosen 1: Dr. Ahmad Wijaya
INSERT INTO users (
    id,
    email,
    password,
    role_id,
    prodi_id,
    is_active,
    created_at,
    updated_at
)
VALUES (
    gen_random_uuid(),
    'dosen1@university.ac.id',
    '$2b$10$rZ5qH8vK9X.YJ5xN3mW8/.vYxGz5qH8vK9X.YJ5xN3mW8/.vYxGz5q', -- password: admin123
    (SELECT id FROM roles WHERE nama_role = 'Dosen' LIMIT 1),
    (SELECT id FROM program_studi WHERE kode_prodi = 'IF' LIMIT 1),
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO dosen (
    id,
    nidn,
    nama,
    user_id,
    prodi_id,
    created_at,
    updated_at
)
VALUES (
    gen_random_uuid(),
    '0123456789',
    'Dr. Ahmad Wijaya, S.Kom., M.Kom.',
    (SELECT id FROM users WHERE email = 'dosen1@university.ac.id' LIMIT 1),
    (SELECT id FROM program_studi WHERE kode_prodi = 'IF' LIMIT 1),
    NOW(),
    NOW()
)
ON CONFLICT DO NOTHING;

-- Dosen 2: Dr. Budi Santoso
INSERT INTO users (
    id,
    email,
    password,
    role_id,
    prodi_id,
    is_active,
    created_at,
    updated_at
)
VALUES (
    gen_random_uuid(),
    'dosen2@university.ac.id',
    '$2b$10$rZ5qH8vK9X.YJ5xN3mW8/.vYxGz5qH8vK9X.YJ5xN3mW8/.vYxGz5q', -- password: admin123
    (SELECT id FROM roles WHERE nama_role = 'Dosen' LIMIT 1),
    (SELECT id FROM program_studi WHERE kode_prodi = 'IF' LIMIT 1),
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO dosen (
    id,
    nidn,
    nama,
    user_id,
    prodi_id,
    created_at,
    updated_at
)
VALUES (
    gen_random_uuid(),
    '0987654321',
    'Dr. Budi Santoso, S.T., M.T.',
    (SELECT id FROM users WHERE email = 'dosen2@university.ac.id' LIMIT 1),
    (SELECT id FROM program_studi WHERE kode_prodi = 'IF' LIMIT 1),
    NOW(),
    NOW()
)
ON CONFLICT DO NOTHING;

-- ============================================
-- STEP 4: TAMBAH MAHASISWA
-- ============================================

-- Mahasiswa 1: Andi Pratama
INSERT INTO users (
    id,
    email,
    password,
    role_id,
    prodi_id,
    is_active,
    created_at,
    updated_at
)
VALUES (
    gen_random_uuid(),
    'andi.pratama@student.ac.id',
    '$2b$10$rZ5qH8vK9X.YJ5xN3mW8/.vYxGz5qH8vK9X.YJ5xN3mW8/.vYxGz5q', -- password: admin123
    (SELECT id FROM roles WHERE nama_role = 'Mahasiswa' LIMIT 1),
    (SELECT id FROM program_studi WHERE kode_prodi = 'IF' LIMIT 1),
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO mahasiswa (
    id,
    nim,
    nama,
    user_id,
    prodi_id,
    angkatan,
    created_at,
    updated_at
)
VALUES (
    gen_random_uuid(),
    '2021001',
    'Andi Pratama',
    (SELECT id FROM users WHERE email = 'andi.pratama@student.ac.id' LIMIT 1),
    (SELECT id FROM program_studi WHERE kode_prodi = 'IF' LIMIT 1),
    2021,
    NOW(),
    NOW()
)
ON CONFLICT DO NOTHING;

-- Mahasiswa 2: Budi Setiawan
INSERT INTO users (
    id,
    email,
    password,
    role_id,
    prodi_id,
    is_active,
    created_at,
    updated_at
)
VALUES (
    gen_random_uuid(),
    'budi.setiawan@student.ac.id',
    '$2b$10$rZ5qH8vK9X.YJ5xN3mW8/.vYxGz5qH8vK9X.YJ5xN3mW8/.vYxGz5q', -- password: admin123
    (SELECT id FROM roles WHERE nama_role = 'Mahasiswa' LIMIT 1),
    (SELECT id FROM program_studi WHERE kode_prodi = 'IF' LIMIT 1),
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO mahasiswa (
    id,
    nim,
    nama,
    user_id,
    prodi_id,
    angkatan,
    created_at,
    updated_at
)
VALUES (
    gen_random_uuid(),
    '2021002',
    'Budi Setiawan',
    (SELECT id FROM users WHERE email = 'budi.setiawan@student.ac.id' LIMIT 1),
    (SELECT id FROM program_studi WHERE kode_prodi = 'IF' LIMIT 1),
    2021,
    NOW(),
    NOW()
)
ON CONFLICT DO NOTHING;

-- Mahasiswa 3: Citra Dewi
INSERT INTO users (
    id,
    email,
    password,
    role_id,
    prodi_id,
    is_active,
    created_at,
    updated_at
)
VALUES (
    gen_random_uuid(),
    'citra.dewi@student.ac.id',
    '$2b$10$rZ5qH8vK9X.YJ5xN3mW8/.vYxGz5qH8vK9X.YJ5xN3mW8/.vYxGz5q', -- password: admin123
    (SELECT id FROM roles WHERE nama_role = 'Mahasiswa' LIMIT 1),
    (SELECT id FROM program_studi WHERE kode_prodi = 'IF' LIMIT 1),
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO mahasiswa (
    id,
    nim,
    nama,
    user_id,
    prodi_id,
    angkatan,
    created_at,
    updated_at
)
VALUES (
    gen_random_uuid(),
    '2022001',
    'Citra Dewi',
    (SELECT id FROM users WHERE email = 'citra.dewi@student.ac.id' LIMIT 1),
    (SELECT id FROM program_studi WHERE kode_prodi = 'IF' LIMIT 1),
    2022,
    NOW(),
    NOW()
)
ON CONFLICT DO NOTHING;

-- ============================================
-- STEP 5: VERIFIKASI DATA
-- ============================================

-- Cek semua user Dosen dan Mahasiswa
SELECT 
    u.id,
    u.email,
    r.nama_role,
    ps.nama_prodi,
    u.is_active,
    u.created_at
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
LEFT JOIN program_studi ps ON u.prodi_id = ps.id
WHERE r.nama_role IN ('Dosen', 'Mahasiswa')
ORDER BY r.nama_role, u.email;

-- Cek data dosen
SELECT 
    d.id,
    d.nidn,
    d.nama,
    u.email,
    ps.nama_prodi
FROM dosen d
LEFT JOIN users u ON d.user_id = u.id
LEFT JOIN program_studi ps ON d.prodi_id = ps.id
ORDER BY d.nama;

-- Cek data mahasiswa
SELECT 
    m.id,
    m.nim,
    m.nama,
    m.angkatan,
    u.email,
    ps.nama_prodi
FROM mahasiswa m
LEFT JOIN users u ON m.user_id = u.id
LEFT JOIN program_studi ps ON m.prodi_id = ps.id
ORDER BY m.nim;

-- ============================================
-- RINGKASAN DATA YANG DITAMBAHKAN
-- ============================================
-- 
-- DOSEN (2 orang):
-- 1. Dr. Ahmad Wijaya, S.Kom., M.Kom.
--    Email: dosen1@university.ac.id
--    Password: admin123
--    NIDN: 0123456789
--
-- 2. Dr. Budi Santoso, S.T., M.T.
--    Email: dosen2@university.ac.id
--    Password: admin123
--    NIDN: 0987654321
--
-- MAHASISWA (3 orang):
-- 1. Andi Pratama (NIM: 2021001, Angkatan: 2021)
--    Email: andi.pratama@student.ac.id
--    Password: admin123
--
-- 2. Budi Setiawan (NIM: 2021002, Angkatan: 2021)
--    Email: budi.setiawan@student.ac.id
--    Password: admin123
--
-- 3. Citra Dewi (NIM: 2022001, Angkatan: 2022)
--    Email: citra.dewi@student.ac.id
--    Password: admin123
--
-- ============================================
