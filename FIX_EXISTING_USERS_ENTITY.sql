-- ============================================
-- FIX EXISTING USERS - UPDATE ENTITY_ID
-- ============================================
-- Script ini akan memperbaiki user yang sudah ada
-- tapi entity_id-nya NULL
-- ============================================

-- ============================================
-- STEP 1: CEK USER DENGAN ENTITY_ID NULL
-- ============================================
SELECT 
    u.id,
    u.email,
    u.entity_type,
    u.entity_id,
    u.prodi_id
FROM users u
WHERE u.entity_type IN ('dosen', 'mahasiswa')
  AND u.entity_id IS NULL;

-- ============================================
-- STEP 2: UPDATE DOSEN - SET ENTITY_ID
-- ============================================
-- Update user dosen dengan entity_id dari tabel dosen
UPDATE users u
SET entity_id = d.id
FROM dosen d
WHERE u.entity_type = 'dosen'
  AND u.id = d.user_id
  AND u.entity_id IS NULL;

-- ============================================
-- STEP 3: UPDATE MAHASISWA - SET ENTITY_ID
-- ============================================
-- Update user mahasiswa dengan entity_id dari tabel mahasiswa
UPDATE users u
SET entity_id = m.id
FROM mahasiswa m
WHERE u.entity_type = 'mahasiswa'
  AND u.id = m.user_id
  AND u.entity_id IS NULL;

-- ============================================
-- STEP 4: VERIFIKASI HASIL
-- ============================================
-- Cek apakah masih ada user dengan entity_id NULL
SELECT 
    u.id,
    u.email,
    u.entity_type,
    u.entity_id,
    CASE 
        WHEN u.entity_type = 'dosen' THEN d.nama
        WHEN u.entity_type = 'mahasiswa' THEN m.nama
        ELSE NULL
    END as nama,
    CASE 
        WHEN u.entity_type = 'dosen' THEN d.nidn
        WHEN u.entity_type = 'mahasiswa' THEN m.nim
        ELSE NULL
    END as identifier
FROM users u
LEFT JOIN dosen d ON u.entity_type = 'dosen' AND u.entity_id = d.id
LEFT JOIN mahasiswa m ON u.entity_type = 'mahasiswa' AND u.entity_id = m.id
WHERE u.entity_type IN ('dosen', 'mahasiswa')
ORDER BY u.entity_type, u.email;

-- ============================================
-- STEP 5: CEK USER TANPA DATA DOSEN/MAHASISWA
-- ============================================
-- Jika ada user dosen tanpa data di tabel dosen
SELECT 
    u.id,
    u.email,
    u.entity_type,
    'Tidak ada data di tabel dosen' as status
FROM users u
LEFT JOIN dosen d ON u.id = d.user_id
WHERE u.entity_type = 'dosen' 
  AND d.id IS NULL

UNION ALL

-- Jika ada user mahasiswa tanpa data di tabel mahasiswa
SELECT 
    u.id,
    u.email,
    u.entity_type,
    'Tidak ada data di tabel mahasiswa' as status
FROM users u
LEFT JOIN mahasiswa m ON u.id = m.user_id
WHERE u.entity_type = 'mahasiswa' 
  AND m.id IS NULL;

-- ============================================
-- CATATAN:
-- ============================================
-- Jika STEP 5 mengembalikan rows, berarti ada user
-- yang tidak memiliki data di tabel dosen/mahasiswa.
-- 
-- Untuk memperbaikinya, jalankan script berikut:
-- ============================================

-- CREATE DOSEN DATA FOR ORPHAN USERS
-- (Uncomment jika ada user dosen tanpa data dosen)
/*
INSERT INTO dosen (id, nidn, nama, user_id, prodi_id, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    'NIDN' || LPAD(FLOOR(RANDOM() * 100000000)::TEXT, 8, '0'),
    SPLIT_PART(u.email, '@', 1),
    u.id,
    u.prodi_id,
    NOW(),
    NOW()
FROM users u
LEFT JOIN dosen d ON u.id = d.user_id
WHERE u.entity_type = 'dosen' 
  AND d.id IS NULL;

-- Update entity_id
UPDATE users u
SET entity_id = d.id
FROM dosen d
WHERE u.entity_type = 'dosen'
  AND u.id = d.user_id
  AND u.entity_id IS NULL;
*/

-- CREATE MAHASISWA DATA FOR ORPHAN USERS
-- (Uncomment jika ada user mahasiswa tanpa data mahasiswa)
/*
INSERT INTO mahasiswa (id, nim, nama, user_id, prodi_id, angkatan, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    'NIM' || LPAD(FLOOR(RANDOM() * 100000000)::TEXT, 8, '0'),
    SPLIT_PART(u.email, '@', 1),
    u.id,
    u.prodi_id,
    EXTRACT(YEAR FROM NOW()),
    NOW(),
    NOW()
FROM users u
LEFT JOIN mahasiswa m ON u.id = m.user_id
WHERE u.entity_type = 'mahasiswa' 
  AND m.id IS NULL;

-- Update entity_id
UPDATE users u
SET entity_id = m.id
FROM mahasiswa m
WHERE u.entity_type = 'mahasiswa'
  AND u.id = m.user_id
  AND u.entity_id IS NULL;
*/

-- ============================================
-- FINAL CHECK
-- ============================================
SELECT 
    u.id,
    u.email,
    u.entity_type,
    u.entity_id,
    CASE 
        WHEN u.entity_type = 'dosen' THEN d.nama
        WHEN u.entity_type = 'mahasiswa' THEN m.nama
        ELSE NULL
    END as nama,
    CASE 
        WHEN u.entity_type = 'dosen' THEN d.nidn
        WHEN u.entity_type = 'mahasiswa' THEN m.nim
        ELSE NULL
    END as identifier,
    p.nama_prodi
FROM users u
LEFT JOIN dosen d ON u.entity_type = 'dosen' AND u.entity_id = d.id
LEFT JOIN mahasiswa m ON u.entity_type = 'mahasiswa' AND u.entity_id = m.id
LEFT JOIN program_studi p ON u.prodi_id = p.id
WHERE u.entity_type IN ('dosen', 'mahasiswa')
ORDER BY u.entity_type, u.email;

-- ============================================
-- HASIL YANG DIHARAPKAN:
-- ============================================
-- Semua user harus memiliki:
-- 1. entity_id yang TIDAK NULL
-- 2. nama yang TIDAK NULL
-- 3. identifier (NIDN/NIM) yang TIDAK NULL
-- ============================================
