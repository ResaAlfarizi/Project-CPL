const Mahasiswa = require('../models/mahasiswaModel');
const pool = require('../config/db');
const bcrypt = require('bcrypt');

exports.getAllMahasiswa = async (req, res) => {
  try {
    const data = await Mahasiswa.getAll();
    return res.status(200).json({ status: "Success", data });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: error.message });
  }
};

exports.createMahasiswa = async (req, res) => {
  const { prodi_id, nim, nama, angkatan, email } = req.body;
  
  if (!prodi_id || !nim || !nama || !angkatan || !email) {
    return res.status(400).json({ status: "Error", message: "Data pendaftaran mahasiswa tidak lengkap!" });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const cekNim = await Mahasiswa.getByNim(nim);
    if (cekNim) {
      await client.query('ROLLBACK');
      return res.status(400).json({ status: "Error", message: "NIM sudah terdaftar!" });
    }

    // a. Simpan data ke tabel fisik mahasiswa
    const newMhs = await Mahasiswa.create({ prodi_id, nim, nama, angkatan }, client);

    // b. Ambil UUID role 'mahasiswa'
    const roleResult = await client.query(`SELECT id FROM roles WHERE nama_role = 'mahasiswa'`);
    if (roleResult.rows.length === 0) {
      throw new Error("Pendaftaran gagal: Data master role 'mahasiswa' belum dikonfigurasi di database.");
    }
    const roleId = roleResult.rows[0].id;

    // c. Hashing password bawaan
    const passwordDefault = 'Mhs123!';
    const passwordHash = await bcrypt.hash(passwordDefault, 10);

    // d. Masukkan data ke tabel users relasional auth
    const userQuery = `
      INSERT INTO users (email, password_hash, role_id, prodi_id, entity_type, entity_id)
      VALUES ($1, $2, $3, $4, 'mahasiswa', $5)
    `;
    await client.query(userQuery, [email, passwordHash, roleId, prodi_id, newMhs.id]);

    await client.query('COMMIT');
    return res.status(201).json({ 
      status: "Success", 
      message: `Mahasiswa berhasil disimpan. Akun login aktif otomatis dengan password default: ${passwordDefault}`,
      data: newMhs 
    });
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505') {
      return res.status(409).json({ status: "Error", message: "Alamat Email atau NIM tersebut sudah diklaim pengguna lain!" });
    }
    return res.status(500).json({ status: "Error", message: error.message });
  } finally {
    client.release();
  }
};

exports.updateMahasiswa = async (req, res) => {
  const { id } = req.params;
  const { prodi_id, nim, nama, angkatan, is_active } = req.body;

  if (!prodi_id || !nim || !nama || !angkatan) {
    return res.status(400).json({ status: "Error", message: "Parameter modifikasi data mahasiswa tidak lengkap!" });
  }

  try {
    const updated = await Mahasiswa.update(id, { prodi_id, nim, nama, angkatan, is_active });
    if (!updated) {
      return res.status(404).json({ status: "Error", message: "Mahasiswa tidak ditemukan!" });
    }
    return res.status(200).json({ status: "Success", data: updated });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ status: "Error", message: "NIM baru tersebut bentrok dengan mahasiswa lain!" });
    }
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