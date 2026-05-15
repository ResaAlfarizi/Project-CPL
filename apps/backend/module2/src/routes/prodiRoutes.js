const express = require("express");
const router = express.Router();

const {
  getAllProdiHandler,
  getProdiByIdHandler,
  createProdiHandler,
  updateProdiHandler,
  deleteProdiHandler,
} = require("../controllers/prodiController");

const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

/**
 * PROGRAM STUDI ROUTES
 * 
 * Matrik Hak Akses:
 * - SUPERADMIN: R/W/D (Read, Write, Delete)
 * - ADMIN PRODI: R (Read only)
 * - DOSEN: R (Read only)
 * - MAHASISWA: R (Read only)
 */

// GET semua program studi - Semua role (Read)
router.get(
  "/",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi", "Dosen", "Mahasiswa"),
  getAllProdiHandler
);

// GET program studi berdasarkan ID - Semua role (Read)
router.get(
  "/:id",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi", "Dosen", "Mahasiswa"),
  getProdiByIdHandler
);

// POST buat program studi baru - SUPERADMIN, ADMIN PRODI (Write)
router.post(
  "/",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi"),
  createProdiHandler
);

// PUT update program studi - SUPERADMIN, ADMIN PRODI (Write)
router.put(
  "/:id",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi"),
  updateProdiHandler
);

// DELETE hapus program studi - SUPERADMIN only (Delete)
router.delete(
  "/:id",
  authMiddleware,
  authorize("Superadmin"),
  deleteProdiHandler
);

module.exports = router;
