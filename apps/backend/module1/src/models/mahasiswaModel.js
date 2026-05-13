const pool = require('../config/db');

const Mahasiswa = {
  // JOIN dengan prodi agar kita dapat nama prodinya, bukan cuma ID-nya
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

  create: async (data) => {
    const { prodi_id, nim, nama, angkatan } = data;
    const query = `
      INSERT INTO mahasiswa (prodi_id, nim, nama, angkatan) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *`;
    const result = await pool.query(query, [prodi_id, nim, nama, angkatan]);
    return result.rows[0];
  }
};

module.exports = Mahasiswa;