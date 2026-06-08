const {
  getAllAuthAuditLog,
  getAuthAuditLogById,
  getAuthAuditLogByUserId,
  getAuthAuditLogByEventType,
  getLoginStatistics,
  getUsersWithMostFailedLogins,
  deleteOldAuthAuditLog,
  deleteAuthAuditLogByUserId, // ✅ Import fungsi baru
} = require("../models/authAuditLogModel");

const { successResponse, errorResponse } = require("../utils/response");

/**
 * AUTH AUDIT LOG CONTROLLER
 * Mengatur logika bisnis untuk auth audit log
 */

// GET semua auth audit log
const getAllAuthAuditLogHandler = async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const auditLog = await getAllAuthAuditLog(parseInt(limit), parseInt(offset));
    return successResponse(res, auditLog, "Berhasil mengambil data auth audit log");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET auth audit log berdasarkan ID
const getAuthAuditLogByIdHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const auditLog = await getAuthAuditLogById(id);

    if (!auditLog) {
      return errorResponse(res, "Auth audit log tidak ditemukan", 404);
    }

    return successResponse(res, auditLog, "Berhasil mengambil data auth audit log");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET auth audit log berdasarkan user
const getAuthAuditLogByUserHandler = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { limit = 100, offset = 0 } = req.query;
    const auditLog = await getAuthAuditLogByUserId(
      user_id,
      parseInt(limit),
      parseInt(offset)
    );

    return successResponse(res, auditLog, "Berhasil mengambil data auth audit log");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET auth audit log berdasarkan event type
const getAuthAuditLogByEventTypeHandler = async (req, res) => {
  try {
    const { event_type } = req.params;
    const { limit = 100, offset = 0 } = req.query;
    
    // Validasi event type
    const validEventTypes = [
      'login_success',
      'login_failed',
      'logout',
      'token_refresh',
      'account_locked',
      'password_reset_req',
      'password_changed'
    ];
    
    if (!validEventTypes.includes(event_type)) {
      return errorResponse(res, "Event type tidak valid", 400);
    }

    const auditLog = await getAuthAuditLogByEventType(
      event_type,
      parseInt(limit),
      parseInt(offset)
    );

    return successResponse(res, auditLog, "Berhasil mengambil data auth audit log");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET statistik login
const getLoginStatisticsHandler = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const statistics = await getLoginStatistics(parseInt(days));

    return successResponse(res, statistics, "Berhasil mengambil statistik login");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET user dengan login gagal terbanyak
const getUsersWithMostFailedLoginsHandler = async (req, res) => {
  try {
    const { days = 7, limit = 10 } = req.query;
    const users = await getUsersWithMostFailedLogins(
      parseInt(days),
      parseInt(limit)
    );

    return successResponse(
      res,
      users,
      "Berhasil mengambil data user dengan login gagal terbanyak"
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// DELETE auth audit log lama
const deleteOldAuthAuditLogHandler = async (req, res) => {
  try {
    const { days = 90 } = req.query;
    const result = await deleteOldAuthAuditLog(parseInt(days));

    return successResponse(
      res,
      result,
      `Berhasil menghapus auth audit log lebih dari ${days} hari`
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// ✅ BARU: DELETE auth audit log berdasarkan user_id (untuk cascade delete)
const deleteAuthAuditLogByUserHandler = async (req, res) => {
  try {
    const { user_id } = req.params;
    
    if (!user_id) {
      return errorResponse(res, "User ID tidak ditemukan", 400);
    }
    
    const result = await deleteAuthAuditLogByUserId(user_id);

    return successResponse(
      res,
      result,
      `Berhasil menghapus ${result.deleted_count || 0} audit log untuk user ID ${user_id}`
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  getAllAuthAuditLogHandler,
  getAuthAuditLogByIdHandler,
  getAuthAuditLogByUserHandler,
  getAuthAuditLogByEventTypeHandler,
  getLoginStatisticsHandler,
  getUsersWithMostFailedLoginsHandler,
  deleteOldAuthAuditLogHandler,
  deleteAuthAuditLogByUserHandler, // ✅ Export handler baru
};