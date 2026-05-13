const pool = require('../config/db');

const Threshold = {
  upsert: async (data) => {
    const { prodi_id, nama_status, nilai_min, nilai_max } = data;
    const query = `
      INSERT INTO threshold_status (prodi_id, nama_status, nilai_min, nilai_max) 
      VALUES ($1, $2, $3, $4) 
      ON CONFLICT (prodi_id, nama_status) 
      DO UPDATE SET nilai_min = EXCLUDED.nilai_min, nilai_max = EXCLUDED.nilai_max 
      RETURNING *`;
    const result = await pool.query(query, [prodi_id, nama_status, nilai_min, nilai_max]);
    return result.rows[0];
  }
};

module.exports = Threshold;