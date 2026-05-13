const { successResponse, errorResponse } = require("../utils/response");

const getUsers = (req, res) => {
  try {
    const data = [
      { id: 1, name: "Admin" },
      { id: 2, name: "User" },
    ];

    return successResponse(res, data, "Data users berhasil diambil");
  } catch (error) {
    return errorResponse(res, "Gagal mengambil users");
  }
};

module.exports = { getUsers };