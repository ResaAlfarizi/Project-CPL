const pool = require('../config/db');

const Mahasiswa = {
  getAll: async () => {
    const query = `
      SELECT m.*, p.nama_prodi 
      FROM mahasiswa m 
      LEFT JOIN program_studi p ON m.prodi_id = p.id 
      ORDER BY m.angkatan DESC, m.nama ASC`;
    const result = await pool.query(query);
    return result.rows;
  },

  getByNim: async (nim) => {
    const result = await pool.query('SELECT * FROM mahasiswa WHERE nim = $1', [nim]);
    return result.rows[0];
  },

  // Menerima parameter client untuk merantai transaksi dari controller
  create: async ({ prodi_id, nim, nama, angkatan }, client) => {
    const query = `
      INSERT INTO mahasiswa (prodi_id, nim, nama, angkatan) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *`;
    const db = client || pool; // Memastikan isolasi atomik query
    const result = await db.query(query, [prodi_id, nim, nama, angkatan]);
    return result.rows[0];
  },

  update: async (id, { prodi_id, nim, nama, angkatan, is_active }) => {
    const query = `
      UPDATE mahasiswa 
      SET prodi_id = $1, nim = $2, nama = $3, angkatan = $4, is_active = $5 
      WHERE id = $6 
      RETURNING *`;
    const result = await pool.query(query, [prodi_id, nim, nama, angkatan, is_active ?? true, id]);
    return result.rows[0];
  },

  delete: async (id) => {
    const result = await pool.query('DELETE FROM mahasiswa WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
};

module.exports = Mahasiswa;