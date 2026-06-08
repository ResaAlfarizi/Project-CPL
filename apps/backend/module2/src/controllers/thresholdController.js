const {
  getAllThreshold,
  getThresholdByProdiId,
  getThresholdById,
  checkThresholdExists,
  createThreshold,
  updateThreshold,
  deleteThreshold,
  seedDefaultThreshold,
} = require("../models/thresholdModel");

const { successResponse, errorResponse } = require("../utils/response");

/**
 * THRESHOLD CONTROLLER
 * Mengatur logika bisnis untuk manajemen threshold status CPL
 */

// GET semua threshold
const getAllThresholdHandler = async (req, res) => {
  try {
    const thresholds = await getAllThreshold();
    return successResponse(res, thresholds, "Berhasil mengambil data threshold");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET threshold berdasarkan prodi
const getThresholdByProdiHandler = async (req, res) => {
  try {
    const { prodi_id } = req.params;
    const thresholds = await getThresholdByProdiId(prodi_id);

    return successResponse(res, thresholds, "Berhasil mengambil data threshold");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET threshold berdasarkan ID
const getThresholdByIdHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const threshold = await getThresholdById(id);

    if (!threshold) {
      return errorResponse(res, "Threshold tidak ditemukan", 404);
    }

    return successResponse(res, threshold, "Berhasil mengambil data threshold");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// POST buat threshold baru
const createThresholdHandler = async (req, res) => {
  try {
    const { prodi_id, nama_status, nilai_min, nilai_max } = req.body;

    // Validasi input
    if (!prodi_id || !nama_status || nilai_min === undefined || nilai_max === undefined) {
      return errorResponse(res, "Data tidak lengkap", 400);
    }

    // Validasi nilai (0-100)
    if (nilai_min < 0 || nilai_min > 100 || nilai_max < 0 || nilai_max > 100) {
      return errorResponse(res, "Nilai harus antara 0-100", 400);
    }

    // Validasi nilai_min <= nilai_max
    if (nilai_min > nilai_max) {
      return errorResponse(res, "Nilai minimum tidak boleh lebih besar dari nilai maximum", 400);
    }

    // Cek apakah threshold sudah ada
    const exists = await checkThresholdExists(prodi_id, nama_status);
    if (exists) {
      return errorResponse(res, "Threshold untuk status ini sudah ada, gunakan update", 400);
    }

    const newThreshold = await createThreshold(prodi_id, nama_status, nilai_min, nilai_max);

    return successResponse(res, newThreshold, "Threshold berhasil dibuat", 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// PUT update threshold
const updateThresholdHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_status, nilai_min, nilai_max } = req.body;

    // Validasi input
    if (!nama_status || nilai_min === undefined || nilai_max === undefined) {
      return errorResponse(res, "Data tidak lengkap", 400);
    }

    // Validasi nilai (0-100)
    if (nilai_min < 0 || nilai_min > 100 || nilai_max < 0 || nilai_max > 100) {
      return errorResponse(res, "Nilai harus antara 0-100", 400);
    }

    // Validasi nilai_min <= nilai_max
    if (nilai_min > nilai_max) {
      return errorResponse(res, "Nilai minimum tidak boleh lebih besar dari nilai maximum", 400);
    }

    const updatedThreshold = await updateThreshold(id, nama_status, nilai_min, nilai_max);

    if (!updatedThreshold) {
      return errorResponse(res, "Threshold tidak ditemukan", 404);
    }

    return successResponse(res, updatedThreshold, "Threshold berhasil diupdate");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// DELETE hapus threshold
const deleteThresholdHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const threshold = await deleteThreshold(id);

    if (!threshold) {
      return errorResponse(res, "Threshold tidak ditemukan", 404);
    }

    return successResponse(res, threshold, "Threshold berhasil dihapus");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// POST seed default threshold untuk prodi
const seedDefaultThresholdHandler = async (req, res) => {
  try {
    const { prodi_id } = req.body;

    if (!prodi_id) {
      return errorResponse(res, "prodi_id diperlukan", 400);
    }

    const result = await seedDefaultThreshold(prodi_id);

    return successResponse(res, result, result.message, 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  getAllThresholdHandler,
  getThresholdByProdiHandler,
  getThresholdByIdHandler,
  createThresholdHandler,
  updateThresholdHandler,
  deleteThresholdHandler,
  seedDefaultThresholdHandler,
};
