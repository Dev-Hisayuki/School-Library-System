const PolicyReservationModel = require('../models/modelD_policyReservation');

const controllerD_policyReservation = {
  // Get all reservations
  getReservations: (req, res) => {
    PolicyReservationModel.getAllReservations((err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  },

  // Get Overdue and Penalty Report (FULL OUTER JOIN / UNION)
  getOverdueAndPenaltyReport: (req, res) => {
    PolicyReservationModel.getOverdueAndPenaltyReport((err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  },

  // Create a new reservation
  createReservation: (req, res) => {
    PolicyReservationModel.createReservation(req.body, (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Reservation created successfully', id: results.insertId });
    });
  }
};

module.exports = controllerD_policyReservation;
