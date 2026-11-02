const db = require('../config/db');
const borrowDetailModel = require('./borrowDetailModel');

const createBorrowTransaction = async (studentId, itemId, loanDurationDaysOverride) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [students] = await connection.query(
            `SELECT student_id, student_name
             FROM students
             WHERE student_id = ?
             FOR UPDATE`,
            [studentId]
        );

        if (students.length === 0) {
            throw new Error('Student not found');
        }

        const [borrowers] = await connection.query(
            `SELECT borrower_id
             FROM borrowers
             WHERE student_id = ?`,
            [studentId]
        );

        if (borrowers.length === 0) {
            throw new Error('Student is not registered as a borrower');
        }

        const [settings] = await connection.query(
            `SELECT setting_key, setting_value
             FROM system_settings
             WHERE setting_key IN (
                 'max_borrow_items',
                 'loan_duration_days'
             )`
        );

        const settingsMap = {};
        settings.forEach(setting => {
            settingsMap[setting.setting_key] = Number(setting.setting_value);
        });

        const maxBorrowItems = settingsMap.max_borrow_items;
        const loanDurationDays = loanDurationDaysOverride || settingsMap.loan_duration_days;

        if (
            !Number.isInteger(maxBorrowItems) ||
            maxBorrowItems < 1 ||
            !Number.isInteger(loanDurationDays) ||
            loanDurationDays < 1
        ) {
            throw new Error('Invalid library borrowing settings');
        }

        const [overdueBooks] = await connection.query(
            `SELECT borrow_id
             FROM borrow_records
             WHERE student_id = ?
               AND status IN ('Borrowed', 'Overdue')
               AND due_date < CURDATE()
             LIMIT 1`,
            [studentId]
        );

        if (overdueBooks.length > 0) {
            throw new Error('Borrowing blocked. Please return your overdue item first.');
        }

        const [unpaidFines] = await connection.query(
            `SELECT fine_id
             FROM fines
             WHERE student_id = ?
               AND status IN ('Unpaid', 'Partially Paid')
             LIMIT 1`,
            [studentId]
        );

        if (unpaidFines.length > 0) {
            throw new Error('Borrowing blocked. Please settle your outstanding fines first.');
        }

        const [activeBorrows] = await connection.query(
            `SELECT COUNT(*) AS total
             FROM borrow_records
             WHERE student_id = ?
               AND status IN ('Borrowed', 'Overdue')`,
            [studentId]
        );

        if (Number(activeBorrows[0].total) >= maxBorrowItems) {
            throw new Error(`Borrowing limit reached. Maximum allowed is ${maxBorrowItems} items.`);
        }

        const [items] = await connection.query(
            `SELECT book_id AS item_id, title AS item_name, available_copies
             FROM books
             WHERE book_id = ?
             FOR UPDATE`,
            [itemId]
        );

        if (items.length === 0) {
            throw new Error('Item not found');
        }

        if (Number(items[0].available_copies) <= 0) {
            throw new Error('No available copies of this item');
        }

        const [dateResult] = await connection.query(
            `SELECT DATE_ADD(CURDATE(), INTERVAL ? DAY) AS due_date`,
            [loanDurationDays]
        );

        const dueDate = dateResult[0].due_date;

        const [borrowResult] = await connection.query(
            `INSERT INTO borrow_records
             (student_id, book_id, borrow_date, due_date, status)
             VALUES (?, ?, CURDATE(), ?, 'Borrowed')`,
            [studentId, itemId, dueDate]
        );

        await borrowDetailModel.createBorrowDetail(
            connection,
            borrowResult.insertId,
            itemId
        );

        await connection.query(
            `UPDATE books
             SET available_copies = available_copies - 1
             WHERE book_id = ?`,
            [itemId]
        );

        await connection.query(
            `INSERT INTO activity_logs
                (admin_id, action, description)
             VALUES (?, ?, ?)`,
            [
                null,
                'ISSUE_BOOK',
                `Item "${items[0].item_name}" issued to student ID ${studentId}. Borrow ID: ${borrowResult.insertId}.`
            ]
        );

        await connection.commit();

        return {
            borrow_id: borrowResult.insertId,
            due_date: dueDate
        };

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const getActiveBorrows = async () => {
    await db.query(
        `UPDATE borrow_records
         SET status = 'Overdue'
         WHERE status = 'Borrowed'
           AND due_date < CURDATE()`
    );

    const [rows] = await db.query(
        `SELECT
            br.borrow_id,
            br.student_id,
            s.student_number,
            s.student_name,
            s.course,
            br.book_id AS item_id,
            b.title AS item_name,
            br.borrow_date,
            br.due_date,
            br.status
         FROM borrow_records AS br
         INNER JOIN students AS s
            ON br.student_id = s.student_id
         INNER JOIN books AS b
            ON br.book_id = b.book_id
         WHERE br.status IN ('Borrowed', 'Overdue')
         ORDER BY br.due_date ASC, br.borrow_id DESC`
    );

    return rows;
};

const getBorrowDetails = async (borrowId) => {
    const [rows] = await db.query(
        `SELECT
            br.borrow_id,
            br.student_id,
            s.student_name,
            br.book_id AS item_id,
            b.title AS item_name,
            br.borrow_date,
            br.due_date,
            br.return_date,
            br.status
         FROM borrow_records AS br
         INNER JOIN students AS s
            ON br.student_id = s.student_id
         INNER JOIN books AS b
            ON br.book_id = b.book_id
         WHERE br.borrow_id = ?`,
        [borrowId]
    );

    return rows[0] || null;
};

module.exports = {
    createBorrowTransaction,
    getActiveBorrows,
    getBorrowDetails
};