const db = require('../config/db');

const StockAlert = {
  getAllActive: async () => {
    const sql = `SELECT sa.*, i.item_name FROM stock_alerts sa INNER JOIN items i ON sa.item_id = i.id WHERE sa.is_resolved = 0`;
    const [rows] = await db.execute(sql);
    return rows;
  },

  create: async (itemId, message) => {
    const sql = `INSERT INTO stock_alerts (item_id, message, is_resolved, created_at) VALUES (?, ?, 0, NOW())`;
    const [result] = await db.execute(sql, [itemId, message]);
    return result;
  }
};

module.exports = StockAlert;
