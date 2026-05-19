const Kurikulum = require('../models/kurikulumModel');

// ==========================================
// MATA KULIAH (MK)
// ==========================================
exports.getAllMK = async (req, res) => {
  try {
    const data = await Kurikulum.getAllMK();
    return res.status(200).json({ status: "Success", data });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: error.message });
  }
};

exports.createMK = async (req, res) => {
  const { prodi_id, kode_mk, nama_mk, sks, semester } = req.body;
  if (!prodi_id || !kode_mk || !nama_mk || !sks || !semester) {
    return res.status(400).json({ status: "Error", message: "Data Mata Kuliah tidak lengkap!" });
  }
  try {
    const data = await Kurikulum.createMK({ prodi_id, kode_mk, nama_mk, sks, semester });
    return res.status(201).json({ status: "Success", data });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: error.message });
  }
};

exports.updateMK = async (req, res) => {
  const { id } = req.params;
  const { prodi_id, kode_mk, nama_mk, sks, semester } = req.body;
  if (!prodi_id || !kode_mk || !nama_mk || !sks || !semester) {
    return res.status(400).json({ status: "Error", message: "Data pembaruan Mata Kuliah tidak lengkap!" });
  }
  try {
    const data = await Kurikulum.updateMK(id, { prodi_id, kode_mk, nama_mk, sks, semester });
    if (!data) return res.status(404).json({ status: "Error", message: "Mata Kuliah tidak ditemukan!" });
    return res.status(200).json({ status: "Success", data });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: error.message });
  }
};

exports.deleteMK = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Kurikulum.deleteMK(id);
    if (!data) return res.status(404).json({ status: "Error", message: "Mata Kuliah tidak ditemukan!" });
    return res.status(200).json({ status: "Success", message: "Mata Kuliah berhasil dihapus", data });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: error.message });
  }
};

// ==========================================
// CAPAIAN PEMBELAJARAN LULUSAN (CPL)
// ==========================================
exports.getAllCPL = async (req, res) => {
  try {
    const data = await Kurikulum.getAllCPL();
    return res.status(200).json({ status: "Success", data });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: error.message });
  }
};

exports.createCPL = async (req, res) => {
  const { prodi_id, kode_cpl, deskripsi } = req.body;
  if (!prodi_id || !kode_cpl || !deskripsi) {
    return res.status(400).json({ status: "Error", message: "Data CPL tidak lengkap!" });
  }
  try {
    const data = await Kurikulum.createCPL({ prodi_id, kode_cpl, deskripsi });
    return res.status(201).json({ status: "Success", data });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: error.message });
  }
};

exports.updateCPL = async (req, res) => {
  const { id } = req.params;
  const { prodi_id, kode_cpl, deskripsi } = req.body;
  if (!prodi_id || !kode_cpl || !deskripsi) {
    return res.status(400).json({ status: "Error", message: "Data pembaruan CPL tidak lengkap!" });
  }
  try {
    const data = await Kurikulum.updateCPL(id, { prodi_id, kode_cpl, deskripsi });
    if (!data) return res.status(404).json({ status: "Error", message: "CPL tidak ditemukan!" });
    return res.status(200).json({ status: "Success", data });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: error.message });
  }
};

exports.deleteCPL = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Kurikulum.deleteCPL(id);
    if (!data) return res.status(404).json({ status: "Error", message: "CPL tidak ditemukan!" });
    return res.status(200).json({ status: "Success", message: "CPL berhasil dihapus", data });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: error.message });
  }
};

// ==========================================
// MAPPING MK - CPL
// ==========================================
exports.getAllMapping = async (req, res) => {
  try {
    const data = await Kurikulum.getAllMapping();
    return res.status(200).json({ status: "Success", data });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: error.message });
  }
};

exports.saveMappingMKCPL = async (req, res) => {
  const { mk_id, mappings } = req.body;
  if (!mk_id || !mappings || !Array.isArray(mappings)) {
    return res.status(400).json({ status: "Error", message: "Data mapping tidak valid atau tidak lengkap!" });
  }
  try {
    // Whitelisting properti array item dan paksa tipe Float
    const sanitizedMappings = mappings.map(item => ({
      cpl_id: item.cpl_id,
      bobot: parseFloat(item.bobot || 0)
    }));

    const totalBobot = sanitizedMappings.reduce((sum, item) => sum + item.bobot, 0);
    // Presisi pengecekan desimal JavaScript (Floating-point tolerance)
    if (Math.abs(totalBobot - 1.0) > 0.0001) {
      return res.status(400).json({ status: "Error", message: `Total akumulasi bobot adalah ${totalBobot}. Harus berjumlah tepat 1.0 (100%)!` });
    }

    await Kurikulum.saveMapping(mk_id, sanitizedMappings);
    return res.status(201).json({ status: "Success", message: "Mapping MK-CPL berhasil disimpan" });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: error.message });
  }
};

// ==========================================
// SUB-CPMK
// ==========================================
exports.getAllSubCpmk = async (req, res) => {
  try {
    const data = await Kurikulum.getAllSubCpmk();
    return res.status(200).json({ status: "Success", data });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: error.message });
  }
};

exports.saveSubCpmks = async (req, res) => {
  const { mk_cpl_id, subCpmks } = req.body;
  if (!mk_cpl_id || !subCpmks || !Array.isArray(subCpmks)) {
    return res.status(400).json({ status: "Error", message: "Data Sub-CPMK tidak valid atau tidak lengkap!" });
  }
  try {
    // Melakukan sanitasi item array objek
    const sanitizedSubCpmks = subCpmks.map(item => ({
      kode_sub_cpmk: item.kode_sub_cpmk,
      deskripsi: item.deskripsi,
      bobot: parseFloat(item.bobot || 0)
    }));

    const totalBobot = sanitizedSubCpmks.reduce((sum, item) => sum + item.bobot, 0);
    if (Math.abs(totalBobot - 1.0) > 0.0001) {
      return res.status(400).json({ status: "Error", message: `Total bobot Sub-CPMK harus berjumlah 1.0 (100%). Akumulasi masukan saat ini: ${totalBobot}` });
    }

    await Kurikulum.saveSubCpmks(mk_cpl_id, sanitizedSubCpmks);
    return res.status(201).json({ status: "Success", message: "Sub-CPMK berhasil disimpan" });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: error.message });
  }
};