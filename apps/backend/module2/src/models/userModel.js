const pool = require("../config/db");

const getAllUsers = async () => {
  const result = await pool.query(`
    SELECT 
      users.id,
      users.email,
      roles.nama_role
    FROM users
    JOIN roles ON users.role_id = roles.id
  `);

  return result.rows;
};

module.exports = {
  getAllUsers,
};