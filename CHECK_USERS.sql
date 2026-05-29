-- ============================================
-- CEK DATA USER (DOSEN & MAHASISWA)
-- ============================================

-- 1. Cek semua user dengan role Dosen dan Mahasiswa
SELECT 
    u.id,
    u.email,
    r.nama_role,
    ps.kode_prodi,
    ps.nama_prodi,
    u.is_active,
    u.created_at
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
LEFT JOIN program_studi ps ON u.prodi_id = ps.id
WHERE r.nama_role IN ('Dosen', 'Mahasiswa')
ORDER BY r.nama_role, u.email;

-- 2. Cek data dosen (dengan join ke tabel dosen)
SELECT 
    d.id,
    d.nidn,
    d.nama,
    u.email,
    ps.nama_prodi,
    u.is_active
FROM dosen d
LEFT JOIN users u ON d.user_id = u.id
LEFT JOIN program_studi ps ON d.prodi_id = ps.id
ORDER BY d.nama;

-- 3. Cek data mahasiswa (dengan join ke tabel mahasiswa)
SELECT 
    m.id,
    m.nim,
    m.nama,
    m.angkatan,
    u.email,
    ps.nama_prodi,
    u.is_active
FROM mahasiswa m
LEFT JOIN users u ON m.user_id = u.id
LEFT JOIN program_studi ps ON m.prodi_id = ps.id
ORDER BY m.nim;

-- 4. Hitung jumlah user per role
SELECT 
    r.nama_role,
    COUNT(u.id) as jumlah_user
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
WHERE r.nama_role IN ('Dosen', 'Mahasiswa')
GROUP BY r.nama_role
ORDER BY r.nama_role;

-- 5. Cek user yang tidak memiliki data di tabel dosen/mahasiswa (orphan users)
-- User Dosen tanpa data di tabel dosen
SELECT 
    u.id,
    u.email,
    'Dosen' as role,
    'Tidak ada data di tabel dosen' as status
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
LEFT JOIN dosen d ON u.id = d.user_id
WHERE r.nama_role = 'Dosen' AND d.id IS NULL

UNION ALL

-- User Mahasiswa tanpa data di tabel mahasiswa
SELECT 
    u.id,
    u.email,
    'Mahasiswa' as role,
    'Tidak ada data di tabel mahasiswa' as status
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
LEFT JOIN mahasiswa m ON u.id = m.user_id
WHERE r.nama_role = 'Mahasiswa' AND m.id IS NULL;

-- ============================================
-- CATATAN:
-- ============================================
-- Jika query 1 mengembalikan 0 rows, berarti tidak ada user Dosen/Mahasiswa
-- Jika query 2 atau 3 mengembalikan 0 rows, berarti tidak ada data dosen/mahasiswa
-- Jika query 5 mengembalikan rows, berarti ada user tanpa data lengkap (perlu diperbaiki)
-- ============================================
