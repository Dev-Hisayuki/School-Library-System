const db = require('../config/db');
const borrowDetailModel = require('./borrowDetailModel');

// Issue a book using a database transaction
const createBorrowTransaction = async (studentId, bookId) => {
const createBorrowTransaction = async (studentId, itemId, dueDate) => {
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
        const loanDurationDays = settingsMap.loan_duration_days;

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
            throw new Error(
                'Borrowing blocked. Please return your overdue book first.'
            );
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
            throw new Error(
                'Borrowing blocked. Please settle your outstanding fines first.'
            );
        }

        const [activeBorrows] = await connection.query(
            `SELECT COUNT(*) AS total
             FROM borrow_records
             WHERE student_id = ?
               AND status IN ('Borrowed', 'Overdue')`,
            [studentId]
        );

        if (Number(activeBorrows[0].total) >= maxBorrowItems) {
            throw new Error(
                `Borrowing limit reached. Maximum allowed is ${maxBorrowItems} books.`
            );
        }

        const [books] = await connection.query(
            `SELECT book_id, title, available_copies
             FROM books
             WHERE book_id = ?
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

        if (Number(books[0].available_copies) <= 0) {
            throw new Error('No available copies of this book');
        }

        const [dateResult] = await connection.query(
            `SELECT DATE_ADD(CURDATE(), INTERVAL ? DAY) AS due_date`,
            [loanDurationDays]
        );

        const dueDate = dateResult[0].due_date;

        const [borrowResult] = await connection.query(
            `INSERT INTO borrow_records
                (student_id, book_id, borrow_date, due_date, status)
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

        await connection.query(
            `INSERT INTO activity_logs
                (admin_id, action, description)
             VALUES (?, ?, ?)`,
            [
                null,
                'ISSUE_BOOK',
                `Book "${books[0].title}" issued to ${students[0].student_name}. Borrow ID: ${borrowResult.insertId}.`
            ]
        );

        await connection.commit();

        return {
            borrow_id: borrowResult.insertId,
            due_date: dueDate
        };
        return borrowResult.insertId;

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// Get all active borrowing records
const getActiveBorrows = async () => {
    // Update borrowed records whose due dates have passed
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
            br.book_id,
            b.title AS book_title,
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

// Get borrowing details by ID
const getBorrowDetails = async (borrowId) => {
    const [rows] = await db.query(
        `SELECT
            br.borrow_id,
            br.student_id,
            s.student_name,
            br.book_id,
            b.title AS book_title,
            br.item_id,
            i.item_name,
            br.borrow_date,
            br.due_date,
            br.return_date,
            br.status
         FROM borrow_records AS br
         INNER JOIN students AS s
            ON br.student_id = s.student_id
         INNER JOIN books AS b
            ON br.book_id = b.book_id
         INNER JOIN items i
            ON br.item_id = i.item_id
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