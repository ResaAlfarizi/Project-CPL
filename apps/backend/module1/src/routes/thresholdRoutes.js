const express = require('express');
const router = express.Router();
const thresholdController = require('../controllers/thresholdController');

router.get('/', thresholdController.getAllThreshold);
router.post('/', thresholdController.saveThreshold);

module.exports = router;