
const db = require('../config/db');

// Add a book to a borrowing record
const createBorrowDetail = async (connection, borrowId, bookId) => {
    const [result] = await connection.query(
        `INSERT INTO borrow_details (borrow_id, book_id)
         VALUES (?, ?)`,
        [borrowId, bookId]
    );

    return result.insertId;
};

module.exports = {
    createBorrowDetail
};

