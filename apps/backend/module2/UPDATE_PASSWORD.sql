-- =============================================
-- UPDATE PASSWORD HASH
-- Password: password123
-- =============================================

-- Update password untuk semua user dummy
UPDATE users 
SET password_hash = '$2b$10$EawDMbamOlHASNWbvQmAWOP.hS3vDX88E/ZnqieV9/AYD7XIP45dC'
WHERE email IN ('admin@if.ac.id', 'dosen1@if.ac.id', 'mhs1@if.ac.id');

-- Verifikasi
SELECT email, 
       CASE 
         WHEN password_hash = '$2b$10$EawDMbamOlHASNWbvQmAWOP.hS3vDX88E/ZnqieV9/AYD7XIP45dC' 
         THEN 'OK' 
         ELSE 'BELUM' 
       END as status
FROM users
WHERE email IN ('admin@if.ac.id', 'dosen1@if.ac.id', 'mhs1@if.ac.id');
