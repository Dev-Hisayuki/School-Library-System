const ReturnTransaction = require('../models/returnTransactionModel');

exports.getActiveBorrowings = async (req, res) => {
    try {
        const records = await ReturnTransaction.getActiveBorrowings();

        return res.status(200).json({
            success: true,
            data: records
        });
    } catch (error) {
        console.error('Get active borrowings error:', error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.processReturn = async (req, res) => {
    try {
        const {
            borrowId,
            processedBy,
            returnDate,
            quantityReturned,
            itemCondition,
            remarks
        } = req.body;

        if (
            !borrowId ||
            !quantityReturned ||
            !itemCondition
        ) {
            return res.status(400).json({
                success: false,
                message: 'Borrow ID, quantity returned, and item condition are required.'
            });
        }

        const result = await ReturnTransaction.processReturn({
            borrowId,
            processedBy: processedBy || null,
            returnDate: returnDate || new Date().toISOString().slice(0, 10),
            quantityReturned,
            itemCondition,
            remarks: remarks || null
        });

        return res.status(201).json({
            success: true,
            message: 'Return processed successfully.',
            data: result
        });
    } catch (error) {
        console.error('Process return error:', error);

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.getReturnLogs = async (req, res) => {
    try {
        const records = await ReturnTransaction.getAllWithDetails();

        return res.status(200).json({
            success: true,
            data: records
        });
    } catch (error) {
        console.error('Get return logs error:', error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};