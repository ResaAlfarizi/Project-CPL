const pool = require("../config/db");

/**
 * PROGRAM STUDI MODEL
 * Mengelola data program studi
 */

// Ambil semua program studi
const getAllProdi = async () => {
  const query = `
    SELECT 
      id,
      kode_prodi,
      nama_prodi,
      jenjang,
      created_at
    FROM program_studi
    ORDER BY nama_prodi ASC
  `;

  const result = await pool.query(query);
  return result.rows;
};

// Ambil program studi berdasarkan ID
const getProdiById = async (id) => {
  const query = `
    SELECT 
      id,
      kode_prodi,
      nama_prodi,
      jenjang,
      created_at
    FROM program_studi
    WHERE id = $1
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Buat program studi baru
const createProdi = async (kodeProdi, namaProdi, jenjang) => {
  const query = `
    INSERT INTO program_studi (
      kode_prodi,
      nama_prodi,
      jenjang
    )
    VALUES ($1, $2, $3)
    RETURNING *
  `;

  const values = [kodeProdi, namaProdi, jenjang];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Update program studi
const updateProdi = async (id, kodeProdi, namaProdi, jenjang) => {
  const query = `
    UPDATE program_studi
    SET 
      kode_prodi = $2,
      nama_prodi = $3,
      jenjang = $4
    WHERE id = $1
    RETURNING *
  `;

  const values = [id, kodeProdi, namaProdi, jenjang];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Hapus program studi
const deleteProdi = async (id) => {
  const query = `DELETE FROM program_studi WHERE id = $1 RETURNING *`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  getAllProdi,
  getProdiById,
  createProdi,
  updateProdi,
  deleteProdi,
};
