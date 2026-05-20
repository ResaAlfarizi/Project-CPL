const pool = require('../config/db');

const Dosen = {
  getAll: async () => {
    const result = await pool.query('SELECT * FROM dosen ORDER BY nama ASC');
    return result.rows;
  },

  // Menerima parameter client untuk merantai transaksi dari controller
  create: async ({ nidn, nama }, client) => {
    const query = 'INSERT INTO dosen (nidn, nama) VALUES ($1, $2) RETURNING *';
    const db = client || pool; // Jika ada transaksi, gunakan koneksi transaksi client
    const result = await db.query(query, [nidn, nama]);
    return result.rows[0];
  },

  update: async (id, { nidn, nama }) => {
    const query = `
      UPDATE dosen 
      SET nidn = $1, nama = $2 
      WHERE id = $3 RETURNING *`;
    const result = await pool.query(query, [nidn, nama, id]);
    return result.rows[0];
  },

  delete: async (id) => {
    const query = 'DELETE FROM dosen WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
};

module.exports = Dosen;