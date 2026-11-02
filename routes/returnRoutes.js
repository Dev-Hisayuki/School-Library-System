const express = require('express');
const router = express.Router();

const returnController = require('../controllers/returnController');

router.get('/active', returnController.getActiveBorrowings);
router.get('/', returnController.getReturnLogs);
router.post('/', returnController.processReturn);

module.exports = router;