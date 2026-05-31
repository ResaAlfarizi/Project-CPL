const {
  getAllKelas,
  getKelasById,
  getKelasByDosenId,
  getKelasByMahasiswaId,
  createKelas,
  updateKelas,
  deleteKelas,
} = require("../models/kelasModel");

const { successResponse, errorResponse } = require("../utils/response");

/**
 * KELAS CONTROLLER
 * Mengatur logika bisnis untuk manajemen kelas
 */

// GET semua kelas
const getAllKelasHandler = async (req, res) => {
  try {
    const kelas = await getAllKelas();
    return successResponse(res, kelas, "Berhasil mengambil data kelas");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET kelas berdasarkan ID
const getKelasByIdHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const kelas = await getKelasById(id);

    if (!kelas) {
      return errorResponse(res, "Kelas tidak ditemukan", 404);
    }

    return successResponse(res, kelas, "Berhasil mengambil data kelas");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET kelas berdasarkan dosen (untuk dosen melihat kelas yang diampu)
const getKelasByDosenHandler = async (req, res) => {
  try {
    // Ambil dosen_id dari token JWT (req.user.entity_id)
    const dosenId = req.user.entity_id;
    
    if (!dosenId) {
      return errorResponse(res, "Entity ID dosen tidak ditemukan", 400);
    }
    
    const kelas = await getKelasByDosenId(dosenId);

    return successResponse(res, kelas, "Berhasil mengambil data kelas");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// GET kelas berdasarkan mahasiswa (untuk mahasiswa melihat kelas yang diikuti)
const getKelasByMahasiswaHandler = async (req, res) => {
  try {
    // Ambil mahasiswa_id dari token JWT (req.user.entity_id)
    const mahasiswaId = req.user.entity_id;
    
    if (!mahasiswaId) {
      return errorResponse(res, "Entity ID mahasiswa tidak ditemukan", 400);
    }
    
    const kelas = await getKelasByMahasiswaId(mahasiswaId);

    return successResponse(res, kelas, "Berhasil mengambil data kelas");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// POST buat kelas baru
const createKelasHandler = async (req, res) => {
  try {
    const { mk_id, dosen_id, tahun_akademik, semester_aktif, nama_kelas } = req.body;

    // Validasi input
    if (!mk_id || !tahun_akademik || !semester_aktif) {
      return errorResponse(res, "Data tidak lengkap", 400);
    }

    const kelas = await createKelas(mk_id, dosen_id, tahun_akademik, semester_aktif, nama_kelas);

    return successResponse(res, kelas, "Kelas berhasil dibuat", 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// PUT update kelas
const updateKelasHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { mk_id, dosen_id, tahun_akademik, semester_aktif, nama_kelas } = req.body;

    // Validasi input
    if (!mk_id || !tahun_akademik || !semester_aktif) {
      return errorResponse(res, "Data tidak lengkap", 400);
    }

    const kelas = await updateKelas(id, mk_id, dosen_id, tahun_akademik, semester_aktif, nama_kelas);

    if (!kelas) {
      return errorResponse(res, "Kelas tidak ditemukan", 404);
    }

    return successResponse(res, kelas, "Kelas berhasil diupdate");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// DELETE hapus kelas
const deleteKelasHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const kelas = await deleteKelas(id);

    if (!kelas) {
      return errorResponse(res, "Kelas tidak ditemukan", 404);
    }

    return successResponse(res, kelas, "Kelas berhasil dihapus");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  getAllKelasHandler,
  getKelasByIdHandler,
  getKelasByDosenHandler,
  getKelasByMahasiswaHandler,
  createKelasHandler,
  updateKelasHandler,
  deleteKelasHandler,
};
