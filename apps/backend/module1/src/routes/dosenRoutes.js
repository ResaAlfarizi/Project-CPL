const express = require('express');
const router = express.Router();
const dosenController = require('../controllers/dosenController');

router.get('/', dosenController.getAllDosen);
router.post('/', dosenController.createDosen);

module.exports = router;