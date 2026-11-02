const express = require('express');
const router = express.Router();

const borrowerController = require('../controllers/borrowerController');

console.log('BORROWER ROUTES LOADED');

router.get('/', borrowerController.getAllBorrowers);
router.post('/', borrowerController.createBorrower);

module.exports = router;