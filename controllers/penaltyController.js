const PenaltyModel = require('../models/penaltyModel');

class PenaltyController {
  static async getAll(req, res) {
    try {
      const penalties = await PenaltyModel.getAllPenalties();
      res.status(200).json({ success: true, data: penalties });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const penalty = await PenaltyModel.getPenaltyById(req.params.id);
      if (!penalty) return res.status(404).json({ success: false, message: 'Penalty not found' });
      res.status(200).json({ success: true, data: penalty });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async create(req, res) {
    try {
      const id = await PenaltyModel.createPenalty(req.body);
      res.status(201).json({ success: true, message: 'Penalty created', penaltyId: id });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async update(req, res) {
    try {
      const affected = await PenaltyModel.updatePenalty(req.params.id, req.body);
      if (!affected) return res.status(404).json({ success: false, message: 'Penalty not found' });
      res.status(200).json({ success: true, message: 'Penalty updated successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getReport(req, res) {
    try {
      const report = await PenaltyModel.getOverduePenaltiesReport();
      res.status(200).json({ success: true, data: report });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = PenaltyController;
