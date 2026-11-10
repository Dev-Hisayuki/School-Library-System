
const db = require('../config/db');

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

function isValidDateString(date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return false;
    }

    const parsed = new Date(`${date}T00:00:00Z`);

    return (
        !Number.isNaN(parsed.getTime()) &&
        parsed.toISOString().slice(0, 10) === date
    );
}

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
                DATE_FORMAT(br.borrow_date, '%Y-%m-%d') AS borrow_date,
                DATE_FORMAT(br.due_date, '%Y-%m-%d') AS due_date,
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

            const normalizedBorrowId = Number(borrowId);
            const normalizedQuantity = Number(quantityReturned);

            if (
                !Number.isInteger(normalizedBorrowId) ||
                normalizedBorrowId < 1
            ) {
                throw new Error('Invalid borrowing record ID.');
            }

            if (
                !Number.isInteger(normalizedQuantity) ||
                normalizedQuantity < 1
            ) {
                throw new Error(
                    'Return quantity must be a positive whole number.'
                );
            }

            if (!['Good', 'Damaged', 'Lost'].includes(itemCondition)) {
                throw new Error('Invalid item condition.');
            }

            const formattedDate = returnDate
                ? String(returnDate).slice(0, 10)
                : getManilaDate();

            if (!isValidDateString(formattedDate)) {
                throw new Error('Invalid return date.');
            }

            const today = getManilaDate();

            if (formattedDate > today) {
                throw new Error('Return date cannot be later than today.');
            }

            const [borrowRows] = await connection.execute(
                `SELECT
                    borrow_id,
                    student_id,
                    book_id,
                    DATE_FORMAT(borrow_date, '%Y-%m-%d') AS borrow_date,
                    DATE_FORMAT(due_date, '%Y-%m-%d') AS due_date,
                    status
                 FROM borrow_records
                 WHERE borrow_id = ?
                 FOR UPDATE`,
                [normalizedBorrowId]
            );

            if (borrowRows.length === 0) {
                throw new Error('Borrowing record not found.');
            }

            const borrow = borrowRows[0];

            if (!['Borrowed', 'Overdue'].includes(borrow.status)) {
                throw new Error('This borrowing record is not active.');
            }

            const actualBorrowDate = borrow.borrow_date;

            if (!isValidDateString(actualBorrowDate)) {
                throw new Error('Invalid borrowing date in database.');
            }

            if (formattedDate < actualBorrowDate) {
                throw new Error(
                    'Return date cannot be earlier than the borrow date.'
                );
            }


            const [detailRows] = await connection.execute(
                `SELECT quantity
                 FROM borrow_details
                 WHERE borrow_id = ? AND book_id = ?`,
                [normalizedBorrowId, borrow.book_id]
            );

            if (detailRows.length === 0) {
                throw new Error('Borrowed book details not found.');
            }

            const borrowedQuantity = Number(detailRows[0].quantity);


            const [returnedRows] = await connection.execute(
                `SELECT COALESCE(SUM(rd.quantity_returned), 0) AS returned_quantity
                 FROM return_details rd
                 INNER JOIN return_records rr
                    ON rr.return_id = rd.return_id
                 WHERE rr.borrow_id = ? AND rd.book_id = ?`,
                [normalizedBorrowId, borrow.book_id]
            );

            const alreadyReturned = Number(
                returnedRows[0].returned_quantity
            );

            const remainingQuantity = borrowedQuantity - alreadyReturned;

            if (remainingQuantity <= 0) {
                throw new Error(
                    'All borrowed copies have already been returned.'
                );
            }

            if (normalizedQuantity > remainingQuantity) {
                throw new Error(
                    `Invalid return quantity. Remaining copies: ${remainingQuantity}.`
                );
            }


            const finalReturn =
                alreadyReturned + normalizedQuantity === borrowedQuantity;


                const [returnResult] = await connection.execute(
                `INSERT INTO return_records
                    (borrow_id, processed_by, return_date, remarks)
                 VALUES (?, ?, ?, ?)`,
                [
                    normalizedBorrowId,
                    processedBy || null,
                    formattedDate,
                    remarks || null
                ]
            );

            const returnId = returnResult.insertId;


            await connection.execute(
                `INSERT INTO return_details
                    (return_id, book_id, quantity_returned, item_condition)
                 VALUES (?, ?, ?, ?)`,
                [
                    returnId,
                    borrow.book_id,
                    normalizedQuantity,
                    itemCondition
                ]
            );


            if (itemCondition === 'Good') {
                await connection.execute(
                    `UPDATE books
                     SET available_copies = available_copies + ?
                     WHERE book_id = ?`,
                    [normalizedQuantity, borrow.book_id]
                );
            }


            if (finalReturn) {
                await connection.execute(
                    `UPDATE borrow_records
                     SET status = 'Returned',
                         return_date = ?
                     WHERE borrow_id = ?`,
                    [formattedDate, normalizedBorrowId]
                );


                const [settings] = await connection.execute(
                    `SELECT setting_value
                     FROM system_settings
                     WHERE setting_key = 'overdue_fine_per_day'
                     LIMIT 1`
                );

                const finePerDay = settings.length
                    ? Number(settings[0].setting_value)
                    : 0;

                if (!Number.isFinite(finePerDay) || finePerDay < 0) {
                    throw new Error('Invalid overdue fine setting.');
                }

                const dueDate = new Date(`${borrow.due_date}T00:00:00Z`);
                const actualReturnDate = new Date(`${formattedDate}T00:00:00Z`);

                const overdueDays = Math.max(
                    0,
                    Math.floor(
                        (actualReturnDate.getTime() - dueDate.getTime()) /
                        86400000
                    )
                );

                const fineAmount = Number(
                    (overdueDays * finePerDay).toFixed(2)
                );

                if (fineAmount > 0) {
                    await connection.execute(
                        `INSERT INTO fines
                            (borrow_id, student_id, amount, reason, status)
                         VALUES (?, ?, ?, ?, 'Unpaid')`,
                        [
                            normalizedBorrowId,
                            borrow.student_id,
                            fineAmount,
                            `Overdue return: ${overdueDays} day(s)`
                        ]
                    );
                }
            } else {

                await connection.execute(
                    `UPDATE borrow_records
                     SET status = CASE
                        WHEN due_date < ? THEN 'Overdue'
                        ELSE 'Borrowed'
                     END
                     WHERE borrow_id = ?`,
                    [formattedDate, normalizedBorrowId]
                );
            }

            await connection.execute(
                `INSERT INTO activity_logs
                    (admin_id, action, description)
                 VALUES (?, ?, ?)`,
                [
                    processedBy || null,
                    'RETURN_ITEM',
                    `Returned ${normalizedQuantity} ${itemCondition} copy/copies for borrowing record #${normalizedBorrowId}. Return ID #${returnId}.`
                ]
            );

            await connection.commit();

            return {
                returnId,
                borrowId: normalizedBorrowId,
                quantityReturned: normalizedQuantity,
                remainingQuantity: remainingQuantity - normalizedQuantity,
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
};

module.exports = ReturnTransaction;
