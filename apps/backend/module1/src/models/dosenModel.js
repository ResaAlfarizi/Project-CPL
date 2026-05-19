const pool = require('../config/db');

const Dosen = {
  getAll: async () => {
    const result = await pool.query('SELECT * FROM dosen ORDER BY nama ASC');
    return result.rows;
  },

  create: async ({ nidn, nama, prodi_id, role, is_active }) => {
    const query = 'INSERT INTO dosen (nidn, nama, prodi_id, role, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    const result = await pool.query(query, [nidn, nama, prodi_id || null, role || 'dosen', is_active ?? true]);
    return result.rows[0];
  },

  update: async (id, { nidn, nama, prodi_id, role, is_active }) => {
    const query = `
      UPDATE dosen 
      SET nidn = $1, nama = $2, prodi_id = $3, role = $4, is_active = $5 
      WHERE id = $6 RETURNING *`;
    const result = await pool.query(query, [nidn, nama, prodi_id || null, role || 'dosen', is_active ?? true, id]);
    return result.rows[0];
  },

  delete: async (id) => {
    const query = 'DELETE FROM dosen WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
};

module.exports = Dosen;