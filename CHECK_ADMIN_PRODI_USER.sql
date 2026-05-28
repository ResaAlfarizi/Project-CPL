-- ============================================
-- CEK USER ADMIN PRODI YANG SUDAH ADA
-- ============================================

-- 1. Cek semua user dengan role Admin Prodi
SELECT 
    u.id,
    u.email,
    r.nama_role,
    ps.kode_prodi,
    ps.nama_prodi,
    u.is_active,
    u.created_at
FROM users u
JOIN roles r ON u.role_id = r.id
LEFT JOIN program_studi ps ON u.prodi_id = ps.id
WHERE r.nama_role = 'Admin Prodi'
ORDER BY u.created_at DESC;

-- 2. Jika tidak ada, tampilkan semua roles yang tersedia
SELECT * FROM roles ORDER BY nama_role;

-- 3. Tampilkan semua program studi
SELECT id, kode_prodi, nama_prodi FROM program_studi ORDER BY kode_prodi;
