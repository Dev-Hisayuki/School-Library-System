const express = require('express');
const router = express.Router();
const returnController = require('../controllers/returnController');

router.post('/', returnController.processReturn);
router.get('/', returnController.getReturnLogs);

module.exports = router;
