const express = require("express");
const router = express.Router();

const {
  getAllMKCPLHandler,
  getMKCPLByDosenHandler,
  getMKCPLByMKHandler,
  createMKCPLHandler,
  updateMKCPLHandler,
  deleteMKCPLHandler,
} = require("../controllers/mkCplController");

const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

/**
 * MK_CPL ROUTES (CRUD lengkap)
 * Untuk pemetaan Mata Kuliah ke CPL
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

// ✅ TAMBAHAN: CREATE MK_CPL
router.post(
  "/",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi"),
  createMKCPLHandler
);

// ✅ TAMBAHAN: UPDATE MK_CPL
router.put(
  "/:id",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi"),
  updateMKCPLHandler
);

// ✅ TAMBAHAN: DELETE MK_CPL
router.delete(
  "/:id",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi"),
  deleteMKCPLHandler
);

module.exports = router;