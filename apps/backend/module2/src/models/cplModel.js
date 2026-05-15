const pool = require("../config/db");

/**
 * CPL MODEL
 * Mengelola data Capaian Pembelajaran Lulusan (CPL)
 */

// Ambil semua CPL
const getAllCPL = async () => {
  const query = `
    SELECT 
      c.id,
      c.kode_cpl,
      c.deskripsi,
      c.prodi_id,
      c.is_active,
      ps.nama_prodi,
      ps.kode_prodi,
      ps.jenjang
    FROM cpl c
    JOIN program_studi ps ON c.prodi_id = ps.id
    ORDER BY c.kode_cpl ASC
  `;

  const result = await pool.query(query);
  return result.rows;
};

// Ambil CPL berdasarkan ID
const getCPLById = async (id) => {
  const query = `
    SELECT 
      c.id,
      c.kode_cpl,
      c.deskripsi,
      c.prodi_id,
      c.is_active,
      ps.nama_prodi,
      ps.kode_prodi,
      ps.jenjang
    FROM cpl c
    JOIN program_studi ps ON c.prodi_id = ps.id
    WHERE c.id = $1
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Ambil CPL berdasarkan prodi
const getCPLByProdiId = async (prodiId) => {
  const query = `
    SELECT 
      id,
      kode_cpl,
      deskripsi,
      prodi_id,
      is_active
    FROM cpl
    WHERE prodi_id = $1
    ORDER BY kode_cpl ASC
  `;

  const result = await pool.query(query, [prodiId]);
  return result.rows;
};

// Buat CPL baru
const createCPL = async (kodeCPL, deskripsi, prodiId, isActive = true) => {
  const query = `
    INSERT INTO cpl (
      kode_cpl,
      deskripsi,
      prodi_id,
      is_active
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;

  const values = [kodeCPL, deskripsi, prodiId, isActive];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Update CPL
const updateCPL = async (id, kodeCPL, deskripsi, prodiId, isActive) => {
  const query = `
    UPDATE cpl
    SET 
      kode_cpl = $2,
      deskripsi = $3,
      prodi_id = $4,
      is_active = $5
    WHERE id = $1
    RETURNING *
  `;

  const values = [id, kodeCPL, deskripsi, prodiId, isActive];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Hapus CPL
const deleteCPL = async (id) => {
  const query = `DELETE FROM cpl WHERE id = $1 RETURNING *`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  getAllCPL,
  getCPLById,
  getCPLByProdiId,
  createCPL,
  updateCPL,
  deleteCPL,
};
