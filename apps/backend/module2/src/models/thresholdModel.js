const pool = require("../config/db");

/**
 * THRESHOLD MODEL
 * Mengelola threshold status pencapaian CPL per prodi
 * Threshold menentukan range nilai untuk status:
 * Excellence, Satisfactory, Competent, Developing, Not Competent
 */

// Ambil semua threshold
const getAllThreshold = async () => {
  const query = `
    SELECT 
      ts.id,
      ts.prodi_id,
      ps.kode_prodi,
      ps.nama_prodi,
      ts.nama_status,
      ts.nilai_min,
      ts.nilai_max
    FROM threshold_status ts
    JOIN program_studi ps ON ts.prodi_id = ps.id
    ORDER BY ps.nama_prodi, ts.nilai_min DESC
  `;

  const result = await pool.query(query);
  return result.rows;
};

// Ambil threshold berdasarkan prodi
const getThresholdByProdiId = async (prodiId) => {
  const query = `
    SELECT 
      id,
      prodi_id,
      nama_status,
      nilai_min,
      nilai_max
    FROM threshold_status
    WHERE prodi_id = $1
    ORDER BY nilai_min DESC
  `;

  const result = await pool.query(query, [prodiId]);
  return result.rows;
};

// Ambil threshold berdasarkan ID
const getThresholdById = async (id) => {
  const query = `
    SELECT 
      ts.id,
      ts.prodi_id,
      ps.kode_prodi,
      ps.nama_prodi,
      ts.nama_status,
      ts.nilai_min,
      ts.nilai_max
    FROM threshold_status ts
    JOIN program_studi ps ON ts.prodi_id = ps.id
    WHERE ts.id = $1
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Cek apakah threshold sudah ada
const checkThresholdExists = async (prodiId, namaStatus) => {
  const query = `
    SELECT * FROM threshold_status
    WHERE prodi_id = $1 AND nama_status = $2
  `;

  const result = await pool.query(query, [prodiId, namaStatus]);
  return result.rows[0];
};

// Buat threshold baru
const createThreshold = async (prodiId, namaStatus, nilaiMin, nilaiMax) => {
  const query = `
    INSERT INTO threshold_status (
      prodi_id,
      nama_status,
      nilai_min,
      nilai_max
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;

  const values = [prodiId, namaStatus, nilaiMin, nilaiMax];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Update threshold
const updateThreshold = async (id, namaStatus, nilaiMin, nilaiMax) => {
  const query = `
    UPDATE threshold_status
    SET 
      nama_status = $2,
      nilai_min = $3,
      nilai_max = $4
    WHERE id = $1
    RETURNING *
  `;

  const values = [id, namaStatus, nilaiMin, nilaiMax];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Hapus threshold
const deleteThreshold = async (id) => {
  const query = `DELETE FROM threshold_status WHERE id = $1 RETURNING *`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Seed default threshold untuk prodi
const seedDefaultThreshold = async (prodiId) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Hapus threshold lama untuk prodi ini
    await client.query('DELETE FROM threshold_status WHERE prodi_id = $1', [prodiId]);

    // Insert default threshold
    const thresholds = [
      { nama_status: 'Excellence', nilai_min: 85.00, nilai_max: 100.00 },
      { nama_status: 'Satisfactory', nilai_min: 70.00, nilai_max: 84.99 },
      { nama_status: 'Competent', nilai_min: 55.00, nilai_max: 69.99 },
      { nama_status: 'Developing', nilai_min: 40.00, nilai_max: 54.99 },
      { nama_status: 'Not Competent', nilai_min: 0.00, nilai_max: 39.99 },
    ];

    for (const t of thresholds) {
      await client.query(
        `INSERT INTO threshold_status (prodi_id, nama_status, nilai_min, nilai_max)
         VALUES ($1, $2, $3, $4)`,
        [prodiId, t.nama_status, t.nilai_min, t.nilai_max]
      );
    }

    await client.query('COMMIT');
    
    return {
      success: true,
      message: 'Default threshold seeded successfully',
      count: thresholds.length,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  getAllThreshold,
  getThresholdByProdiId,
  getThresholdById,
  checkThresholdExists,
  createThreshold,
  updateThreshold,
  deleteThreshold,
  seedDefaultThreshold,
};
