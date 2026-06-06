const pool = require("../config/db");

/**
 * MK_CPL MODEL
 * Mengelola pemetaan Mata Kuliah ke CPL
 */

// Ambil semua MK_CPL
const getAllMKCPL = async () => {
  const query = `
    SELECT 
      mc.id,
      mc.mk_id,
      mc.cpl_id,
      mc.bobot,
      mk.kode_mk,
      mk.nama_mk,
      mk.prodi_id,
      cpl.kode_cpl,
      cpl.deskripsi as deskripsi_cpl,
      cpl.prodi_id as cpl_prodi_id
    FROM mk_cpl mc
    JOIN mata_kuliah mk ON mc.mk_id = mk.id
    JOIN cpl ON mc.cpl_id = cpl.id
    ORDER BY mk.nama_mk, cpl.kode_cpl
  `;

  const result = await pool.query(query);
  return result.rows;
};

// Ambil MK_CPL berdasarkan dosen (hanya MK yang diampu)
const getMKCPLByDosenId = async (dosenId) => {
  const query = `
    SELECT DISTINCT
      mc.id,
      mc.mk_id,
      mc.cpl_id,
      mc.bobot,
      mk.kode_mk,
      mk.nama_mk,
      cpl.kode_cpl,
      cpl.deskripsi as deskripsi_cpl
    FROM mk_cpl mc
    JOIN mata_kuliah mk ON mc.mk_id = mk.id
    JOIN cpl ON mc.cpl_id = cpl.id
    WHERE mc.mk_id IN (
      SELECT DISTINCT k.mk_id 
      FROM kelas k 
      WHERE k.dosen_id = $1
    )
    ORDER BY mk.nama_mk, cpl.kode_cpl
  `;

  const result = await pool.query(query, [dosenId]);
  return result.rows;
};

// Ambil MK_CPL berdasarkan MK
const getMKCPLByMKId = async (mkId) => {
  const query = `
    SELECT 
      mc.id,
      mc.mk_id,
      mc.cpl_id,
      mc.bobot,
      mk.kode_mk,
      mk.nama_mk,
      cpl.kode_cpl,
      cpl.deskripsi as deskripsi_cpl
    FROM mk_cpl mc
    JOIN mata_kuliah mk ON mc.mk_id = mk.id
    JOIN cpl ON mc.cpl_id = cpl.id
    WHERE mc.mk_id = $1
    ORDER BY cpl.kode_cpl
  `;

  const result = await pool.query(query, [mkId]);
  return result.rows;
};

// ✅ TAMBAHAN: CREATE MK_CPL
const createMKCPL = async (mk_id, cpl_id, bobot) => {
  const query = `
    INSERT INTO mk_cpl (mk_id, cpl_id, bobot)
    VALUES ($1, $2, $3)
    RETURNING id, mk_id, cpl_id, bobot
  `;

  const result = await pool.query(query, [mk_id, cpl_id, bobot]);
  return result.rows[0];
};

// ✅ TAMBAHAN: UPDATE MK_CPL
const updateMKCPL = async (id, mk_id, cpl_id, bobot) => {
  const query = `
    UPDATE mk_cpl
    SET mk_id = $2, cpl_id = $3, bobot = $4
    WHERE id = $1
    RETURNING id, mk_id, cpl_id, bobot
  `;

  const result = await pool.query(query, [id, mk_id, cpl_id, bobot]);
  return result.rows[0];
};

// ✅ TAMBAHAN: DELETE MK_CPL
const deleteMKCPL = async (id) => {
  const query = `DELETE FROM mk_cpl WHERE id = $1 RETURNING id`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// ✅ TAMBAHAN: GET MK_CPL BY ID
const getMKCPLById = async (id) => {
  const query = `
    SELECT 
      mc.id,
      mc.mk_id,
      mc.cpl_id,
      mc.bobot,
      mk.kode_mk,
      mk.nama_mk,
      cpl.kode_cpl,
      cpl.deskripsi as deskripsi_cpl
    FROM mk_cpl mc
    JOIN mata_kuliah mk ON mc.mk_id = mk.id
    JOIN cpl ON mc.cpl_id = cpl.id
    WHERE mc.id = $1
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  getAllMKCPL,
  getMKCPLByDosenId,
  getMKCPLByMKId,
  createMKCPL,
  updateMKCPL,
  deleteMKCPL,
  getMKCPLById,
};