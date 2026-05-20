const Threshold = require('../models/thresholdModel');

exports.getAllThreshold = async (req, res) => {
  try {
    const data = await Threshold.getAll();
    return res.status(200).json({ status: "Success", data });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: error.message });
  }
};

exports.saveThreshold = async (req, res) => {
  const { prodi_id, thresholds } = req.body;
  
  if (!prodi_id || !thresholds || !Array.isArray(thresholds)) {
    return res.status(400).json({ status: "Error", message: "Data tidak lengkap atau format thresholds salah!" });
  }
  
  try {
    const sanitizedThresholds = thresholds.map(item => ({
      nama_status: item.nama_status,
      nilai_min: parseFloat(item.nilai_min || 0),
      nilai_max: parseFloat(item.nilai_max || 0)
    }));

    // Validasi Logika Batas Atas & Batas Bawah Nilai
    for (const item of sanitizedThresholds) {
      if (item.nilai_min > item.nilai_max) {
        return res.status(400).json({ 
          status: "Error", 
          message: `Aturan batas nilai tidak valid! Batas Minimum (${item.nilai_min}) tidak boleh melampaui Batas Maksimum (${item.nilai_max}) pada label status: "${item.nama_status}".` 
        });
      }
    }

    await Threshold.saveThresholds(prodi_id, sanitizedThresholds);
    return res.status(201).json({ status: "Success", message: "Batas kelulusan performa nilai program studi berhasil diperbarui" });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: error.message });
  }
};