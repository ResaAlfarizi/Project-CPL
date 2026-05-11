const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "projectcpl",
  password: "Resaeja08",
  port: 5432,
});

module.exports = pool;