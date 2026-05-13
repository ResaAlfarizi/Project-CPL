const pool = require("../config/db");

const findUserByEmail = async (email) => {
  const query = `
    SELECT 
      users.*,
      roles.nama_role
    FROM users
    JOIN roles ON users.role_id = roles.id
    WHERE email = $1
  `;

  const result = await pool.query(query, [email]);

  return result.rows[0];
};

const createUser = async (
  email,
  passwordHash,
  roleId
) => {
  const query = `
    INSERT INTO users (
      email,
      password_hash,
      role_id
    )
    VALUES ($1, $2, $3)
    RETURNING *
  `;

  const values = [
    email,
    passwordHash,
    roleId,
  ];

  const result = await pool.query(
    query,
    values
  );

  return result.rows[0];
};

module.exports = {
  findUserByEmail,
  createUser,
};