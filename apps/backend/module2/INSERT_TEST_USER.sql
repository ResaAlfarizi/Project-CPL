-- Script untuk membuat test user dengan password yang benar
-- Password: test123
-- Hash: $2b$10$BtrKvcGZ05nJ89ljM8HHDe/k/wj5jXKDJ.1PDQsMtOV28d0PgPz9a

-- Cek apakah user sudah ada
SELECT * FROM users WHERE email = 'dosen3@if.ac.id';

-- Jika belum ada, jalankan query ini:
INSERT INTO users (email, password_hash, role_id, created_at, updated_at)
VALUES (
  'dosen3@if.ac.id',
  '$2b$10$BtrKvcGZ05nJ89ljM8HHDe/k/wj5jXKDJ.1PDQsMtOV28d0PgPz9a',
  2,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = '$2b$10$BtrKvcGZ05nJ89ljM8HHDe/k/wj5jXKDJ.1PDQsMtOV28d0PgPz9a',
  updated_at = NOW();

-- Verifikasi user berhasil dibuat
SELECT id, email, role_id, created_at FROM users WHERE email = 'dosen3@if.ac.id';

-- CATATAN:
-- Email: dosen3@if.ac.id (sesuai dengan email yang Anda coba login)
-- Password: test123
-- Role: 2 (Dosen)
-- Hash: $2b$10$BtrKvcGZ05nJ89ljM8HHDe/k/wj5jXKDJ.1PDQsMtOV28d0PgPz9a
