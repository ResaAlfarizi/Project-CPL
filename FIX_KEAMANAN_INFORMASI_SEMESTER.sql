-- Script untuk memperbaiki semester Mata Kuliah Keamanan Informasi
-- Dari semester 1 menjadi semester 3

-- 1. Cek data sebelum update
SELECT id, kode_mk, nama_mk, semester 
FROM mata_kuliah 
WHERE nama_mk LIKE '%Keamanan%Informasi%';

-- 2. Update semester di tabel mata_kuliah menjadi 3
UPDATE mata_kuliah 
SET semester = 3 
WHERE nama_mk LIKE '%Keamanan%Informasi%' 
  AND semester != 3;

-- 3. Verifikasi setelah update
SELECT id, kode_mk, nama_mk, semester 
FROM mata_kuliah 
WHERE nama_mk LIKE '%Keamanan%Informasi%';

-- 4. Cek data di tabel kelas (semester_aktif)
SELECT k.id, k.mk_id, mk.nama_mk, mk.semester as semester_mk, k.semester_aktif, k.tahun_akademik
FROM kelas k
JOIN mata_kuliah mk ON k.mk_id = mk.id
WHERE mk.nama_mk LIKE '%Keamanan%Informasi%';

-- 5. PENTING: Update semester_aktif di tabel kelas agar sesuai dengan semester di mata_kuliah
-- Ini akan memastikan kelas dibuka di semester yang benar
UPDATE kelas 
SET semester_aktif = 3 
WHERE mk_id IN (
  SELECT id FROM mata_kuliah WHERE nama_mk LIKE '%Keamanan%Informasi%'
) AND semester_aktif != 3;

-- 6. Verifikasi final - pastikan semester_mk dan semester_aktif sama
SELECT 
  k.id as kelas_id,
  mk.kode_mk,
  mk.nama_mk,
  mk.semester as semester_mk,
  k.semester_aktif,
  k.tahun_akademik,
  CASE 
    WHEN mk.semester = k.semester_aktif THEN '✓ Sesuai'
    ELSE '✗ Tidak Sesuai'
  END as status
FROM kelas k
JOIN mata_kuliah mk ON k.mk_id = mk.id
WHERE mk.nama_mk LIKE '%Keamanan%Informasi%';

-- 7. Cek semua mata kuliah untuk memastikan tidak ada yang salah
SELECT 
  mk.kode_mk,
  mk.nama_mk,
  mk.semester as semester_mk,
  k.semester_aktif,
  k.tahun_akademik,
  CASE 
    WHEN mk.semester = k.semester_aktif THEN '✓'
    ELSE '✗ PERLU DIPERBAIKI'
  END as status
FROM mata_kuliah mk
LEFT JOIN kelas k ON mk.id = k.mk_id
ORDER BY mk.semester ASC, mk.kode_mk ASC;
