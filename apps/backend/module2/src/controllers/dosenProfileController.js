const { getDosenProfile } = require("../models/dosenProfileModel");
const { successResponse, errorResponse } = require("../utils/response");

/**
 * DOSEN PROFILE CONTROLLER
 * Mengatur logika bisnis untuk profil dosen
 */

// GET profil dosen yang sedang login
const getDosenProfileHandler = async (req, res) => {
  try {
    // Ambil dosen_id dari token JWT (req.user.entity_id)
    const dosenId = req.user.entity_id;
    
    if (!dosenId) {
      return errorResponse(res, "Entity ID dosen tidak ditemukan", 400);
    }
    
    const profile = await getDosenProfile(dosenId);

    if (!profile) {
      return errorResponse(res, "Profil dosen tidak ditemukan", 404);
    }

    return successResponse(res, profile, "Berhasil mengambil profil dosen");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  getDosenProfileHandler,
};
