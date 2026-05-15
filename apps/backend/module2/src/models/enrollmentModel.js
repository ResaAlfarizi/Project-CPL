const pool = require("../config/db");

/**
 * ENROLLMENT MODEL
 * Mengelola data pendaftaran mahasiswa ke kelas (KRS)
 * Database: UUID-based
 */

// Ambil semua enrollment
const getAllEnrollment = async () => {
  const query = `
    SELECT 
      e.id,
      e.kelas_id,
      e.mahasiswa_id,
      m.nim,
      m.nama as nama_mahasiswa,
      k.tahun_akademik,
      k.semester_aktif,
      k.nama_kelas,
      mk.kode_mk,
      mk.nama_mk,
      d.nama as nama_dosen
    FROM enrollment e
    JOIN mahasiswa m ON e.mahasiswa_id = m.id
    JOIN kelas k ON e.kelas_id = k.id
    JOIN mata_kuliah mk ON k.mk_id = mk.id
    LEFT JOIN dosen d ON k.dosen_id = d.id
    ORDER BY e.id
  `;

  const result = await pool.query(query);
  return result.rows;
};

// Ambil enrollment berdasarkan ID
const getEnrollmentById = async (id) => {
  const query = `
    SELECT 
      e.id,
      e.kelas_id,
      e.mahasiswa_id,
      m.nim,
      m.nama as nama_mahasiswa,
      k.tahun_akademik,
      k.semester_aktif,
      k.nama_kelas,
      mk.kode_mk,
      mk.nama_mk,
      mk.sks,
      d.nama as nama_dosen
    FROM enrollment e
    JOIN mahasiswa m ON e.mahasiswa_id = m.id
    JOIN kelas k ON e.kelas_id = k.id
    JOIN mata_kuliah mk ON k.mk_id = mk.id
    LEFT JOIN dosen d ON k.dosen_id = d.id
    WHERE e.id = $1
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Ambil enrollment berdasarkan mahasiswa
const getEnrollmentByMahasiswaId = async (mahasiswaId) => {
  const query = `
    SELECT 
      e.id,
      e.kelas_id,
      k.tahun_akademik,
      k.semester_aktif,
      k.nama_kelas,
      mk.kode_mk,
      mk.nama_mk,
      mk.sks,
      d.nama as nama_dosen
    FROM enrollment e
    JOIN kelas k ON e.kelas_id = k.id
    JOIN mata_kuliah mk ON k.mk_id = mk.id
    LEFT JOIN dosen d ON k.dosen_id = d.id
    WHERE e.mahasiswa_id = $1
    ORDER BY k.tahun_akademik DESC, k.semester_aktif DESC
  `;

  const result = await pool.query(query, [mahasiswaId]);
  return result.rows;
};

// Ambil enrollment berdasarkan kelas
const getEnrollmentByKelasId = async (kelasId) => {
  const query = `
    SELECT 
      e.id,
      e.mahasiswa_id,
      m.nim,
      m.nama as nama_mahasiswa,
      m.angkatan
    FROM enrollment e
    JOIN mahasiswa m ON e.mahasiswa_id = m.id
    WHERE e.kelas_id = $1
    ORDER BY m.nim
  `;

  const result = await pool.query(query, [kelasId]);
  return result.rows;
};

// Cek apakah mahasiswa sudah terdaftar di kelas
const checkEnrollmentExists = async (mahasiswaId, kelasId) => {
  const query = `
    SELECT * FROM enrollment
    WHERE mahasiswa_id = $1 AND kelas_id = $2
  `;

  const result = await pool.query(query, [mahasiswaId, kelasId]);
  return result.rows[0];
};

// Buat enrollment baru (mahasiswa daftar kelas)
const createEnrollment = async (mahasiswaId, kelasId) => {
  const query = `
    INSERT INTO enrollment (
      mahasiswa_id,
      kelas_id
    )
    VALUES ($1, $2)
    RETURNING *
  `;

  const values = [mahasiswaId, kelasId];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Hapus enrollment (drop kelas)
const deleteEnrollment = async (id) => {
  const query = `DELETE FROM enrollment WHERE id = $1 RETURNING *`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  getAllEnrollment,
  getEnrollmentById,
  getEnrollmentByMahasiswaId,
  getEnrollmentByKelasId,
  checkEnrollmentExists,
  createEnrollment,
  deleteEnrollment,
};
