const db = require('../config/db');

const ReturnTransaction = {
    getActiveBorrowings: async () => {
        const sql = `
            SELECT
                br.borrow_id,
                br.student_id,
                s.student_number,
                s.student_name,
                br.book_id,
                b.title AS book_title,
                br.borrow_date,
                br.due_date,
                br.status,
                bd.quantity AS borrowed_quantity,
                COALESCE(SUM(rd.quantity_returned), 0) AS returned_quantity,
                bd.quantity - COALESCE(SUM(rd.quantity_returned), 0) AS remaining_quantity
            FROM borrow_records br
            INNER JOIN students s
                ON s.student_id = br.student_id
            INNER JOIN books b
                ON b.book_id = br.book_id
            INNER JOIN borrow_details bd
                ON bd.borrow_id = br.borrow_id
                AND bd.book_id = br.book_id
            LEFT JOIN return_records rr
                ON rr.borrow_id = br.borrow_id
            LEFT JOIN return_details rd
                ON rd.return_id = rr.return_id
                AND rd.book_id = br.book_id
            WHERE br.status IN ('Borrowed', 'Overdue')
            GROUP BY
                br.borrow_id,
                br.student_id,
                s.student_number,
                s.student_name,
                br.book_id,
                b.title,
                br.borrow_date,
                br.due_date,
                br.status,
                bd.quantity
            HAVING remaining_quantity > 0
            ORDER BY br.due_date ASC, br.borrow_id ASC
        `;

        const [rows] = await db.execute(sql);
        return rows;
    },

    processReturn: async ({
        borrowId,
        processedBy,
        returnDate,
        quantityReturned,
        itemCondition,
        remarks
    }) => {
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // Lock the borrowing record.
            const [borrowRows] = await connection.execute(
                `SELECT borrow_id, book_id, due_date, status
                 FROM borrow_records
                 WHERE borrow_id = ?
                 FOR UPDATE`,
                [borrowId]
            );

            if (borrowRows.length === 0) {
                throw new Error('Borrowing record not found.');
            }

            const borrow = borrowRows[0];

            if (!['Borrowed', 'Overdue'].includes(borrow.status)) {
                throw new Error('This borrowing record is not active.');
            }

            // Get the original borrowed quantity.
            const [detailRows] = await connection.execute(
                `SELECT quantity
                 FROM borrow_details
                 WHERE borrow_id = ? AND book_id = ?`,
                [borrowId, borrow.book_id]
            );

            if (detailRows.length === 0) {
                throw new Error('Borrowed book details not found.');
            }

            const borrowedQuantity = Number(detailRows[0].quantity);

            // Calculate how many copies have already been returned.
            const [returnedRows] = await connection.execute(
                `SELECT COALESCE(SUM(rd.quantity_returned), 0) AS returned_quantity
                 FROM return_details rd
                 INNER JOIN return_records rr
                    ON rr.return_id = rd.return_id
                 WHERE rr.borrow_id = ? AND rd.book_id = ?`,
                [borrowId, borrow.book_id]
            );

            const alreadyReturned = Number(returnedRows[0].returned_quantity);
            const remainingQuantity = borrowedQuantity - alreadyReturned;

            if (!Number.isInteger(Number(quantityReturned)) ||
                Number(quantityReturned) < 1 ||
                Number(quantityReturned) > remainingQuantity) {
                throw new Error(
                    `Invalid return quantity. Remaining copies: ${remainingQuantity}.`
                );
            }

            if (!['Good', 'Damaged', 'Lost'].includes(itemCondition)) {
                throw new Error('Invalid item condition.');
            }

            const finalReturn =
                alreadyReturned + Number(quantityReturned) >= borrowedQuantity;

            const actualReturnDate = returnDate
                ? new Date(returnDate)
                : new Date();

            if (Number.isNaN(actualReturnDate.getTime())) {
                throw new Error('Invalid return date.');
            }

            const formattedDate = actualReturnDate.toISOString().slice(0, 10);

            // Create the return record.
            const [returnResult] = await connection.execute(
                `INSERT INTO return_records
                    (borrow_id, processed_by, return_date, remarks)
                 VALUES (?, ?, ?, ?)`,
                [
                    borrowId,
                    processedBy || null,
                    formattedDate,
                    remarks || null
                ]
            );

            const returnId = returnResult.insertId;

            // Save the returned book details.
            await connection.execute(
                `INSERT INTO return_details
                    (return_id, book_id, quantity_returned, item_condition)
                 VALUES (?, ?, ?, ?)`,
                [
                    returnId,
                    borrow.book_id,
                    Number(quantityReturned),
                    itemCondition
                ]
            );

            // Only books in good condition become available again.
            if (itemCondition === 'Good') {
                await connection.execute(
                    `UPDATE books
                     SET available_copies = available_copies + ?
                     WHERE book_id = ?`,
                    [Number(quantityReturned), borrow.book_id]
                );
            }

            // Update the borrowing status after the final return.
            if (finalReturn) {
                await connection.execute(
                    `UPDATE borrow_records
                     SET status = 'Returned', return_date = ?
                     WHERE borrow_id = ?`,
                    [formattedDate, borrowId]
                );

                // Read the configured overdue fine rate.
                const [settings] = await connection.execute(
                    `SELECT setting_value
                     FROM system_settings
                     WHERE setting_key = 'overdue_fine_per_day'
                     LIMIT 1`
                );

                const finePerDay = settings.length
                    ? Number(settings[0].setting_value)
                    : 0;

                const dueDate = new Date(`${borrow.due_date}T00:00:00`);
                const returnedDate = new Date(`${formattedDate}T00:00:00`);

                const overdueDays = Math.max(
                    0,
                    Math.floor((returnedDate - dueDate) / 86400000)
                );

                const fineAmount = overdueDays * finePerDay;

                if (fineAmount > 0) {
                    await connection.execute(
                        `INSERT INTO fines
                            (borrow_id, student_id, amount, reason, status)
                         VALUES (?, ?, ?, ?, 'Unpaid')`,
                        [
                            borrowId,
                            borrow.student_id,
                            fineAmount,
                            `Overdue return: ${overdueDays} day(s)`
                        ]
                    );
                }
            } else {
                // Keep the record overdue if its due date has passed.
                await connection.execute(
                    `UPDATE borrow_records
                     SET status = CASE
                        WHEN due_date < ? THEN 'Overdue'
                        ELSE 'Borrowed'
                     END
                     WHERE borrow_id = ?`,
                    [formattedDate, borrowId]
                );
            }

            // Record the activity using the same transaction.
            await connection.execute(
                `INSERT INTO activity_logs
                    (admin_id, action, description)
                 VALUES (?, ?, ?)`,
                [
                    processedBy || null,
                    'RETURN_ITEM',
                    `Returned ${quantityReturned} ${itemCondition} copy/copies for borrowing record #${borrowId}. Return ID #${returnId}.`
                ]
            );

            await connection.commit();

            return {
                returnId,
                borrowId,
                quantityReturned: Number(quantityReturned),
                remainingQuantity: remainingQuantity - Number(quantityReturned),
                fullyReturned: finalReturn
            };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    getAllWithDetails: async () => {
        const sql = `
            SELECT
                rr.return_id,
                rr.borrow_id,
                rr.return_date,
                rr.remarks,
                a.full_name AS processed_by,
                s.student_number,
                s.student_name,
                b.title AS book_title,
                rd.quantity_returned,
                rd.item_condition
            FROM return_records rr
            LEFT JOIN admins a
                ON rr.processed_by = a.id
            INNER JOIN borrow_records br
                ON rr.borrow_id = br.borrow_id
            INNER JOIN students s
                ON br.student_id = s.student_id
            INNER JOIN return_details rd
                ON rr.return_id = rd.return_id
            INNER JOIN books b
                ON rd.book_id = b.book_id
            ORDER BY rr.return_date DESC, rr.return_id DESC
        `;

        const [rows] = await db.execute(sql);
        return rows;
    }
  create: async (borrowId, processedBy, returnDate) => {
    const sql = `INSERT INTO return_transactions (borrow_id, processed_by, return_date) VALUES (?, ?, ?)`;
    const [result] = await db.execute(sql, [borrowId, processedBy, returnDate || new Date()]);
    return result.insertId;
  },

  getAllWithDetails: async () => {
    const sql = `
      SELECT 
        rt.id AS return_id,
        rt.return_date,
        u.username AS processed_by,
        s.student_name AS borrower_name,
        i.item_name,
        rd.quantity_returned,
        rd.item_condition
      FROM return_transactions rt
      INNER JOIN users u ON rt.processed_by = u.id
      INNER JOIN borrow_records br ON rt.borrow_id = br.borrow_id
      INNER JOIN students s ON br.student_id = s.student_id
      INNER JOIN items i ON br.item_id = i.item_id
      INNER JOIN return_details rd ON rt.id = rd.return_id
      ORDER BY rt.return_date DESC
    `;
    const [rows] = await db.execute(sql);
    return rows;
  }
};

module.exports = ReturnTransaction;