
const db = require('../config/db');

class FineModel {
    static async getStudentFines(studentId) {
        const [fines] = await db.query(
            `SELECT
                f.fine_id,
                f.borrow_id,
                f.student_id,
                f.amount,
                f.reason,
                f.status,
                f.created_at,
                COALESCE(SUM(fp.amount_paid), 0) AS amount_paid
            FROM fines f
            LEFT JOIN fine_payments fp ON fp.fine_id = f.fine_id
            WHERE f.student_id = ?
            GROUP BY
                f.fine_id,
                f.borrow_id,
                f.student_id,
                f.amount,
                f.reason,
                f.status,
                f.created_at
            ORDER BY f.created_at DESC`,
            [studentId]
        );

        if (fines.length === 0) {
            return [];
        }

        const fineIds = fines.map(fine => fine.fine_id);
        const placeholders = fineIds.map(() => '?').join(',');

        const [payments] = await db.query(
            `SELECT
                payment_id,
                fine_id,
                amount_paid,
                payment_date,
                payment_method
            FROM fine_payments
            WHERE fine_id IN (${placeholders})
            ORDER BY payment_date DESC`,
            fineIds
        );

        const paymentMap = {};

        for (const payment of payments) {
            if (!paymentMap[payment.fine_id]) {
                paymentMap[payment.fine_id] = [];
            }

            paymentMap[payment.fine_id].push(payment);
        }

        return fines.map(fine => {
            const amountCents = Math.round(Number(fine.amount) * 100);
            const paidCents = Math.round(Number(fine.amount_paid) * 100);

            return {
                ...fine,
                amount_paid: (paidCents / 100).toFixed(2),
                balance: (Math.max(0, amountCents - paidCents) / 100).toFixed(2),
                payments: paymentMap[fine.fine_id] || []
            };
        });
    }

    static async getFinePayments(fineId) {
        const [rows] = await db.query(
            `SELECT
                payment_id,
                fine_id,
                amount_paid,
                payment_date,
                payment_method
            FROM fine_payments
            WHERE fine_id = ?
            ORDER BY payment_date DESC`,
            [fineId]
        );

        return rows;
    }

    static async recordPayment(fineId, data) {
        const amount = Number(data.amount_paid);
        const paymentMethod = data.payment_method
            ? String(data.payment_method).trim()
            : null;

        if (!Number.isFinite(amount) || amount <= 0) {
            throw new Error('Enter a valid payment amount greater than zero.');
        }

        const amountCents = Math.round(amount * 100);

        if (Math.abs(amount * 100 - amountCents) > 0.000001) {
            throw new Error('Payment amount can only have two decimal places.');
        }

        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const [fineRows] = await connection.query(
                `SELECT fine_id, amount, status
                 FROM fines
                 WHERE fine_id = ?
                 FOR UPDATE`,
                [fineId]
            );

            if (fineRows.length === 0) {
                throw new Error('Fine not found.');
            }

            const fine = fineRows[0];
            const fineAmountCents = Math.round(Number(fine.amount) * 100);

            const [paymentRows] = await connection.query(
                `SELECT COALESCE(SUM(amount_paid), 0) AS total_paid
                 FROM fine_payments
                 WHERE fine_id = ?`,
                [fineId]
            );

            const paidCents = Math.round(
                Number(paymentRows[0].total_paid) * 100
            );

            const balanceCents = fineAmountCents - paidCents;

            if (balanceCents <= 0) {
                throw new Error('This fine has already been fully paid.');
            }

            if (amountCents > balanceCents) {
                throw new Error(
                    `Payment exceeds the remaining balance of ₱${(balanceCents / 100).toFixed(2)}.`
                );
            }

            await connection.query(
                `INSERT INTO fine_payments
                    (fine_id, amount_paid, payment_method)
                 VALUES (?, ?, ?)`,
                [fineId, (amountCents / 100).toFixed(2), paymentMethod]
            );

            const newPaidCents = paidCents + amountCents;

            let newStatus = 'Unpaid';

            if (newPaidCents >= fineAmountCents) {
                newStatus = 'Paid';
            } else if (newPaidCents > 0) {
                newStatus = 'Partially Paid';
            }

            await connection.query(
                `UPDATE fines
                 SET status = ?
                 WHERE fine_id = ?`,
                [newStatus, fineId]
            );

            await connection.commit();

            return {
                fine_id: Number(fineId),
                amount_paid: (amountCents / 100).toFixed(2),
                total_paid: (newPaidCents / 100).toFixed(2),
                balance: ((fineAmountCents - newPaidCents) / 100).toFixed(2),
                status: newStatus
            };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = FineModel;
