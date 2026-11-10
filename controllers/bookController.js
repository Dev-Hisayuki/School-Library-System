
const BookModel = require('../models/bookModel');


exports.getBooks = async (req, res) => {
    try {
        const books = await BookModel.getAllBooks();

        res.status(200).json({
            success: true,
            data: books
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


exports.getBookById = async (req, res) => {
    try {
        const book = await BookModel.getBookById(req.params.id);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found.'
            });
        }

        res.status(200).json({
            success: true,
            data: book
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


exports.createBook = async (req, res) => {
    try {
        const {
            title,
            isbn,
            total_copies = 0,
            available_copies = total_copies
        } = req.body;

        if (
            typeof title !== 'string' ||
            !title.trim() ||
            typeof isbn !== 'string' ||
            !isbn.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: 'Title and ISBN are required.'
            });
        }

        if (
            !Number.isInteger(Number(total_copies)) ||
            !Number.isInteger(Number(available_copies)) ||
            Number(total_copies) < 0 ||
            Number(available_copies) < 0 ||
            Number(available_copies) > Number(total_copies)
        ) {
            return res.status(400).json({
                success: false,
                message: 'Copy counts must be valid non-negative integers, and available copies cannot exceed total copies.'
            });
        }

        const bookId = await BookModel.createBook({
            ...req.body,
            total_copies: Number(total_copies),
            available_copies: Number(available_copies)
        });

        res.status(201).json({
            success: true,
            message: 'Book created successfully.',
            book_id: bookId
        });
    } catch (error) {
        const duplicate = error.code === 'ER_DUP_ENTRY';

        res.status(duplicate ? 409 : 500).json({
            success: false,
            message: duplicate
                ? 'A book with this ISBN already exists.'
                : error.message
        });
    }
};


exports.updateBook = async (req, res) => {
    try {
        const {
            title,
            isbn,
            total_copies,
            available_copies
        } = req.body;

        if (
            typeof title !== 'string' ||
            !title.trim() ||
            typeof isbn !== 'string' ||
            !isbn.trim() ||
            total_copies === undefined ||
            available_copies === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: 'Title, ISBN, total copies, and available copies are required.'
            });
        }

        if (
            !Number.isInteger(Number(total_copies)) ||
            !Number.isInteger(Number(available_copies)) ||
            Number(total_copies) < 0 ||
            Number(available_copies) < 0 ||
            Number(available_copies) > Number(total_copies)
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid copy counts.'
            });
        }

        const affected = await BookModel.updateBook(req.params.id, {
            ...req.body,
            total_copies: Number(total_copies),
            available_copies: Number(available_copies)
        });

        if (!affected) {
            return res.status(404).json({
                success: false,
                message: 'Book not found or already archived.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Book updated successfully.'
        });
    } catch (error) {
        res.status(error.code === 'ER_DUP_ENTRY' ? 409 : 500).json({
            success: false,
            message: error.code === 'ER_DUP_ENTRY'
                ? 'A book with this ISBN already exists.'
                : error.message
        });
    }
};


exports.deleteBook = async (req, res) => {
    try {
        const affected = await BookModel.deleteBook(req.params.id);

        if (!affected) {
            return res.status(404).json({
                success: false,
                message: 'Book not found or already archived.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Book archived successfully.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
