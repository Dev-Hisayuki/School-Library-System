
const borrowTransactionModel = require('../models/borrowTransactionModel');

// POST /api/borrows
const createBorrow = async (req, res) => {
    try {
        const { student_id, book_id, due_date } = req.body;

        if (
            !Number.isInteger(Number(student_id)) ||
            Number(student_id) <= 0 ||
            !Number.isInteger(Number(book_id)) ||
            Number(book_id) <= 0 ||
            !due_date
        ) {
            return res.status(400).json({
                success: false,
                message: 'Valid student_id, book_id, and due_date are required'
            });
        }

        // Validate the due date format and calendar date
        if (
            !/^\d{4}-\d{2}-\d{2}$/.test(due_date) ||
            new Date(`${due_date}T00:00:00.000Z`).toISOString().slice(0, 10) !== due_date
        ) {
            return res.status(400).json({
                success: false,
                message: 'due_date must be a valid date in YYYY-MM-DD format'
            });
        }

        const borrowId =
            await borrowTransactionModel.createBorrowTransaction(
                Number(student_id),
                Number(book_id),
                due_date
            );

        res.status(201).json({
            success: true,
            message: 'Book issued successfully',
            borrow_id: borrowId
        });

    } catch (error) {
        console.error('Error issuing book:', error);

        const knownErrors = [
            'Student is not registered as a borrower',
            'Book not found',
            'No available copies of this book'
        ];

        if (knownErrors.includes(error.message)) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to issue book'
        });
    }
};

// GET /api/borrows/:id
const getBorrowDetails = async (req, res) => {
    try {
        const borrowId = Number(req.params.id);

        if (!Number.isInteger(borrowId) || borrowId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'A valid borrow ID is required'
            });
        }

        const borrowDetails =
            await borrowTransactionModel.getBorrowDetails(borrowId);

        if (!borrowDetails) {
            return res.status(404).json({
                success: false,
                message: 'Borrowing record not found'
            });
        }

        res.status(200).json({
            success: true,
            data: borrowDetails
        });
    } catch (error) {
        console.error('Error fetching borrow details:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch borrow details'
        });
    }
};

module.exports = {
    createBorrow,
    getBorrowDetails
};

