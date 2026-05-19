-- Script untuk membuat user test untuk login
-- Password: test123

-- Pastikan tabel users sudah ada
-- Jika belum, jalankan migration backend terlebih dahulu

-- Cek user yang sudah ada
SELECT id, email, role_id, created_at FROM users;

-- Hapus user test jika sudah ada (optional)
-- DELETE FROM users WHERE email = 'test@example.com';

-- Buat user test dengan role SuperAdmin (role_id = 1)
-- Password hash untuk 'test123' menggunakan bcrypt dengan salt rounds 10
INSERT INTO users (email, password_hash, role_id, created_at, updated_at)
VALUES (
  'test@example.com',
  '$2b$10$rKvVPZqGhf5vZ5qGhf5vZOqGhf5vZ5qGhf5vZ5qGhf5vZ5qGhf5vZ',
  1,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Buat user dosen untuk testing role
INSERT INTO users (email, password_hash, role_id, created_at, updated_at)
VALUES (
  'dosen@example.com',
  '$2b$10$rKvVPZqGhf5vZ5qGhf5vZOqGhf5vZ5qGhf5vZ5qGhf5vZ5qGhf5vZ',
  2,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Buat user mahasiswa untuk testing role
INSERT INTO users (email, password_hash, role_id, created_at, updated_at)
VALUES (
  'mahasiswa@example.com',
  '$2b$10$rKvVPZqGhf5vZ5qGhf5vZOqGhf5vZ5qGhf5vZ5qGhf5vZ5qGhf5vZ',
  3,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Verifikasi user berhasil dibuat
SELECT id, email, role_id, created_at FROM users WHERE email IN ('test@example.com', 'dosen@example.com', 'mahasiswa@example.com');

-- CATATAN:
-- Password hash di atas adalah contoh, Anda perlu generate hash yang benar
-- Gunakan script hash.js di backend untuk generate password hash:
-- node hash.js test123

-- Atau gunakan endpoint register untuk membuat user:
-- POST http://localhost:3000/api/auth/register
-- Body: { "email": "test@example.com", "password": "test123", "role_id": 1 }
