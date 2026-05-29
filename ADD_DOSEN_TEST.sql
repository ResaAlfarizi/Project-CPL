 -- ============================================
-- TAMBAH DOSEN TEST
-- ============================================

-- 1. Cek ID role Dosen
SELECT id, nama_role FROM roles WHERE nama_role = 'Dosen';

-- 2. Cek ID program studi Teknik Informatika
SELECT id, kode_prodi, nama_prodi FROM program_studi WHERE kode_prodi = 'IF';

-- 3. Tambah user Dosen
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
ON CONFLICT (email) DO NOTHING
RETURNING id;

-- 4. Tambah data dosen (gunakan user_id dari step 3)
-- Ganti <USER_ID> dengan ID yang dikembalikan dari query di atas
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

-- 5. Tambah dosen kedua
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

-- 6. Verifikasi dosen sudah dibuat
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

-- ============================================
-- CATATAN:
-- ============================================
-- Dosen 1:
--   Email: dosen1@university.ac.id
--   Password: admin123
--   NIDN: 0123456789
--   Nama: Dr. Ahmad Wijaya, S.Kom., M.Kom.
--
-- Dosen 2:
--   Email: dosen2@university.ac.id
--   Password: admin123
--   NIDN: 0987654321
--   Nama: Dr. Budi Santoso, S.T., M.T.
-- ============================================
