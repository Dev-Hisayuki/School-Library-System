const db = require('../config/db');

const ReturnDetail = {
  create: async (returnId, itemId, quantityReturned, itemCondition) => {
    const sql = `INSERT INTO return_details (return_id, item_id, quantity_returned, item_condition) VALUES (?, ?, ?, ?)`;
    const [result] = await db.execute(sql, [returnId, itemId, quantityReturned, itemCondition]);
    return result;
  }
};

module.exports = ReturnDetail;
