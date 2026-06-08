const pool = require("../config/db");

/**
 * CAPAIAN MODEL
 * Mengelola analisis capaian CPL mahasiswa
 * Menggunakan VIEW yang sudah ada di database
 */

// ✅ BARU: Ambil semua capaian CPL mahasiswa (untuk superadmin monitoring global)
// Mengambil data dari tabel capaian_cpl_mahasiswa dengan JOIN ke tabel terkait
const getAllCapaian = async (limit = 1000, offset = 0) => {
  const query = `
    SELECT 
      ccm.id,
      ccm.mahasiswa_id,
      m.nim,
      m.nama as nama_mahasiswa,
      ps.nama_prodi,
      c.kode_cpl,
      c.deskripsi as nama_cpl,
      ccm.nilai_capaian as nilai_cpl_total,
      ccm.tahun_akademik,
      ccm.status,
      ccm.calculated_at as tanggal_input,
      -- Sub CPMK information (ambil dari sub_cpmk yang terkait dengan mk_cpl yang memiliki cpl_id sama)
      STRING_AGG(DISTINCT sc.kode_sub_cpmk, ', ') as sub_cpmk_list
    FROM capaian_cpl_mahasiswa ccm
    JOIN mahasiswa m ON ccm.mahasiswa_id = m.id
    JOIN cpl c ON ccm.cpl_id = c.id
    JOIN program_studi ps ON m.prodi_id = ps.id
    LEFT JOIN mk_cpl mc ON c.id = mc.cpl_id
    LEFT JOIN sub_cpmk sc ON mc.id = sc.mk_cpl_id
    GROUP BY ccm.id, ccm.mahasiswa_id, m.nim, m.nama, ps.nama_prodi, 
             c.kode_cpl, c.deskripsi, ccm.nilai_capaian, ccm.tahun_akademik, 
             ccm.status, ccm.calculated_at
    ORDER BY ccm.calculated_at DESC, ps.nama_prodi, m.nama, c.kode_cpl
    LIMIT $1 OFFSET $2
  `;

  const result = await pool.query(query, [limit, offset]);
  return result.rows;
};

// Ambil capaian CPL mahasiswa (menggunakan view)
const getCapaianByMahasiswaId = async (mahasiswaId) => {
  const query = `
    SELECT 
      v.cpl_id,
      c.kode_cpl,
      c.deskripsi as deskripsi_cpl,
      v.nilai_cpl_total as rata_rata_nilai,
      ts.nilai_min as nilai_minimum,
      ts.nama_status as status_capaian
    FROM v_capaian_cpl_mahasiswa v
    JOIN cpl c ON v.cpl_id = c.id
    LEFT JOIN program_studi ps ON c.prodi_id = ps.id
    LEFT JOIN threshold_status ts ON ps.id = ts.prodi_id 
      AND v.nilai_cpl_total BETWEEN ts.nilai_min AND ts.nilai_max
    WHERE v.mahasiswa_id = $1
    ORDER BY c.kode_cpl
  `;

  const result = await pool.query(query, [mahasiswaId]);
  return result.rows;
};

// Ambil capaian CPL untuk seluruh mahasiswa di prodi
const getCapaianByProdiId = async (prodiId) => {
  const query = `
    WITH rata_rata_cpl AS (
      SELECT 
        v.cpl_id,
        c.kode_cpl,
        c.deskripsi as deskripsi_cpl,
        ROUND(AVG(v.nilai_cpl_total)::numeric, 2) as rata_rata_nilai,
        COUNT(DISTINCT v.mahasiswa_id) as jumlah_mahasiswa
      FROM v_capaian_cpl_mahasiswa v
      JOIN cpl c ON v.cpl_id = c.id
      JOIN mahasiswa m ON v.mahasiswa_id = m.id
      WHERE m.prodi_id = $1
      GROUP BY v.cpl_id, c.kode_cpl, c.deskripsi
    )
    SELECT 
      rc.cpl_id,
      rc.kode_cpl,
      rc.deskripsi_cpl,
      rc.rata_rata_nilai,
      rc.jumlah_mahasiswa,
      ts.nilai_min as nilai_minimum,
      ts.nama_status as status_capaian
    FROM rata_rata_cpl rc
    LEFT JOIN threshold_status ts ON ts.prodi_id = $1
      AND rc.rata_rata_nilai BETWEEN ts.nilai_min AND ts.nilai_max
    ORDER BY rc.kode_cpl
  `;

  const result = await pool.query(query, [prodiId]);
  return result.rows;
};

