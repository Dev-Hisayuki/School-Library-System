
const borrowerModel = require('../models/borrowerModel');

// GET /api/borrowers
const getAllBorrowers = async (req, res) => {
    try {
        const borrowers = await borrowerModel.getAllBorrowers();

        res.status(200).json({
            success: true,
            data: borrowers
        });
    } catch (error) {
        console.error('Error fetching borrowers:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch borrowers'
        });
    }
};

// POST /api/borrowers
const createBorrower = async (req, res) => {
    try {
        const { student_id } = req.body;

        if (!student_id || !Number.isInteger(Number(student_id))) {
            return res.status(400).json({
                success: false,
                message: 'A valid student_id is required'
            });
        }

        const borrowerId = await borrowerModel.createBorrower(
            Number(student_id)
        );

        res.status(201).json({
            success: true,
            message: 'Borrower registered successfully',
            borrower_id: borrowerId
        });
    } catch (error) {
        console.error('Error registering borrower:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'This student is already registered as a borrower'
            });
        }

        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({
                success: false,
                message: 'The student_id does not exist'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to register borrower'
        });
    }
};

module.exports = {
    getAllBorrowers,
    createBorrower
};

