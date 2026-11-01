const db = require('../config/db');

class PenaltyModel {
  static async getAllPenalties() {
    const [rows] = await db.query('SELECT * FROM penalties');
    return rows;
  }

  static async getPenaltyById(id) {
    const [rows] = await db.query('SELECT * FROM penalties WHERE id = ?', [id]);
    return rows[0];
  }

  static async createPenalty(data) {
    const { borrow_id, amount, reason, status } = data;
    const [result] = await db.query(
      'INSERT INTO penalties (borrow_id, amount, reason, status) VALUES (?, ?, ?, ?)',
      [borrow_id, amount, reason, status || 'unpaid']
    );
    return result.insertId;
  }

  static async updatePenalty(id, data) {
    const { amount, reason, status } = data;
    const [result] = await db.query(
      'UPDATE penalties SET amount = ?, reason = ?, status = ? WHERE id = ?',
      [amount, reason, status, id]
    );
    return result.affectedRows;
  }

  static async getOverduePenaltiesReport() {
    const query = `
      SELECT 
        p.id AS penalty_id,
        p.amount,
        p.reason,
        p.status AS penalty_status,
        r.reservation_id,
        r.reservation_date,
        r.status AS reservation_status
      FROM penalties p
      LEFT JOIN reservations r ON p.borrow_id = r.reservation_id
    `;
    const [rows] = await db.query(query);
    return rows;
  }
}

module.exports = PenaltyModel;