// Ambil capaian CPL untuk kelas tertentu (summary)
const getCapaianByKelasId = async (kelasId) => {
  const query = `
    SELECT 
      v.cpl_id,
      c.kode_cpl,
      c.deskripsi as deskripsi_cpl,
      ROUND(AVG(v.nilai_capaian_cpl_mk)::numeric, 2) as rata_rata_nilai,
      COUNT(DISTINCT e.mahasiswa_id) as jumlah_mahasiswa
    FROM v_capaian_cpl_mk v
    JOIN cpl c ON v.cpl_id = c.id
    JOIN enrollment e ON v.enrollment_id = e.id
    WHERE e.kelas_id = $1
    GROUP BY v.cpl_id, c.kode_cpl, c.deskripsi
    ORDER BY c.kode_cpl
  `;

  const result = await pool.query(query, [kelasId]);
  return result.rows;
};

// Ambil detail capaian per mahasiswa untuk kelas tertentu
const getCapaianDetailByKelasId = async (kelasId) => {
  const query = `
    SELECT 
      e.id as enrollment_id,
      e.mahasiswa_id,
      m.nim,
      m.nama as nama_mahasiswa,
      v.cpl_id,
      c.kode_cpl,
      c.deskripsi as deskripsi_cpl,
      v.nilai_capaian_cpl_mk as nilai_capaian,
      ts.nama_status as status
    FROM enrollment e
    JOIN mahasiswa m ON e.mahasiswa_id = m.id
    LEFT JOIN v_capaian_cpl_mk v ON e.id = v.enrollment_id
    LEFT JOIN cpl c ON v.cpl_id = c.id
    LEFT JOIN threshold_status ts ON m.prodi_id = ts.prodi_id 
      AND v.nilai_capaian_cpl_mk BETWEEN ts.nilai_min AND ts.nilai_max
    WHERE e.kelas_id = $1
    ORDER BY m.nim, c.kode_cpl
  `;

  const result = await pool.query(query, [kelasId]);
  return result.rows;
};

// Ambil detail capaian mahasiswa per mata kuliah
const getCapaianDetailByMahasiswaId = async (mahasiswaId) => {
  const query = `
    SELECT 
      mk.kode_mk,
      mk.nama_mk,
      k.tahun_akademik,
      k.semester_aktif,
      c.kode_cpl,
      c.deskripsi as deskripsi_cpl,
      v.nilai_capaian_cpl_mk as nilai,
      ts.nilai_min as nilai_minimum,
      ts.nama_status as status
    FROM v_capaian_cpl_mk v
    JOIN enrollment e ON v.enrollment_id = e.id
    JOIN kelas k ON e.kelas_id = k.id
    JOIN mata_kuliah mk ON k.mk_id = mk.id
    JOIN cpl c ON v.cpl_id = c.id
    JOIN mahasiswa m ON e.mahasiswa_id = m.id
    LEFT JOIN threshold_status ts ON m.prodi_id = ts.prodi_id 
      AND v.nilai_capaian_cpl_mk BETWEEN ts.nilai_min AND ts.nilai_max
    WHERE e.mahasiswa_id = $1
    ORDER BY k.tahun_akademik DESC, k.semester_aktif DESC, c.kode_cpl
  `;

  const result = await pool.query(query, [mahasiswaId]);
  return result.rows;
};

// Ambil mahasiswa yang belum mencapai CPL tertentu
const getMahasiswaBelumCapaiCPL = async (cplId, prodiId) => {
  const query = `
    SELECT 
      m.id,
      m.nim,
      m.nama,
      v.nilai_cpl_total as rata_rata_nilai,
      ts.nilai_min as nilai_minimum
    FROM mahasiswa m
    LEFT JOIN v_capaian_cpl_mahasiswa v ON m.id = v.mahasiswa_id AND v.cpl_id = $1
    LEFT JOIN threshold_status ts ON m.prodi_id = ts.prodi_id 
      AND v.nilai_cpl_total BETWEEN ts.nilai_min AND ts.nilai_max
    WHERE m.prodi_id = $2
      AND (v.nilai_cpl_total < ts.nilai_min OR v.nilai_cpl_total IS NULL)
    ORDER BY m.nim
  `;

  const result = await pool.query(query, [cplId, prodiId]);
  return result.rows;
};

