const express = require("express");
const router = express.Router();

const {
  getAllEnrollmentHandler,
  getEnrollmentByIdHandler,
  getEnrollmentByMahasiswaHandler,
  getEnrollmentByKelasHandler,
  createEnrollmentHandler,
  deleteEnrollmentHandler,
} = require("../controllers/enrollmentController");

const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

/**
 * ENROLLMENT ROUTES (Input Nilai Sub-CPMK)
 * 
 * Matrik Hak Akses:
 * - SUPERADMIN: R/W/D (Read, Write, Delete)
 * - ADMIN PRODI: R (Read only)
 * - DOSEN: R/W (Read, Write - data sendiri)
 * - MAHASISWA: - (Tidak ada akses)
 */

// GET semua enrollment - SUPERADMIN, ADMIN PRODI
router.get(
  "/",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi"),
  getAllEnrollmentHandler
);

// GET enrollment berdasarkan ID - SUPERADMIN, ADMIN PRODI, DOSEN
router.get(
  "/:id",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi", "Dosen"),
  getEnrollmentByIdHandler
);

// GET KRS mahasiswa - MAHASISWA (data sendiri)
router.get(
  "/mahasiswa/my-enrollment",
  authMiddleware,
  authorize("Mahasiswa"),
  getEnrollmentByMahasiswaHandler
);

// GET enrollment berdasarkan kelas - DOSEN, SUPERADMIN, ADMIN PRODI
router.get(
  "/kelas/:kelas_id",
  authMiddleware,
  authorize("Dosen", "Superadmin", "Admin Prodi"),
  getEnrollmentByKelasHandler
);

// POST buat enrollment baru - SUPERADMIN, ADMIN PRODI
router.post(
  "/",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi"),
  createEnrollmentHandler
);

// DELETE hapus enrollment - SUPERADMIN only
router.delete(
  "/:id",
  authMiddleware,
  authorize("Superadmin"),
  deleteEnrollmentHandler
);

module.exports = router;
