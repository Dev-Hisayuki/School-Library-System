const db = require('../config/db');
const borrowDetailModel = require('./borrowDetailModel');

const createBorrowTransaction = async (studentId, itemId, dueDate) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [borrowers] = await connection.query(
            'SELECT borrower_id FROM borrowers WHERE student_id = ?',
            [studentId]
        );

        if (borrowers.length === 0) {
            throw new Error('Student is not registered as a borrower');
        }

        const [items] = await connection.query(
            `SELECT available_copies
             FROM items
             WHERE item_id = ?
             FOR UPDATE`,
            [itemId]
        );

        if (items.length === 0) {
            throw new Error('Item not found');
        }

        if (items[0].available_copies <= 0) {
            throw new Error('No available copies of this item');
        }

        const [borrowResult] = await connection.query(
            `INSERT INTO borrow_records
             (student_id, item_id, borrow_date, due_date, status)
             VALUES (?, ?, CURDATE(), ?, 'Borrowed')`,
            [studentId, itemId, dueDate]
        );

        await borrowDetailModel.createBorrowDetail(
            connection,
            borrowResult.insertId,
            itemId
        );

        await connection.query(
            `UPDATE items
             SET available_copies = available_copies - 1
             WHERE item_id = ?`,
            [itemId]
        );

        await connection.commit();
        return borrowResult.insertId;

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const getBorrowDetails = async (borrowId) => {
    const [rows] = await db.query(
        `SELECT
            br.borrow_id,
            br.student_id,
            s.student_name,
            br.item_id,
            i.item_name,
            br.borrow_date,
            br.due_date,
            br.return_date,
            br.status
         FROM borrow_records br
         INNER JOIN students s
            ON br.student_id = s.student_id
         INNER JOIN items i
            ON br.item_id = i.item_id
         WHERE br.borrow_id = ?`,
        [borrowId]
    );

    return rows[0] || null;
};

module.exports = {
    createBorrowTransaction,
    getBorrowDetails
};