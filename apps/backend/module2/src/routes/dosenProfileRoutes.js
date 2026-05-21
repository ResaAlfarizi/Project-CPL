const express = require("express");
const router = express.Router();

const { getDosenProfileHandler } = require("../controllers/dosenProfileController");

const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

/**
 * DOSEN PROFILE ROUTES
 * 
 * Matrik Hak Akses:
 * - DOSEN: R (Read only - profil sendiri)
 */

// GET profil dosen yang sedang login
router.get(
  "/me",
  authMiddleware,
  authorize("Dosen"),
  getDosenProfileHandler
);

module.exports = router;
