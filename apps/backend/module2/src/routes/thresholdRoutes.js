const express = require("express");
const router = express.Router();

const {
  getAllThresholdHandler,
  getThresholdByProdiHandler,
  getThresholdByIdHandler,
  createThresholdHandler,
  updateThresholdHandler,
  deleteThresholdHandler,
  seedDefaultThresholdHandler,
} = require("../controllers/thresholdController");

const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

// ══════════════════════════════════════════════════════════
// THRESHOLD ROUTES
// ══════════════════════════════════════════════════════════

// GET semua threshold (Admin/Superadmin)
router.get(
  "/",
  authMiddleware,
  authorize("superadmin", "admin_prodi"),
  getAllThresholdHandler
);

// GET threshold berdasarkan prodi (Admin Prodi bisa lihat prodi sendiri)
router.get(
  "/prodi/:prodi_id",
  authMiddleware,
  getThresholdByProdiHandler
);

// GET threshold berdasarkan ID
router.get(
  "/:id",
  authMiddleware,
  getThresholdByIdHandler
);

// POST buat threshold baru (Admin/Superadmin)
router.post(
  "/",
  authMiddleware,
  authorize("superadmin", "admin_prodi"),
  createThresholdHandler
);

// PUT update threshold (Admin/Superadmin)
router.put(
  "/:id",
  authMiddleware,
  authorize("superadmin", "admin_prodi"),
  updateThresholdHandler
);

// DELETE threshold (Superadmin only)
router.delete(
  "/:id",
  authMiddleware,
  authorize("superadmin"),
  deleteThresholdHandler
);

// POST seed default threshold untuk prodi (Superadmin only)
router.post(
  "/seed",
  authMiddleware,
  authorize("superadmin", "admin_prodi"),
  seedDefaultThresholdHandler
);

module.exports = router;
