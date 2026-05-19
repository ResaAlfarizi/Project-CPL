const express = require('express');
const router = express.Router();

const prodiRoutes = require('./prodiRoutes');
const dosenRoutes = require('./dosenRoutes');
const mahasiswaRoutes = require('./mahasiswaRoutes');
const kurikulumRoutes = require('./kurikulumRoutes');
const thresholdRoutes = require('./thresholdRoutes');

router.use('/prodi', prodiRoutes);
router.use('/dosen', dosenRoutes);
router.use('/mahasiswa', mahasiswaRoutes);
router.use('/kurikulum', kurikulumRoutes);
router.use('/threshold', thresholdRoutes);

module.exports = router;
