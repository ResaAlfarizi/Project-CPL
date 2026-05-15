const express = require("express");
const router = express.Router();

const {
  getUsers,
  getUserByIdHandler,
  getUserByEmailHandler,
  createUserHandler,
  updateUserHandler,
  deleteUserHandler,
} = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

/**
 * USER ROUTES
 *
 * Matrik Hak Akses:
 * - SUPERADMIN: R/W/D (Read, Write, Delete)
 * - ADMIN PRODI: R/W (Read, Write)
 * - DOSEN: R (Read only)
 * - MAHASISWA: R (Read only)
 */

// GET all users
router.get(
  "/",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi", "Dosen", "Mahasiswa"),
  getUsers
);

// GET user by ID
router.get(
  "/:id",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi", "Dosen", "Mahasiswa"),
  getUserByIdHandler
);

// GET user by email
router.get(
  "/email/:email",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi", "Dosen", "Mahasiswa"),
  getUserByEmailHandler
);

// POST create user (superadmin & admin prodi)
router.post(
  "/",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi"),
  createUserHandler
);

// PUT update user (superadmin & admin prodi)
router.put(
  "/:id",
  authMiddleware,
  authorize("Superadmin", "Admin Prodi"),
  updateUserHandler
);

// DELETE user (superadmin only)
router.delete(
  "/:id",
  authMiddleware,
  authorize("Superadmin"),
  deleteUserHandler
);

module.exports = router;