const Dosen = require('../models/dosenModel');

// 1. Ambil Semua Data Dosen
exports.getAllDosen = async (req, res) => {
  try {
    const data = await Dosen.getAll();
    res.status(200).json({ status: "Success", data });
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

// 2. Tambah Dosen Baru
exports.createDosen = async (req, res) => {
  const { nidn, nama, prodi_id, role, is_active } = req.body;
  
  // Validasi input wajib
  if (!nidn || !nama) {
    return res.status(400).json({ status: "Error", message: "NIDN dan Nama Dosen wajib diisi!" });
  }
  
  try {
    const newDosen = await Dosen.create({ nidn, nama, prodi_id, role, is_active });
    res.status(201).json({ status: "Success", data: newDosen });
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

// 3. Update Data Dosen
exports.updateDosen = async (req, res) => {
  const { id } = req.params;
  const { nidn, nama, prodi_id, role, is_active } = req.body;

  // Validasi jika properti wajib dikirim tapi kosong
  if (nidn !== undefined && !nidn) {
    return res.status(400).json({ status: "Error", message: "NIDN tidak boleh kosong!" });
  }
  if (nama !== undefined && !nama) {
    return res.status(400).json({ status: "Error", message: "Nama tidak boleh kosong!" });
  }

  try {
    // Membawa variabel yang sudah di-destructure agar aman (whitelist payload)
    const updated = await Dosen.update(id, { nidn, nama, prodi_id, role, is_active });
    
    if (!updated) {
      return res.status(404).json({ status: "Error", message: "Dosen tidak ditemukan" });
    }
    
    res.status(200).json({ status: "Success", data: updated });
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

// 4. Hapus Data Dosen
exports.deleteDosen = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Dosen.delete(id);
    
    if (!deleted) {
      return res.status(404).json({ status: "Error", message: "Dosen tidak ditemukan" });
    }
    
    res.status(200).json({ status: "Success", message: "Data dosen berhasil dihapus", data: deleted });
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};