const express = require("express");
const router = express.Router();

const { getUsers } = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

// GET all users (hanya superadmin)
router.get(
  "/",
  authMiddleware,
  authorize("superadmin"),
  getUsers
);

module.exports = router;