// CREATE - Tambah capaian manual
const createCapaian = async (mahasiswaIdOrNim, cplIdOrKode, nilaiCapaian, tahunAkademik = '2024/2025') => {
  // Convert NIM to UUID mahasiswa_id jika perlu
  const mahasiswaQuery = `
    SELECT id, prodi_id FROM mahasiswa WHERE nim = $1 OR id::text = $1
  `;
  const mahasiswaResult = await pool.query(mahasiswaQuery, [mahasiswaIdOrNim]);
  const mahasiswa = mahasiswaResult.rows[0];
  
  if (!mahasiswa) {
    throw new Error(`Mahasiswa dengan NIM/ID ${mahasiswaIdOrNim} tidak ditemukan`);
  }
  
  // Convert kode_cpl to UUID cpl_id jika perlu
  const cplQuery = `
    SELECT id FROM cpl WHERE kode_cpl = $1 OR id::text = $1
  `;
  const cplResult = await pool.query(cplQuery, [cplIdOrKode]);
  const cplId = cplResult.rows[0]?.id;
  
  if (!cplId) {
    throw new Error(`CPL dengan kode ${cplIdOrKode} tidak ditemukan`);
  }

  // ✅ Gunakan function get_status_cpl untuk status dinamis
  const statusResult = await pool.query(
    `SELECT get_status_cpl($1, $2) as status`,
    [mahasiswa.prodi_id, nilaiCapaian]
  );
  const status = statusResult.rows[0]?.status || 'Not Competent';
  
  const query = `
    INSERT INTO capaian_cpl_mahasiswa (mahasiswa_id, cpl_id, tahun_akademik, nilai_capaian, status, calculated_at)
    VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
    RETURNING *
  `;
  
  const result = await pool.query(query, [mahasiswa.id, cplId, tahunAkademik, nilaiCapaian, status]);
  return result.rows[0];
};

// UPDATE - Edit capaian manual
const updateCapaian = async (mahasiswaIdOrNim, cplIdOrKode, nilaiCapaian, tahunAkademik) => {
  console.log('🔧 updateCapaian called with:', { mahasiswaIdOrNim, cplIdOrKode, nilaiCapaian, tahunAkademik });
  
  // Convert NIM to UUID mahasiswa_id jika perlu
  const mahasiswaQuery = `
    SELECT id, prodi_id FROM mahasiswa WHERE nim = $1 OR id::text = $1
  `;
  const mahasiswaResult = await pool.query(mahasiswaQuery, [mahasiswaIdOrNim]);
  const mahasiswa = mahasiswaResult.rows[0];
  
  if (!mahasiswa) {
    throw new Error(`Mahasiswa dengan NIM/ID ${mahasiswaIdOrNim} tidak ditemukan`);
  }
  
  // Convert kode_cpl to UUID cpl_id jika perlu
  const cplQuery = `
    SELECT id FROM cpl WHERE kode_cpl = $1 OR id::text = $1
  `;
  const cplResult = await pool.query(cplQuery, [cplIdOrKode]);
  const cplId = cplResult.rows[0]?.id;
  
  if (!cplId) {
    throw new Error(`CPL dengan kode ${cplIdOrKode} tidak ditemukan`);
  }

  console.log('🔧 Resolved IDs:', { mahasiswaId: mahasiswa.id, prodiId: mahasiswa.prodi_id, cplId });

  // ✅ Gunakan function get_status_cpl untuk status dinamis
  const statusResult = await pool.query(
    `SELECT get_status_cpl($1, $2) as status`,
    [mahasiswa.prodi_id, nilaiCapaian]
  );
  const status = statusResult.rows[0]?.status || 'Not Competent';
  
  let query, values;
  
  if (tahunAkademik) {
    query = `
      UPDATE capaian_cpl_mahasiswa
      SET nilai_capaian = $3, status = $4, tahun_akademik = $5, calculated_at = CURRENT_TIMESTAMP
      WHERE mahasiswa_id = $1 AND cpl_id = $2
      RETURNING *
    `;
    values = [mahasiswa.id, cplId, nilaiCapaian, status, tahunAkademik];
  } else {
    query = `
      UPDATE capaian_cpl_mahasiswa
      SET nilai_capaian = $3, status = $4, calculated_at = CURRENT_TIMESTAMP
      WHERE mahasiswa_id = $1 AND cpl_id = $2
      RETURNING *
    `;
    values = [mahasiswa.id, cplId, nilaiCapaian, status];
  }
  
  console.log('🔧 Update query:', query);
  console.log('🔧 Update values:', values);
  
  const result = await pool.query(query, values);
  console.log('🔧 Update result:', result.rows[0]);
  
  return result.rows[0];
};

