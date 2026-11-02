const db = require('../config/db');

const StockAlert = {
  getAllActive: async () => {
    const sql = `
      SELECT sa.*, b.book_title AS item_name 
      FROM stock_alerts sa 
      INNER JOIN books b ON sa.book_id = b.book_id 
      WHERE sa.is_resolved = 0
    `;
    const [rows] = await db.execute(sql);
    return rows;
  },

  create: async (bookId, message) => {
    const sql = `INSERT INTO stock_alerts (book_id, message, is_resolved, created_at) VALUES (?, ?, 0, NOW())`;
    const [result] = await db.execute(sql, [bookId, message]);
    return result;
  }
};

module.exports = StockAlert;