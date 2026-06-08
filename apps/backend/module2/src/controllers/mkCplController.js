const {
  getAllMKCPL,
  getMKCPLByDosenId,
  getMKCPLByMKId,
  createMKCPL,
  updateMKCPL,
  deleteMKCPL,
  getMKCPLById,
} = require("../models/mkCplModel");

const { successResponse, errorResponse } = require("../utils/response");

/**
 * MK_CPL CONTROLLER
 * CRUD lengkap untuk Pemetaan MK-CPL
 */

// GET semua MK_CPL
const getAllMKCPLHandler = async (req, res) => {
  try {
    const mkCpl = await getAllMKCPL();
    return successResponse(res, mkCpl, "Berhasil mengambil data MK-CPL");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET MK_CPL berdasarkan dosen (hanya MK yang diampu)
const getMKCPLByDosenHandler = async (req, res) => {
  try {
    const dosenId = req.user.entity_id;
    
    if (!dosenId) {
      return errorResponse(res, "Entity ID dosen tidak ditemukan", 400);
    }
    
    const mkCpl = await getMKCPLByDosenId(dosenId);
    return successResponse(res, mkCpl, "Berhasil mengambil data MK-CPL");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET MK_CPL berdasarkan MK
const getMKCPLByMKHandler = async (req, res) => {
  try {
    const { mk_id } = req.params;
    const mkCpl = await getMKCPLByMKId(mk_id);
    return successResponse(res, mkCpl, "Berhasil mengambil data MK-CPL");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// ✅ TAMBAHAN: CREATE MK_CPL
const createMKCPLHandler = async (req, res) => {
  try {
    const { mk_id, cpl_id, bobot } = req.body;

    // Validasi input
    if (!mk_id || !cpl_id || bobot === undefined) {
      return errorResponse(res, "mk_id, cpl_id, dan bobot harus diisi", 400);
    }

    if (bobot < 0 || bobot > 1) {
      return errorResponse(res, "Bobot harus antara 0 dan 1", 400);
    }

    const newMKCPL = await createMKCPL(mk_id, cpl_id, bobot);
    return successResponse(res, newMKCPL, "Pemetaan MK-CPL berhasil ditambahkan", 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// ✅ TAMBAHAN: UPDATE MK_CPL
const updateMKCPLHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { mk_id, cpl_id, bobot } = req.body;

    // Validasi input
    if (!mk_id || !cpl_id || bobot === undefined) {
      return errorResponse(res, "mk_id, cpl_id, dan bobot harus diisi", 400);
    }

    if (bobot < 0 || bobot > 1) {
      return errorResponse(res, "Bobot harus antara 0 dan 1", 400);
    }

    // Cek apakah data exists
    const existing = await getMKCPLById(id);
    if (!existing) {
      return errorResponse(res, "Pemetaan MK-CPL tidak ditemukan", 404);
    }

    const updatedMKCPL = await updateMKCPL(id, mk_id, cpl_id, bobot);
    return successResponse(res, updatedMKCPL, "Pemetaan MK-CPL berhasil diperbarui");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// ✅ TAMBAHAN: DELETE MK_CPL
const deleteMKCPLHandler = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah data exists
    const existing = await getMKCPLById(id);
    if (!existing) {
      return errorResponse(res, "Pemetaan MK-CPL tidak ditemukan", 404);
    }

    await deleteMKCPL(id);
    return successResponse(res, null, "Pemetaan MK-CPL berhasil dihapus");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  getAllMKCPLHandler,
  getMKCPLByDosenHandler,
  getMKCPLByMKHandler,
  createMKCPLHandler,
  updateMKCPLHandler,
  deleteMKCPLHandler,
};