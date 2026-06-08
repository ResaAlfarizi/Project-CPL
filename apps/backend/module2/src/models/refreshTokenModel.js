const pool = require("../config/db");
const crypto = require("crypto");

/**
 * REFRESH TOKEN MODEL
 * Mengelola refresh tokens untuk session management multi-device
 * Refresh token berlaku 7 hari, access token 15 menit
 */

// Hash token dengan SHA-256
const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

// Generate random refresh token
const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString("hex");
};

// Buat refresh token baru
const createRefreshToken = async (
  userId,
  deviceInfo = null,
  ipAddress = null
) => {
  const token = generateRefreshToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 hari

  const query = `
    INSERT INTO refresh_tokens (
      user_id,
      token_hash,
      device_info,
      ip_address,
      expires_at
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, user_id, device_info, ip_address, expires_at, created_at
  `;

  const values = [userId, tokenHash, deviceInfo, ipAddress, expiresAt];
  const result = await pool.query(query, values);

  return {
    token, // Plain token yang dikirim ke client
    ...result.rows[0],
  };
};

// Verifikasi refresh token
const verifyRefreshToken = async (token) => {
  const tokenHash = hashToken(token);

  const query = `
    SELECT 
      rt.id,
      rt.user_id,
      rt.device_info,
      rt.ip_address,
      rt.expires_at,
      rt.revoked_at,
      u.email,
      u.is_active,
      u.entity_type,
      u.entity_id,
      u.prodi_id,
      r.nama_role,
      CASE 
        WHEN u.entity_type = 'dosen' THEN d.nama
        WHEN u.entity_type = 'mahasiswa' THEN m.nama
        ELSE NULL
      END as nama_entity
    FROM refresh_tokens rt
    JOIN users u ON rt.user_id = u.id
    JOIN roles r ON u.role_id = r.id
    LEFT JOIN dosen d ON u.entity_id = d.id AND u.entity_type = 'dosen'
    LEFT JOIN mahasiswa m ON u.entity_id = m.id AND u.entity_type = 'mahasiswa'
    WHERE rt.token_hash = $1
      AND rt.revoked_at IS NULL
      AND rt.expires_at > NOW()
  `;

  const result = await pool.query(query, [tokenHash]);

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
};

// Revoke single refresh token
const revokeRefreshToken = async (token) => {
  const tokenHash = hashToken(token);

  const query = `
    UPDATE refresh_tokens
    SET revoked_at = NOW()
    WHERE token_hash = $1
      AND revoked_at IS NULL
    RETURNING id, user_id
  `;

  const result = await pool.query(query, [tokenHash]);
  return result.rows[0];
};

// Revoke semua refresh tokens milik user (logout all devices)
const revokeAllUserTokens = async (userId) => {
  const query = `
    UPDATE refresh_tokens
    SET revoked_at = NOW()
    WHERE user_id = $1
      AND revoked_at IS NULL
    RETURNING COUNT(*) as revoked_count
  `;

  const result = await pool.query(query, [userId]);
  return result.rows[0]?.revoked_count || 0;
};

// Ambil semua active sessions user
const getUserActiveSessions = async (userId) => {
  const query = `
    SELECT 
      id,
      device_info,
      ip_address,
      created_at,
      expires_at
    FROM refresh_tokens
    WHERE user_id = $1
      AND revoked_at IS NULL
      AND expires_at > NOW()
    ORDER BY created_at DESC
  `;

  const result = await pool.query(query, [userId]);
  return result.rows;
};

// Cleanup expired tokens (untuk maintenance/cron job)
const cleanupExpiredTokens = async () => {
  const query = `
    DELETE FROM refresh_tokens
    WHERE expires_at < NOW()
      OR revoked_at < NOW() - INTERVAL '30 days'
    RETURNING COUNT(*) as deleted_count
  `;

  const result = await pool.query(query);
  return result.rows[0]?.deleted_count || 0;
};

// Cleanup tokens by user (untuk cascade delete saat hapus user)
const deleteUserTokens = async (userId) => {
  const query = `
    DELETE FROM refresh_tokens
    WHERE user_id = $1
    RETURNING COUNT(*) as deleted_count
  `;

  const result = await pool.query(query, [userId]);
  return result.rows[0]?.deleted_count || 0;
};

module.exports = {
  generateRefreshToken,
  hashToken,
  createRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  getUserActiveSessions,
  cleanupExpiredTokens,
  deleteUserTokens,
};
