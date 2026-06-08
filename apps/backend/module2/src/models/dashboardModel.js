const pool = require("../config/db");

/**
 * DASHBOARD MODEL
 * Menyediakan data statistik dan ringkasan untuk dashboard
 * Database: UUID-based
 */

// Dashboard untuk Admin/Kaprodi
const getDashboardAdmin = async (prodiId) => {
  // Total mahasiswa
  const totalMahasiswaQuery = `
    SELECT COUNT(*) as total
    FROM mahasiswa
    WHERE prodi_id = $1
  `;

  // Total dosen
  const totalDosenQuery = `
    SELECT COUNT(DISTINCT d.id) as total
    FROM dosen d
    JOIN kelas k ON d.id = k.dosen_id
    JOIN mata_kuliah mk ON k.mk_id = mk.id
    WHERE mk.prodi_id = $1
  `;

  // Total kelas aktif
  const totalKelasQuery = `
    SELECT COUNT(*) as total
    FROM kelas k
    JOIN mata_kuliah mk ON k.mk_id = mk.id
    WHERE mk.prodi_id = $1
  `;

  // Total CPL
  const totalCPLQuery = `
    SELECT COUNT(*) as total
    FROM cpl
    WHERE prodi_id = $1 AND is_active = TRUE
  `;

  // Capaian CPL keseluruhan (menggunakan view) - FIXED: aggregate dalam CTE
  const capaianCPLQuery = `
    WITH cpl_avg AS (
      SELECT 
        v.cpl_id,
        ROUND(AVG(v.nilai_cpl_total)::numeric, 2) as rata_rata
      FROM v_capaian_cpl_mahasiswa v
      JOIN cpl c ON v.cpl_id = c.id
      WHERE c.prodi_id = $1
      GROUP BY v.cpl_id
    )
    SELECT 
      c.kode_cpl,
      c.deskripsi as deskripsi_cpl,
      ca.rata_rata,
      ts.nilai_min as nilai_minimum,
      ts.nama_status as status
    FROM cpl c
    JOIN cpl_avg ca ON c.id = ca.cpl_id
    JOIN mahasiswa m ON m.prodi_id = c.prodi_id
    LEFT JOIN threshold_status ts ON ts.prodi_id = m.prodi_id 
      AND ca.rata_rata BETWEEN ts.nilai_min AND ts.nilai_max
    WHERE c.prodi_id = $1
    GROUP BY c.kode_cpl, c.deskripsi, ca.rata_rata, ts.nilai_min, ts.nama_status
    ORDER BY c.kode_cpl
  `;

  const [totalMahasiswa, totalDosen, totalKelas, totalCPL, capaianCPL] = await Promise.all([
    pool.query(totalMahasiswaQuery, [prodiId]),
    pool.query(totalDosenQuery, [prodiId]),
    pool.query(totalKelasQuery, [prodiId]),
    pool.query(totalCPLQuery, [prodiId]),
    pool.query(capaianCPLQuery, [prodiId]),
  ]);

  return {
    statistik: {
      total_mahasiswa: parseInt(totalMahasiswa.rows[0].total),
      total_dosen: parseInt(totalDosen.rows[0].total),
      total_kelas: parseInt(totalKelas.rows[0].total),
      total_cpl: parseInt(totalCPL.rows[0].total),
    },
    capaian_cpl: capaianCPL.rows,
  };
};

