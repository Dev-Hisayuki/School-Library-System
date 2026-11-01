
const express = require('express');
const router = express.Router();

const borrowController = require('../controllers/borrowController');

// POST /api/borrows
router.post('/', borrowController.createBorrow);
router.get('/:id', borrowController.getBorrowDetails);

module.exports = router;

