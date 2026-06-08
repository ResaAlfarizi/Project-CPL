const jwt = require("jsonwebtoken");
const pool = require("../config/db");

/**
 * AUTH MIDDLEWARE
 * Verifikasi JWT token dan set session variables untuk Row-Level Security (RLS)
 */
const authMiddleware = async (req, res, next) => {
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

    // ═══════════════════════════════════════════════════════
    // ROW-LEVEL SECURITY (RLS) - Set Session Variables
    // ═══════════════════════════════════════════════════════
    // Session variables ini digunakan oleh RLS policies di PostgreSQL
    // untuk membatasi akses data per user
    
    try {
      // Set session variables untuk current request
      // IMPORTANT: Harus pakai pool.query, bukan client.query
      // karena setiap request dapat connection baru dari pool
      
      await pool.query(`
        SET LOCAL app.current_user_id = '${decoded.id}';
        SET LOCAL app.current_entity_id = '${decoded.entity_id || ''}';
        SET LOCAL app.current_role = '${decoded.role || ''}';
        SET LOCAL app.current_prodi_id = '${decoded.prodi_id || ''}';
        SET LOCAL app.current_entity_type = '${decoded.entity_type || ''}';
      `);

      // Add RLS context to request for debugging
      req.rlsContext = {
        user_id: decoded.id,
        entity_id: decoded.entity_id,
        role: decoded.role,
        prodi_id: decoded.prodi_id,
        entity_type: decoded.entity_type,
      };
    } catch (rlsError) {
      console.error('RLS session variable error:', rlsError);
      // Don't fail request if RLS setup fails, just log it
      // RLS will just not work, but app still functions
    }

    next();
  } catch (error) {
    // Provide more specific error messages
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token sudah kadaluarsa",
        hint: "Gunakan /auth/refresh untuk mendapatkan token baru",
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