const pool = require("../config/db");

/**
 * MAHASISWA PROFILE MODEL
 * Mengelola data profil mahasiswa
 */

// Ambil profil mahasiswa lengkap
const getMahasiswaProfile = async (mahasiswaId) => {
  const query = `
    SELECT 
      m.id,
      m.nim,
      m.nama,
      u.email,
      m.prodi_id,
      ps.nama_prodi,
      ps.kode_prodi,
      ps.jenjang,
      m.angkatan,
      COUNT(DISTINCT e.id) as total_kelas,
      COUNT(DISTINCT n.id) as total_nilai
    FROM mahasiswa m
    LEFT JOIN users u ON u.entity_id = m.id
    LEFT JOIN program_studi ps ON m.prodi_id = ps.id
    LEFT JOIN enrollment e ON m.id = e.mahasiswa_id
    LEFT JOIN nilai_sub_cpmk n ON e.id = n.enrollment_id
    WHERE m.id = $1
    GROUP BY m.id, m.nim, m.nama, u.email, m.prodi_id, ps.nama_prodi, ps.kode_prodi, ps.jenjang, m.angkatan
  `;

  const result = await pool.query(query, [mahasiswaId]);
  return result.rows[0];
};

module.exports = {
  getMahasiswaProfile,
};
