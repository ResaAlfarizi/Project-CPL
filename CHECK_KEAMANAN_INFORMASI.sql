-- Cek data mata kuliah Keamanan Informasi
SELECT id, kode_mk, nama_mk, sks, semester, prodi_id, created_at
FROM mata_kuliah
WHERE nama_mk LIKE '%Keamanan%' OR kode_mk LIKE '%103%';

-- Jika ditemukan semester yang salah (semester 1 padahal seharusnya 3), jalankan query ini:
-- UPDATE mata_kuliah 
-- SET semester = 3 
-- WHERE nama_mk LIKE '%Keamanan Informasi%' AND semester = 1;

-- Cek semua mata kuliah untuk memastikan semester sudah benar
SELECT kode_mk, nama_mk, semester, prodi_id
FROM mata_kuliah
ORDER BY semester ASC, kode_mk ASC;
