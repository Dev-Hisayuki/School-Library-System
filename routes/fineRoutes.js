
const express = require('express');
const router = express.Router();

const fineController = require('../controllers/fineController');

router.get('/student/:studentId', fineController.getStudentFines);
router.get('/:fineId/payments', fineController.getFinePayments);
router.post('/:fineId/payments', fineController.recordPayment);

module.exports = router;
