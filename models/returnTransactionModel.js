const db = require('../config/db');

const ReturnTransaction = {
  create: async (borrowId, processedBy, returnDate) => {
    const sql = `INSERT INTO return_transactions (borrow_id, processed_by, return_date) VALUES (?, ?, ?)`;
    const [result] = await db.execute(sql, [borrowId, processedBy, returnDate || new Date()]);
    return result.insertId;
  },

  getAllWithDetails: async () => {
    const sql = `
      SELECT 
        rt.id AS return_id,
        rt.return_date,
        u.username AS processed_by,
        s.student_name AS borrower_name,
        i.item_name,
        rd.quantity_returned,
        rd.item_condition
      FROM return_transactions rt
      INNER JOIN users u ON rt.processed_by = u.id
      INNER JOIN borrow_records br ON rt.borrow_id = br.borrow_id
      INNER JOIN students s ON br.student_id = s.student_id
      INNER JOIN items i ON br.item_id = i.item_id
      INNER JOIN return_details rd ON rt.id = rd.return_id
      ORDER BY rt.return_date DESC
    `;
    const [rows] = await db.execute(sql);
    return rows;
  }
};

module.exports = ReturnTransaction;