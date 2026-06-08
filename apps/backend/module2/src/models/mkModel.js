const pool = require("../config/db");

/**
 * MK MODEL (Module 2)
 * Mengelola CRUD Mata Kuliah dengan relasi ke CPL
 */

// Ambil semua mata kuliah dengan informasi prodi dan jumlah CPL
const getAllMK = async () => {
  const query = `
    SELECT 
      mk.id,
      mk.kode_mk,
      mk.nama_mk,
      mk.sks,
      mk.semester,
      mk.prodi_id,
      ps.nama_prodi,
      ps.kode_prodi,
      COUNT(DISTINCT mc.cpl_id) as cpl_count
    FROM mata_kuliah mk
    LEFT JOIN program_studi ps ON mk.prodi_id = ps.id
    LEFT JOIN mk_cpl mc ON mk.id = mc.mk_id
    GROUP BY mk.id, mk.kode_mk, mk.nama_mk, mk.sks, mk.semester, mk.prodi_id, ps.nama_prodi, ps.kode_prodi
    ORDER BY mk.kode_mk
  `;

  const result = await pool.query(query);
  return result.rows;
};

// Ambil MK berdasarkan ID dengan detail CPL yang terpetakan
const getMKById = async (mkId) => {
  const mkQuery = `
    SELECT 
      mk.id,
      mk.kode_mk,
      mk.nama_mk,
      mk.sks,
      mk.semester,
      mk.prodi_id,
      ps.nama_prodi,
      ps.kode_prodi
    FROM mata_kuliah mk
    LEFT JOIN program_studi ps ON mk.prodi_id = ps.id
    WHERE mk.id = $1
  `;

  const cplQuery = `
    SELECT 
      c.id,
      c.kode_cpl,
      c.deskripsi,
      mc.bobot
    FROM mk_cpl mc
    JOIN cpl c ON mc.cpl_id = c.id
    WHERE mc.mk_id = $1
    ORDER BY c.kode_cpl
  `;

  const [mkResult, cplResult] = await Promise.all([
    pool.query(mkQuery, [mkId]),
    pool.query(cplQuery, [mkId]),
  ]);

  if (mkResult.rows.length === 0) {
    throw new Error("Mata kuliah tidak ditemukan");
  }

  const mk = mkResult.rows[0];
  mk.cpls = cplResult.rows;
  mk.cpl_ids = cplResult.rows.map(c => c.id);
  mk.cpl_count = cplResult.rows.length;

  return mk;
};

// Buat mata kuliah baru dengan relasi CPL
const createMK = async ({ prodi_id, kode_mk, nama_mk, sks, semester, cpl_ids = [] }) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Insert mata kuliah
    const mkQuery = `
      INSERT INTO mata_kuliah (prodi_id, kode_mk, nama_mk, sks, semester)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const mkResult = await client.query(mkQuery, [prodi_id, kode_mk, nama_mk, sks, semester]);
    const newMK = mkResult.rows[0];

    // Insert relasi mk_cpl (bobot default 1, akan diatur di halaman bobot MK-CPL)
    if (cpl_ids && cpl_ids.length > 0) {
      const mkCplValues = cpl_ids
        .map((cplId, idx) => `($1, $${idx + 2}, 1)`)
        .join(", ");
      
      const mkCplQuery = `
        INSERT INTO mk_cpl (mk_id, cpl_id, bobot)
        VALUES ${mkCplValues}
      `;
      
      await client.query(mkCplQuery, [newMK.id, ...cpl_ids]);
    }

    await client.query("COMMIT");
    return newMK;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// Update mata kuliah dan relasi CPL
const updateMK = async (mkId, { prodi_id, kode_mk, nama_mk, sks, semester, cpl_ids = [] }) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Update mata kuliah
    const mkQuery = `
      UPDATE mata_kuliah
      SET prodi_id = $1, kode_mk = $2, nama_mk = $3, sks = $4, semester = $5
      WHERE id = $6
      RETURNING *
    `;
    const mkResult = await client.query(mkQuery, [prodi_id, kode_mk, nama_mk, sks, semester, mkId]);
    
    if (mkResult.rows.length === 0) {
      throw new Error("Mata kuliah tidak ditemukan");
    }

    // Hapus relasi di capaian_cpl_mk yang mereferensi mk_cpl dari mk_id ini
    await client.query(`
      DELETE FROM capaian_cpl_mk 
      WHERE mk_cpl_id IN (
        SELECT id FROM mk_cpl WHERE mk_id = $1
      )
    `, [mkId]);

    // Hapus relasi lama di mk_cpl
    await client.query("DELETE FROM mk_cpl WHERE mk_id = $1", [mkId]);

    // Insert relasi baru (bobot default 1, akan diatur di halaman bobot MK-CPL)
    if (cpl_ids && cpl_ids.length > 0) {
      const mkCplValues = cpl_ids
        .map((cplId, idx) => `($1, $${idx + 2}, 1)`)
        .join(", ");
      
      const mkCplQuery = `
        INSERT INTO mk_cpl (mk_id, cpl_id, bobot)
        VALUES ${mkCplValues}
      `;
      
      await client.query(mkCplQuery, [mkId, ...cpl_ids]);
    }

    await client.query("COMMIT");
    return mkResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// Hapus mata kuliah (cascade manual ke capaian_cpl_mk dan mk_cpl)
const deleteMK = async (mkId) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Hapus relasi di capaian_cpl_mk yang mereferensi mk_cpl dari mk_id ini
    await client.query(`
      DELETE FROM capaian_cpl_mk 
      WHERE mk_cpl_id IN (
        SELECT id FROM mk_cpl WHERE mk_id = $1
      )
    `, [mkId]);

    // Hapus relasi di mk_cpl
    await client.query("DELETE FROM mk_cpl WHERE mk_id = $1", [mkId]);

    // Hapus mata kuliah
    const query = `
      DELETE FROM mata_kuliah
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await client.query(query, [mkId]);
    
    if (result.rows.length === 0) {
      throw new Error("Mata kuliah tidak ditemukan");
    }

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  getAllMK,
  getMKById,
  createMK,
  updateMK,
  deleteMK,
};