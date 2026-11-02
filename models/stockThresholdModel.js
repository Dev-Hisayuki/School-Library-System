const db = require('../config/db');

const StockThreshold = {
  getByItemId: async (bookId) => {
    const sql = `SELECT * FROM stock_thresholds WHERE book_id = ?`;
    const [rows] = await db.execute(sql, [bookId]);
    return rows[0];
  }
};

module.exports = StockThreshold;