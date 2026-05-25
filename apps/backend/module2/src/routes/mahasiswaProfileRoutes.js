const express = require("express");
const router = express.Router();

const { getMahasiswaProfileHandler } = require("../controllers/mahasiswaProfileController");

const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

/**
 * MAHASISWA PROFILE ROUTES
 * 
 * Matrik Hak Akses:
 * - MAHASISWA: R (Read only - profil sendiri)
 */

// GET profil mahasiswa yang sedang login
router.get(
  "/mahasiswa/me",
  authMiddleware,
  authorize("Mahasiswa"),
  getMahasiswaProfileHandler
);

module.exports = router;