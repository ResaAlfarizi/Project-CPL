const Prodi = require('../models/prodiModel');

// 1. Fungsi Get All
const getAllProdi = async (req, res) => {
  try {
    const data = await Prodi.getAll();
    res.status(200).json({ status: "Success", data });
  } catch (err) {
    res.status(500).json({ status: "Error", message: err.message });
  }
};

// 2. Fungsi Create
const createProdi = async (req, res) => {
  const { kode_prodi, nama_prodi, jenjang } = req.body;
  
  if (!kode_prodi || !nama_prodi) {
    return res.status(400).json({ message: "Kode dan Nama Prodi wajib diisi!" });
  }

  try {
    // Pastikan ini mengirim satu objek agar cocok dengan prodiModel
    const newProdi = await Prodi.create({ kode_prodi, nama_prodi, jenjang });
    res.status(201).json({ status: "Success", data: newProdi });
  } catch (err) {
    res.status(500).json({ status: "Error", message: err.message });
  }
};

// 3. Ekspor di paling bawah (Hanya gunakan cara ini)
module.exports = {
  getAllProdi,
  createProdi
};