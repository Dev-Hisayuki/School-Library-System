const createBorrowDetail = async (connection, borrowId, bookId) => {
    const [result] = await connection.query(
        `INSERT INTO borrow_details
         (borrow_id, book_id, quantity)
         VALUES (?, ?, 1)`,
        [borrowId, bookId]
    );

    return result.insertId;
};

module.exports = {
    createBorrowDetail
};