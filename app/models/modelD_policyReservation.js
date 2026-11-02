const db = require('../../config/db');

class PolicyReservationModel {
    static async getAllReservations(callback) {
        try {
            const query = 'SELECT * FROM reservations';
            const [rows] = await db.query(query);

            if (callback) callback(null, rows);
            return rows;
        } catch (error) {
            if (callback) {
                callback(error);
                return;
            }
            throw error;
        }
    }

    static async getOverdueAndPenaltyReport(callback) {
        try {
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

            const [rows] = await db.query(query);

            if (callback) callback(null, rows);
            return rows;
        } catch (error) {
            if (callback) {
                callback(error);
                return;
            }
            throw error;
        }
    }

    static async createReservation(data, callback) {
        try {
            const query = `
                INSERT INTO reservations
                (user_id, book_id, status, reservation_date)
                VALUES (?, ?, ?, ?)
            `;

            const [result] = await db.query(query, [
                data.user_id,
                data.book_id,
                data.status,
                data.reservation_date
            ]);

            if (callback) callback(null, result);
            return result;
        } catch (error) {
            if (callback) {
                callback(error);
                return;
            }
            throw error;
        }
    }
}

module.exports = PolicyReservationModel;