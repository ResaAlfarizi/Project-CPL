const { successResponse, errorResponse } = require("../utils/response");
const {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
} = require("../models/userModel");

const getUsers = async (req, res) => {
  try {
    const data = await getAllUsers();

    return successResponse(res, data, "Data users berhasil diambil");
  } catch (error) {
    return errorResponse(res, "Gagal mengambil users");
  }
};

const getUserByIdHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUserById(id);

    if (!user) {
      return errorResponse(res, "User tidak ditemukan", 404);
    }

    return successResponse(res, user, "User berhasil diambil");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const getUserByEmailHandler = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await getUserByEmail(email);

    if (!user) {
      return errorResponse(res, "User tidak ditemukan", 404);
    }

    return successResponse(res, user, "User berhasil diambil");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const createUserHandler = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validasi input
    if (!email || !password || !role) {
      return errorResponse(res, "Data tidak lengkap", 400);
    }

    // Cek apakah email sudah ada
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return errorResponse(res, "Email sudah terdaftar", 400);
    }

    const user = await createUser(email, password, role);

    return successResponse(res, user, "User berhasil dibuat", 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const updateUserHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role } = req.body;

    // Validasi input
    if (!email || !role) {
      return errorResponse(res, "Data tidak lengkap", 400);
    }

    const user = await updateUser(id, email, role);

    if (!user) {
      return errorResponse(res, "User tidak ditemukan", 404);
    }

    return successResponse(res, user, "User berhasil diupdate");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const deleteUserHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await deleteUser(id);

    if (!user) {
      return errorResponse(res, "User tidak ditemukan", 404);
    }

    return successResponse(res, user, "User berhasil dihapus");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  getUsers,
  getUserByIdHandler,
  getUserByEmailHandler,
  createUserHandler,
  updateUserHandler,
  deleteUserHandler,
};