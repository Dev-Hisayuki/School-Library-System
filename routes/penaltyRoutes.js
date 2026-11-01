const express = require('express');
const router = express.Router();
const PenaltyController = require('../controllers/penaltyController');

router.get('/', PenaltyController.getAll);
router.get('/report/overdue', PenaltyController.getReport);
router.get('/:id', PenaltyController.getById);
router.post('/', PenaltyController.create);
router.put('/:id', PenaltyController.update);

module.exports = router;
