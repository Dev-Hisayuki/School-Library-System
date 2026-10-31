const db = require('../config/db');

const StockThreshold = {
  getByItemId: async (itemId) => {
    const sql = `SELECT * FROM stock_thresholds WHERE item_id = ?`;
    const [rows] = await db.execute(sql, [itemId]);
    return rows[0];
  }
};

module.exports = StockThreshold;
