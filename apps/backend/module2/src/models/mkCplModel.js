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
      cpl.kode_cpl,
      cpl.deskripsi as deskripsi_cpl
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

module.exports = {
  getAllMKCPL,
  getMKCPLByDosenId,
  getMKCPLByMKId,
};
