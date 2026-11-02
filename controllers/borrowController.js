const borrowTransactionModel = require('../models/borrowTransactionModel');

// POST /api/borrows
const createBorrow = async (req, res) => {
    console.log('ISSUE BOOK REQUEST:', req.body);

    try {
        const { student_id, book_id } = req.body;

        if (
            !Number.isInteger(Number(student_id)) ||
            Number(student_id) <= 0 ||
            !Number.isInteger(Number(book_id)) ||
            Number(book_id) <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: 'Valid student_id and book_id are required.'
            });
        }

        const result =
            await borrowTransactionModel.createBorrowTransaction(
                Number(student_id),
                Number(book_id)
            );

        return res.status(201).json({
            success: true,
            message: 'Book issued successfully.',
            borrow_id: result.borrow_id,
            due_date: result.due_date
        });

    } catch (error) {
        console.error('Error issuing book:', error);

        const knownErrors = [
            'Student not found',
            'Student is not registered as a borrower',
            'Book not found',
            'No available copies of this book',
            'Borrowing blocked. Please return your overdue book first.',
            'Borrowing blocked. Please settle your outstanding fines first.',
            'Invalid library borrowing settings'
        ];

        if (
            knownErrors.includes(error.message) ||
            error.message.startsWith('Borrowing limit reached.')
        ) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Failed to issue book.'
        });
    }
};

// GET /api/borrows
const getAllActiveBorrows = async (req, res) => {
    try {
        const borrows =
            await borrowTransactionModel.getActiveBorrows();

        return res.status(200).json({
            success: true,
            data: borrows
        });

    } catch (error) {
        console.error('Error fetching active borrows:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve active borrowing records.'
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
                message: 'A valid borrow ID is required.'
            });
        }

        const borrowDetails =
            await borrowTransactionModel.getBorrowDetails(borrowId);

        if (!borrowDetails) {
            return res.status(404).json({
                success: false,
                message: 'Borrowing record not found.'
            });
        }

        return res.status(200).json({
            success: true,
            data: borrowDetails
        });

    } catch (error) {
        console.error('Error fetching borrow details:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch borrow details.'
        });
    }
};

module.exports = {
    createBorrow,
    getAllActiveBorrows,
    getBorrowDetails
};