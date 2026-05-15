const {
  getAllCPL,
  getCPLById,
  getCPLByProdiId,
  createCPL,
  updateCPL,
  deleteCPL,
} = require("../models/cplModel");

const { successResponse, errorResponse } = require("../utils/response");

/**
 * CPL CONTROLLER
 * Mengatur logika bisnis untuk manajemen CPL
 */

// GET semua CPL
const getAllCPLHandler = async (req, res) => {
  try {
    const cpl = await getAllCPL();
    return successResponse(res, cpl, "Berhasil mengambil data CPL");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET CPL berdasarkan ID
const getCPLByIdHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const cpl = await getCPLById(id);

    if (!cpl) {
      return errorResponse(res, "CPL tidak ditemukan", 404);
    }

    return successResponse(res, cpl, "Berhasil mengambil data CPL");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET CPL berdasarkan prodi
const getCPLByProdiHandler = async (req, res) => {
  try {
    const { prodi_id } = req.params;
    const cpl = await getCPLByProdiId(prodi_id);

    return successResponse(res, cpl, "Berhasil mengambil data CPL");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// POST buat CPL baru
const createCPLHandler = async (req, res) => {
  try {
    const { kode_cpl, deskripsi, prodi_id, is_active } = req.body;

    // Validasi input
    if (!kode_cpl || !deskripsi || !prodi_id) {
      return errorResponse(res, "Data tidak lengkap", 400);
    }

    const cpl = await createCPL(kode_cpl, deskripsi, prodi_id, is_active);

    return successResponse(res, cpl, "CPL berhasil dibuat", 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// PUT update CPL
const updateCPLHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { kode_cpl, deskripsi, prodi_id, is_active } = req.body;

    // Validasi input
    if (!kode_cpl || !deskripsi || !prodi_id) {
      return errorResponse(res, "Data tidak lengkap", 400);
    }

    const cpl = await updateCPL(id, kode_cpl, deskripsi, prodi_id, is_active);

    if (!cpl) {
      return errorResponse(res, "CPL tidak ditemukan", 404);
    }

    return successResponse(res, cpl, "CPL berhasil diupdate");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// DELETE hapus CPL
const deleteCPLHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const cpl = await deleteCPL(id);

    if (!cpl) {
      return errorResponse(res, "CPL tidak ditemukan", 404);
    }

    return successResponse(res, cpl, "CPL berhasil dihapus");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  getAllCPLHandler,
  getCPLByIdHandler,
  getCPLByProdiHandler,
  createCPLHandler,
  updateCPLHandler,
  deleteCPLHandler,
};
