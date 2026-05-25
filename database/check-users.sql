-- =============================================
-- CEK USERS DI DATABASE
-- =============================================

-- Cek semua users
SELECT 
    u.id,
    u.email,
    r.nama_role as role,
    u.entity_type,
    u.is_active,
    CASE 
        WHEN u.entity_type = 'mahasiswa' THEN m.nama
        WHEN u.entity_type = 'dosen' THEN d.nama
        ELSE 'Admin'
    END as nama
FROM users u
JOIN roles r ON u.role_id = r.id
LEFT JOIN mahasiswa m ON u.entity_id = m.id AND u.entity_type = 'mahasiswa'
LEFT JOIN dosen d ON u.entity_id = d.id AND u.entity_type = 'dosen'
ORDER BY r.nama_role;

-- Cek khusus mahasiswa
SELECT 
    u.id as user_id,
    u.email,
    r.nama_role,
    m.id as mahasiswa_id,
    m.nim,
    m.nama,
    m.angkatan,
    ps.nama_prodi
FROM users u
JOIN roles r ON u.role_id = r.id
LEFT JOIN mahasiswa m ON u.entity_id = m.id
LEFT JOIN program_studi ps ON m.prodi_id = ps.id
WHERE r.nama_role = 'Mahasiswa';
