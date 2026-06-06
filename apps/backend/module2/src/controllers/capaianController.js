const {
  getAllCapaian, 
  getCapaianByMahasiswaId,
  getCapaianByProdiId,
  getCapaianByKelasId,
  getCapaianDetailByKelasId,
  getCapaianDetailByMahasiswaId,
  getMahasiswaBelumCapaiCPL,
  createCapaian,
  updateCapaian,
  deleteCapaian,
  checkCapaianExists,
} = require("../models/capaianModel");

const { successResponse, errorResponse } = require("../utils/response");

/**
 * CAPAIAN CONTROLLER
 * Mengatur logika bisnis untuk analisis capaian CPL
 */

// ✅ BARU: GET semua capaian CPL mahasiswa (untuk superadmin monitoring global)
const getAllCapaianHandler = async (req, res) => {
  try {
    const { limit = 1000, offset = 0 } = req.query;
    const capaianList = await getAllCapaian(parseInt(limit), parseInt(offset));
    return successResponse(res, capaianList, "Berhasil mengambil semua data capaian CPL");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

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

// CREATE - Tambah capaian manual
const createCapaianHandler = async (req, res) => {
  try {
    const { mahasiswa_id, cpl_id, nilai_cpl_total, tahun_akademik } = req.body;

    // Validasi input
    if (!mahasiswa_id || !cpl_id || nilai_cpl_total === undefined) {
      return errorResponse(res, "Data tidak lengkap", 400);
    }

    // Validasi nilai (0-100)
    if (nilai_cpl_total < 0 || nilai_cpl_total > 100) {
      return errorResponse(res, "Nilai harus antara 0-100", 400);
    }

    // Cek apakah capaian sudah ada
    const existing = await checkCapaianExists(mahasiswa_id, cpl_id);
    if (existing) {
      return errorResponse(res, "Capaian untuk mahasiswa dan CPL ini sudah ada. Gunakan fitur edit untuk mengubah.", 409);
    }

    // ✅ Kirim nilai_cpl_total sebagai nilaiCapaian ke model dengan tahun akademik
    const capaian = await createCapaian(mahasiswa_id, cpl_id, nilai_cpl_total, tahun_akademik);
    return successResponse(res, capaian, "Berhasil menambahkan capaian", 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// UPDATE - Edit capaian manual
const updateCapaianHandler = async (req, res) => {
  try {
    const { mahasiswa_id, cpl_id } = req.params;
    const { nilai_cpl_total, tahun_akademik } = req.body;

    console.log('🔧 Update Request Debug:', {
      mahasiswa_id,
      cpl_id,
      body: req.body
    });

    // Validasi input
    if (nilai_cpl_total === undefined) {
      return errorResponse(res, "Nilai capaian harus diisi", 400);
    }

    // Validasi nilai (0-100)
    if (nilai_cpl_total < 0 || nilai_cpl_total > 100) {
      return errorResponse(res, "Nilai harus antara 0-100", 400);
    }

    // Cek apakah capaian ada
    const existing = await checkCapaianExists(mahasiswa_id, cpl_id);
    console.log('🔍 Existing capaian check result:', existing);
    
    if (!existing) {
      console.log('❌ Capaian tidak ditemukan untuk:', { mahasiswa_id, cpl_id });
      return errorResponse(res, "Capaian tidak ditemukan", 404);
    }

    console.log('✅ Found existing capaian:', existing);

    // ✅ Kirim nilai_cpl_total sebagai nilaiCapaian ke model
    const capaian = await updateCapaian(mahasiswa_id, cpl_id, nilai_cpl_total, tahun_akademik);
    console.log('✅ Update successful:', capaian);
    
    return successResponse(res, capaian, "Berhasil mengupdate capaian");
  } catch (error) {
    console.error('❌ Update Error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// DELETE - Hapus capaian manual
const deleteCapaianHandler = async (req, res) => {
  try {
    const { mahasiswa_id, cpl_id } = req.params;

    // Cek apakah capaian ada
    const existing = await checkCapaianExists(mahasiswa_id, cpl_id);
    if (!existing) {
      return errorResponse(res, "Capaian tidak ditemukan", 404);
    }

    await deleteCapaian(mahasiswa_id, cpl_id);
    return successResponse(res, null, "Berhasil menghapus capaian");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  getAllCapaianHandler, // ✅ Export handler baru
  getCapaianMahasiswaHandler,
  getCapaianMahasiswaByIdHandler,
  getCapaianProdiHandler,
  getCapaianKelasHandler,
  getCapaianDetailMahasiswaHandler,
  getMahasiswaBelumCapaiHandler,
  createCapaianHandler,
  updateCapaianHandler,
  deleteCapaianHandler,
};