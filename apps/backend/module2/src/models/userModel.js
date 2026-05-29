const pool = require("../config/db");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

const getAllUsers = async () => {
  const result = await pool.query(`
    SELECT 
      u.id,
      u.email,
      u.entity_type as role,
      u.entity_id,
      u.prodi_id,
      p.nama_prodi,
      CASE 
        WHEN u.entity_type = 'dosen' THEN d.nama
        WHEN u.entity_type = 'mahasiswa' THEN m.nama
        ELSE NULL
      END as nama,
      CASE 
        WHEN u.entity_type = 'dosen' THEN d.nidn
        WHEN u.entity_type = 'mahasiswa' THEN m.nim
        ELSE NULL
      END as identifier
    FROM users u
    LEFT JOIN program_studi p ON u.prodi_id = p.id
    LEFT JOIN dosen d ON u.entity_type = 'dosen' AND u.entity_id = d.id
    LEFT JOIN mahasiswa m ON u.entity_type = 'mahasiswa' AND u.entity_id = m.id
    WHERE u.entity_type IN ('dosen', 'mahasiswa')
    ORDER BY u.entity_type, u.email
  `);

  return result.rows;
};

const getUserById = async (id) => {
  const result = await pool.query(
    `
    SELECT 
      u.id,
      u.email,
      u.entity_type as role,
      u.entity_id,
      u.prodi_id,
      p.nama_prodi,
      CASE 
        WHEN u.entity_type = 'dosen' THEN d.nama
        WHEN u.entity_type = 'mahasiswa' THEN m.nama
        ELSE NULL
      END as nama,
      CASE 
        WHEN u.entity_type = 'dosen' THEN d.nidn
        WHEN u.entity_type = 'mahasiswa' THEN m.nim
        ELSE NULL
      END as identifier
    FROM users u
    LEFT JOIN program_studi p ON u.prodi_id = p.id
    LEFT JOIN dosen d ON u.entity_type = 'dosen' AND u.entity_id = d.id
    LEFT JOIN mahasiswa m ON u.entity_type = 'mahasiswa' AND u.entity_id = m.id
    WHERE u.id = $1
    `,
    [id]
  );

  return result.rows[0];
};

const getUserByEmail = async (email) => {
  const result = await pool.query(
    `
    SELECT 
      u.id,
      u.email,
      u.entity_type as role,
      u.prodi_id,
      p.nama_prodi
    FROM users u
    LEFT JOIN program_studi p ON u.prodi_id = p.id
    WHERE u.email = $1
    `,
    [email]
  );

  return result.rows[0];
};

const createUser = async (email, password, role, prodi_id, nama, identifier) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const user_id = uuidv4();

    // Normalize role to lowercase
    const normalizedRole = role.toLowerCase();

    // Get role_id from roles table
    const roleResult = await client.query(
      `SELECT id FROM roles WHERE LOWER(nama_role) = LOWER($1)`,
      [normalizedRole]
    );
    
    if (roleResult.rows.length === 0) {
      throw new Error(`Role '${normalizedRole}' tidak ditemukan di tabel roles`);
    }
    
    const role_id = roleResult.rows[0].id;

    // Create entity first based on role (SESUAI SCHEMA DB LENGKAP.SQL)
    let entity_id = null;
    
    if (normalizedRole === 'dosen') {
      // Dosen table: HANYA nidn, nama (TIDAK ADA prodi_id, user_id, created_at, updated_at)
      const dosenNama = nama || email.split('@')[0];
      const nidn = identifier || `NIDN${Date.now().toString().slice(-8)}`;
      
      const dosenResult = await client.query(
        `INSERT INTO dosen (nidn, nama) VALUES ($1, $2) RETURNING id`,
        [nidn, dosenNama]
      );
      entity_id = dosenResult.rows[0].id;
      
    } else if (normalizedRole === 'mahasiswa') {
      // Mahasiswa table: prodi_id, nim, nama, angkatan (TIDAK ADA user_id, created_at, updated_at)
      const mhsNama = nama || email.split('@')[0];
      const nim = identifier || `NIM${Date.now().toString().slice(-8)}`;
      const angkatan = new Date().getFullYear();
      
      const mhsResult = await client.query(
        `INSERT INTO mahasiswa (prodi_id, nim, nama, angkatan) VALUES ($1, $2, $3, $4) RETURNING id`,
        [prodi_id, nim, mhsNama, angkatan]
      );
      entity_id = mhsResult.rows[0].id;
    }

    // Insert user (SESUAI MODULE1 - tanpa created_at/updated_at karena ada DEFAULT)
    await client.query(
      `INSERT INTO users (id, email, password_hash, role_id, prodi_id, entity_type, entity_id, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)`,
      [user_id, email, hashedPassword, role_id, prodi_id || null, normalizedRole, entity_id]
    );

    await client.query('COMMIT');
    
    // Get full user data
    const userWithDetails = await getUserById(user_id);
    return userWithDetails;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const updateUser = async (id, email, role) => {
  try {
    // Normalize role to lowercase
    const normalizedRole = role.toLowerCase();

    const result = await pool.query(
      `UPDATE users SET email = $1, entity_type = $2 WHERE id = $3 RETURNING id, email, entity_type as role`,
      [email, normalizedRole, id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const userWithDetails = await getUserById(id);
    return userWithDetails;
  } catch (error) {
    throw error;
  }
};

const deleteUser = async (id) => {
  try {
    const result = await pool.query(
      `DELETE FROM users WHERE id = $1 RETURNING id, email`,
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
};
