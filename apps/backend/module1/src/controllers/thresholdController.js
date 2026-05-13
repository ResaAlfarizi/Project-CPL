const Threshold = require('../models/thresholdModel');

exports.saveThreshold = async (req, res) => {
  const { prodi_id, nama_status, nilai_min, nilai_max } = req.body;
  if (!prodi_id || !nama_status) return res.status(400).json({ message: "Data tidak lengkap" });
  try {
    const result = await Threshold.upsert(req.body);
    res.status(201).json({ status: "Success", data: result });
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};