const db = require('../config/db');

const ReturnDetail = {
  create: async (returnId, bookId, quantityReturned, itemCondition) => {
    const sql = `INSERT INTO return_details (return_id, book_id, quantity_returned, item_condition) VALUES (?, ?, ?, ?)`;
    const [result] = await db.execute(sql, [returnId, bookId, quantityReturned, itemCondition]);
    return result;
  }
};

module.exports = ReturnDetail;