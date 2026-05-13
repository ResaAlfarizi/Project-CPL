const Dosen = require('../models/dosenModel');

exports.getAllDosen = async (req, res) => {
  try {
    const data = await Dosen.getAll();
    res.status(200).json({ status: "Success", data });
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

exports.createDosen = async (req, res) => {
  const { nidn, nama } = req.body;
  if (!nidn || !nama) {
    return res.status(400).json({ message: "NIDN dan Nama Dosen wajib diisi!" });
  }
  try {
    const newDosen = await Dosen.create(nidn, nama);
    res.status(201).json({ status: "Success", data: newDosen });
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};