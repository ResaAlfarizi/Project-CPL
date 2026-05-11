const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await db.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({
        message: "User tidak ditemukan",
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].password_hash
    );

    if (!validPassword) {
      return res.status(401).json({
        message: "Password salah",
      });
    }

    const token = jwt.sign(
      {
        id: user.rows[0].id,
        role: user.rows[0].role_id,
      },
      "SECRET_KEY",
      {
        expiresIn: "1d",
      }
    );

    res.json({
      token,
    });

  } catch (err) {
    console.log(err);
  }
};