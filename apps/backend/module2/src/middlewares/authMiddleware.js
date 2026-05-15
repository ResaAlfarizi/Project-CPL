const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Token tidak ada",
      });
    }

    // Extract token from "Bearer <token>" format
    const parts = authHeader.split(" ");
    
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        message: "Format Authorization header salah. Gunakan: Bearer <token>",
      });
    }

    const token = parts[1];

    if (!token) {
      return res.status(401).json({
        message: "Token tidak ada",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch (error) {
    // Provide more specific error messages
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token sudah kadaluarsa",
      });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Token tidak valid",
      });
    }
    
    return res.status(401).json({
      message: "Token tidak valid",
    });
  }
};

module.exports = authMiddleware;