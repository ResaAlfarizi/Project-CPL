const express = require("express");
const router = express.Router();

const {
  getAllKelasHandler,
  getKelasByIdHandler,
  getKelasByDosenHandler,
  createKelasHandler,
  updateKelasHandler,
  deleteKelasHandler,
} = require("../controllers/kelasController");

const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

/**
 * KELAS ROUTES (Mata Kuliah & Penetapan)
 * 
 * Matrik Hak Akses:
 * - SUPERADMIN: R/W/D (Read, Write, Delete)
 * - ADMIN PRODI: R/W (Read, Write)
 * - DOSEN: R (Read only)
 * - MAHASISWA: R (Read only)
 */

// GET kelas yang diampu dosen - DOSEN (Read)
// PENTING: Route ini harus di atas route /:id agar tidak tertangkap sebagai parameter
router.get(
  "/dosen/my-classes",
  authMiddleware,
  authorize("Dosen"),
  getKelasByDosenHandler
);

// GET semua kelas - SUPERADMIN, ADMIN PRODI, DOSEN, MAHASISWA (Read)
router.get(
  "/",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi", "Dosen", "Mahasiswa"),
  getAllKelasHandler
);

// GET kelas berdasarkan ID - Semua role yang login (Read)
router.get(
  "/:id",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi", "Dosen", "Mahasiswa"),
  getKelasByIdHandler
);

// POST buat kelas baru - SUPERADMIN, ADMIN PRODI (Write)
router.post(
  "/",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi"),
  createKelasHandler
);

// PUT update kelas - SUPERADMIN, ADMIN PRODI (Write)
router.put(
  "/:id",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi"),
  updateKelasHandler
);

// DELETE hapus kelas - SUPERADMIN only (Delete)
router.delete(
  "/:id",
  authMiddleware,
  authorize("Superadmin"),
  deleteKelasHandler
);

module.exports = router;
