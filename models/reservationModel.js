const db = require('../config/db');

class ReservationModel {
    // --- RESERVATIONS CRUD ---
    static async getAllReservations() {
        const [rows] = await db.query('SELECT * FROM reservations');
        return rows;
    }

    static async getReservationById(id) {
        const [rows] = await db.query('SELECT * FROM reservations WHERE reservation_id = ?', [id]);
        return rows[0];
    }

    static async createReservation(data) {
        const { student_id, book_id, reservation_date, status } = data;
        const [result] = await db.query(
            'INSERT INTO reservations (student_id, book_id, reservation_date, status) VALUES (?, ?, ?, ?)',
            [student_id, book_id, reservation_date, status]
        );
        return result.insertId;
    }

    static async updateReservation(id, data) {
        const { status } = data;
        const [result] = await db.query(
            'UPDATE reservations SET status = ? WHERE reservation_id = ?',
            [status, id]
        );
        return result.affectedRows;
    }

    static async deleteReservation(id) {
        const [result] = await db.query('DELETE FROM reservations WHERE reservation_id = ?', [id]);
        return result.affectedRows;
    }

    // --- REQUIRED JOIN REPORT: Overdue and Penalty Report (FULL OUTER JOIN via UNION) ---
    static async getOverdueAndPenaltyReport() {
        const query = `
            SELECT r.reservation_id, s.student_id, s.student_name, r.status, p.amount AS fine_amount, p.status AS payment_status
            FROM reservations r
            LEFT JOIN students s ON r.student_id = s.student_id
            LEFT JOIN penalties p ON r.reservation_id = p.borrow_id
            
            UNION
            
            SELECT r.reservation_id, s.student_id, s.student_name, r.status, p.amount AS fine_amount, p.status AS payment_status
            FROM reservations r
            RIGHT JOIN students s ON r.student_id = s.student_id
            RIGHT JOIN penalties p ON r.reservation_id = p.borrow_id;
        `;
        const [rows] = await db.query(query);
        return rows;
    }
}

module.exports = ReservationModel;