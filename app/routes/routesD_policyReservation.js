const express = require('express');
const router = express.Router();
const controllerD = require('../controllers/controllerD_policyReservation');

router.get('/', controllerD.getReservations);

router.get('/report/overdue-penalties', controllerD.getOverdueAndPenaltyReport);

router.post('/', controllerD.createReservation);

module.exports = router;
