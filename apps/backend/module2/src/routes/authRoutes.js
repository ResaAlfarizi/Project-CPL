const express = require("express");
const router = express.Router();

const {
  login,
  refreshToken,
  logout,
  logoutAllDevices,
  getActiveSessions,
  forgotPassword,
  resetPassword,
  changePassword,
  register,
} = require("../controllers/authController");

const authMiddleware = require("../middlewares/authMiddleware");

const authorize = require("../middlewares/roleMiddleware");

// ══════════════════════════════════════════════════════════
// PUBLIC ROUTES (Tidak perlu auth)
// ══════════════════════════════════════════════════════════

// LOGIN - Dapatkan access token & refresh token
router.post("/login", login);

// REFRESH TOKEN - Dapatkan access token baru dengan refresh token
router.post("/refresh", refreshToken);

// LOGOUT - Revoke single refresh token
router.post("/logout", logout);

// FORGOT PASSWORD - Request reset password token
router.post("/forgot-password", forgotPassword);

// RESET PASSWORD - Reset password dengan token
router.post("/reset-password", resetPassword);

// ══════════════════════════════════════════════════════════
// PROTECTED ROUTES (Perlu auth)
// ══════════════════════════════════════════════════════════

// CEK TOKEN - Verifikasi access token masih valid
router.get(
  "/me",
  authMiddleware,
  (req, res) => {
    res.json({
      user: req.user,
    });
  }
);

// GET ACTIVE SESSIONS - Lihat semua device yang sedang login
router.get(
  "/sessions",
  authMiddleware,
  getActiveSessions
);

// LOGOUT ALL DEVICES - Revoke semua refresh tokens
router.post(
  "/logout-all",
  authMiddleware,
  logoutAllDevices
);

// CHANGE PASSWORD - Ubah password (user sudah login)
router.post(
  "/change-password",
  authMiddleware,
  changePassword
);

// REGISTER - Buat user baru (hanya superadmin)
router.post(
  "/register",
  authMiddleware,
  authorize("superadmin"),
  register
);

// ══════════════════════════════════════════════════════════
// TESTING ROUTES
// ══════════════════════════════════════════════════════════

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

module.exports = router;