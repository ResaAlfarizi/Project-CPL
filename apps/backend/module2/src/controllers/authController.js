const pool = require("../config/db");

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
  verifyToken,
} = require("../utils/jwt");

const {
  createAuthAuditLog,
} = require("../models/authAuditLogModel");

const {
  createRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  getUserActiveSessions,
} = require("../models/refreshTokenModel");

const {
  createPasswordResetToken,
  verifyPasswordResetToken,
  markTokenAsUsed,
  deleteUserResetTokens,
  countRecentResetRequests,
} = require("../models/passwordResetModel");


// LOGIN dengan Account Lockout & Refresh Token
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(404).json({
        message: "User tidak ditemukan",
      });
    }

    // ✅ CHECK 1: Apakah akun aktif?
    if (!user.is_active) {
      await createAuthAuditLog(
        user.id,
        'login_failed',
        req.ip,
        req.get('user-agent'),
        { reason: 'account_inactive', email }
      );

      return res.status(403).json({
        message: "Akun tidak aktif. Hubungi administrator.",
      });
    }

    // ✅ CHECK 2: Apakah akun terkunci? (5× failed login = lock 15 menit)
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      await createAuthAuditLog(
        user.id,
        'login_failed',
        req.ip,
        req.get('user-agent'),
        { reason: 'account_locked', locked_until: user.locked_until }
      );

      const lockMinutesLeft = Math.ceil(
        (new Date(user.locked_until) - new Date()) / 60000
      );

      return res.status(423).json({
        message: `Akun terkunci. Coba lagi dalam ${lockMinutesLeft} menit.`,
        locked_until: user.locked_until,
      });
    }

    // ✅ CHECK 3: Verifikasi password
    const isMatch = await comparePassword(password, user.password_hash);

    if (!isMatch) {
      // ❌ Password salah - increment failed_login_count
      const newFailedCount = (user.failed_login_count || 0) + 1;
      const shouldLock = newFailedCount >= 5;

      await pool.query(
        `UPDATE users SET 
          failed_login_count = $1,
          locked_until = CASE 
            WHEN $2 THEN NOW() + INTERVAL '15 minutes'
            ELSE locked_until 
          END
        WHERE id = $3`,
        [newFailedCount, shouldLock, user.id]
      );

      // Log failed login
      await createAuthAuditLog(
        user.id,
        shouldLock ? 'account_locked' : 'login_failed',
        req.ip,
        req.get('user-agent'),
        {
          reason: 'wrong_password',
          failed_attempts: newFailedCount,
          locked: shouldLock,
        }
      );

      if (shouldLock) {
        return res.status(423).json({
          message: `Terlalu banyak percobaan login gagal. Akun terkunci selama 15 menit.`,
          locked: true,
        });
      }

      return res.status(401).json({
        message: `Password salah. ${5 - newFailedCount} percobaan tersisa.`,
        attempts_left: 5 - newFailedCount,
      });
    }

    // ✅ LOGIN SUKSES - Reset failed_login_count & generate tokens
    await pool.query(
      `UPDATE users SET 
        failed_login_count = 0,
        locked_until = NULL,
        last_login_at = NOW()
      WHERE id = $1`,
      [user.id]
    );

    // Generate Access Token (15 menit)
    const accessToken = generateAccessToken({
      id: user.id,
      role: user.nama_role,
      entity_id: user.entity_id,
      entity_type: user.entity_type,
      prodi_id: user.prodi_id,
      nama: user.nama_entity,
    });

    // Generate Refresh Token (7 hari)
    const deviceInfo = req.get('user-agent') || 'Unknown Device';
    const refreshTokenData = await createRefreshToken(
      user.id,
      deviceInfo,
      req.ip
    );

    // Log successful login
    await createAuthAuditLog(
      user.id,
      'login_success',
      req.ip,
      req.get('user-agent'),
      { email }
    );

    res.json({
      message: "Login berhasil",
      access_token: accessToken,
      refresh_token: refreshTokenData.token,
      expires_in: 900, // 15 menit dalam detik
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
    console.error('Login error:', error);
    res.status(500).json({
      message: error.message,
    });
  }
};


