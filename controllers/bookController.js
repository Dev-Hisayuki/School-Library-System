const BookModel = require('../models/bookModel');

// GET /api/books (Includes Assigned LEFT JOIN Report)
exports.getBooks = async (req, res) => {
  try {
    const books = await BookModel.getAllBooks();
    res.status(200).json({ success: true, data: books });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/books/:id
exports.getBookById = async (req, res) => {
  try {
    const book = await BookModel.getBookById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    res.status(200).json({ success: true, data: book });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/books
exports.createBook = async (req, res) => {
  try {
    const { title, isbn } = req.body;
    if (!title || !isbn) {
      return res.status(400).json({ success: false, message: 'Title and ISBN are required.' });
    }
    const bookId = await BookModel.createBook(req.body);
    res.status(201).json({ success: true, message: 'Book created successfully', book_id: bookId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/books/:id
exports.updateBook = async (req, res) => {
  try {
    const affected = await BookModel.updateBook(req.params.id, req.body);
    if (!affected) {
      return res.status(404).json({ success: false, message: 'Book not found or no changes made' });
    }
    res.status(200).json({ success: true, message: 'Book updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/books/:id
exports.deleteBook = async (req, res) => {
  try {
    const affected = await BookModel.deleteBook(req.params.id);
    if (!affected) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    res.status(200).json({ success: true, message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};