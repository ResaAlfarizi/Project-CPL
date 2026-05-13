const Kurikulum = require('../models/kurikulumModel');

exports.createMK = async (req, res) => {
  const { prodi_id, kode_mk, nama_mk, sks, semester } = req.body;
  if (!kode_mk || !nama_mk) return res.status(400).json({ message: "Data MK tidak lengkap" });
  try {
    const data = await Kurikulum.createMK(req.body);
    res.status(201).json({ status: "Success", data });
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

exports.createCPL = async (req, res) => {
  const { prodi_id, kode_cpl, deskripsi } = req.body;
  if (!kode_cpl) return res.status(400).json({ message: "Kode CPL wajib ada" });
  try {
    const data = await Kurikulum.createCPL(req.body);
    res.status(201).json({ status: "Success", data });
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

exports.saveMappingMKCPL = async (req, res) => {
  const { mk_id, mappings } = req.body;
  if (!mk_id || !mappings || !Array.isArray(mappings)) {
    return res.status(400).json({ message: "Data mapping tidak valid" });
  }
  try {
    const totalBobot = mappings.reduce((sum, item) => sum + parseFloat(item.bobot || 0), 0);
    // Menggunakan toleransi floating point agar 0.9999 dianggap 1.0
    if (Math.abs(totalBobot - 1.0) > 0.0001) {
      return res.status(400).json({ message: `Total bobot adalah ${totalBobot}. Harus 1.0!` });
    }
    await Kurikulum.saveMapping(mk_id, mappings);
    res.status(201).json({ status: "Success", message: "Mapping MK-CPL berhasil disimpan" });
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};