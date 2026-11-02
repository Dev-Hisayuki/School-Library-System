const express = require('express');
const router = express.Router();

const logsController = require('../controllers/logsController');

// Get all activity logs
router.get('/activity', logsController.getActivityLogs);

module.exports = router;