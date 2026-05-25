const {
  getAllMKCPL,
  getMKCPLByDosenId,
  getMKCPLByMKId,
} = require("../models/mkCplModel");

const { successResponse, errorResponse } = require("../utils/response");

/**
 * MK_CPL CONTROLLER
 * Read-only untuk mendukung form Sub-CPMK
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

module.exports = {
  getAllMKCPLHandler,
  getMKCPLByDosenHandler,
  getMKCPLByMKHandler,
};
