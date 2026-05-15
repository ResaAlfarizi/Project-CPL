const pool = require("../config/db");

/**
 * NILAI MODEL
 * Mengelola data nilai mahasiswa untuk setiap Sub-CPMK
 * Database: nilai_sub_cpmk (UUID-based)
 */

// Ambil semua nilai
const getAllNilai = async () => {
  const query = `
    SELECT 
      n.id,
      n.enrollment_id,
      n.sub_cpmk_id,
      n.nilai,
      n.input_at,
      m.nim,
      m.nama as nama_mahasiswa,
      k.tahun_akademik,
      k.semester_aktif,
      mk.kode_mk,
      mk.nama_mk,
      sc.kode_sub_cpmk,
      sc.deskripsi as deskripsi_sub_cpmk
    FROM nilai_sub_cpmk n
    JOIN enrollment e ON n.enrollment_id = e.id
    JOIN mahasiswa m ON e.mahasiswa_id = m.id
    JOIN kelas k ON e.kelas_id = k.id
    JOIN mata_kuliah mk ON k.mk_id = mk.id
    JOIN sub_cpmk sc ON n.sub_cpmk_id = sc.id
    ORDER BY n.input_at DESC
  `;

  const result = await pool.query(query);
  return result.rows;
};

// Ambil nilai berdasarkan ID
const getNilaiById = async (id) => {
  const query = `
    SELECT 
      n.id,
      n.enrollment_id,
      n.sub_cpmk_id,
      n.nilai,
      n.input_at,
      m.nim,
      m.nama as nama_mahasiswa,
      k.tahun_akademik,
      k.semester_aktif,
      mk.kode_mk,
      mk.nama_mk,
      sc.kode_sub_cpmk,
      sc.deskripsi as deskripsi_sub_cpmk
    FROM nilai_sub_cpmk n
    JOIN enrollment e ON n.enrollment_id = e.id
    JOIN mahasiswa m ON e.mahasiswa_id = m.id
    JOIN kelas k ON e.kelas_id = k.id
    JOIN mata_kuliah mk ON k.mk_id = mk.id
    JOIN sub_cpmk sc ON n.sub_cpmk_id = sc.id
    WHERE n.id = $1
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Ambil nilai berdasarkan enrollment
const getNilaiByEnrollmentId = async (enrollmentId) => {
  const query = `
    SELECT 
      n.id,
      n.sub_cpmk_id,
      n.nilai,
      sc.kode_sub_cpmk,
      sc.deskripsi as deskripsi_sub_cpmk,
      sc.bobot
    FROM nilai_sub_cpmk n
    JOIN sub_cpmk sc ON n.sub_cpmk_id = sc.id
    WHERE n.enrollment_id = $1
    ORDER BY sc.kode_sub_cpmk
  `;

  const result = await pool.query(query, [enrollmentId]);
  return result.rows;
};

// Ambil nilai berdasarkan mahasiswa
const getNilaiByMahasiswaId = async (mahasiswaId) => {
  const query = `
    SELECT 
      n.id,
      n.enrollment_id,
      n.sub_cpmk_id,
      n.nilai,
      k.tahun_akademik,
      k.semester_aktif,
      mk.kode_mk,
      mk.nama_mk,
      sc.kode_sub_cpmk,
      sc.deskripsi as deskripsi_sub_cpmk
    FROM nilai_sub_cpmk n
    JOIN enrollment e ON n.enrollment_id = e.id
    JOIN kelas k ON e.kelas_id = k.id
    JOIN mata_kuliah mk ON k.mk_id = mk.id
    JOIN sub_cpmk sc ON n.sub_cpmk_id = sc.id
    WHERE e.mahasiswa_id = $1
    ORDER BY k.tahun_akademik DESC, k.semester_aktif DESC, sc.kode_sub_cpmk
  `;

  const result = await pool.query(query, [mahasiswaId]);
  return result.rows;
};

// Ambil nilai berdasarkan kelas
const getNilaiByKelasId = async (kelasId) => {
  const query = `
    SELECT 
      n.id,
      n.enrollment_id,
      n.sub_cpmk_id,
      n.nilai,
      m.nim,
      m.nama as nama_mahasiswa,
      sc.kode_sub_cpmk,
      sc.deskripsi as deskripsi_sub_cpmk
    FROM nilai_sub_cpmk n
    JOIN enrollment e ON n.enrollment_id = e.id
    JOIN mahasiswa m ON e.mahasiswa_id = m.id
    JOIN sub_cpmk sc ON n.sub_cpmk_id = sc.id
    WHERE e.kelas_id = $1
    ORDER BY m.nim, sc.kode_sub_cpmk
  `;

  const result = await pool.query(query, [kelasId]);
  return result.rows;
};

// Cek apakah nilai sudah ada
const checkNilaiExists = async (enrollmentId, subCpmkId) => {
  const query = `
    SELECT * FROM nilai_sub_cpmk
    WHERE enrollment_id = $1 AND sub_cpmk_id = $2
  `;

  const result = await pool.query(query, [enrollmentId, subCpmkId]);
  return result.rows[0];
};

// Buat nilai baru
const createNilai = async (enrollmentId, subCpmkId, nilaiAngka) => {
  const query = `
    INSERT INTO nilai_sub_cpmk (
      enrollment_id,
      sub_cpmk_id,
      nilai
    )
    VALUES ($1, $2, $3)
    RETURNING *
  `;

  const values = [enrollmentId, subCpmkId, nilaiAngka];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Update nilai
const updateNilai = async (id, nilaiAngka) => {
  const query = `
    UPDATE nilai_sub_cpmk
    SET 
      nilai = $2,
      input_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `;

  const values = [id, nilaiAngka];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Hapus nilai
const deleteNilai = async (id) => {
  const query = `DELETE FROM nilai_sub_cpmk WHERE id = $1 RETURNING *`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  getAllNilai,
  getNilaiById,
  getNilaiByEnrollmentId,
  getNilaiByMahasiswaId,
  getNilaiByKelasId,
  checkNilaiExists,
  createNilai,
  updateNilai,
  deleteNilai,
};
