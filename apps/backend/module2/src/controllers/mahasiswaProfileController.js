const { getMahasiswaProfile } = require("../models/mahasiswaProfileModel");
const { successResponse, errorResponse } = require("../utils/response");

/**
 * MAHASISWA PROFILE CONTROLLER
 * Mengatur logika bisnis untuk profil mahasiswa
 */

// GET profil mahasiswa yang sedang login
const getMahasiswaProfileHandler = async (req, res) => {
  try {
    // Ambil mahasiswa_id dari token JWT (req.user.entity_id)
    const mahasiswaId = req.user.entity_id;
    
    if (!mahasiswaId) {
      return errorResponse(res, "Entity ID mahasiswa tidak ditemukan", 400);
    }
    
    const profile = await getMahasiswaProfile(mahasiswaId);

    if (!profile) {
      return errorResponse(res, "Profil mahasiswa tidak ditemukan", 404);
    }

    return successResponse(res, profile, "Berhasil mengambil profil mahasiswa");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  getMahasiswaProfileHandler,
};
