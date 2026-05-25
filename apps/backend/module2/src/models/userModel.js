const pool = require("../config/db");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

const getAllUsers = async () => {
  const result = await pool.query(`
    SELECT 
      users.id,
      users.email,
      roles.nama_role as role
    FROM users
    JOIN roles ON users.role_id = roles.id
  `);

  return result.rows;
};

const getUserById = async (id) => {
  const result = await pool.query(
    `
    SELECT 
      users.id,
      users.email,
      roles.nama_role as role
    FROM users
    JOIN roles ON users.role_id = roles.id
    WHERE users.id = $1
    `,
    [id]
  );

  return result.rows[0];
};

const getUserByEmail = async (email) => {
  const result = await pool.query(
    `
    SELECT 
      users.id,
      users.email,
      roles.nama_role as role
    FROM users
    JOIN roles ON users.role_id = roles.id
    WHERE users.email = $1
    `,
    [email]
  );

  return result.rows[0];
};

const createUser = async (email, password, role) => {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get role_id dari nama role
    const roleResult = await pool.query(
      `SELECT id FROM roles WHERE LOWER(nama_role) = LOWER($1)`,
      [role]
    );

    if (roleResult.rows.length === 0) {
      throw new Error(`Role '${role}' tidak ditemukan`);
    }

    const role_id = roleResult.rows[0].id;
    const user_id = uuidv4();

    const result = await pool.query(
      `
      INSERT INTO users (id, email, password_hash, role_id, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id, email, role_id
      `,
      [user_id, email, hashedPassword, role_id]
    );

    // Get role name
    const userWithRole = await getUserById(user_id);
    return userWithRole;
  } catch (error) {
    throw error;
  }
};

const updateUser = async (id, email, role) => {
  try {
    // Get role_id dari nama role
    const roleResult = await pool.query(
      `SELECT id FROM roles WHERE LOWER(nama_role) = LOWER($1)`,
      [role]
    );

    if (roleResult.rows.length === 0) {
      throw new Error(`Role '${role}' tidak ditemukan`);
    }

    const role_id = roleResult.rows[0].id;

    const result = await pool.query(
      `
      UPDATE users 
      SET email = $1, role_id = $2
      WHERE id = $3
      RETURNING id, email, role_id
      `,
      [email, role_id, id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const userWithRole = await getUserById(id);
    return userWithRole;
  } catch (error) {
    throw error;
  }
};

const deleteUser = async (id) => {
  try {
    const result = await pool.query(
      `
      DELETE FROM users
      WHERE id = $1
      RETURNING id, email
      `,
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