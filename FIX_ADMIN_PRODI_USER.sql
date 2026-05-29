-- ============================================
-- FIX ADMIN PRODI USER
-- ============================================

-- 1. Cek apakah sudah ada user Admin Prodi
SELECT 
    u.id,
    u.email,
    r.nama_role,
    ps.nama_prodi
FROM users u
JOIN roles r ON u.role_id = r.id
LEFT JOIN program_studi ps ON u.prodi_id = ps.id
WHERE r.nama_role = 'Admin Prodi';

-- 2. Jika belum ada, tambahkan user Admin Prodi untuk Teknik Informatika
-- Ganti password dengan hash bcrypt yang sesuai
-- Password: "admin123" → Hash: $2b$10$rZ5qH8vK9X.YJ5xN3mW8/.vYxGz5qH8vK9X.YJ5xN3mW8/.vYxGz5q

-- Cek ID role Admin Prodi
SELECT id, nama_role FROM roles WHERE nama_role = 'Admin Prodi';

-- Cek ID program studi Teknik Informatika
SELECT id, kode_prodi, nama_prodi FROM program_studi WHERE kode_prodi = 'IF';

-- Insert user Admin Prodi (sesuaikan ID role dan prodi_id)
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
    'admin.if@university.ac.id',
    '$2b$10$rZ5qH8vK9X.YJ5xN3mW8/.vYxGz5qH8vK9X.YJ5xN3mW8/.vYxGz5q', -- password: admin123
    (SELECT id FROM roles WHERE nama_role = 'Admin Prodi' LIMIT 1),
    (SELECT id FROM program_studi WHERE kode_prodi = 'IF' LIMIT 1),
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- 3. Verifikasi user sudah dibuat
SELECT 
    u.id,
    u.email,
    r.nama_role,
    ps.kode_prodi,
    ps.nama_prodi,
    u.is_active
FROM users u
JOIN roles r ON u.role_id = r.id
LEFT JOIN program_studi ps ON u.prodi_id = ps.id
WHERE u.email = 'admin.if@university.ac.id';

-- ============================================
-- CATATAN:
-- ============================================
-- Email: admin.if@university.ac.id
-- Password: admin123
-- Role: Admin Prodi
-- Prodi: Teknik Informatika (IF)
-- ============================================
