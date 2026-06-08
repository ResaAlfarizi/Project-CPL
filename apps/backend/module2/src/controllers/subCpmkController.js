const {
  getAllSubCPMK,
  getSubCPMKById,
  getSubCPMKByMKCPLId,
  getSubCPMKByMKId,
  getSubCPMKByDosenId,
  getSubCPMKByCPLId,
  createSubCPMK,
  updateSubCPMK,
  deleteSubCPMK,
} = require("../models/subCpmkModel");

const pool = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");

/**
 * SUB-CPMK CONTROLLER
 * Mengatur logika bisnis untuk manajemen Sub-CPMK
 */

// GET semua Sub-CPMK
const getAllSubCPMKHandler = async (req, res) => {
  try {
    const subCpmk = await getAllSubCPMK();
    return successResponse(res, subCpmk, "Berhasil mengambil data Sub-CPMK");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET Sub-CPMK berdasarkan ID
const getSubCPMKByIdHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const subCpmk = await getSubCPMKById(id);

    if (!subCpmk) {
      return errorResponse(res, "Sub-CPMK tidak ditemukan", 404);
    }

    return successResponse(res, subCpmk, "Berhasil mengambil data Sub-CPMK");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET Sub-CPMK berdasarkan MK_CPL
const getSubCPMKByMKCPLHandler = async (req, res) => {
  try {
    const { mk_cpl_id } = req.params;
    const subCpmk = await getSubCPMKByMKCPLId(mk_cpl_id);

    return successResponse(res, subCpmk, "Berhasil mengambil data Sub-CPMK");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET Sub-CPMK berdasarkan MK
const getSubCPMKByMKHandler = async (req, res) => {
  try {
    const { mk_id } = req.params;
    const subCpmk = await getSubCPMKByMKId(mk_id);

    return successResponse(res, subCpmk, "Berhasil mengambil data Sub-CPMK");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET Sub-CPMK berdasarkan CPL
const getSubCPMKByCPLHandler = async (req, res) => {
  try {
    const { cpl_id } = req.params;
    const subCpmk = await getSubCPMKByCPLId(cpl_id);

    return successResponse(res, subCpmk, "Berhasil mengambil data Sub-CPMK");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET Sub-CPMK berdasarkan dosen (hanya MK yang diampu)
const getSubCPMKByDosenHandler = async (req, res) => {
  try {
    const dosenId = req.user.entity_id;
    
    if (!dosenId) {
      return errorResponse(res, "Entity ID dosen tidak ditemukan", 400);
    }
    
    const subCpmk = await getSubCPMKByDosenId(dosenId);

    return successResponse(res, subCpmk, "Berhasil mengambil data Sub-CPMK");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// POST buat Sub-CPMK baru
const createSubCPMKHandler = async (req, res) => {
  try {
    const { kode_sub_cpmk, deskripsi, mk_cpl_id, bobot } = req.body;

    // Validasi input
    if (!kode_sub_cpmk || !deskripsi || !mk_cpl_id || !bobot) {
      return errorResponse(res, "Data tidak lengkap", 400);
    }

    // Validasi bobot (0-1)
    if (bobot <= 0 || bobot > 1) {
      return errorResponse(res, "Bobot harus antara 0 dan 1", 400);
    }

    // ✅ VALIDASI: Total bobot semua Sub-CPMK per mk_cpl harus <= 1.0
    const totalBobotQuery = await pool.query(
      `SELECT COALESCE(SUM(bobot), 0) as total FROM sub_cpmk WHERE mk_cpl_id = $1`,
      [mk_cpl_id]
    );
    
    const currentTotal = parseFloat(totalBobotQuery.rows[0].total);
    const newTotal = currentTotal + parseFloat(bobot);
    
    if (newTotal > 1.0) {
      return errorResponse(
        res,
        `Total bobot Sub-CPMK akan melebihi 1.0. Saat ini: ${currentTotal.toFixed(4)}, mencoba tambah: ${parseFloat(bobot).toFixed(4)}, total akan: ${newTotal.toFixed(4)}`,
        400
      );
    }

    const subCpmk = await createSubCPMK(
      kode_sub_cpmk,
      deskripsi,
      mk_cpl_id,
      bobot
    );

    return successResponse(res, subCpmk, "Sub-CPMK berhasil dibuat", 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// PUT update Sub-CPMK
const updateSubCPMKHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { kode_sub_cpmk, deskripsi, mk_cpl_id, bobot } = req.body;

    // Validasi input
    if (!kode_sub_cpmk || !deskripsi || !mk_cpl_id || !bobot) {
      return errorResponse(res, "Data tidak lengkap", 400);
    }

    // Validasi bobot (0-1)
    if (bobot <= 0 || bobot > 1) {
      return errorResponse(res, "Bobot harus antara 0 dan 1", 400);
    }

    // ✅ VALIDASI: Total bobot semua Sub-CPMK per mk_cpl harus <= 1.0
    // Ambil bobot lama sub-cpmk ini
    const oldBobotQuery = await pool.query(
      `SELECT bobot FROM sub_cpmk WHERE id = $1`,
      [id]
    );
    
    if (oldBobotQuery.rows.length === 0) {
      return errorResponse(res, "Sub-CPMK tidak ditemukan", 404);
    }
    
    const oldBobot = parseFloat(oldBobotQuery.rows[0].bobot);
    
    // Hitung total bobot tanpa sub-cpmk ini
    const totalBobotQuery = await pool.query(
      `SELECT COALESCE(SUM(bobot), 0) as total FROM sub_cpmk WHERE mk_cpl_id = $1 AND id != $2`,
      [mk_cpl_id, id]
    );
    
    const currentTotal = parseFloat(totalBobotQuery.rows[0].total);
    const newTotal = currentTotal + parseFloat(bobot);
    
    if (newTotal > 1.0) {
      return errorResponse(
        res,
        `Total bobot Sub-CPMK akan melebihi 1.0. Total bobot lain: ${currentTotal.toFixed(4)}, bobot baru: ${parseFloat(bobot).toFixed(4)}, total akan: ${newTotal.toFixed(4)}`,
        400
      );
    }

    const subCpmk = await updateSubCPMK(
      id,
      kode_sub_cpmk,
      deskripsi,
      mk_cpl_id,
      bobot
    );

    if (!subCpmk) {
      return errorResponse(res, "Sub-CPMK tidak ditemukan", 404);
    }

    return successResponse(res, subCpmk, "Sub-CPMK berhasil diupdate");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// DELETE hapus Sub-CPMK
const deleteSubCPMKHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const subCpmk = await deleteSubCPMK(id);

    if (!subCpmk) {
      return errorResponse(res, "Sub-CPMK tidak ditemukan", 404);
    }

    return successResponse(res, subCpmk, "Sub-CPMK berhasil dihapus");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  getAllSubCPMKHandler,
  getSubCPMKByIdHandler,
  getSubCPMKByMKCPLHandler,
  getSubCPMKByMKHandler,
  getSubCPMKByDosenHandler,
  getSubCPMKByCPLHandler,
  createSubCPMKHandler,
  updateSubCPMKHandler,
  deleteSubCPMKHandler,
};
