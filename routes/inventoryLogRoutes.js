const express = require('express');
const router = express.Router();
const inventoryLogController = require('../controllers/inventoryLogController');

router.get('/activity', inventoryLogController.getActivityLogs);

module.exports = router;
