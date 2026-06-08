const pool = require("../config/db");

/**
 * KELAS MODEL
 * Mengelola data kelas (mata kuliah yang dibuka untuk semester tertentu)
 * Database: UUID-based
 */

// Ambil semua kelas
const getAllKelas = async () => {
  const query = `
    SELECT 
      kelas.id,
      kelas.mk_id,
      kelas.dosen_id,
      kelas.tahun_akademik,
      kelas.semester_aktif,
      kelas.nama_kelas,
      mk.kode_mk,
      mk.nama_mk,
      mk.sks,
      mk.semester as semester_mk,
      mk.prodi_id,
      d.nama as nama_dosen,
      ps.nama_prodi
    FROM kelas
    JOIN mata_kuliah mk ON kelas.mk_id = mk.id
    LEFT JOIN dosen d ON kelas.dosen_id = d.id
    JOIN program_studi ps ON mk.prodi_id = ps.id
    ORDER BY kelas.tahun_akademik DESC, kelas.semester_aktif DESC
  `;

  const result = await pool.query(query);
  return result.rows;
};

// Ambil kelas berdasarkan ID
const getKelasById = async (id) => {
  const query = `
    SELECT 
      kelas.id,
      kelas.mk_id,
      kelas.dosen_id,
      kelas.tahun_akademik,
      kelas.semester_aktif,
      kelas.nama_kelas,
      mk.kode_mk,
      mk.nama_mk,
      mk.sks,
      mk.prodi_id,
      d.nama as nama_dosen,
      d.nidn,
      ps.nama_prodi
    FROM kelas
    JOIN mata_kuliah mk ON kelas.mk_id = mk.id
    LEFT JOIN dosen d ON kelas.dosen_id = d.id
    JOIN program_studi ps ON mk.prodi_id = ps.id
    WHERE kelas.id = $1
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Ambil kelas berdasarkan dosen
const getKelasByDosenId = async (dosenId) => {
  const query = `
    SELECT 
      kelas.id,
      kelas.mk_id,
      kelas.tahun_akademik,
      kelas.semester_aktif,
      kelas.nama_kelas,
      mk.kode_mk,
      mk.nama_mk,
      mk.sks,
      mk.prodi_id,
      COUNT(e.id) as jumlah_mahasiswa
    FROM kelas
    JOIN mata_kuliah mk ON kelas.mk_id = mk.id
    LEFT JOIN enrollment e ON kelas.id = e.kelas_id
    WHERE kelas.dosen_id = $1
    GROUP BY kelas.id, kelas.mk_id, mk.kode_mk, mk.nama_mk, mk.sks, mk.prodi_id
    ORDER BY kelas.tahun_akademik DESC, kelas.semester_aktif DESC
  `;

  const result = await pool.query(query, [dosenId]);
  return result.rows;
};

// Ambil kelas berdasarkan mahasiswa (kelas yang diikuti mahasiswa)
const getKelasByMahasiswaId = async (mahasiswaId) => {
  const query = `
    SELECT 
      kelas.id,
      kelas.mk_id,
      kelas.tahun_akademik,
      kelas.semester_aktif,
      kelas.nama_kelas,
      mk.kode_mk,
      mk.nama_mk,
      mk.sks,
      mk.prodi_id,
      d.nama as nama_dosen,
      d.nidn,
      ps.nama_prodi,
      e.id as enrollment_id
    FROM enrollment e
    JOIN kelas ON e.kelas_id = kelas.id
    JOIN mata_kuliah mk ON kelas.mk_id = mk.id
    LEFT JOIN dosen d ON kelas.dosen_id = d.id
    JOIN program_studi ps ON mk.prodi_id = ps.id
    WHERE e.mahasiswa_id = $1
    ORDER BY kelas.tahun_akademik DESC, kelas.semester_aktif DESC
  `;

  const result = await pool.query(query, [mahasiswaId]);
  return result.rows;
};

// Buat kelas baru
const createKelas = async (mkId, dosenId, tahunAkademik, semesterAktif, namaKelas) => {
  const query = `
    INSERT INTO kelas (
      mk_id,
      dosen_id,
      tahun_akademik,
      semester_aktif,
      nama_kelas
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;

  const values = [mkId, dosenId, tahunAkademik, semesterAktif, namaKelas];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Update kelas
const updateKelas = async (id, mkId, dosenId, tahunAkademik, semesterAktif, namaKelas) => {
  const query = `
    UPDATE kelas
    SET 
      mk_id = $2,
      dosen_id = $3,
      tahun_akademik = $4,
      semester_aktif = $5,
      nama_kelas = $6
    WHERE id = $1
    RETURNING *
  `;

  const values = [id, mkId, dosenId, tahunAkademik, semesterAktif, namaKelas];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Hapus kelas
const deleteKelas = async (id) => {
  const query = `DELETE FROM kelas WHERE id = $1 RETURNING *`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  getAllKelas,
  getKelasById,
  getKelasByDosenId,
  getKelasByMahasiswaId,
  createKelas,
  updateKelas,
  deleteKelas,
};
