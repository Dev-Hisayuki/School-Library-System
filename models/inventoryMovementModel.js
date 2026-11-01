const db = require('../config/db');

const InventoryMovement = {
  logMovement: async (bookId, changeType, quantity, referenceId) => {
    const sql = `INSERT INTO inventory_movements (book_id, change_type, quantity, reference_id, created_at) VALUES (?, ?, ?, ?, NOW())`;
    const [result] = await db.execute(sql, [bookId, changeType, quantity, referenceId]);
    return result;
  }
};

module.exports = InventoryMovement;