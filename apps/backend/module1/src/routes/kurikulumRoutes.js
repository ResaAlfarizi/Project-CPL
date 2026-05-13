const express = require('express');
const router = express.Router();
const kurikulumController = require('../controllers/kurikulumController');

// Jalur untuk Mata Kuliah
router.post('/mk', kurikulumController.createMK);

// Jalur untuk CPL
router.post('/cpl', kurikulumController.createCPL);

// Jalur untuk Mapping MK ke CPL (Validasi bobot 1.0)
router.post('/mapping', kurikulumController.saveMappingMKCPL);

module.exports = router;