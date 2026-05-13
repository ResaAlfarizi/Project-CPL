const pool = require('../config/db');

const Kurikulum = {
  createMK: async (data) => {
    const { prodi_id, kode_mk, nama_mk, sks, semester } = data;
    const res = await pool.query(
      'INSERT INTO mata_kuliah (prodi_id, kode_mk, nama_mk, sks, semester) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [prodi_id, kode_mk, nama_mk, sks, semester]
    );
    return res.rows[0];
  },

  createCPL: async (data) => {
    const { prodi_id, kode_cpl, deskripsi } = data;
    const res = await pool.query(
      'INSERT INTO cpl (prodi_id, kode_cpl, deskripsi) VALUES ($1, $2, $3) RETURNING *',
      [prodi_id, kode_cpl, deskripsi]
    );
    return res.rows[0];
  },

  // Transaksi untuk simpan mapping MK ke CPL
  saveMapping: async (mk_id, mappings) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      // Hapus mapping lama untuk MK ini (timpa data lama)
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
  }
};

module.exports = Kurikulum;