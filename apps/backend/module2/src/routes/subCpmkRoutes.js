const express = require("express");
const router = express.Router();

const {
  getAllSubCPMKHandler,
  getSubCPMKByIdHandler,
  getSubCPMKByMKCPLHandler,
  getSubCPMKByMKHandler,
  getSubCPMKByDosenHandler,
  getSubCPMKByCPLHandler,
  createSubCPMKHandler,
  updateSubCPMKHandler,
  deleteSubCPMKHandler,
} = require("../controllers/subCpmkController");

const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

/**
 * SUB-CPMK ROUTES
 * 
 * Matrik Hak Akses:
 * - SUPERADMIN: R/W/D (Read, Write, Delete)
 * - ADMIN PRODI: R/W (Read, Write)
 * - DOSEN: R/W (Read, Write)
 * - MAHASISWA: R (Read only)
 */

// GET semua Sub-CPMK - Semua role (Read)
router.get(
  "/",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi", "Dosen", "Mahasiswa"),
  getAllSubCPMKHandler
);

// GET Sub-CPMK berdasarkan ID - Semua role (Read)
router.get(
  "/:id",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi", "Dosen", "Mahasiswa"),
  getSubCPMKByIdHandler
);

// GET Sub-CPMK berdasarkan MK_CPL - Semua role (Read)
router.get(
  "/mk-cpl/:mk_cpl_id",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi", "Dosen", "Mahasiswa"),
  getSubCPMKByMKCPLHandler
);

// GET Sub-CPMK berdasarkan MK - Semua role (Read)
router.get(
  "/mk/:mk_id",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi", "Dosen", "Mahasiswa"),
  getSubCPMKByMKHandler
);

// GET Sub-CPMK berdasarkan dosen (hanya MK yang diampu) - Dosen only
router.get(
  "/dosen/my-sub-cpmk",
  authMiddleware,
  authorize("Dosen"),
  getSubCPMKByDosenHandler
);

// GET Sub-CPMK berdasarkan CPL - Semua role (Read)
router.get(
  "/cpl/:cpl_id",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi", "Dosen", "Mahasiswa"),
  getSubCPMKByCPLHandler
);

// POST buat Sub-CPMK baru - SUPERADMIN, ADMIN PRODI, DOSEN (Write)
router.post(
  "/",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi", "Dosen"),
  createSubCPMKHandler
);

// PUT update Sub-CPMK - SUPERADMIN, ADMIN PRODI, DOSEN (Write)
router.put(
  "/:id",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi", "Dosen"),
  updateSubCPMKHandler
);

// DELETE hapus Sub-CPMK - SUPERADMIN only (Delete)
router.delete(
  "/:id",
  authMiddleware,
  authorize("Superadmin"),
  deleteSubCPMKHandler
);

module.exports = router;