// REFRESH TOKEN - Dapatkan access token baru
const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        message: "Refresh token diperlukan",
      });
    }

    // Verifikasi refresh token
    const tokenData = await verifyRefreshToken(refresh_token);

    if (!tokenData) {
      return res.status(401).json({
        message: "Refresh token tidak valid atau sudah kadaluarsa",
      });
    }

    // Cek apakah user masih aktif
    if (!tokenData.is_active) {
      return res.status(403).json({
        message: "Akun tidak aktif",
      });
    }

    // Generate access token baru
    const accessToken = generateAccessToken({
      id: tokenData.user_id,
      role: tokenData.nama_role,
      entity_id: tokenData.entity_id,
      entity_type: tokenData.entity_type,
      prodi_id: tokenData.prodi_id,
      nama: tokenData.nama_entity,
    });

    // Log token refresh
    await createAuthAuditLog(
      tokenData.user_id,
      'token_refresh',
      req.ip,
      req.get('user-agent'),
      { device: tokenData.device_info }
    );

    res.json({
      message: "Token berhasil di-refresh",
      access_token: accessToken,
      expires_in: 900, // 15 menit
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      message: error.message,
    });
  }
};


// LOGOUT - Revoke refresh token
const logout = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        message: "Refresh token diperlukan",
      });
    }

    const revokedToken = await revokeRefreshToken(refresh_token);

    if (!revokedToken) {
      return res.status(404).json({
        message: "Token tidak ditemukan",
      });
    }

    // Log logout
    await createAuthAuditLog(
      revokedToken.user_id,
      'logout',
      req.ip,
      req.get('user-agent'),
      null
    );

    res.json({
      message: "Logout berhasil",
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      message: error.message,
    });
  }
};


// LOGOUT ALL DEVICES - Revoke semua refresh tokens user
const logoutAllDevices = async (req, res) => {
  try {
    // User ID dari JWT yang sudah terverifikasi di middleware
    const userId = req.user.id;

    const revokedCount = await revokeAllUserTokens(userId);

    // Log logout all
    await createAuthAuditLog(
      userId,
      'logout',
      req.ip,
      req.get('user-agent'),
      { logout_type: 'all_devices', revoked_count: revokedCount }
    );

    res.json({
      message: `Berhasil logout dari ${revokedCount} device`,
      revoked_count: revokedCount,
    });
  } catch (error) {
    console.error('Logout all devices error:', error);
    res.status(500).json({
      message: error.message,
    });
  }
};


// GET ACTIVE SESSIONS - Lihat semua device yang sedang login
const getActiveSessions = async (req, res) => {
  try {
    const userId = req.user.id;

    const sessions = await getUserActiveSessions(userId);

    res.json({
      message: "Berhasil mengambil active sessions",
      count: sessions.length,
      sessions,
    });
  } catch (error) {
    console.error('Get active sessions error:', error);
    res.status(500).json({
      message: error.message,
    });
  }
};


