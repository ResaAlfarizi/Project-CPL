const express = require('express');
const router = express.Router();
const kurikulumController = require('../controllers/kurikulumController');

// Mata Kuliah
router.get('/mk', kurikulumController.getAllMK);
router.post('/mk', kurikulumController.createMK);
router.put('/mk/:id', kurikulumController.updateMK);
router.delete('/mk/:id', kurikulumController.deleteMK);

// CPL
router.get('/cpl', kurikulumController.getAllCPL);
router.post('/cpl', kurikulumController.createCPL);
router.put('/cpl/:id', kurikulumController.updateCPL);
router.delete('/cpl/:id', kurikulumController.deleteCPL);

// Mapping MK-CPL
router.get('/mapping', kurikulumController.getAllMapping);
router.post('/mapping', kurikulumController.saveMappingMKCPL);

// Sub-CPMK
router.get('/sub-cpmk', kurikulumController.getAllSubCpmk);
router.post('/sub-cpmk', kurikulumController.saveSubCpmks);

module.exports = router;