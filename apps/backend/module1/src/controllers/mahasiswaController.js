const Mahasiswa = require('../models/mahasiswaModel');

exports.getAllMahasiswa = async (req, res) => {
  try {
    const data = await Mahasiswa.getAll();
    res.status(200).json({ status: "Success", data });
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

exports.createMahasiswa = async (req, res) => {
  const { prodi_id, nim, nama, angkatan } = req.body;
  if (!prodi_id || !nim || !nama || !angkatan) {
    return res.status(400).json({ message: "Data mahasiswa tidak lengkap!" });
  }
  try {
    const cekNim = await Mahasiswa.getByNim(nim);
    if (cekNim) return res.status(400).json({ message: "NIM sudah terdaftar!" });

    const newMhs = await Mahasiswa.create(req.body);
    res.status(201).json({ status: "Success", data: newMhs });
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};