const Prodi = require('../models/prodiModel');

const getAllProdi = async (req, res) => {
  try {
    const data = await Prodi.getAll();
    res.json({ status: "Success", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createProdi = async (req, res) => {
  const { kode_prodi, nama_prodi, jenjang } = req.body;
  try {
    const newProdi = await Prodi.create(kode_prodi, nama_prodi, jenjang);
    res.status(201).json({ message: "Berhasil!", data: newProdi });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAllProdi, createProdi };