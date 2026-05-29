const express = require("express");
const router = express.Router();
const pool = require("../config/db");

const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

/**
 * @route   GET /api/v1/m2/profile/me
 * @desc    Get current user profile (All authenticated users)
 * @access  Private (All roles)
 */
router.get(
  "/me",
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;

      // Get user data with prodi info
      // Note: Database uses 'program_studi' table and 'role_id' foreign key
      const query = `
        SELECT 
          u.id,
          u.email,
          u.role_id,
          u.prodi_id,
          u.entity_id,
          r.nama_role as role,
          ps.nama_prodi,
          ps.kode_prodi,
          ps.jenjang
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        LEFT JOIN program_studi ps ON u.prodi_id = ps.id
        WHERE u.id = $1
      `;

      const result = await pool.query(query, [userId]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User tidak ditemukan",
        });
      }

      const user = result.rows[0];

      // Get name based on role
      let nama = user.email.split('@')[0]; // Default fallback
      
      // Try to get actual name from respective tables
      if (user.role === 'Dosen' || userRole === 'Dosen') {
        const dosenQuery = `SELECT nama FROM dosen WHERE user_id = $1`;
        const dosenResult = await pool.query(dosenQuery, [userId]);
        if (dosenResult.rows.length > 0) {
          nama = dosenResult.rows[0].nama;
        }
      } else if (user.role === 'Mahasiswa' || userRole === 'Mahasiswa') {
        const mhsQuery = `SELECT nama FROM mahasiswa WHERE user_id = $1`;
        const mhsResult = await pool.query(mhsQuery, [userId]);
        if (mhsResult.rows.length > 0) {
          nama = mhsResult.rows[0].nama;
        }
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          nama: nama,
          role: user.role,
          prodi_id: user.prodi_id,
          nama_prodi: user.nama_prodi || 'Program Studi',
          kode_prodi: user.kode_prodi,
          jenjang: user.jenjang,
        },
      });
    } catch (error) {
      console.error("Error getting profile:", error);
      res.status(500).json({
        success: false,
        message: "Gagal mengambil profil",
        error: error.message,
      });
    }
  }
);

module.exports = router;
