const express = require('express');
const router = express.Router();
const thresholdController = require('../controllers/thresholdController');

router.get('/', thresholdController.getAllThreshold);
router.post('/', thresholdController.saveThreshold);
router.delete('/:prodi_id', thresholdController.deleteThreshold);

module.exports = router;