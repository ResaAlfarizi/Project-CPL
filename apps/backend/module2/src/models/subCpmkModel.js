const pool = require("../config/db");

/**
 * SUB-CPMK MODEL
 * Mengelola data Sub-CPMK (Sub Capaian Pembelajaran Mata Kuliah)
 * Sub-CPMK terikat ke mk_cpl (pemetaan MK ke CPL)
 */

// Ambil semua Sub-CPMK
const getAllSubCPMK = async () => {
  const query = `
    SELECT 
      sc.id,
      sc.kode_sub_cpmk,
      sc.deskripsi,
      sc.mk_cpl_id,
      sc.bobot,
      mc.mk_id,
      mc.cpl_id,
      mc.bobot as bobot_mk_ke_cpl,
      mk.kode_mk,
      mk.nama_mk,
      mk.sks,
      mk.semester,
      cpl.kode_cpl,
      cpl.deskripsi as deskripsi_cpl
    FROM sub_cpmk sc
    JOIN mk_cpl mc ON sc.mk_cpl_id = mc.id
    JOIN mata_kuliah mk ON mc.mk_id = mk.id
    JOIN cpl ON mc.cpl_id = cpl.id
    ORDER BY sc.kode_sub_cpmk ASC
  `;

  const result = await pool.query(query);
  return result.rows;
};

// Ambil Sub-CPMK berdasarkan ID
const getSubCPMKById = async (id) => {
  const query = `
    SELECT 
      sc.id,
      sc.kode_sub_cpmk,
      sc.deskripsi,
      sc.mk_cpl_id,
      sc.bobot,
      mc.mk_id,
      mc.cpl_id,
      mc.bobot as bobot_mk_ke_cpl,
      mk.kode_mk,
      mk.nama_mk,
      mk.sks,
      mk.semester,
      cpl.kode_cpl,
      cpl.deskripsi as deskripsi_cpl
    FROM sub_cpmk sc
    JOIN mk_cpl mc ON sc.mk_cpl_id = mc.id
    JOIN mata_kuliah mk ON mc.mk_id = mk.id
    JOIN cpl ON mc.cpl_id = cpl.id
    WHERE sc.id = $1
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Ambil Sub-CPMK berdasarkan MK_CPL
const getSubCPMKByMKCPLId = async (mkCplId) => {
  const query = `
    SELECT 
      sc.id,
      sc.kode_sub_cpmk,
      sc.deskripsi,
      sc.mk_cpl_id,
      sc.bobot,
      cpl.kode_cpl
    FROM sub_cpmk sc
    JOIN mk_cpl mc ON sc.mk_cpl_id = mc.id
    JOIN cpl ON mc.cpl_id = cpl.id
    WHERE sc.mk_cpl_id = $1
    ORDER BY sc.kode_sub_cpmk ASC
  `;

  const result = await pool.query(query, [mkCplId]);
  return result.rows;
};

// Ambil Sub-CPMK berdasarkan MK
const getSubCPMKByMKId = async (mkId) => {
  const query = `
    SELECT 
      sc.id,
      sc.kode_sub_cpmk,
      sc.deskripsi,
      sc.mk_cpl_id,
      sc.bobot,
      mc.cpl_id,
      cpl.kode_cpl
    FROM sub_cpmk sc
    JOIN mk_cpl mc ON sc.mk_cpl_id = mc.id
    JOIN cpl ON mc.cpl_id = cpl.id
    WHERE mc.mk_id = $1
    ORDER BY sc.kode_sub_cpmk ASC
  `;

  const result = await pool.query(query, [mkId]);
  return result.rows;
};

// Ambil Sub-CPMK berdasarkan dosen (hanya MK yang diampu)
const getSubCPMKByDosenId = async (dosenId) => {
  const query = `
    SELECT DISTINCT
      sc.id,
      sc.kode_sub_cpmk,
      sc.deskripsi,
      sc.mk_cpl_id,
      sc.bobot,
      mc.cpl_id,
      mc.mk_id,
      cpl.kode_cpl,
      mk.kode_mk,
      mk.nama_mk
    FROM sub_cpmk sc
    JOIN mk_cpl mc ON sc.mk_cpl_id = mc.id
    JOIN cpl ON mc.cpl_id = cpl.id
    JOIN mata_kuliah mk ON mc.mk_id = mk.id
    WHERE mc.mk_id IN (
      SELECT DISTINCT k.mk_id 
      FROM kelas k 
      WHERE k.dosen_id = $1
    )
    ORDER BY mk.nama_mk, sc.kode_sub_cpmk ASC
  `;

  const result = await pool.query(query, [dosenId]);
  return result.rows;
};

// Ambil Sub-CPMK berdasarkan CPL
const getSubCPMKByCPLId = async (cplId) => {
  const query = `
    SELECT 
      sc.id,
      sc.kode_sub_cpmk,
      sc.deskripsi,
      sc.mk_cpl_id,
      sc.bobot,
      mc.mk_id,
      mk.kode_mk,
      mk.nama_mk
    FROM sub_cpmk sc
    JOIN mk_cpl mc ON sc.mk_cpl_id = mc.id
    JOIN mata_kuliah mk ON mc.mk_id = mk.id
    WHERE mc.cpl_id = $1
    ORDER BY sc.kode_sub_cpmk ASC
  `;

  const result = await pool.query(query, [cplId]);
  return result.rows;
};

// Buat Sub-CPMK baru
const createSubCPMK = async (kodeSubCPMK, deskripsi, mkCplId, bobot) => {
  const query = `
    INSERT INTO sub_cpmk (
      kode_sub_cpmk,
      deskripsi,
      mk_cpl_id,
      bobot
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;

  const values = [kodeSubCPMK, deskripsi, mkCplId, bobot];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Update Sub-CPMK
const updateSubCPMK = async (id, kodeSubCPMK, deskripsi, mkCplId, bobot) => {
  const query = `
    UPDATE sub_cpmk
    SET 
      kode_sub_cpmk = $2,
      deskripsi = $3,
      mk_cpl_id = $4,
      bobot = $5
    WHERE id = $1
    RETURNING *
  `;

  const values = [id, kodeSubCPMK, deskripsi, mkCplId, bobot];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Hapus Sub-CPMK
const deleteSubCPMK = async (id) => {
  const query = `DELETE FROM sub_cpmk WHERE id = $1 RETURNING *`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  getAllSubCPMK,
  getSubCPMKById,
  getSubCPMKByMKCPLId,
  getSubCPMKByMKId,
  getSubCPMKByDosenId,
  getSubCPMKByCPLId,
  createSubCPMK,
  updateSubCPMK,
  deleteSubCPMK,
};
