const express = require("express");
const router = express.Router();

const {
  getAllCPLHandler,
  getCPLByIdHandler,
  getCPLByProdiHandler,
  createCPLHandler,
  updateCPLHandler,
  deleteCPLHandler,
} = require("../controllers/cplController");

const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

/**
 * CPL ROUTES
 * 
 * Matrik Hak Akses:
 * - SUPERADMIN: R/W/D (Read, Write, Delete)
 * - ADMIN PRODI: R/W (Read, Write)
 * - DOSEN: R (Read only)
 * - MAHASISWA: R (Read only)
 */

// GET semua CPL - Semua role (Read)
router.get(
  "/",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi", "Dosen", "Mahasiswa"),
  getAllCPLHandler
);

// GET CPL berdasarkan ID - Semua role (Read)
router.get(
  "/:id",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi", "Dosen", "Mahasiswa"),
  getCPLByIdHandler
);

// GET CPL berdasarkan prodi - Semua role (Read)
router.get(
  "/prodi/:prodi_id",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi", "Dosen", "Mahasiswa"),
  getCPLByProdiHandler
);

// POST buat CPL baru - SUPERADMIN, ADMIN PRODI (Write)
router.post(
  "/",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi"),
  createCPLHandler
);

// PUT update CPL - SUPERADMIN, ADMIN PRODI (Write)
router.put(
  "/:id",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi"),
  updateCPLHandler
);

// DELETE hapus CPL - SUPERADMIN only (Delete)
router.delete(
  "/:id",
  authMiddleware,
  authorize("Superadmin"),
  deleteCPLHandler
);

module.exports = router;
