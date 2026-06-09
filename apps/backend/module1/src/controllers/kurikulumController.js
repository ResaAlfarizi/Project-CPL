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
    if (error.code === '23505') {
      return res.status(409).json({ status: "Error", message: "Kode Mata Kuliah tersebut sudah terdaftar pada Program Studi ini!" });
    }
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
    if (error.code === '23505') {
      return res.status(409).json({ status: "Error", message: "Kode Mata Kuliah bentrok dengan MK lain di prodi ini!" });
    }
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
    if (error.code === '23505') {
      return res.status(409).json({ status: "Error", message: "Kode CPL tersebut sudah terdaftar pada Program Studi ini!" });
    }
    return res.status(500).json({ status: "Error", message: error.message });
  }
};

exports.updateCPL = async (req, res) => {
  const { id } = req.params;
  const { prodi_id, kode_cpl, deskripsi, is_active } = req.body;
  if (!prodi_id || !kode_cpl || !deskripsi) {
    return res.status(400).json({ status: "Error", message: "Data pembaruan CPL tidak lengkap!" });
  }
  try {
    const data = await Kurikulum.updateCPL(id, { prodi_id, kode_cpl, deskripsi, is_active });
    if (!data) return res.status(404).json({ status: "Error", message: "CPL tidak ditemukan!" });
    return res.status(200).json({ status: "Success", data });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ status: "Error", message: "Kode CPL berbenturan dengan konfigurasi prodi!" });
    }
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
// MAPPING MK - CPL (Validasi Delta Floating Point)
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
    return res.status(400).json({ status: "Error", message: "Data mapping tidak valid atau format salah!" });
  }
  try {
    const sanitizedMappings = mappings.map(item => ({
      cpl_id: item.cpl_id,
      bobot: parseFloat(item.bobot || 0)
    }));

    const totalBobot = sanitizedMappings.reduce((sum, item) => sum + item.bobot, 0);
    if (Math.abs(totalBobot - 1.0) > 0.0001) {
      return res.status(400).json({
        status: "Error",
        message: `Total akumulasi bobot adalah ${totalBobot}. Batas akumulasi harus tepat berharga 1.0 (100%)!`
      });
    }

    await Kurikulum.saveMapping(mk_id, sanitizedMappings);
    return res.status(201).json({ status: "Success", message: "Mapping bobot MK-CPL berhasil diperbarui" });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: error.message });
  }
};

// ==========================================
// SUB-CPMK (Validasi Delta Floating Point)
// ==========================================
exports.getAllSubCpmk = async (req, res) => {
  try {
    const data = await Kurikulum.getAllSubCpmk();
    return res.status(200).json({ status: "Success", data });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: error.message });
  }
};

exports.createSubCpmk = async (req, res) => {
  const { mk_cpl_id, kode_sub_cpmk, deskripsi, bobot } = req.body;
  if (!mk_cpl_id || !kode_sub_cpmk || !deskripsi || bobot === undefined) {
    return res.status(400).json({ status: "Error", message: "Data Sub-CPMK tidak lengkap!" });
  }
  try {
    const data = await Kurikulum.createSubCpmk({ mk_cpl_id, kode_sub_cpmk, deskripsi, bobot: parseFloat(bobot) });
    return res.status(201).json({ status: "Success", data });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: error.message });
  }
};

exports.updateSubCpmk = async (req, res) => {
  const { id } = req.params;
  const { mk_cpl_id, kode_sub_cpmk, deskripsi, bobot } = req.body;
  if (!mk_cpl_id || !kode_sub_cpmk || !deskripsi || bobot === undefined) {
    return res.status(400).json({ status: "Error", message: "Data pembaruan Sub-CPMK tidak lengkap!" });
  }
  try {
    const data = await Kurikulum.updateSubCpmk(id, { mk_cpl_id, kode_sub_cpmk, deskripsi, bobot: parseFloat(bobot) });
    if (!data) return res.status(404).json({ status: "Error", message: "Sub-CPMK tidak ditemukan!" });
    return res.status(200).json({ status: "Success", data });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: error.message });
  }
};

exports.deleteSubCpmk = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Kurikulum.deleteSubCpmk(id);
    if (!data) return res.status(404).json({ status: "Error", message: "Sub-CPMK tidak ditemukan!" });
    return res.status(200).json({ status: "Success", message: "Sub-CPMK berhasil dihapus", data });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: error.message });
  }
};

exports.saveSubCpmks = async (req, res) => {
  const { mk_cpl_id, subCpmks } = req.body;
  if (!mk_cpl_id || !subCpmks || !Array.isArray(subCpmks)) {
    return res.status(400).json({ status: "Error", message: "Format input Sub-CPMK tidak valid!" });
  }
  try {
    const sanitizedSubCpmks = subCpmks.map(item => ({
      kode_sub_cpmk: item.kode_sub_cpmk,
      deskripsi: item.deskripsi,
      bobot: parseFloat(item.bobot || 0)
    }));

    const totalBobot = sanitizedSubCpmks.reduce((sum, item) => sum + item.bobot, 0);

    await Kurikulum.saveSubCpmks(mk_cpl_id, sanitizedSubCpmks);
    return res.status(201).json({ status: "Success", message: "Data komponen Sub-CPMK berhasil dikonfigurasi" });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: error.message });
  }
};