const Prodi = require('../models/prodiModel');

const getAllProdi = async (req, res) => {
  try {
    const data = await Prodi.getAll();
    return res.status(200).json({ status: "Success", data });
  } catch (err) {
    return res.status(500).json({ status: "Error", message: err.message });
  }
};

const createProdi = async (req, res) => {
  // Whitelisting parameter input
  const { kode_prodi, nama_prodi, jenjang } = req.body;
  
  if (!kode_prodi || !nama_prodi || !jenjang) {
    return res.status(400).json({ status: "Error", message: "Kode, Nama Prodi, dan Jenjang wajib diisi!" });
  }

  try {
    const newProdi = await Prodi.create({ kode_prodi, nama_prodi, jenjang });
    return res.status(201).json({ status: "Success", data: newProdi });
  } catch (err) {
    return res.status(500).json({ status: "Error", message: err.message });
  }
};

const updateProdi = async (req, res) => {
  const { id } = req.params;
  const { kode_prodi, nama_prodi, jenjang } = req.body;

  if (!kode_prodi || !nama_prodi || !jenjang) {
    return res.status(400).json({ status: "Error", message: "Kode, Nama Prodi, dan Jenjang wajib diisi untuk pembaruan!" });
  }

  try {
    const updated = await Prodi.update(id, { kode_prodi, nama_prodi, jenjang });
    if (!updated) {
      return res.status(404).json({ status: "Error", message: "Program Studi tidak ditemukan!" });
    }
    return res.status(200).json({ status: "Success", data: updated });
  } catch (err) {
    return res.status(500).json({ status: "Error", message: err.message });
  }
};

const deleteProdi = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Prodi.delete(id);
    if (!deleted) {
      return res.status(404).json({ status: "Error", message: "Program Studi tidak ditemukan!" });
    }
    return res.status(200).json({ status: "Success", message: "Program Studi berhasil dihapus", data: deleted });
  } catch (err) {
    return res.status(500).json({ status: "Error", message: err.message });
  }
};

module.exports = {
  getAllProdi,
  createProdi,
  updateProdi,
  deleteProdi
};