// DELETE - Hapus capaian manual
const deleteCapaian = async (mahasiswaIdOrNim, cplIdOrKode) => {
  // Convert NIM to UUID mahasiswa_id jika perlu
  const mahasiswaQuery = `
    SELECT id FROM mahasiswa WHERE nim = $1 OR id::text = $1
  `;
  const mahasiswaResult = await pool.query(mahasiswaQuery, [mahasiswaIdOrNim]);
  const mahasiswaId = mahasiswaResult.rows[0]?.id;
  
  if (!mahasiswaId) {
    throw new Error(`Mahasiswa dengan NIM/ID ${mahasiswaIdOrNim} tidak ditemukan`);
  }
  
  // Convert kode_cpl to UUID cpl_id jika perlu
  const cplQuery = `
    SELECT id FROM cpl WHERE kode_cpl = $1 OR id::text = $1
  `;
  const cplResult = await pool.query(cplQuery, [cplIdOrKode]);
  const cplId = cplResult.rows[0]?.id;
  
  if (!cplId) {
    throw new Error(`CPL dengan kode ${cplIdOrKode} tidak ditemukan`);
  }
  
  const query = `
    DELETE FROM capaian_cpl_mahasiswa
    WHERE mahasiswa_id = $1 AND cpl_id = $2
    RETURNING *
  `;
  
  const result = await pool.query(query, [mahasiswaId, cplId]);
  return result.rows[0];
};

// CHECK - Cek apakah capaian sudah ada
const checkCapaianExists = async (mahasiswaIdOrNim, cplIdOrKode) => {
  console.log('🔍 checkCapaianExists called with:', { mahasiswaIdOrNim, cplIdOrKode });
  
  // Convert NIM to UUID mahasiswa_id jika perlu
  const mahasiswaQuery = `
    SELECT id, nim FROM mahasiswa WHERE nim = $1 OR id::text = $1
  `;
  const mahasiswaResult = await pool.query(mahasiswaQuery, [mahasiswaIdOrNim]);
  console.log('🔍 Mahasiswa query result:', mahasiswaResult.rows);
  const mahasiswaId = mahasiswaResult.rows[0]?.id;
  
  console.log('🔍 Found mahasiswa_id:', mahasiswaId);
  
  if (!mahasiswaId) {
    console.log('❌ Mahasiswa tidak ditemukan untuk:', mahasiswaIdOrNim);
    return null;
  }
  
  // Convert kode_cpl to UUID cpl_id jika perlu
  const cplQuery = `
    SELECT id, kode_cpl FROM cpl WHERE kode_cpl = $1 OR id::text = $1
  `;
  const cplResult = await pool.query(cplQuery, [cplIdOrKode]);
  console.log('🔍 CPL query result:', cplResult.rows);
  const cplId = cplResult.rows[0]?.id;
  
  console.log('🔍 Found cpl_id:', cplId);
  
  if (!cplId) {
    console.log('❌ CPL tidak ditemukan untuk:', cplIdOrKode);
    return null;
  }
  
  const query = `
    SELECT * FROM capaian_cpl_mahasiswa
    WHERE mahasiswa_id = $1 AND cpl_id = $2
  `;
  
  console.log('🔍 Final check query:', query, 'with params:', [mahasiswaId, cplId]);
  
  const result = await pool.query(query, [mahasiswaId, cplId]);
  console.log('🔍 checkCapaianExists result:', result.rows[0] || 'Not found');
  
  return result.rows[0];
};

module.exports = {
  getAllCapaian, // ✅ Export fungsi baru
  getCapaianByMahasiswaId,
  getCapaianByProdiId,
  getCapaianByKelasId,
  getCapaianDetailByKelasId,
  getCapaianDetailByMahasiswaId,
  getMahasiswaBelumCapaiCPL,
  createCapaian,
  updateCapaian,
  deleteCapaian,
  checkCapaianExists,
};