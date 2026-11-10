
const FineModel = require('../models/fineModel');

class FineController {
    static async getStudentFines(req, res) {
        try {
            const { studentId } = req.params;

            if (!Number.isInteger(Number(studentId)) || Number(studentId) <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid student ID.'
                });
            }

            const fines = await FineModel.getStudentFines(studentId);

            return res.status(200).json({
                success: true,
                data: fines
            });

        } catch (error) {
            console.error('GET STUDENT FINES ERROR:', error);

            return res.status(500).json({
                success: false,
                message: 'Unable to retrieve student fines.'
            });
        }
    }

    static async getFinePayments(req, res) {
        try {
            const { fineId } = req.params;

            if (!Number.isInteger(Number(fineId)) || Number(fineId) <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid fine ID.'
                });
            }

            const payments = await FineModel.getFinePayments(fineId);

            return res.status(200).json({
                success: true,
                data: payments
            });

        } catch (error) {
            console.error('GET FINE PAYMENTS ERROR:', error);

            return res.status(500).json({
                success: false,
                message: 'Unable to retrieve payment history.'
            });
        }
    }

    static async recordPayment(req, res) {
        try {
            const { fineId } = req.params;
            const { amount_paid, payment_method } = req.body;

            if (!Number.isInteger(Number(fineId)) || Number(fineId) <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid fine ID.'
                });
            }

            const result = await FineModel.recordPayment(fineId, {
                amount_paid,
                payment_method
            });

            return res.status(201).json({
                success: true,
                message: 'Payment recorded successfully.',
                data: result
            });

        } catch (error) {
            console.error('RECORD FINE PAYMENT ERROR:', error);

            const clientError = [
                'Enter a valid payment amount greater than zero.',
                'Payment amount can only have two decimal places.',
                'Fine not found.',
                'This fine has already been fully paid.'
            ].includes(error.message) ||
                error.message.startsWith('Payment exceeds the remaining balance');

            return res.status(clientError ? 400 : 500).json({
                success: false,
                message: clientError
                    ? error.message
                    : 'Unable to record payment.'
            });
        }
    }
}

module.exports = FineController;
