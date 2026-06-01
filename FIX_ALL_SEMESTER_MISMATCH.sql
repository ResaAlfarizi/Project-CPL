-- Script untuk memperbaiki SEMUA ketidaksesuaian semester antara mata_kuliah dan kelas
-- Masalah: semester_aktif di tabel kelas tidak sesuai dengan semester di tabel mata_kuliah

-- 1. CEK SEMUA KETIDAKSESUAIAN
-- Query ini akan menampilkan semua kelas yang semester_aktif-nya tidak sesuai dengan semester mata kuliah
SELECT 
  k.id as kelas_id,
  mk.kode_mk,
  mk.nama_mk,
  mk.semester as semester_seharusnya,
  k.semester_aktif as semester_saat_ini,
  k.tahun_akademik,
  '❌ TIDAK SESUAI' as status
FROM kelas k
JOIN mata_kuliah mk ON k.mk_id = mk.id
WHERE mk.semester != k.semester_aktif
ORDER BY mk.semester ASC, mk.kode_mk ASC;

-- 2. FIX OTOMATIS - Update semester_aktif di kelas agar sesuai dengan semester di mata_kuliah
-- HATI-HATI: Ini akan mengubah semua data kelas yang tidak sesuai
UPDATE kelas k
SET semester_aktif = mk.semester
FROM mata_kuliah mk
WHERE k.mk_id = mk.id
  AND k.semester_aktif != mk.semester;

-- 3. VERIFIKASI SETELAH FIX
-- Query ini akan menampilkan semua kelas dan status kesesuaiannya
SELECT 
  k.id as kelas_id,
  mk.kode_mk,
  mk.nama_mk,
  mk.semester as semester_mk,
  k.semester_aktif,
  k.tahun_akademik,
  CASE 
    WHEN mk.semester = k.semester_aktif THEN '✅ SESUAI'
    ELSE '❌ MASIH TIDAK SESUAI'
  END as status
FROM kelas k
JOIN mata_kuliah mk ON k.mk_id = mk.id
ORDER BY mk.semester ASC, mk.kode_mk ASC;

-- 4. KHUSUS KEAMANAN INFORMASI
-- Pastikan Keamanan Informasi sudah semester 3
SELECT 
  mk.kode_mk,
  mk.nama_mk,
  mk.semester as semester_mk,
  k.semester_aktif,
  k.tahun_akademik
FROM mata_kuliah mk
LEFT JOIN kelas k ON mk.id = k.mk_id
WHERE mk.nama_mk LIKE '%Keamanan%Informasi%';

-- 5. SUMMARY - Hitung berapa banyak yang sudah sesuai vs tidak sesuai
SELECT 
  COUNT(*) as total_kelas,
  SUM(CASE WHEN mk.semester = k.semester_aktif THEN 1 ELSE 0 END) as sesuai,
  SUM(CASE WHEN mk.semester != k.semester_aktif THEN 1 ELSE 0 END) as tidak_sesuai
FROM kelas k
JOIN mata_kuliah mk ON k.mk_id = mk.id;
