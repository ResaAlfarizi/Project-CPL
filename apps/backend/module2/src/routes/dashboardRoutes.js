const express = require("express");
const router = express.Router();

const {
  getDashboardAdminHandler,
  getDashboardDosenHandler,
  getDashboardMahasiswaHandler,
  getDashboardSuperadminHandler,
} = require("../controllers/dashboardController");

const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

/**
 * DASHBOARD ROUTES
 * 
 * Matrik Hak Akses:
 * - SUPERADMIN: R/W/D (Read, Write, Delete)
 * - ADMIN PRODI: R/W (Read, Write)
 * - DOSEN: - (Tidak ada akses)
 * - MAHASISWA: - (Tidak ada akses)
 */

// GET dashboard untuk SUPERADMIN (Global - semua prodi)
router.get(
  "/superadmin",
  authMiddleware,
  authorize("Superadmin"),
  getDashboardSuperadminHandler
);

// GET dashboard untuk ADMIN PRODI (per prodi)
router.get(
  "/admin/:prodi_id",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi"),
  getDashboardAdminHandler
);

// GET dashboard untuk DOSEN
router.get(
  "/dosen",
  authMiddleware,
  authorize("Dosen"),
  getDashboardDosenHandler
);

// GET dashboard untuk MAHASISWA
router.get(
  "/mahasiswa",
  authMiddleware,
  authorize("Mahasiswa"),
  getDashboardMahasiswaHandler
);

module.exports = router;
