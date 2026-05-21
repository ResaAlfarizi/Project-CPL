const {
  getAllEnrollment,
  getEnrollmentById,
  getEnrollmentByMahasiswaId,
  getEnrollmentByKelasId,
  checkEnrollmentExists,
  createEnrollment,
  deleteEnrollment,
} = require("../models/enrollmentModel");

const { successResponse, errorResponse } = require("../utils/response");

/**
 * ENROLLMENT CONTROLLER
 * Mengatur logika bisnis untuk pendaftaran mahasiswa ke kelas (KRS)
 */

// GET semua enrollment
const getAllEnrollmentHandler = async (req, res) => {
  try {
    const enrollment = await getAllEnrollment();
    return successResponse(res, enrollment, "Berhasil mengambil data enrollment");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET enrollment berdasarkan ID
const getEnrollmentByIdHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const enrollment = await getEnrollmentById(id);

    if (!enrollment) {
      return errorResponse(res, "Enrollment tidak ditemukan", 404);
    }

    return successResponse(res, enrollment, "Berhasil mengambil data enrollment");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET enrollment berdasarkan mahasiswa (untuk mahasiswa melihat KRS-nya)
const getEnrollmentByMahasiswaHandler = async (req, res) => {
  try {
    // Ambil mahasiswa_id dari token JWT (req.user.entity_id)
    const mahasiswaId = req.user.entity_id;
    
    if (!mahasiswaId) {
      return errorResponse(res, "Entity ID mahasiswa tidak ditemukan", 400);
    }
    
    const enrollment = await getEnrollmentByMahasiswaId(mahasiswaId);

    return successResponse(res, enrollment, "Berhasil mengambil data enrollment");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET enrollment berdasarkan kelas (untuk dosen melihat mahasiswa di kelasnya)
const getEnrollmentByKelasHandler = async (req, res) => {
  try {
    const { kelas_id } = req.params;
    const enrollment = await getEnrollmentByKelasId(kelas_id);

    return successResponse(res, enrollment, "Berhasil mengambil data enrollment");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// POST buat enrollment baru (mahasiswa daftar kelas)
const createEnrollmentHandler = async (req, res) => {
  try {
    const { mahasiswa_id, kelas_id } = req.body;

    // Validasi input
    if (!mahasiswa_id || !kelas_id) {
      return errorResponse(res, "Data tidak lengkap", 400);
    }

    // Cek apakah sudah terdaftar
    const exists = await checkEnrollmentExists(mahasiswa_id, kelas_id);
    if (exists) {
      return errorResponse(res, "Mahasiswa sudah terdaftar di kelas ini", 400);
    }

    const enrollment = await createEnrollment(mahasiswa_id, kelas_id);

    return successResponse(res, enrollment, "Enrollment berhasil dibuat", 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// DELETE hapus enrollment (mahasiswa drop kelas)
const deleteEnrollmentHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const enrollment = await deleteEnrollment(id);

    if (!enrollment) {
      return errorResponse(res, "Enrollment tidak ditemukan", 404);
    }

    return successResponse(res, enrollment, "Enrollment berhasil dihapus");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  getAllEnrollmentHandler,
  getEnrollmentByIdHandler,
  getEnrollmentByMahasiswaHandler,
  getEnrollmentByKelasHandler,
  createEnrollmentHandler,
  deleteEnrollmentHandler,
};
