const pool = require('../config/db');

const Prodi = {
  getAll: async () => {
    const result = await pool.query('SELECT * FROM program_studi ORDER BY nama_prodi ASC');
    return result.rows;
  },

  create: async ({ kode_prodi, nama_prodi, jenjang }) => {
    const query = `
      INSERT INTO program_studi (kode_prodi, nama_prodi, jenjang) 
      VALUES ($1, $2, $3) 
      RETURNING *`;
    const result = await pool.query(query, [kode_prodi, nama_prodi, jenjang]);
    return result.rows[0];
  },

  update: async (id, { kode_prodi, nama_prodi, jenjang }) => {
    const query = `
      UPDATE program_studi 
      SET kode_prodi = $1, nama_prodi = $2, jenjang = $3 
      WHERE id = $4 
      RETURNING *`;
    const result = await pool.query(query, [kode_prodi, nama_prodi, jenjang, id]);
    return result.rows[0];
  },

  delete: async (id) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      // Lepas relasi users yang terhubung ke prodi ini agar FK tidak blocking
      await client.query('UPDATE users SET prodi_id = NULL WHERE prodi_id = $1', [id]);
      const result = await client.query('DELETE FROM program_studi WHERE id = $1 RETURNING *', [id]);
      await client.query('COMMIT');
      return result.rows[0];
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
};

module.exports = Prodi;