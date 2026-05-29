-- ============================================
-- CEK MATA KULIAH YANG SUDAH DITAMBAHKAN
-- ============================================

-- 1. Cek semua mata kuliah (module1)
SELECT 
    id,
    kode_mk,
    nama_mk,
    sks,
    prodi_id,
    semester,
    created_at
FROM mk
ORDER BY created_at DESC
LIMIT 20;

-- 2. Cek mata kuliah dengan join ke program_studi
SELECT 
    mk.id,
    mk.kode_mk,
    mk.nama_mk,
    mk.sks,
    mk.semester,
    ps.kode_prodi,
    ps.nama_prodi,
    mk.created_at
FROM mk
LEFT JOIN program_studi ps ON mk.prodi_id = ps.id
ORDER BY mk.created_at DESC
LIMIT 20;

-- 3. Cek mata kuliah untuk prodi tertentu (ganti 'IF' dengan kode prodi Anda)
SELECT 
    mk.id,
    mk.kode_mk,
    mk.nama_mk,
    mk.sks,
    ps.nama_prodi
FROM mk
JOIN program_studi ps ON mk.prodi_id = ps.id
WHERE ps.kode_prodi = 'IF'
ORDER BY mk.kode_mk;

-- 4. Cek kelas yang sudah dibuat
SELECT 
    k.id,
    mk.kode_mk,
    mk.nama_mk,
    k.tahun_akademik,
    k.semester_aktif,
    k.nama_kelas,
    d.nama as nama_dosen
FROM kelas k
JOIN mk ON k.mk_id = mk.id
LEFT JOIN dosen d ON k.dosen_id = d.id
ORDER BY k.created_at DESC
LIMIT 20;
