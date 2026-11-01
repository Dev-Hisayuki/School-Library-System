
const db = require('../config/db');
const borrowDetailModel = require('./borrowDetailModel');

// Issue a book using a database transaction
const createBorrowTransaction = async (studentId, bookId, dueDate) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Confirm that the student is registered as a borrower
        const [borrowers] = await connection.query(
            'SELECT borrower_id FROM borrowers WHERE student_id = ?',
            [studentId]
        );

        if (borrowers.length === 0) {
            throw new Error('Student is not registered as a borrower');
        }

        // Check and lock the book row
        const [books] = await connection.query(
            `SELECT available_copies
             FROM books
             WHERE book_id = ?
             FOR UPDATE`,
            [bookId]
        );

        if (books.length === 0) {
            throw new Error('Book not found');
        }

        if (books[0].available_copies <= 0) {
            throw new Error('No available copies of this book');
        }

        // Create the main borrowing record
        const [borrowResult] = await connection.query(
            `INSERT INTO borrow_records
             (student_id, book_id, borrow_date, due_date, status)
             VALUES (?, ?, CURDATE(), ?, 'Borrowed')`,
            [studentId, bookId, dueDate]
        );

        // Create the borrowing detail
        await borrowDetailModel.createBorrowDetail(
            connection,
            borrowResult.insertId,
            bookId
        );

        // Decrease available book copies
        await connection.query(
            `UPDATE books
             SET available_copies = available_copies - 1
             WHERE book_id = ?`,
            [bookId]
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

// Get one borrowing record with student and book information
const getBorrowDetails = async (borrowId) => {
    const [rows] = await db.query(
        `SELECT
            br.borrow_id,
            br.student_id,
            s.student_name,
            br.book_id,
            b.book_title,
            br.borrow_date,
            br.due_date,
            br.return_date,
            br.status
         FROM borrow_records br
         INNER JOIN students s
            ON br.student_id = s.student_id
         INNER JOIN books b
            ON br.book_id = b.book_id
         WHERE br.borrow_id = ?`,
        [borrowId]
    );

    return rows[0] || null;
};
module.exports = {
    createBorrowTransaction,
    getBorrowDetails
};