// Dashboard untuk Dosen
const getDashboardDosen = async (dosenId) => {
  // Total kelas yang diampu
  const totalKelasQuery = `
    SELECT COUNT(*) as total
    FROM kelas
    WHERE dosen_id = $1
  `;

  // Total mahasiswa yang diajar
  const totalMahasiswaQuery = `
    SELECT COUNT(DISTINCT e.mahasiswa_id) as total
    FROM kelas k
    LEFT JOIN enrollment e ON k.id = e.kelas_id
    WHERE k.dosen_id = $1
  `;

  // Total mata kuliah yang diampu
  const totalMkQuery = `
    SELECT COUNT(DISTINCT mk.id) as total
    FROM kelas k
    JOIN mata_kuliah mk ON k.mk_id = mk.id
    WHERE k.dosen_id = $1
  `;

  // Daftar kelas yang diampu
  const kelasQuery = `
    SELECT 
      k.id,
      k.tahun_akademik,
      k.semester_aktif,
      k.nama_kelas,
      mk.kode_mk,
      mk.nama_mk,
      mk.sks,
      COUNT(e.id) as jumlah_mahasiswa
    FROM kelas k
    JOIN mata_kuliah mk ON k.mk_id = mk.id
    LEFT JOIN enrollment e ON k.id = e.kelas_id
    WHERE k.dosen_id = $1
    GROUP BY k.id, mk.kode_mk, mk.nama_mk, mk.sks
    ORDER BY k.tahun_akademik DESC, k.semester_aktif DESC
  `;

  // Capaian CPL per kelas (menggunakan view)
  const capaianPerKelasQuery = `
    SELECT 
      k.id as kelas_id,
      mk.kode_mk,
      mk.nama_mk,
      c.kode_cpl,
      ROUND(AVG(v.nilai_capaian_cpl_mk)::numeric, 2) as rata_rata
    FROM kelas k
    JOIN mata_kuliah mk ON k.mk_id = mk.id
    LEFT JOIN enrollment e ON k.id = e.kelas_id
    LEFT JOIN v_capaian_cpl_mk v ON e.id = v.enrollment_id
    LEFT JOIN cpl c ON v.cpl_id = c.id
    WHERE k.dosen_id = $1
    GROUP BY k.id, mk.kode_mk, mk.nama_mk, c.kode_cpl
    ORDER BY k.id, c.kode_cpl
  `;

  const [totalKelas, totalMahasiswa, totalMk, kelas, capaianPerKelas] = await Promise.all([
    pool.query(totalKelasQuery, [dosenId]),
    pool.query(totalMahasiswaQuery, [dosenId]),
    pool.query(totalMkQuery, [dosenId]),
    pool.query(kelasQuery, [dosenId]),
    pool.query(capaianPerKelasQuery, [dosenId]),
  ]);

  return {
    statistik: {
      total_kelas: parseInt(totalKelas.rows[0].total),
      total_mahasiswa: parseInt(totalMahasiswa.rows[0].total),
      total_mk: parseInt(totalMk.rows[0].total),
    },
    kelas: kelas.rows,
    capaian_per_kelas: capaianPerKelas.rows,
  };
};

// Dashboard untuk Mahasiswa
const getDashboardMahasiswa = async (mahasiswaId) => {
  // Info mahasiswa
  const mahasiswaQuery = `
    SELECT 
      m.id,
      m.nim,
      m.nama,
      m.angkatan,
      ps.nama_prodi
    FROM mahasiswa m
    JOIN program_studi ps ON m.prodi_id = ps.id
    WHERE m.id = $1
  `;

  // Total kelas yang diambil
  const totalKelasQuery = `
    SELECT COUNT(*) as total
    FROM enrollment
    WHERE mahasiswa_id = $1
  `;

  // Capaian CPL mahasiswa (menggunakan view)
  const capaianCPLQuery = `
    SELECT 
      c.kode_cpl,
      c.deskripsi as deskripsi_cpl,
      v.nilai_cpl_total as rata_rata,
      ts.nilai_min as nilai_minimum,
      ts.nama_status as status
    FROM v_capaian_cpl_mahasiswa v
    JOIN cpl c ON v.cpl_id = c.id
    JOIN mahasiswa m ON v.mahasiswa_id = m.id
    LEFT JOIN threshold_status ts ON m.prodi_id = ts.prodi_id 
      AND v.nilai_cpl_total BETWEEN ts.nilai_min AND ts.nilai_max
    WHERE v.mahasiswa_id = $1
    ORDER BY c.kode_cpl
  `;

  // Riwayat kelas
  const riwayatKelasQuery = `
    SELECT 
      k.tahun_akademik,
      k.semester_aktif,
      k.nama_kelas,
      mk.kode_mk,
      mk.nama_mk,
      mk.sks,
      d.nama as nama_dosen,
      COUNT(n.id) as jumlah_nilai_sub_cpmk
    FROM enrollment e
    JOIN kelas k ON e.kelas_id = k.id
    JOIN mata_kuliah mk ON k.mk_id = mk.id
    LEFT JOIN dosen d ON k.dosen_id = d.id
    LEFT JOIN nilai_sub_cpmk n ON e.id = n.enrollment_id
    WHERE e.mahasiswa_id = $1
    GROUP BY k.id, mk.kode_mk, mk.nama_mk, mk.sks, d.nama
    ORDER BY k.tahun_akademik DESC, k.semester_aktif DESC
  `;

  const [mahasiswa, totalKelas, capaianCPL, riwayatKelas] = await Promise.all([
    pool.query(mahasiswaQuery, [mahasiswaId]),
    pool.query(totalKelasQuery, [mahasiswaId]),
    pool.query(capaianCPLQuery, [mahasiswaId]),
    pool.query(riwayatKelasQuery, [mahasiswaId]),
  ]);

  return {
    mahasiswa: mahasiswa.rows[0],
    statistik: {
      total_kelas: parseInt(totalKelas.rows[0].total),
    },
    capaian_cpl: capaianCPL.rows,
    riwayat_kelas: riwayatKelas.rows,
  };
};

