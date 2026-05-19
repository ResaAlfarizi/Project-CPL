const pool = require('../config/db');

const Threshold = {
  saveThresholds: async (prodi_id, thresholds) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM threshold_status WHERE prodi_id = $1', [prodi_id]);
      
      for (let item of thresholds) {
        await client.query(
          'INSERT INTO threshold_status (prodi_id, nama_status, nilai_min, nilai_max) VALUES ($1, $2, $3, $4)',
          [prodi_id, item.nama_status, item.nilai_min, item.nilai_max]
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

  getAll: async () => {
    const result = await pool.query('SELECT * FROM threshold_status');
    return result.rows;
  }
};

module.exports = Threshold;