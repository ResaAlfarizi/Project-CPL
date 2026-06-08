const express = require("express");
const router = express.Router();

const {
  getAllCapaianHandler, // ✅ Import handler baru
  getCapaianMahasiswaHandler,
  getCapaianMahasiswaByIdHandler,
  getCapaianProdiHandler,
  getCapaianKelasHandler,
  getCapaianDetailMahasiswaHandler,
  getMahasiswaBelumCapaiHandler,
  createCapaianHandler,
  updateCapaianHandler,
  deleteCapaianHandler,
} = require("../controllers/capaianController");

const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

/**
 * CAPAIAN ROUTES (Capaian CPL, Mahasiswa)
 * 
 * Matrik Hak Akses:
 * - SUPERADMIN: R/W/D (Read, Write, Delete)
 * - ADMIN PRODI: R/W (Read, Write)
 * - DOSEN: R (Read - data sendiri)
 * - MAHASISWA: R (Read - data sendiri)
 */

// ✅ BARU: GET semua capaian CPL mahasiswa (untuk superadmin monitoring global) - SUPERADMIN only
router.get(
  "/",
  authMiddleware,
  authorize("Superadmin"),
  getAllCapaianHandler
);

// GET capaian CPL mahasiswa (untuk mahasiswa melihat capaiannya) - MAHASISWA (data sendiri)
router.get(
  "/mahasiswa/my-capaian",
  authMiddleware,
  authorize("Mahasiswa"),
  getCapaianMahasiswaHandler
);

// GET detail capaian mahasiswa per mata kuliah - MAHASISWA (data sendiri)
router.get(
  "/mahasiswa/my-capaian/detail",
  authMiddleware,
  authorize("Mahasiswa"),
  getCapaianDetailMahasiswaHandler
);

// GET capaian mahasiswa tertentu - SUPERADMIN, ADMIN PRODI, DOSEN
router.get(
  "/mahasiswa/:mahasiswa_id",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi", "Dosen"),
  getCapaianMahasiswaByIdHandler
);

// GET capaian CPL seluruh mahasiswa di prodi - SUPERADMIN, ADMIN PRODI
router.get(
  "/prodi/:prodi_id",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi"),
  getCapaianProdiHandler
);

// GET capaian CPL untuk kelas tertentu - DOSEN, SUPERADMIN, ADMIN PRODI
router.get(
  "/kelas/:kelas_id",
  authMiddleware,
  authorize("Dosen", "Superadmin", "Admin Prodi"),
  getCapaianKelasHandler
);

// GET mahasiswa yang belum mencapai CPL tertentu - SUPERADMIN, ADMIN PRODI
router.get(
  "/belum-capai/:cpl_id/:prodi_id",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi"),
  getMahasiswaBelumCapaiHandler
);

// CREATE - Tambah capaian manual - SUPERADMIN, ADMIN PRODI
router.post(
  "/",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi"),
  createCapaianHandler
);

// UPDATE - Edit capaian manual - SUPERADMIN, ADMIN PRODI
router.put(
  "/:mahasiswa_id/:cpl_id",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi"),
  updateCapaianHandler
);

// DELETE - Hapus capaian manual - SUPERADMIN, ADMIN PRODI
router.delete(
  "/:mahasiswa_id/:cpl_id",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi"),
  deleteCapaianHandler
);

module.exports = router;