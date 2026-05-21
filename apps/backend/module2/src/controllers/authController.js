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

const {
  createAuthAuditLog,
} = require("../models/authAuditLogModel");


// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);

    if (!user) {
      // Log failed login - user not found
      if (user) {
        await createAuthAuditLog(
          user.id,
          'login_failed',
          req.ip,
          req.get('user-agent'),
          { reason: 'user_not_found', email }
        );
      }

      return res.status(404).json({
        message: "User tidak ditemukan",
      });
    }

    const isMatch = await comparePassword(
      password,
      user.password_hash
    );

    if (!isMatch) {
      // Log failed login - wrong password
      await createAuthAuditLog(
        user.id,
        'login_failed',
        req.ip,
        req.get('user-agent'),
        { reason: 'wrong_password', email }
      );

      return res.status(401).json({
        message: "Password salah",
      });
    }

    // Log successful login
    await createAuthAuditLog(
      user.id,
      'login_success',
      req.ip,
      req.get('user-agent'),
      { email }
    );

    const token = generateAccessToken({
      id: user.id,
      role: user.nama_role,
      entity_id: user.entity_id,
      entity_type: user.entity_type,
      prodi_id: user.prodi_id,
      nama: user.nama_entity,
    });

    res.json({
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.nama_role,
        entity_type: user.entity_type,
        entity_id: user.entity_id,
        prodi_id: user.prodi_id,
        nama: user.nama_entity,
      },
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