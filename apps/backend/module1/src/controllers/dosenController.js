const Dosen = require('../models/dosenModel');
const pool = require('../config/db');
const bcrypt = require('bcrypt');

exports.getAllDosen = async (req, res) => {
  try {
    const data = await Dosen.getAll();
    res.status(200).json({ status: "Success", data });
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

exports.createDosen = async (req, res) => {
  const { nidn, nama, prodi_id, email } = req.body;
  
  if (!nidn || !nama || !email || !prodi_id) {
    return res.status(400).json({ status: "Error", message: "NIDN, Nama, Prodi ID, dan Email Dosen wajib diisi!" });
  }
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // a. Simpan data dosen ke tabel fisik dosen
    const newDosen = await Dosen.create({ nidn, nama }, client);

    // b. Ambil UUID role 'dosen' dari database
    const roleResult = await client.query(`SELECT id FROM roles WHERE nama_role = 'dosen'`);
    if (roleResult.rows.length === 0) {
      throw new Error("Pendaftaran gagal: Data master role 'dosen' belum dikonfigurasi di database.");
    }
    const roleId = roleResult.rows[0].id;

    // c. Hashing password default
    const passwordDefault = 'Dosen123!';
    const passwordHash = await bcrypt.hash(passwordDefault, 10);

    // d. Buat entri kredensial login terpisah pada tabel users
    const userQuery = `
      INSERT INTO users (email, password_hash, role_id, prodi_id, entity_type, entity_id)
      VALUES ($1, $2, $3, $4, 'dosen', $5)
    `;
    await client.query(userQuery, [email, passwordHash, roleId, prodi_id, newDosen.id]);

    await client.query('COMMIT');
    
    res.status(201).json({ 
      status: "Success", 
      message: `Dosen baru terdaftar. Akun login dibuat otomatis dengan password default: ${passwordDefault}`,
      data: newDosen 
    });
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505') {
      return res.status(409).json({ status: "Error", message: "Gagal menyimpan! NIDN atau Email sudah digunakan." });
    }
    res.status(500).json({ status: "Error", message: error.message });
  } finally {
    client.release();
  }
};

exports.updateDosen = async (req, res) => {
  const { id } = req.params;
  const { nidn, nama } = req.body;

  if (nidn !== undefined && !nidn) {
    return res.status(400).json({ status: "Error", message: "NIDN tidak boleh kosong!" });
  }
  if (nama !== undefined && !nama) {
    return res.status(400).json({ status: "Error", message: "Nama tidak boleh kosong!" });
  }

  try {
    const updated = await Dosen.update(id, { nidn, nama });
    if (!updated) {
      return res.status(404).json({ status: "Error", message: "Dosen tidak ditemukan" });
    }
    res.status(200).json({ status: "Success", data: updated });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ status: "Error", message: "NIDN tersebut telah diklaim oleh dosen lain!" });
    }
    res.status(500).json({ status: "Error", message: error.message });
  }
};

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