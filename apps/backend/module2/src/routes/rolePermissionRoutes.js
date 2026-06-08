const express = require("express");
const router = express.Router();

const {
  getAll,
  getByRole,
  upsert,
  remove,
  seed,
} = require("../controllers/rolePermissionController");

const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

// ══════════════════════════════════════════════════════════
// ROLE PERMISSIONS ROUTES (Hanya Superadmin)
// ══════════════════════════════════════════════════════════

// GET ALL PERMISSIONS
router.get(
  "/",
  authMiddleware,
  authorize("superadmin"),
  getAll
);

// GET PERMISSIONS BY ROLE NAME
router.get(
  "/role/:roleName",
  authMiddleware,
  authorize("superadmin", "admin_prodi"),
  getByRole
);

// UPSERT PERMISSION (Create or Update)
router.post(
  "/",
  authMiddleware,
  authorize("superadmin"),
  upsert
);

// DELETE PERMISSION
router.delete(
  "/:id",
  authMiddleware,
  authorize("superadmin"),
  remove
);

// SEED DEFAULT PERMISSIONS (Matrix Hak Akses)
router.post(
  "/seed",
  authMiddleware,
  authorize("superadmin"),
  seed
);

module.exports = router;
