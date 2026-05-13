const { successResponse, errorResponse } = require("../utils/response");
const { getAllUsers } = require("../models/userModel");

const getUsers = async (req, res) => {
  try {
    const data = await getAllUsers();

    return successResponse(res, data, "Data users berhasil diambil");
  } catch (error) {
    return errorResponse(res, "Gagal mengambil users");
  }
};

module.exports = { getUsers };