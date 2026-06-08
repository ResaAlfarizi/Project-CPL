const mkModel = require("../models/mkModel");

/**
 * MK CONTROLLER (Module 2)
 * Handler untuk CRUD Mata Kuliah
 */

// GET /api/v1/m2/mata-kuliah - Ambil semua mata kuliah
const getAllMK = async (req, res) => {
  try {
    const data = await mkModel.getAllMK();
    res.json({
      status: "success",
      data: data,
    });
  } catch (error) {
    console.error("Error getAllMK:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Gagal mengambil data mata kuliah",
    });
  }
};

// GET /api/v1/m2/mata-kuliah/:id - Ambil mata kuliah berdasarkan ID
const getMKById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await mkModel.getMKById(id);
    res.json({
      status: "success",
      data: data,
    });
  } catch (error) {
    console.error("Error getMKById:", error);
    const statusCode = error.message === "Mata kuliah tidak ditemukan" ? 404 : 500;
    res.status(statusCode).json({
      status: "error",
      message: error.message || "Gagal mengambil data mata kuliah",
    });
  }
};

// POST /api/v1/m2/mata-kuliah - Buat mata kuliah baru
const createMK = async (req, res) => {
  try {
    const { prodi_id, kode_mk, nama_mk, sks, semester, cpl_ids } = req.body;

    // Validasi input
    if (!prodi_id || !kode_mk || !nama_mk || !sks || !semester) {
      return res.status(400).json({
        status: "error",
        message: "Data tidak lengkap. Harap isi semua kolom wajib.",
      });
    }

    const newMK = await mkModel.createMK({
      prodi_id,
      kode_mk: kode_mk.toUpperCase(),
      nama_mk,
      sks: parseInt(sks),
      semester: parseInt(semester),
      cpl_ids: cpl_ids || [],
    });

    res.status(201).json({
      status: "success",
      message: "Mata kuliah berhasil ditambahkan",
      data: newMK,
    });
  } catch (error) {
    console.error("Error createMK:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Gagal menambahkan mata kuliah",
    });
  }
};

// PUT /api/v1/m2/mata-kuliah/:id - Update mata kuliah
const updateMK = async (req, res) => {
  try {
    const { id } = req.params;
    const { prodi_id, kode_mk, nama_mk, sks, semester, cpl_ids } = req.body;

    // Validasi input
    if (!prodi_id || !kode_mk || !nama_mk || !sks || !semester) {
      return res.status(400).json({
        status: "error",
        message: "Data tidak lengkap. Harap isi semua kolom wajib.",
      });
    }

    const updatedMK = await mkModel.updateMK(id, {
      prodi_id,
      kode_mk: kode_mk.toUpperCase(),
      nama_mk,
      sks: parseInt(sks),
      semester: parseInt(semester),
      cpl_ids: cpl_ids || [],
    });

    res.json({
      status: "success",
      message: "Mata kuliah berhasil diperbarui",
      data: updatedMK,
    });
  } catch (error) {
    console.error("Error updateMK:", error);
    const statusCode = error.message === "Mata kuliah tidak ditemukan" ? 404 : 500;
    res.status(statusCode).json({
      status: "error",
      message: error.message || "Gagal memperbarui mata kuliah",
    });
  }
};

// DELETE /api/v1/m2/mata-kuliah/:id - Hapus mata kuliah
const deleteMK = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedMK = await mkModel.deleteMK(id);
    
    res.json({
      status: "success",
      message: "Mata kuliah berhasil dihapus",
      data: deletedMK,
    });
  } catch (error) {
    console.error("Error deleteMK:", error);
    const statusCode = error.message === "Mata kuliah tidak ditemukan" ? 404 : 500;
    res.status(statusCode).json({
      status: "error",
      message: error.message || "Gagal menghapus mata kuliah",
    });
  }
};

module.exports = {
  getAllMK,
  getMKById,
  createMK,
  updateMK,
  deleteMK,
};