// FORGOT PASSWORD - Request reset password token
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email diperlukan",
      });
    }

    const user = await findUserByEmail(email);

    // Jangan beritahu apakah email ada atau tidak (security best practice)
    if (!user) {
      return res.json({
        message: "Jika email terdaftar, link reset password akan dikirim",
      });
    }

    // Cek apakah user aktif
    if (!user.is_active) {
      return res.json({
        message: "Jika email terdaftar, link reset password akan dikirim",
      });
    }

    // Anti-spam: Maksimal 3 request per jam
    const recentRequests = await countRecentResetRequests(user.id, 1);
    if (recentRequests >= 3) {
      return res.status(429).json({
        message: "Terlalu banyak permintaan reset password. Coba lagi nanti.",
      });
    }

    // Generate reset token
    const resetToken = await createPasswordResetToken(user.id);

    // Log password reset request
    await createAuthAuditLog(
      user.id,
      'password_reset_req',
      req.ip,
      req.get('user-agent'),
      { email }
    );

    // TODO: Kirim email dengan link reset
    // const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken.token}`;
    // await sendEmail(user.email, 'Reset Password', resetLink);

    res.json({
      message: "Jika email terdaftar, link reset password akan dikirim",
      // DEVELOPMENT ONLY - Remove in production!
      ...(process.env.NODE_ENV === 'development' && {
        dev_token: resetToken.token,
        dev_expires_at: resetToken.expires_at,
      }),
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      message: error.message,
    });
  }
};


// RESET PASSWORD - Reset password dengan token
const resetPassword = async (req, res) => {
  try {
    const { token, new_password } = req.body;

    if (!token || !new_password) {
      return res.status(400).json({
        message: "Token dan password baru diperlukan",
      });
    }

    // Validasi password minimal 6 karakter
    if (new_password.length < 6) {
      return res.status(400).json({
        message: "Password minimal 6 karakter",
      });
    }

    // Verifikasi token
    const tokenData = await verifyPasswordResetToken(token);

    if (!tokenData) {
      return res.status(400).json({
        message: "Token tidak valid atau sudah kadaluarsa",
      });
    }

    // Hash password baru
    const hashedPassword = await hashPassword(new_password);

    // Update password di database
    await pool.query(
      `UPDATE users SET password_hash = $1 WHERE id = $2`,
      [hashedPassword, tokenData.user_id]
    );

    // Tandai token sebagai sudah digunakan
    await markTokenAsUsed(token);

    // Hapus semua reset tokens user (opsional, untuk keamanan)
    await deleteUserResetTokens(tokenData.user_id);

    // Revoke semua refresh tokens (paksa logout dari semua device)
    await revokeAllUserTokens(tokenData.user_id);

    // Log password changed
    await createAuthAuditLog(
      tokenData.user_id,
      'password_changed',
      req.ip,
      req.get('user-agent'),
      { method: 'reset_token' }
    );

    res.json({
      message: "Password berhasil diubah. Silakan login dengan password baru.",
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      message: error.message,
    });
  }
};


// CHANGE PASSWORD - Ubah password (user sudah login)
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
      return res.status(400).json({
        message: "Password lama dan baru diperlukan",
      });
    }

    // Validasi password minimal 6 karakter
    if (new_password.length < 6) {
      return res.status(400).json({
        message: "Password baru minimal 6 karakter",
      });
    }

    // Ambil user dari database
    const userQuery = await pool.query(
      `SELECT password_hash, email FROM users WHERE id = $1`,
      [userId]
    );

    if (userQuery.rows.length === 0) {
      return res.status(404).json({
        message: "User tidak ditemukan",
      });
    }

    const user = userQuery.rows[0];

    // Verifikasi password lama
    const isMatch = await comparePassword(old_password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        message: "Password lama salah",
      });
    }

    // Hash password baru
    const hashedPassword = await hashPassword(new_password);

    // Update password
    await pool.query(
      `UPDATE users SET password_hash = $1 WHERE id = $2`,
      [hashedPassword, userId]
    );

    // Revoke semua refresh tokens kecuali yang sedang dipakai (opsional)
    // await revokeAllUserTokens(userId);

    // Log password changed
    await createAuthAuditLog(
      userId,
      'password_changed',
      req.ip,
      req.get('user-agent'),
      { method: 'manual_change' }
    );

    res.json({
      message: "Password berhasil diubah",
    });
  } catch (error) {
    console.error('Change password error:', error);
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
  refreshToken,
  logout,
  logoutAllDevices,
  getActiveSessions,
  forgotPassword,
  resetPassword,
  changePassword,
  register,
};