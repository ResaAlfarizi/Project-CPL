const express = require("express");
const router = express.Router();
const mkController = require("../controllers/mkController");
const authMiddleware = require("../middlewares/authMiddleware");

// Semua route memerlukan autentikasi
router.use(authMiddleware);

// CRUD Mata Kuliah
router.get("/", mkController.getAllMK);
router.get("/:id", mkController.getMKById);
router.post("/", mkController.createMK);
router.put("/:id", mkController.updateMK);
router.delete("/:id", mkController.deleteMK);

module.exports = router;