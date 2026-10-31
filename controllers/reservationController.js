const ReservationModel = require('../models/reservationModel');

class ReservationController {
    static async getAll(req, res) {
        try {
            const reservations = await ReservationModel.getAllReservations();
            res.status(200).json({ success: true, data: reservations });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const reservation = await ReservationModel.getReservationById(req.params.id);
            if (!reservation) {
                return res.status(404).json({ success: false, message: 'Reservation not found' });
            }
            res.status(200).json({ success: true, data: reservation });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async create(req, res) {
        try {
            const { student_id, book_id, reservation_date, status } = req.body;
            if (!student_id || !book_id) {
                return res.status(400).json({ success: false, message: 'student_id and book_id are required' });
            }
            const insertId = await ReservationModel.createReservation({ student_id, book_id, reservation_date, status });
            res.status(201).json({ success: true, message: 'Reservation created successfully', reservation_id: insertId });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async update(req, res) {
        try {
            const affectedRows = await ReservationModel.updateReservation(req.params.id, req.body);
            if (affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Reservation not found or no changes made' });
            }
            res.status(200).json({ success: true, message: 'Reservation updated successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async remove(req, res) {
        try {
            const affectedRows = await ReservationModel.deleteReservation(req.params.id);
            if (affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Reservation not found' });
            }
            res.status(200).json({ success: true, message: 'Reservation deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getReport(req, res) {
        try {
            const report = await ReservationModel.getOverdueAndPenaltyReport();
            res.status(200).json({ success: true, data: report });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = ReservationController;
