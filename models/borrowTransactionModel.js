const db = require('../config/db');
const borrowDetailModel = require('./borrowDetailModel');

function getManilaDate() {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).formatToParts(new Date());

    const values = {};

    parts.forEach(part => {
        values[part.type] = part.value;
    });

    return `${values.year}-${values.month}-${values.day}`;
}

function formatDate(value) {
    if (!value) return null;

    if (typeof value === 'string') {
        return value.slice(0, 10);
    }

    if (value instanceof Date) {
        const parts = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Manila',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).formatToParts(value);

        const values = {};

        parts.forEach(part => {
            values[part.type] = part.value;
        });

        return `${values.year}-${values.month}-${values.day}`;
    }

    return null;
}

const createBorrowTransaction = async (studentId, bookId, dueDate = null) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const manilaDate = getManilaDate();

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
               AND due_date < ?
             LIMIT 1`,
            [studentId, manilaDate]
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
                `Borrowing limit reached. Maximum allowed is ${maxBorrowItems} items.`
            );
        }

        const [books] = await connection.query(
            `SELECT book_id, available_copies, is_archived
             FROM books
             WHERE book_id = ?
             FOR UPDATE`,
            [bookId]
        );

        if (books.length === 0 || Number(books[0].is_archived) === 1) {
            throw new Error('Book not found');
        }

        if (Number(books[0].available_copies) <= 0) {
            throw new Error('No available copies of this book');
        }

        if (!dueDate) {
            const [dateResult] = await connection.query(
                `SELECT DATE_ADD(?, INTERVAL ? DAY) AS due_date`,
                [manilaDate, loanDurationDays]
            );

            dueDate = formatDate(dateResult[0].due_date);
        } else {
            dueDate = formatDate(dueDate);
        }

        const [borrowResult] = await connection.query(
            `INSERT INTO borrow_records
                (student_id, book_id, borrow_date, due_date, status)
             VALUES (?, ?, ?, ?, 'Borrowed')`,
            [studentId, bookId, manilaDate, dueDate]
        );

        await borrowDetailModel.createBorrowDetail(
            connection,
            borrowResult.insertId,
            bookId
        );

        await connection.query(
            `UPDATE books
             SET available_copies = available_copies - 1
             WHERE book_id = ?`,
            [bookId]
        );

        await connection.query(
            `INSERT INTO activity_logs
                (admin_id, action, description)
             VALUES (?, ?, ?)`,
            [
                null,
                'ISSUE_BOOK',
                `Book ${bookId} issued to ${students[0].student_name}. Borrow ID: ${borrowResult.insertId}.`
            ]
        );

        await connection.commit();

        return {
            borrow_id: borrowResult.insertId,
            borrow_date: manilaDate,
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
    const manilaDate = getManilaDate();

    await db.query(
        `UPDATE borrow_records
         SET status = 'Overdue'
         WHERE status = 'Borrowed'
           AND due_date < ?`,
        [manilaDate]
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
            DATE_FORMAT(br.borrow_date, '%Y-%m-%d') AS borrow_date,
            DATE_FORMAT(br.due_date, '%Y-%m-%d') AS due_date,
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
            s.student_number,
            s.student_name,
            s.course,
            br.book_id,
            b.title AS book_title,
            DATE_FORMAT(br.borrow_date, '%Y-%m-%d') AS borrow_date,
            DATE_FORMAT(br.due_date, '%Y-%m-%d') AS due_date,
            DATE_FORMAT(br.return_date, '%Y-%m-%d') AS return_date,
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