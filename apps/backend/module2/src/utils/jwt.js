const jwt = require("jsonwebtoken");

// Access Token: 15 menit (sesuai spesifikasi)
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
};

// Verifikasi Access Token
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  generateAccessToken,
  verifyToken,
};