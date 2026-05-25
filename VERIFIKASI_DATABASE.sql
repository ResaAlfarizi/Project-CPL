-- ============================================
-- VERIFIKASI DATABASE
-- Jalankan query ini di pgAdmin untuk cek data
-- ============================================

-- 1. CEK USER MAHASISWA
SELECT 
    u.id,
    u.email,
    u.role_id,
    r.nama_role,
    u.entity_id,
    m.nim,
    m.nama as nama_mahasiswa,
    m.angkatan,
    ps.nama_prodi
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
LEFT JOIN mahasiswa m ON u.entity_id = m.id
LEFT JOIN program_studi ps ON m.prodi_id = ps.id
WHERE u.email = 'mhs1@if.ac.id';

-- Expected result:
-- email: mhs1@if.ac.id
-- role: Mahasiswa
-- nim: 23010001
-- nama: Rizky Kurniawan
-- prodi: Teknik Lingkungan

-- ============================================
-- 2. CEK PASSWORD HASH
SELECT 
    email,
    password_hash,
    LENGTH(password_hash) as hash_length
FROM users 
WHERE email = 'mhs1@if.ac.id';

-- Expected:
-- hash_length should be 60 (bcrypt hash)
-- hash should start with $2b$10$

-- ============================================
-- 3. CEK CAPAIAN MAHASISWA
SELECT 
    m.nim,
    m.nama,
    c.kode_cpl,
    vcc.persentase_capaian,
    vcc.status_capaian
FROM mahasiswa m
JOIN v_capaian_cpl_mahasiswa vcc ON m.id = vcc.mahasiswa_id
JOIN cpl c ON vcc.cpl_id = c.id
WHERE m.nim = '23010001'
ORDER BY c.kode_cpl;

-- Expected: 5 rows with persentase ~86-87%

-- ============================================
-- 4. CEK SEMUA MAHASISWA USERS
SELECT 
    u.email,
    m.nim,
    m.nama,
    ps.nama_prodi,
    CASE 
        WHEN u.password_hash IS NULL THEN '❌ NO PASSWORD'
        WHEN LENGTH(u.password_hash) = 60 THEN '✅ VALID HASH'
        ELSE '⚠️ INVALID HASH'
    END as password_status
FROM users u
JOIN roles r ON u.role_id = r.id
LEFT JOIN mahasiswa m ON u.entity_id = m.id
LEFT JOIN program_studi ps ON m.prodi_id = ps.id
WHERE r.nama_role = 'Mahasiswa'
ORDER BY u.email;

-- Expected: 5 mahasiswa dengan password hash valid

-- ============================================
-- 5. CEK PROGRAM STUDI
SELECT 
    id,
    kode_prodi,
    nama_prodi,
    jenjang
FROM program_studi
ORDER BY kode_prodi;

-- Expected: 4 prodi (TL, TM, HK, DKV)

-- ============================================
-- 6. CEK CPL
SELECT 
    c.kode_cpl,
    c.deskripsi,
    ps.nama_prodi
FROM cpl c
JOIN program_studi ps ON c.prodi_id = ps.id
ORDER BY ps.kode_prodi, c.kode_cpl;

-- Expected: 15 CPL total

-- ============================================
-- 7. CEK MATA KULIAH
SELECT 
    mk.kode_mk,
    mk.nama_mk,
    mk.sks,
    ps.nama_prodi
FROM mata_kuliah mk
JOIN program_studi ps ON mk.prodi_id = ps.id
ORDER BY ps.kode_prodi, mk.kode_mk;

-- Expected: 15 mata kuliah

-- ============================================
-- 8. CEK ENROLLMENT MAHASISWA
SELECT 
    m.nim,
    m.nama as nama_mahasiswa,
    mk.kode_mk,
    mk.nama_mk,
    k.semester_aktif,
    k.tahun_akademik
FROM enrollment e
JOIN mahasiswa m ON e.mahasiswa_id = m.id
JOIN kelas k ON e.kelas_id = k.id
JOIN mata_kuliah mk ON k.mk_id = mk.id
WHERE m.nim = '23010001'
ORDER BY k.semester_aktif;

-- Expected: Beberapa enrollment untuk mahasiswa Rizky

-- ============================================
-- 9. CEK NILAI SUB-CPMK
SELECT 
    m.nim,
    m.nama,
    mk.kode_mk,
    sc.kode_sub_cpmk,
    ns.nilai_sub_cpmk
FROM nilai_sub_cpmk ns
JOIN enrollment e ON ns.enrollment_id = e.id
JOIN mahasiswa m ON e.mahasiswa_id = m.id
JOIN sub_cpmk sc ON ns.sub_cpmk_id = sc.id
JOIN mk_cpl mc ON sc.mk_cpl_id = mc.id
JOIN mata_kuliah mk ON mc.mk_id = mk.id
WHERE m.nim = '23010001'
ORDER BY mk.kode_mk, sc.kode_sub_cpmk;

-- Expected: Beberapa nilai untuk mahasiswa Rizky

-- ============================================
-- 10. SUMMARY COUNT
SELECT 
    'Program Studi' as tabel,
    COUNT(*) as jumlah
FROM program_studi
UNION ALL
SELECT 'CPL', COUNT(*) FROM cpl
UNION ALL
SELECT 'Mahasiswa', COUNT(*) FROM mahasiswa
UNION ALL
SELECT 'Dosen', COUNT(*) FROM dosen
UNION ALL
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'Mata Kuliah', COUNT(*) FROM mata_kuliah
UNION ALL
SELECT 'Kelas', COUNT(*) FROM kelas
UNION ALL
SELECT 'Enrollment', COUNT(*) FROM enrollment
UNION ALL
SELECT 'Sub-CPMK', COUNT(*) FROM sub_cpmk
UNION ALL
SELECT 'Nilai Sub-CPMK', COUNT(*) FROM nilai_sub_cpmk;

-- Expected:
-- Program Studi: 4
-- CPL: 15
-- Mahasiswa: 10
-- Dosen: 10
-- Users: 7 (5 mahasiswa + 2 dosen)
-- Mata Kuliah: 15
-- Kelas: 15
-- Enrollment: 10
-- Sub-CPMK: 16
-- Nilai Sub-CPMK: 33
