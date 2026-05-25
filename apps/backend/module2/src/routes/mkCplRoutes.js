const express = require("express");
const router = express.Router();

const {
  getAllMKCPLHandler,
  getMKCPLByDosenHandler,
  getMKCPLByMKHandler,
} = require("../controllers/mkCplController");

const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

/**
 * MK_CPL ROUTES (Read-only)
 * Untuk mendukung form Sub-CPMK
 */

// GET semua MK_CPL
router.get(
  "/",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi", "Dosen"),
  getAllMKCPLHandler
);

// GET MK_CPL berdasarkan dosen (hanya MK yang diampu)
router.get(
  "/dosen/my-mk-cpl",
  authMiddleware,
  authorize("Dosen"),
  getMKCPLByDosenHandler
);

// GET MK_CPL berdasarkan MK
router.get(
  "/mk/:mk_id",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi", "Dosen"),
  getMKCPLByMKHandler
);

module.exports = router;
