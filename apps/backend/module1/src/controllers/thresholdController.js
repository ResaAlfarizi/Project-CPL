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
    // Whitelisting properti skema item array
    const sanitizedThresholds = thresholds.map(item => ({
      nama_status: item.nama_status,
      nilai_min: parseFloat(item.nilai_min || 0),
      nilai_max: parseFloat(item.nilai_max || 0)
    }));

    // Validasi aturan logika batas nilai
    for (const item of sanitizedThresholds) {
      if (item.nilai_min > item.nilai_max) {
        return res.status(400).json({ 
          status: "Error", 
          message: `Aturan tidak valid! Nilai minimum (${item.nilai_min}) tidak boleh lebih besar dari maksimum (${item.nilai_max}) pada status: "${item.nama_status}".` 
        });
      }
    }

    await Threshold.saveThresholds(prodi_id, sanitizedThresholds);
    return res.status(201).json({ status: "Success", message: "Threshold status berhasil disimpan" });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: error.message });
  }
};