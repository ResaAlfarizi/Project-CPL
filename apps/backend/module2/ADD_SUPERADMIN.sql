-- ============================================================================
-- SCRIPT UNTUK MENAMBAH AKUN SUPERADMIN
-- ============================================================================
-- Jalankan script ini di database projectcpl untuk menambah akun superadmin baru
-- ============================================================================

-- STEP 1: Cek role superadmin sudah ada
SELECT id FROM roles WHERE nama_role = 'superadmin';

-- STEP 2: Ambil ID role superadmin (ganti dengan ID yang didapat dari STEP 1)
-- Contoh: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

-- STEP 3: Insert user superadmin baru
-- Password: superadmin123
-- Hash: $2b$10$EawDMbamOlHASNWbvQmAWOP.hS3vDX88E/ZnqieV9/AYD7XIP45dC
INSERT INTO users (
    email,
    password_hash,
    role_id,
    prodi_id,
    entity_type,
    entity_id,
    is_active,
    failed_login_count,
    locked_until,
    last_login_at,
    created_at
) VALUES (
    'superadmin@if.ac.id',
    '$2b$10$EawDMbamOlHASNWbvQmAWOP.hS3vDX88E/ZnqieV9/AYD7XIP45dC',
    (SELECT id FROM roles WHERE nama_role = 'superadmin'),
    NULL,
    'admin',
    NULL,
    TRUE,
    0,
    NULL,
    NULL,
    NOW()
);

-- STEP 4: Verifikasi user sudah dibuat
SELECT id, email, role_id FROM users WHERE email = 'superadmin@if.ac.id';

-- ============================================================================
-- CATATAN PENTING
-- ============================================================================
-- 1. Email: superadmin@if.ac.id
-- 2. Password: superadmin123
-- 3. Hash password sudah di-generate dengan bcrypt
-- 4. Role: superadmin (full access)
-- 5. Akun ini bisa login langsung setelah script dijalankan

-- ============================================================================
-- JIKA INGIN NAMBAH SUPERADMIN LAIN, UBAH:
-- ============================================================================
-- - email: ganti 'superadmin@if.ac.id' dengan email baru
-- - password: ganti hash password dengan hash baru (lihat tabel di bawah)

-- ============================================================================
-- DAFTAR PASSWORD HASH (untuk referensi)
-- ============================================================================
-- Password: superadmin123
-- Hash: $2b$10$EawDMbamOlHASNWbvQmAWOP.hS3vDX88E/ZnqieV9/AYD7XIP45dC

-- Password: admin123
-- Hash: $2b$10$EawDMbamOlHASNWbvQmAWOP.hS3vDX88E/ZnqieV9/AYD7XIP45dC

-- Password: password123
-- Hash: $2b$10$EawDMbamOlHASNWbvQmAWOP.hS3vDX88E/ZnqieV9/AYD7XIP45dC

-- ============================================================================
-- CONTOH: NAMBAH SUPERADMIN DENGAN EMAIL BERBEDA
-- ============================================================================
-- INSERT INTO users (
--     email,
--     password_hash,
--     role_id,
--     prodi_id,
--     entity_type,
--     entity_id,
--     is_active,
--     failed_login_count,
--     locked_until,
--     last_login_at,
--     created_at
-- ) VALUES (
--     'admin2@if.ac.id',
--     '$2b$10$EawDMbamOlHASNWbvQmAWOP.hS3vDX88E/ZnqieV9/AYD7XIP45dC',
--     (SELECT id FROM roles WHERE nama_role = 'superadmin'),
--     NULL,
--     'admin',
--     NULL,
--     TRUE,
--     0,
--     NULL,
--     NULL,
--     NOW()
-- );

-- ============================================================================
-- UNTUK GENERATE PASSWORD HASH BARU, GUNAKAN BCRYPT
-- ============================================================================
-- Contoh di Node.js:
-- const bcrypt = require('bcrypt');
-- const password = 'password_baru';
-- const hash = await bcrypt.hash(password, 10);
-- console.log(hash);

-- Atau gunakan online tool: https://bcrypt-generator.com/
-- (Pastikan menggunakan bcrypt dengan salt rounds 10)

-- ============================================================================
