const express = require('express');
const router = express.Router();

const borrowController = require('../controllers/borrowController');

// GET /api/borrows - Get all active borrowing records
router.get('/', borrowController.getAllActiveBorrows);

// POST /api/borrows - Issue a book
router.post('/', borrowController.createBorrow);

// GET /api/borrows/:id - Get borrowing details
router.get('/:id', borrowController.getBorrowDetails);

module.exports = router;