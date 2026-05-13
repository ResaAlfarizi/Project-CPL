const express = require("express");
const router = express.Router();

const {
  login,
  register,
} = require("../controllers/authController");

const authMiddleware = require("../middlewares/authMiddleware");

const authorize = require("../middlewares/roleMiddleware");

// LOGIN
router.post("/login", login);

// CEK TOKEN
router.get(
  "/me",
  authMiddleware,
  (req, res) => {
    res.json({
      user: req.user,
    });
  }
);

// ROLE TEST
router.get(
  "/admin-only",
  authMiddleware,
  authorize("superadmin"),
  (req, res) => {
    res.json({
      message: "Welcome Superadmin",
    });
  }
);

router.post(
  "/register",
  authMiddleware,
  authorize("superadmin"),
  register
);

module.exports = router;