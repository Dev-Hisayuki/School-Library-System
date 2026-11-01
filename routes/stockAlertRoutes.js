const express = require('express');
const router = express.Router();
const stockAlertController = require('../controllers/stockAlertController');

router.get('/', stockAlertController.getStockAlerts);

module.exports = router;
