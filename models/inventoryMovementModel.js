const db = require('../config/db');

const InventoryMovement = {
  logMovement: async (itemId, changeType, quantity, referenceId) => {
    const sql = `INSERT INTO inventory_movements (item_id, change_type, quantity, reference_id, created_at) VALUES (?, ?, ?, ?, NOW())`;
    const [result] = await db.execute(sql, [itemId, changeType, quantity, referenceId]);
    return result;
  }
};

module.exports = InventoryMovement;
