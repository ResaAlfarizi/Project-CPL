const pool = require("../config/db");

/**
 * DOSEN PROFILE MODEL
 * Mengelola data profil dosen
 */

// Ambil profil dosen lengkap
const getDosenProfile = async (dosenId) => {
  const query = `
    SELECT 
      d.id,
      d.nidn,
      d.nama,
      u.email,
      ps.nama_prodi,
      ps.jenjang,
      ps.kode_prodi,
      COUNT(DISTINCT k.id) as total_kelas,
      COUNT(DISTINCT e.mahasiswa_id) as total_mahasiswa
    FROM dosen d
    LEFT JOIN users u ON u.entity_id = d.id AND u.entity_type = 'dosen'
    LEFT JOIN kelas k ON d.id = k.dosen_id
    LEFT JOIN mata_kuliah mk ON k.mk_id = mk.id
    LEFT JOIN program_studi ps ON mk.prodi_id = ps.id
    LEFT JOIN enrollment e ON k.id = e.kelas_id
    WHERE d.id = $1
    GROUP BY d.id, d.nidn, d.nama, u.email, ps.nama_prodi, ps.jenjang, ps.kode_prodi
  `;

  const result = await pool.query(query, [dosenId]);
  return result.rows[0];
};

module.exports = {
  getDosenProfile,
};
