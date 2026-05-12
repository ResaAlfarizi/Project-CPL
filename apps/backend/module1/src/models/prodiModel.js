const db = require('../config/db');

const Prodi = {
  getAll: async () => {
    const result = await db.query('SELECT * FROM program_studi ORDER BY created_at DESC');
    return result.rows;
  },
  create: async (kode_prodi, nama_prodi, jenjang) => {
    const queryText = 'INSERT INTO program_studi(kode_prodi, nama_prodi, jenjang) VALUES($1, $2, $3) RETURNING *';
    const result = await db.query(queryText, [kode_prodi, nama_prodi, jenjang]);
    return result.rows[0];
  }
};

module.exports = Prodi;