const express = require("express");
const router = express.Router();

const {
  getAllAuthAuditLogHandler,
  getAuthAuditLogByIdHandler,
  getAuthAuditLogByUserHandler,
  getAuthAuditLogByEventTypeHandler,
  getLoginStatisticsHandler,
  getUsersWithMostFailedLoginsHandler,
  deleteOldAuthAuditLogHandler,
} = require("../controllers/authAuditLogController");

const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

/**
 * AUTH AUDIT LOG ROUTES
 * 
 * Matrik Hak Akses:
 * - SUPERADMIN: R/D (Read, Delete)
 * - ADMIN PRODI: R (Read only)
 * - DOSEN: - (No access)
 * - MAHASISWA: - (No access)
 */

// GET semua auth audit log - SUPERADMIN, ADMIN PRODI (Read)
router.get(
  "/",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi"),
  getAllAuthAuditLogHandler
);

// GET auth audit log berdasarkan ID - SUPERADMIN, ADMIN PRODI (Read)
router.get(
  "/:id",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi"),
  getAuthAuditLogByIdHandler
);

// GET auth audit log berdasarkan user - SUPERADMIN, ADMIN PRODI (Read)
router.get(
  "/user/:user_id",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi"),
  getAuthAuditLogByUserHandler
);

// GET auth audit log berdasarkan event type - SUPERADMIN, ADMIN PRODI (Read)
router.get(
  "/event/:event_type",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi"),
  getAuthAuditLogByEventTypeHandler
);

// GET statistik login - SUPERADMIN, ADMIN PRODI (Read)
router.get(
  "/statistics/login",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi"),
  getLoginStatisticsHandler
);

// GET user dengan login gagal terbanyak - SUPERADMIN, ADMIN PRODI (Read)
router.get(
  "/statistics/failed-logins",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi"),
  getUsersWithMostFailedLoginsHandler
);

// DELETE auth audit log lama - SUPERADMIN only (Delete)
router.delete(
  "/cleanup",
  authMiddleware,
  authorize("Superadmin"),
  deleteOldAuthAuditLogHandler
);

module.exports = router;
