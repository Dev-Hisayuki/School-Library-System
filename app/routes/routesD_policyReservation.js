const express = require('express');
const router = express.Router();
const controllerD = require('../controllers/controllerD_policyReservation');

// Route to get all reservations
router.get('/', controllerD.getReservations);

// Route for the mandatory Overdue and Penalty Report (FULL OUTER JOIN / UNION logic)
router.get('/report/overdue-penalties', controllerD.getOverdueAndPenaltyReport);

// Route to create a new reservation
router.post('/', controllerD.createReservation);

module.exports = router;
