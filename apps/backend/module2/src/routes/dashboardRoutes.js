const express = require("express");
const router = express.Router();

const {
  getDashboardAdminHandler,
  getDashboardDosenHandler,
  getDashboardMahasiswaHandler,
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

// GET dashboard untuk SUPERADMIN/ADMIN PRODI
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
