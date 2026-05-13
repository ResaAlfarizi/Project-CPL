const {
  findUserByEmail,
  createUser,
} = require("../models/authModel");

const {
  comparePassword,
  hashPassword,
} = require("../utils/bcrypt");

const {
  generateAccessToken,
} = require("../utils/jwt");


// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(404).json({
        message: "User tidak ditemukan",
      });
    }

    const isMatch = await comparePassword(
      password,
      user.password_hash
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Password salah",
      });
    }

    const token = generateAccessToken({
      id: user.id,
      role: user.nama_role,
    });

    res.json({
      message: "Login berhasil",
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// REGISTER
const register = async (req, res) => {
  try {
    const {
      email,
      password,
      role_id,
    } = req.body;

    const existingUser =
      await findUserByEmail(email);

    if (existingUser) {
      return res.status(400).json({
        message: "Email sudah digunakan",
      });
    }

    const hashedPassword =
      await hashPassword(password);

    const user = await createUser(
      email,
      hashedPassword,
      role_id
    );

    res.status(201).json({
      message: "User berhasil dibuat",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


module.exports = {
  login,
  register,
};