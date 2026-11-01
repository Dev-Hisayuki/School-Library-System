
const express = require('express');
const router = express.Router();

const borrowerController = require('../controllers/borrowerController');

// GET /api/borrowers
router.get('/', borrowerController.getAllBorrowers);

// POST /api/borrowers
router.post('/', borrowerController.createBorrower);

module.exports = router;