// Dashboard untuk Superadmin (Global - semua prodi)
const getDashboardSuperadmin = async () => {
  // Total program studi
  const totalProdiQuery = `
    SELECT COUNT(*) as total
    FROM program_studi
  `;

  // Total mahasiswa (semua prodi)
  const totalMahasiswaQuery = `
    SELECT COUNT(*) as total
    FROM mahasiswa
  `;

  // Total dosen (semua prodi)
  const totalDosenQuery = `
    SELECT COUNT(*) as total
    FROM dosen
  `;

  // Total CPL (semua prodi)
  const totalCPLQuery = `
    SELECT COUNT(*) as total
    FROM cpl
    WHERE is_active = TRUE
  `;

  // Total mata kuliah (semua prodi)
  const totalMKQuery = `
    SELECT COUNT(*) as total
    FROM mata_kuliah
  `;

  // Total pemetaan MK-CPL
  const totalMkCplQuery = `
    SELECT COUNT(*) as total
    FROM mk_cpl
  `;

  // Total Sub-CPMK
  const totalSubCpmkQuery = `
    SELECT COUNT(*) as total
    FROM sub_cpmk
  `;

  // Statistik per prodi
  const statistikPerProdiQuery = `
    SELECT 
      ps.id,
      ps.kode_prodi,
      ps.nama_prodi,
      COUNT(DISTINCT m.id) as total_mahasiswa,
      COUNT(DISTINCT c.id) as total_cpl,
      COUNT(DISTINCT mk.id) as total_mk
    FROM program_studi ps
    LEFT JOIN mahasiswa m ON ps.id = m.prodi_id
    LEFT JOIN cpl c ON ps.id = c.prodi_id AND c.is_active = TRUE
    LEFT JOIN mata_kuliah mk ON ps.id = mk.prodi_id
    GROUP BY ps.id, ps.kode_prodi, ps.nama_prodi
    ORDER BY ps.nama_prodi
  `;

  const [
    totalProdi,
    totalMahasiswa,
    totalDosen,
    totalCPL,
    totalMK,
    totalMkCpl,
    totalSubCpmk,
    statistikPerProdi,
  ] = await Promise.all([
    pool.query(totalProdiQuery),
    pool.query(totalMahasiswaQuery),
    pool.query(totalDosenQuery),
    pool.query(totalCPLQuery),
    pool.query(totalMKQuery),
    pool.query(totalMkCplQuery),
    pool.query(totalSubCpmkQuery),
    pool.query(statistikPerProdiQuery),
  ]);

  return {
    statistik: {
      total_prodi: parseInt(totalProdi.rows[0].total),
      total_mahasiswa: parseInt(totalMahasiswa.rows[0].total),
      total_dosen: parseInt(totalDosen.rows[0].total),
      total_cpl: parseInt(totalCPL.rows[0].total),
      total_mk: parseInt(totalMK.rows[0].total),
      total_mk_cpl: parseInt(totalMkCpl.rows[0].total),
      total_sub_cpmk: parseInt(totalSubCpmk.rows[0].total),
    },
    statistik_per_prodi: statistikPerProdi.rows,
  };
};

module.exports = {
  getDashboardAdmin,
  getDashboardDosen,
  getDashboardMahasiswa,
  getDashboardSuperadmin,
};
