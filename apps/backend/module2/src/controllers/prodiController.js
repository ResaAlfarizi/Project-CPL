const {
  getAllProdi,
  getProdiById,
  createProdi,
  updateProdi,
  deleteProdi,
} = require("../models/prodiModel");

const { successResponse, errorResponse } = require("../utils/response");

/**
 * PROGRAM STUDI CONTROLLER
 * Mengatur logika bisnis untuk manajemen program studi
 */

// GET semua program studi
const getAllProdiHandler = async (req, res) => {
  try {
    const prodi = await getAllProdi();
    return successResponse(res, prodi, "Berhasil mengambil data program studi");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET program studi berdasarkan ID
const getProdiByIdHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const prodi = await getProdiById(id);

    if (!prodi) {
      return errorResponse(res, "Program studi tidak ditemukan", 404);
    }

    return successResponse(res, prodi, "Berhasil mengambil data program studi");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// POST buat program studi baru
const createProdiHandler = async (req, res) => {
  try {
    const { kode_prodi, nama_prodi, jenjang } = req.body;

    // Validasi input
    if (!kode_prodi || !nama_prodi || !jenjang) {
      return errorResponse(res, "Data tidak lengkap", 400);
    }

    // Validasi jenjang
    const validJenjang = ['D3', 'S1', 'S2', 'S3'];
    if (!validJenjang.includes(jenjang)) {
      return errorResponse(res, "Jenjang harus salah satu dari: D3, S1, S2, S3", 400);
    }

    const prodi = await createProdi(kode_prodi, nama_prodi, jenjang);

    return successResponse(res, prodi, "Program studi berhasil dibuat", 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// PUT update program studi
const updateProdiHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { kode_prodi, nama_prodi, jenjang } = req.body;

    // Validasi input
    if (!kode_prodi || !nama_prodi || !jenjang) {
      return errorResponse(res, "Data tidak lengkap", 400);
    }

    // Validasi jenjang
    const validJenjang = ['D3', 'S1', 'S2', 'S3'];
    if (!validJenjang.includes(jenjang)) {
      return errorResponse(res, "Jenjang harus salah satu dari: D3, S1, S2, S3", 400);
    }

    const prodi = await updateProdi(id, kode_prodi, nama_prodi, jenjang);

    if (!prodi) {
      return errorResponse(res, "Program studi tidak ditemukan", 404);
    }

    return successResponse(res, prodi, "Program studi berhasil diupdate");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// DELETE hapus program studi
const deleteProdiHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const prodi = await deleteProdi(id);

    if (!prodi) {
      return errorResponse(res, "Program studi tidak ditemukan", 404);
    }

    return successResponse(res, prodi, "Program studi berhasil dihapus");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  getAllProdiHandler,
  getProdiByIdHandler,
  createProdiHandler,
  updateProdiHandler,
  deleteProdiHandler,
};
