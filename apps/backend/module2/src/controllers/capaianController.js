const {
  getCapaianByMahasiswaId,
  getCapaianByProdiId,
  getCapaianByKelasId,
  getCapaianDetailByKelasId,
  getCapaianDetailByMahasiswaId,
  getMahasiswaBelumCapaiCPL,
} = require("../models/capaianModel");

const { successResponse, errorResponse } = require("../utils/response");

/**
 * CAPAIAN CONTROLLER
 * Mengatur logika bisnis untuk analisis capaian CPL
 */

// GET capaian CPL mahasiswa (untuk mahasiswa melihat capaiannya)
const getCapaianMahasiswaHandler = async (req, res) => {
  try {
    // Ambil mahasiswa_id dari token JWT (req.user.entity_id)
    const mahasiswaId = req.user.entity_id;
    
    if (!mahasiswaId) {
      return errorResponse(res, "Entity ID mahasiswa tidak ditemukan", 400);
    }
    
    const capaian = await getCapaianByMahasiswaId(mahasiswaId);

    return successResponse(res, capaian, "Berhasil mengambil data capaian");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET capaian CPL mahasiswa tertentu (untuk admin/dosen)
const getCapaianMahasiswaByIdHandler = async (req, res) => {
  try {
    const { mahasiswa_id } = req.params;
    const capaian = await getCapaianByMahasiswaId(mahasiswa_id);

    return successResponse(res, capaian, "Berhasil mengambil data capaian");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET capaian CPL seluruh mahasiswa di prodi
const getCapaianProdiHandler = async (req, res) => {
  try {
    const { prodi_id } = req.params;
    const capaian = await getCapaianByProdiId(prodi_id);

    return successResponse(res, capaian, "Berhasil mengambil data capaian prodi");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET capaian CPL untuk kelas tertentu (untuk dosen) - Detail per mahasiswa
const getCapaianKelasHandler = async (req, res) => {
  try {
    const { kelas_id } = req.params;
    const capaian = await getCapaianDetailByKelasId(kelas_id);

    return successResponse(res, capaian, "Berhasil mengambil data capaian kelas");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET detail capaian mahasiswa per mata kuliah
const getCapaianDetailMahasiswaHandler = async (req, res) => {
  try {
    // Ambil mahasiswa_id dari token JWT (req.user.entity_id)
    const mahasiswaId = req.user.entity_id;
    
    if (!mahasiswaId) {
      return errorResponse(res, "Entity ID mahasiswa tidak ditemukan", 400);
    }
    
    const detail = await getCapaianDetailByMahasiswaId(mahasiswaId);

    return successResponse(res, detail, "Berhasil mengambil detail capaian");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET mahasiswa yang belum mencapai CPL tertentu
const getMahasiswaBelumCapaiHandler = async (req, res) => {
  try {
    const { cpl_id, prodi_id } = req.params;
    const mahasiswa = await getMahasiswaBelumCapaiCPL(cpl_id, prodi_id);

    return successResponse(
      res,
      mahasiswa,
      "Berhasil mengambil data mahasiswa yang belum mencapai CPL"
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  getCapaianMahasiswaHandler,
  getCapaianMahasiswaByIdHandler,
  getCapaianProdiHandler,
  getCapaianKelasHandler,
  getCapaianDetailMahasiswaHandler,
  getMahasiswaBelumCapaiHandler,
};
