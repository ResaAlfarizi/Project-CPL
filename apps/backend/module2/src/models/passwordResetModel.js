const pool = require("../config/db");
const crypto = require("crypto");

/**
 * PASSWORD RESET MODEL
 * Mengelola token reset password via email
 * Token berlaku 1 jam, satu kali pakai
 */

// Hash token dengan SHA-256
const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

// Generate random reset token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Buat password reset token
const createPasswordResetToken = async (userId) => {
  const token = generateResetToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 jam

  const query = `
    INSERT INTO password_resets (
      user_id,
      token_hash,
      expires_at
    )
    VALUES ($1, $2, $3)
    RETURNING id, user_id, expires_at, created_at
  `;

  const values = [userId, tokenHash, expiresAt];
  const result = await pool.query(query, values);

  return {
    token, // Plain token yang dikirim via email
    ...result.rows[0],
  };
};

// Verifikasi password reset token
const verifyPasswordResetToken = async (token) => {
  const tokenHash = hashToken(token);

  const query = `
    SELECT 
      pr.id,
      pr.user_id,
      pr.expires_at,
      pr.used_at,
      u.email,
      u.is_active
    FROM password_resets pr
    JOIN users u ON pr.user_id = u.id
    WHERE pr.token_hash = $1
      AND pr.used_at IS NULL
      AND pr.expires_at > NOW()
  `;

  const result = await pool.query(query, [tokenHash]);

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
};

// Tandai token sebagai sudah digunakan
const markTokenAsUsed = async (token) => {
  const tokenHash = hashToken(token);

  const query = `
    UPDATE password_resets
    SET used_at = NOW()
    WHERE token_hash = $1
      AND used_at IS NULL
    RETURNING id, user_id
  `;

  const result = await pool.query(query, [tokenHash]);
  return result.rows[0];
};

// Hapus semua reset tokens milik user (saat password berhasil diubah)
const deleteUserResetTokens = async (userId) => {
  const query = `
    DELETE FROM password_resets
    WHERE user_id = $1
    RETURNING COUNT(*) as deleted_count
  `;

  const result = await pool.query(query, [userId]);
  return result.rows[0]?.deleted_count || 0;
};

// Cleanup expired tokens (untuk maintenance/cron job)
const cleanupExpiredTokens = async () => {
  const query = `
    DELETE FROM password_resets
    WHERE expires_at < NOW()
      OR used_at < NOW() - INTERVAL '7 days'
    RETURNING COUNT(*) as deleted_count
  `;

  const result = await pool.query(query);
  return result.rows[0]?.deleted_count || 0;
};

// Cek berapa kali user request reset dalam 1 jam terakhir (anti-spam)
const countRecentResetRequests = async (userId, hours = 1) => {
  const query = `
    SELECT COUNT(*) as count
    FROM password_resets
    WHERE user_id = $1
      AND created_at > NOW() - INTERVAL '${hours} hours'
  `;

  const result = await pool.query(query, [userId]);
  return parseInt(result.rows[0]?.count || 0);
};

module.exports = {
  generateResetToken,
  hashToken,
  createPasswordResetToken,
  verifyPasswordResetToken,
  markTokenAsUsed,
  deleteUserResetTokens,
  cleanupExpiredTokens,
  countRecentResetRequests,
};
