const pool = require('../config/db');

const Dosen = {
  getAll: async () => {
    const result = await pool.query('SELECT * FROM dosen ORDER BY nama ASC');
    return result.rows;
  },

  create: async (nidn, nama) => {
    const query = 'INSERT INTO dosen (nidn, nama) VALUES ($1, $2) RETURNING *';
    const result = await pool.query(query, [nidn, nama]);
    return result.rows[0];
  }
};

module.exports = Dosen;