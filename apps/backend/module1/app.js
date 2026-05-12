const express = require('express');
require('dotenv').config();
const prodiRoutes = require('./src/routes/prodiRoutes');

const app = express();
app.use(express.json());

// Gunakan routes yang sudah dipisah
app.use('/api/prodi', prodiRoutes);

app.get('/', (req, res) => {
  res.send('Backend Modul 1 Aktif dengan Struktur Rapi!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server nyala di http://localhost:${PORT}`);
});