const express = require('express');
require('dotenv').config();

// Perhatikan: sekarang jalurnya masuk ke folder 'module1'
const prodiRoutes = require('./module1/src/routes/prodiRoutes');

const app = express();
app.use(express.json());

// Menggunakan API Prodi
app.use('/api/prodi', prodiRoutes);

app.get('/', (req, res) => {
  res.send('Backend Aktif - Struktur Sudah Sesuai Request Kelompok!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server nyala di http://localhost:${PORT}`);
});