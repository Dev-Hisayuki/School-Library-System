const StockAlert = require('../models/stockAlertModel');

exports.getStockAlerts = async (req, res) => {
  try {
    const alerts = await StockAlert.getAllActive();
    return res.status(200).json({ success: true, data: alerts });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
