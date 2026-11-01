const express = require('express');
const router = express.Router();
const ReservationController = require('../controllers/reservationController');

// GET all reservations and POST new reservation
router.get('/', ReservationController.getAll);
router.post('/', ReservationController.create);

// GET Overdue and Penalty Report (Join Report)
router.get('/report/overdue-penalties', ReservationController.getReport);

// GET, PUT, DELETE specific reservation by ID
router.get('/:id', ReservationController.getById);
router.put('/:id', ReservationController.update);
router.delete('/:id', ReservationController.remove);

module.exports = router;
