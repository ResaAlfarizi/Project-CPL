const pool = require("../config/db");

/**
 * CAPAIAN MODEL
 * Mengelola analisis capaian CPL mahasiswa
 * Menggunakan VIEW yang sudah ada di database
 */

// Ambil capaian CPL mahasiswa (menggunakan view)
const getCapaianByMahasiswaId = async (mahasiswaId) => {
  const query = `
    SELECT 
      v.cpl_id,
      c.kode_cpl,
      c.deskripsi as deskripsi_cpl,
      v.nilai_cpl_total as rata_rata_nilai,
      ts.nilai_min as nilai_minimum,
      ts.nama_status as status_capaian
    FROM v_capaian_cpl_mahasiswa v
    JOIN cpl c ON v.cpl_id = c.id
    LEFT JOIN program_studi ps ON c.prodi_id = ps.id
    LEFT JOIN threshold_status ts ON ps.id = ts.prodi_id 
      AND v.nilai_cpl_total BETWEEN ts.nilai_min AND ts.nilai_max
    WHERE v.mahasiswa_id = $1
    ORDER BY c.kode_cpl
  `;

  const result = await pool.query(query, [mahasiswaId]);
  return result.rows;
};

// Ambil capaian CPL untuk seluruh mahasiswa di prodi
const getCapaianByProdiId = async (prodiId) => {
  const query = `
    SELECT 
      v.cpl_id,
      c.kode_cpl,
      c.deskripsi as deskripsi_cpl,
      ROUND(AVG(v.nilai_cpl_total)::numeric, 2) as rata_rata_nilai,
      COUNT(DISTINCT v.mahasiswa_id) as jumlah_mahasiswa,
      ts.nilai_min as nilai_minimum,
      ts.nama_status as status_capaian
    FROM v_capaian_cpl_mahasiswa v
    JOIN cpl c ON v.cpl_id = c.id
    JOIN mahasiswa m ON v.mahasiswa_id = m.id
    LEFT JOIN threshold_status ts ON m.prodi_id = ts.prodi_id 
      AND AVG(v.nilai_cpl_total) BETWEEN ts.nilai_min AND ts.nilai_max
    WHERE m.prodi_id = $1
    GROUP BY v.cpl_id, c.kode_cpl, c.deskripsi, ts.nilai_min, ts.nama_status
    ORDER BY c.kode_cpl
  `;

  const result = await pool.query(query, [prodiId]);
  return result.rows;
};

// Ambil capaian CPL untuk kelas tertentu (summary)
const getCapaianByKelasId = async (kelasId) => {
  const query = `
    SELECT 
      v.cpl_id,
      c.kode_cpl,
      c.deskripsi as deskripsi_cpl,
      ROUND(AVG(v.nilai_capaian_cpl_mk)::numeric, 2) as rata_rata_nilai,
      COUNT(DISTINCT e.mahasiswa_id) as jumlah_mahasiswa
    FROM v_capaian_cpl_mk v
    JOIN cpl c ON v.cpl_id = c.id
    JOIN enrollment e ON v.enrollment_id = e.id
    WHERE e.kelas_id = $1
    GROUP BY v.cpl_id, c.kode_cpl, c.deskripsi
    ORDER BY c.kode_cpl
  `;

  const result = await pool.query(query, [kelasId]);
  return result.rows;
};

// Ambil detail capaian per mahasiswa untuk kelas tertentu
const getCapaianDetailByKelasId = async (kelasId) => {
  const query = `
    SELECT 
      e.id as enrollment_id,
      e.mahasiswa_id,
      m.nim,
      m.nama as nama_mahasiswa,
      v.cpl_id,
      c.kode_cpl,
      c.deskripsi as deskripsi_cpl,
      v.nilai_capaian_cpl_mk as nilai_capaian,
      ts.nama_status as status
    FROM enrollment e
    JOIN mahasiswa m ON e.mahasiswa_id = m.id
    LEFT JOIN v_capaian_cpl_mk v ON e.id = v.enrollment_id
    LEFT JOIN cpl c ON v.cpl_id = c.id
    LEFT JOIN threshold_status ts ON m.prodi_id = ts.prodi_id 
      AND v.nilai_capaian_cpl_mk BETWEEN ts.nilai_min AND ts.nilai_max
    WHERE e.kelas_id = $1
    ORDER BY m.nim, c.kode_cpl
  `;

  const result = await pool.query(query, [kelasId]);
  return result.rows;
};

// Ambil detail capaian mahasiswa per mata kuliah
const getCapaianDetailByMahasiswaId = async (mahasiswaId) => {
  const query = `
    SELECT 
      mk.kode_mk,
      mk.nama_mk,
      k.tahun_akademik,
      k.semester_aktif,
      c.kode_cpl,
      c.deskripsi as deskripsi_cpl,
      v.nilai_capaian_cpl_mk as nilai,
      ts.nilai_min as nilai_minimum,
      ts.nama_status as status
    FROM v_capaian_cpl_mk v
    JOIN enrollment e ON v.enrollment_id = e.id
    JOIN kelas k ON e.kelas_id = k.id
    JOIN mata_kuliah mk ON k.mk_id = mk.id
    JOIN cpl c ON v.cpl_id = c.id
    JOIN mahasiswa m ON e.mahasiswa_id = m.id
    LEFT JOIN threshold_status ts ON m.prodi_id = ts.prodi_id 
      AND v.nilai_capaian_cpl_mk BETWEEN ts.nilai_min AND ts.nilai_max
    WHERE e.mahasiswa_id = $1
    ORDER BY k.tahun_akademik DESC, k.semester_aktif DESC, c.kode_cpl
  `;

  const result = await pool.query(query, [mahasiswaId]);
  return result.rows;
};

// Ambil mahasiswa yang belum mencapai CPL tertentu
const getMahasiswaBelumCapaiCPL = async (cplId, prodiId) => {
  const query = `
    SELECT 
      m.id,
      m.nim,
      m.nama,
      v.nilai_cpl_total as rata_rata_nilai,
      ts.nilai_min as nilai_minimum
    FROM mahasiswa m
    LEFT JOIN v_capaian_cpl_mahasiswa v ON m.id = v.mahasiswa_id AND v.cpl_id = $1
    LEFT JOIN threshold_status ts ON m.prodi_id = ts.prodi_id 
      AND v.nilai_cpl_total BETWEEN ts.nilai_min AND ts.nilai_max
    WHERE m.prodi_id = $2
      AND (v.nilai_cpl_total < ts.nilai_min OR v.nilai_cpl_total IS NULL)
    ORDER BY m.nim
  `;

  const result = await pool.query(query, [cplId, prodiId]);
  return result.rows;
};

module.exports = {
  getCapaianByMahasiswaId,
  getCapaianByProdiId,
  getCapaianByKelasId,
  getCapaianDetailByKelasId,
  getCapaianDetailByMahasiswaId,
  getMahasiswaBelumCapaiCPL,
};
