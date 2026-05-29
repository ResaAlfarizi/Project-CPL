-- ============================================
-- CEK DATA DOSEN
-- ============================================

-- 1. Cek semua dosen
SELECT 
    d.id,
    d.nidn,
    d.nama,
    d.user_id,
    ps.kode_prodi,
    ps.nama_prodi,
    d.created_at
FROM dosen d
LEFT JOIN program_studi ps ON d.prodi_id = ps.id
ORDER BY d.created_at DESC;

-- 2. Cek user dengan role Dosen
SELECT 
    u.id,
    u.email,
    r.nama_role,
    u.prodi_id,
    ps.nama_prodi
FROM users u
JOIN roles r ON u.role_id = r.id
LEFT JOIN program_studi ps ON u.prodi_id = ps.id
WHERE r.nama_role = 'Dosen'
ORDER BY u.created_at DESC;

-- 3. Cek dosen dengan user_id yang valid
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

-- 4. Jika tidak ada dosen, cek struktur tabel
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'dosen'
ORDER BY ordinal_position;
