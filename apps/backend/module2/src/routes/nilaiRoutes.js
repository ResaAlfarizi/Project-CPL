const express = require("express");
const router = express.Router();

const {
  getAllNilaiHandler,
  getNilaiByIdHandler,
  getNilaiByEnrollmentHandler,
  getNilaiByMahasiswaHandler,
  getNilaiByKelasHandler,
  createNilaiHandler,
  updateNilaiHandler,
  deleteNilaiHandler,
} = require("../controllers/nilaiController");

const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

/**
 * NILAI ROUTES (Input Nilai Sub-CPMK)
 * 
 * Matrik Hak Akses:
 * - SUPERADMIN: R/W/D (Read, Write, Delete)
 * - ADMIN PRODI: R (Read only)
 * - DOSEN: R/W (Read, Write - data sendiri)
 * - MAHASISWA: - (Tidak ada akses)
 */

// GET semua nilai - SUPERADMIN, ADMIN PRODI
router.get(
  "/",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi"),
  getAllNilaiHandler
);

// GET nilai berdasarkan ID - SUPERADMIN, ADMIN PRODI, DOSEN
router.get(
  "/:id",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi", "Dosen"),
  getNilaiByIdHandler
);

// GET nilai berdasarkan enrollment - DOSEN, SUPERADMIN, ADMIN PRODI
router.get(
  "/enrollment/:enrollment_id",
  authMiddleware,
  authorize("Dosen", "Superadmin", "Admin Prodi"),
  getNilaiByEnrollmentHandler
);

// GET nilai mahasiswa (semua nilai mahasiswa) - MAHASISWA (data sendiri)
router.get(
  "/mahasiswa/my-nilai",
  authMiddleware,
  authorize("Mahasiswa"),
  getNilaiByMahasiswaHandler
);

// GET nilai berdasarkan kelas - DOSEN, SUPERADMIN, ADMIN PRODI
router.get(
  "/kelas/:kelas_id",
  authMiddleware,
  authorize("Dosen", "Superadmin", "Admin Prodi"),
  getNilaiByKelasHandler
);

// POST buat nilai baru (dosen input nilai) - DOSEN, SUPERADMIN
router.post(
  "/",
  authMiddleware,
  authorize("Dosen", "Superadmin"),
  createNilaiHandler
);

// PUT update nilai - DOSEN, SUPERADMIN
router.put(
  "/:id",
  authMiddleware,
  authorize("Dosen", "Superadmin"),
  updateNilaiHandler
);

// DELETE hapus nilai - SUPERADMIN only
router.delete(
  "/:id",
  authMiddleware,
  authorize("Superadmin"),
  deleteNilaiHandler
);

module.exports = router;
