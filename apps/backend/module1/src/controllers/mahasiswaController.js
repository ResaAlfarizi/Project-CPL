const Mahasiswa = require('../models/mahasiswaModel');

exports.getAllMahasiswa = async (req, res) => {
  try {
    const data = await Mahasiswa.getAll();
    return res.status(200).json({ status: "Success", data });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: error.message });
  }
};

exports.createMahasiswa = async (req, res) => {
  // Proteksi Mass Assignment melalui destructuring eksplisit
  const { prodi_id, nim, nama, angkatan } = req.body;
  
  if (!prodi_id || !nim || !nama || !angkatan) {
    return res.status(400).json({ status: "Error", message: "Data mahasiswa tidak lengkap! (prodi_id, nim, nama, angkatan wajib diisi)" });
  }

  try {
    const cekNim = await Mahasiswa.getByNim(nim);
    if (cekNim) {
      return res.status(400).json({ status: "Error", message: "NIM sudah terdaftar!" });
    }

    const newMhs = await Mahasiswa.create({ prodi_id, nim, nama, angkatan });
    return res.status(201).json({ status: "Success", data: newMhs });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: error.message });
  }
};

exports.updateMahasiswa = async (req, res) => {
  const { id } = req.params;
  const { prodi_id, nim, nama, angkatan, is_active } = req.body;

  if (!prodi_id || !nim || !nama || !angkatan) {
    return res.status(400).json({ status: "Error", message: "Data update mahasiswa tidak lengkap!" });
  }

  try {
    const updated = await Mahasiswa.update(id, { prodi_id, nim, nama, angkatan, is_active });
    if (!updated) {
      return res.status(404).json({ status: "Error", message: "Mahasiswa tidak ditemukan!" });
    }
    return res.status(200).json({ status: "Success", data: updated });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: error.message });
  }
};

exports.deleteMahasiswa = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Mahasiswa.delete(id);
    if (!deleted) {
      return res.status(404).json({ status: "Error", message: "Mahasiswa tidak ditemukan!" });
    }
    return res.status(200).json({ status: "Success", message: "Data mahasiswa berhasil dihapus", data: deleted });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: error.message });
  }
};