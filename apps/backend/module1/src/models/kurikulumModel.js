const pool = require('../config/db');

const Kurikulum = {
  // Mata Kuliah (MK)
  getAllMK: async () => {
    const res = await pool.query('SELECT * FROM mata_kuliah ORDER BY semester ASC, kode_mk ASC');
    return res.rows;
  },

  createMK: async ({ prodi_id, kode_mk, nama_mk, sks, semester }) => {
    const res = await pool.query(
      'INSERT INTO mata_kuliah (prodi_id, kode_mk, nama_mk, sks, semester) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [prodi_id, kode_mk, nama_mk, sks, semester]
    );
    return res.rows[0];
  },

  updateMK: async (id, { prodi_id, kode_mk, nama_mk, sks, semester }) => {
    const res = await pool.query(
      'UPDATE mata_kuliah SET prodi_id = $1, kode_mk = $2, nama_mk = $3, sks = $4, semester = $5 WHERE id = $6 RETURNING *',
      [prodi_id, kode_mk, nama_mk, sks, semester, id]
    );
    return res.rows[0];
  },

  deleteMK: async (id) => {
    const res = await pool.query('DELETE FROM mata_kuliah WHERE id = $1 RETURNING *', [id]);
    return res.rows[0];
  },

  // CPL
  getAllCPL: async () => {
    const res = await pool.query('SELECT * FROM cpl ORDER BY kode_cpl ASC');
    return res.rows;
  },

  createCPL: async ({ prodi_id, kode_cpl, deskripsi }) => {
    const res = await pool.query(
      'INSERT INTO cpl (prodi_id, kode_cpl, deskripsi) VALUES ($1, $2, $3) RETURNING *',
      [prodi_id, kode_cpl, deskripsi]
    );
    return res.rows[0];
  },

  updateCPL: async (id, { prodi_id, kode_cpl, deskripsi, is_active }) => {
    const res = await pool.query(
      'UPDATE cpl SET prodi_id = $1, kode_cpl = $2, deskripsi = $3, is_active = $4 WHERE id = $5 RETURNING *',
      [prodi_id, kode_cpl, deskripsi, is_active ?? true, id]
    );
    return res.rows[0];
  },

  deleteCPL: async (id) => {
    const res = await pool.query('DELETE FROM cpl WHERE id = $1 RETURNING *', [id]);
    return res.rows[0];
  },

  // MK-CPL Mapping
  getAllMapping: async () => {
    const res = await pool.query('SELECT * FROM mk_cpl');
    return res.rows;
  },

  saveMapping: async (mk_id, mappings) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM mk_cpl WHERE mk_id = $1', [mk_id]);
      
      for (let item of mappings) {
        await client.query(
          'INSERT INTO mk_cpl (mk_id, cpl_id, bobot) VALUES ($1, $2, $3)',
          [mk_id, item.cpl_id, item.bobot]
        );
      }
      await client.query('COMMIT');
      return true;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  },

  // Sub-CPMK
  getAllSubCpmk: async () => {
    const res = await pool.query('SELECT * FROM sub_cpmk');
    return res.rows;
  },

  saveSubCpmks: async (mk_cpl_id, subCpmks) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM sub_cpmk WHERE mk_cpl_id = $1', [mk_cpl_id]);
      
      for (let item of subCpmks) {
        await client.query(
          'INSERT INTO sub_cpmk (mk_cpl_id, kode_sub_cpmk, deskripsi, bobot) VALUES ($1, $2, $3, $4)',
          [mk_cpl_id, item.kode_sub_cpmk, item.deskripsi, item.bobot]
        );
      }
      await client.query('COMMIT');
      return true;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
};

module.exports = Kurikulum;