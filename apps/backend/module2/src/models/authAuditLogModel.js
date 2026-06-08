const pool = require("../config/db");

/**
 * AUTH AUDIT LOG MODEL
 * Mengelola data audit log untuk autentikasi
 * Event types: login_success, login_failed, logout, token_refresh, 
 *              account_locked, password_reset_req, password_changed
 */

// Ambil semua auth audit log
const getAllAuthAuditLog = async (limit = 100, offset = 0) => {
  const query = `
    SELECT 
      aal.id,
      aal.user_id,
      aal.event_type,
      aal.ip_address,
      aal.user_agent,
      aal.detail,
      aal.created_at,
      u.email as user_email,
      CASE 
        WHEN u.entity_type = 'dosen' THEN d.nama
        WHEN u.entity_type = 'mahasiswa' THEN m.nama
        ELSE 'Admin'
      END as user_name
    FROM auth_audit_log aal
    LEFT JOIN users u ON aal.user_id = u.id
    LEFT JOIN dosen d ON u.entity_id = d.id AND u.entity_type = 'dosen'
    LEFT JOIN mahasiswa m ON u.entity_id = m.id AND u.entity_type = 'mahasiswa'
    ORDER BY aal.created_at DESC
    LIMIT $1 OFFSET $2
  `;

  const result = await pool.query(query, [limit, offset]);
  return result.rows;
};

// Ambil auth audit log berdasarkan ID
const getAuthAuditLogById = async (id) => {
  const query = `
    SELECT 
      aal.id,
      aal.user_id,
      aal.event_type,
      aal.ip_address,
      aal.user_agent,
      aal.detail,
      aal.created_at,
      u.email as user_email,
      CASE 
        WHEN u.entity_type = 'dosen' THEN d.nama
        WHEN u.entity_type = 'mahasiswa' THEN m.nama
        ELSE 'Admin'
      END as user_name
    FROM auth_audit_log aal
    LEFT JOIN users u ON aal.user_id = u.id
    LEFT JOIN dosen d ON u.entity_id = d.id AND u.entity_type = 'dosen'
    LEFT JOIN mahasiswa m ON u.entity_id = m.id AND u.entity_type = 'mahasiswa'
    WHERE aal.id = $1
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Ambil auth audit log berdasarkan user
const getAuthAuditLogByUserId = async (userId, limit = 100, offset = 0) => {
  const query = `
    SELECT 
      id,
      user_id,
      event_type,
      ip_address,
      user_agent,
      detail,
      created_at
    FROM auth_audit_log
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3
  `;

  const result = await pool.query(query, [userId, limit, offset]);
  return result.rows;
};

// Ambil auth audit log berdasarkan event type
const getAuthAuditLogByEventType = async (eventType, limit = 100, offset = 0) => {
  const query = `
    SELECT 
      aal.id,
      aal.user_id,
      aal.event_type,
      aal.ip_address,
      aal.user_agent,
      aal.detail,
      aal.created_at,
      u.email as user_email
    FROM auth_audit_log aal
    LEFT JOIN users u ON aal.user_id = u.id
    WHERE aal.event_type = $1
    ORDER BY aal.created_at DESC
    LIMIT $2 OFFSET $3
  `;

  const result = await pool.query(query, [eventType, limit, offset]);
  return result.rows;
};

// Ambil statistik login
const getLoginStatistics = async (days = 7) => {
  const query = `
    SELECT 
      DATE(created_at) as date,
      COUNT(*) FILTER (WHERE event_type = 'login_success') as successful_logins,
      COUNT(*) FILTER (WHERE event_type = 'login_failed') as failed_logins,
      COUNT(*) FILTER (WHERE event_type = 'account_locked') as account_locked
    FROM auth_audit_log
    WHERE created_at >= NOW() - INTERVAL '${days} days'
    GROUP BY DATE(created_at)
    ORDER BY date DESC
  `;

  const result = await pool.query(query);
  return result.rows;
};

// Ambil user dengan login gagal terbanyak
const getUsersWithMostFailedLogins = async (days = 7, limit = 10) => {
  const query = `
    SELECT 
      aal.user_id,
      u.email,
      COUNT(*) as failed_attempts,
      MAX(aal.created_at) as last_failed_attempt
    FROM auth_audit_log aal
    JOIN users u ON aal.user_id = u.id
    WHERE aal.event_type = 'login_failed'
      AND aal.created_at >= NOW() - INTERVAL '${days} days'
    GROUP BY aal.user_id, u.email
    ORDER BY failed_attempts DESC
    LIMIT $1
  `;

  const result = await pool.query(query, [limit]);
  return result.rows;
};

// Buat auth audit log baru
const createAuthAuditLog = async (
  userId,
  eventType,
  ipAddress,
  userAgent,
  detail = null
) => {
  const query = `
    INSERT INTO auth_audit_log (
      user_id,
      event_type,
      ip_address,
      user_agent,
      detail
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;

  const values = [
    userId,
    eventType,
    ipAddress,
    userAgent,
    detail ? JSON.stringify(detail) : null,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

// Hapus auth audit log lama (untuk maintenance)
const deleteOldAuthAuditLog = async (days = 90) => {
  const query = `
    DELETE FROM auth_audit_log 
    WHERE created_at < NOW() - INTERVAL '${days} days'
    RETURNING COUNT(*) as deleted_count
  `;

  const result = await pool.query(query);
  return result.rows[0];
};

// ✅ BARU: Hapus auth audit log berdasarkan user_id (untuk cascade delete)
const deleteAuthAuditLogByUserId = async (userId) => {
  const query = `
    DELETE FROM auth_audit_log 
    WHERE user_id = $1
    RETURNING COUNT(*) as deleted_count
  `;

  const result = await pool.query(query, [userId]);
  return result.rows[0];
};

module.exports = {
  getAllAuthAuditLog,
  getAuthAuditLogById,
  getAuthAuditLogByUserId,
  getAuthAuditLogByEventType,
  getLoginStatistics,
  getUsersWithMostFailedLogins,
  createAuthAuditLog,
  deleteOldAuthAuditLog,
  deleteAuthAuditLogByUserId, // ✅ Export fungsi baru
};