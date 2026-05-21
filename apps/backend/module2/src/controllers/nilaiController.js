const {
  getAllNilai,
  getNilaiById,
  getNilaiByEnrollmentId,
  getNilaiByMahasiswaId,
  getNilaiByKelasId,
  checkNilaiExists,
  createNilai,
  updateNilai,
  deleteNilai,
} = require("../models/nilaiModel");

const { successResponse, errorResponse } = require("../utils/response");

/**
 * NILAI CONTROLLER
 * Mengatur logika bisnis untuk manajemen nilai CPL mahasiswa
 */

// GET semua nilai
const getAllNilaiHandler = async (req, res) => {
  try {
    const nilai = await getAllNilai();
    return successResponse(res, nilai, "Berhasil mengambil data nilai");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET nilai berdasarkan ID
const getNilaiByIdHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const nilai = await getNilaiById(id);

    if (!nilai) {
      return errorResponse(res, "Nilai tidak ditemukan", 404);
    }

    return successResponse(res, nilai, "Berhasil mengambil data nilai");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET nilai berdasarkan enrollment
const getNilaiByEnrollmentHandler = async (req, res) => {
  try {
    const { enrollment_id } = req.params;
    const nilai = await getNilaiByEnrollmentId(enrollment_id);

    return successResponse(res, nilai, "Berhasil mengambil data nilai");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET nilai berdasarkan mahasiswa (untuk mahasiswa melihat semua nilainya)
const getNilaiByMahasiswaHandler = async (req, res) => {
  try {
    // Ambil mahasiswa_id dari token JWT (req.user.entity_id)
    const mahasiswaId = req.user.entity_id;
    
    if (!mahasiswaId) {
      return errorResponse(res, "Entity ID mahasiswa tidak ditemukan", 400);
    }
    
    const nilai = await getNilaiByMahasiswaId(mahasiswaId);

    return successResponse(res, nilai, "Berhasil mengambil data nilai");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET nilai berdasarkan kelas (untuk dosen melihat nilai mahasiswa di kelasnya)
const getNilaiByKelasHandler = async (req, res) => {
  try {
    const { kelas_id } = req.params;
    const nilai = await getNilaiByKelasId(kelas_id);

    return successResponse(res, nilai, "Berhasil mengambil data nilai");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// POST buat nilai baru (dosen input nilai)
const createNilaiHandler = async (req, res) => {
  try {
    const { enrollment_id, sub_cpmk_id, nilai } = req.body;

    // Validasi input
    if (!enrollment_id || !sub_cpmk_id || nilai === undefined) {
      return errorResponse(res, "Data tidak lengkap", 400);
    }

    // Validasi nilai (0-100)
    if (nilai < 0 || nilai > 100) {
      return errorResponse(res, "Nilai harus antara 0-100", 400);
    }

    // Cek apakah nilai sudah ada
    const exists = await checkNilaiExists(enrollment_id, sub_cpmk_id);
    if (exists) {
      return errorResponse(res, "Nilai untuk Sub-CPMK ini sudah ada, gunakan update", 400);
    }

    const newNilai = await createNilai(enrollment_id, sub_cpmk_id, nilai);

    return successResponse(res, newNilai, "Nilai berhasil dibuat", 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// PUT update nilai (dosen edit nilai)
const updateNilaiHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { nilai } = req.body;

    // Validasi input
    if (nilai === undefined) {
      return errorResponse(res, "Nilai tidak boleh kosong", 400);
    }

    // Validasi nilai (0-100)
    if (nilai < 0 || nilai > 100) {
      return errorResponse(res, "Nilai harus antara 0-100", 400);
    }

    const updatedNilai = await updateNilai(id, nilai);

    if (!updatedNilai) {
      return errorResponse(res, "Nilai tidak ditemukan", 404);
    }

    return successResponse(res, updatedNilai, "Nilai berhasil diupdate");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// DELETE hapus nilai
const deleteNilaiHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const nilai = await deleteNilai(id);

    if (!nilai) {
      return errorResponse(res, "Nilai tidak ditemukan", 404);
    }

    return successResponse(res, nilai, "Nilai berhasil dihapus");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  getAllNilaiHandler,
  getNilaiByIdHandler,
  getNilaiByEnrollmentHandler,
  getNilaiByMahasiswaHandler,
  getNilaiByKelasHandler,
  createNilaiHandler,
  updateNilaiHandler,
  deleteNilaiHandler,
};
