const db = require('../../config/db');

class PolicyReservationModel {
  static async getAllReservations(callback) {
    const query = 'SELECT * FROM reservations';
    db.query(query, callback);
  }

  static async getOverdueAndPenaltyReport(callback) {
    const query = `
      SELECT 
        r.id AS reservation_id,
        r.user_id,
        r.status AS reservation_status,
        p.id AS penalty_id,
        p.amount AS penalty_amount,
        p.status AS penalty_status
      FROM reservations r
      LEFT JOIN penalties p ON r.id = p.reservation_id
      UNION
      SELECT 
        r.id AS reservation_id,
        r.user_id,
        r.status AS reservation_status,
        p.id AS penalty_id,
        p.amount AS penalty_amount,
        p.status AS penalty_status
      FROM penalties p
      RIGHT JOIN reservations r ON r.id = p.reservation_id
    `;
    db.query(query, callback);
  }

  static async createReservation(data, callback) {
    const query = 'INSERT INTO reservations (user_id, book_id, status, reservation_date) VALUES (?, ?, ?, ?)';
    db.query(query, [data.user_id, data.book_id, data.status, data.reservation_date], callback);
  }
}

module.exports = PolicyReservationModel;
