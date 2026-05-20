const Prodi = require('../models/prodiModel');

exports.getAllProdi = async (req, res) => {
  try {
    const data = await Prodi.getAll();
    return res.status(200).json({ status: "Success", data });
  } catch (err) {
    return res.status(500).json({ status: "Error", message: err.message });
  }
};

exports.createProdi = async (req, res) => {
  const { kode_prodi, nama_prodi, jenjang } = req.body;
  
  if (!kode_prodi || !nama_prodi || !jenjang) {
    return res.status(400).json({ status: "Error", message: "Kode, Nama Prodi, dan Jenjang wajib diisi!" });
  }

  try {
    const newProdi = await Prodi.create({ kode_prodi, nama_prodi, jenjang });
    return res.status(201).json({ status: "Success", data: newProdi });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ status: "Error", message: "Kode prodi tersebut sudah terdaftar di database!" });
    }
    return res.status(500).json({ status: "Error", message: err.message });
  }
};

exports.updateProdi = async (req, res) => {
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
    if (err.code === '23505') {
      return res.status(409).json({ status: "Error", message: "Kode prodi baru berbenturan dengan prodi lain!" });
    }
    return res.status(500).json({ status: "Error", message: err.message });
  }
};

exports.deleteProdi = async (req, res) => {
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