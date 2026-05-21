const {
  getDashboardAdmin,
  getDashboardDosen,
  getDashboardMahasiswa,
} = require("../models/dashboardModel");

const { successResponse, errorResponse } = require("../utils/response");

/**
 * DASHBOARD CONTROLLER
 * Mengatur logika bisnis untuk dashboard berbagai role
 */

// GET dashboard untuk Admin/Kaprodi
const getDashboardAdminHandler = async (req, res) => {
  try {
    const { prodi_id } = req.params;

    if (!prodi_id) {
      return errorResponse(res, "Prodi ID tidak boleh kosong", 400);
    }

    const dashboard = await getDashboardAdmin(prodi_id);

    return successResponse(res, dashboard, "Berhasil mengambil data dashboard admin");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET dashboard untuk Dosen
const getDashboardDosenHandler = async (req, res) => {
  try {
    // Ambil dosen_id dari token JWT (req.user.entity_id)
    const dosenId = req.user.entity_id;
    
    if (!dosenId) {
      return errorResponse(res, "Entity ID dosen tidak ditemukan", 400);
    }
    
    const dashboard = await getDashboardDosen(dosenId);

    return successResponse(res, dashboard, "Berhasil mengambil data dashboard dosen");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET dashboard untuk Mahasiswa
const getDashboardMahasiswaHandler = async (req, res) => {
  try {
    // Ambil mahasiswa_id dari token JWT (req.user.entity_id)
    const mahasiswaId = req.user.entity_id;
    
    if (!mahasiswaId) {
      return errorResponse(res, "Entity ID mahasiswa tidak ditemukan", 400);
    }
    
    const dashboard = await getDashboardMahasiswa(mahasiswaId);

    return successResponse(res, dashboard, "Berhasil mengambil data dashboard mahasiswa");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  getDashboardAdminHandler,
  getDashboardDosenHandler,
  getDashboardMahasiswaHandler,
};
