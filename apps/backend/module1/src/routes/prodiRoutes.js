const express = require('express');
const router = express.Router();
const prodiController = require('../controllers/prodiController');

router.get('/', prodiController.getAllProdi);
router.post('/', prodiController.createProdi);

module.exports = router;