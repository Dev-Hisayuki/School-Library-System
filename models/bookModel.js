const db = require('../config/db');

class BookModel {
  // Get all books with category and publisher details (LEFT JOIN Report)
  static async getAllBooks() {
    const query = `
      SELECT 
        b.book_id,
        b.title,
        b.isbn,
        b.publication_year,
        b.available_copies,
        c.category_name,
        p.publisher_name
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.category_id
      LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
      ORDER BY b.title ASC
    `;
    const [rows] = await db.query(query);
    return rows;
  }

  // Get single book by ID
  static async getBookById(id) {
    const query = `
      SELECT b.*, c.category_name, p.publisher_name 
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.category_id
      LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
      WHERE b.book_id = ?
    `;
    const [rows] = await db.query(query, [id]);
    return rows[0];
  }

  // Create new book entry
  static async createBook(data) {
    const { title, isbn, category_id, publisher_id, publication_year, available_copies } = data;
    const query = `
      INSERT INTO books (title, isbn, category_id, publisher_id, publication_year, available_copies)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [
      title, isbn, category_id, publisher_id, publication_year, available_copies
    ]);
    return result.insertId;
  }

  // Update existing book
  static async updateBook(id, data) {
    const { title, isbn, category_id, publisher_id, publication_year, available_copies } = data;
    const query = `
      UPDATE books 
      SET title = ?, isbn = ?, category_id = ?, publisher_id = ?, publication_year = ?, available_copies = ?
      WHERE book_id = ?
    `;
    const [result] = await db.query(query, [
      title, isbn, category_id, publisher_id, publication_year, available_copies, id
    ]);
    return result.affectedRows;
  }

  // Delete book
  static async deleteBook(id) {
    const query = `DELETE FROM books WHERE book_id = ?`;
    const [result] = await db.query(query, [id]);
    return result.affectedRows;
  }
}

module.exports = BookModel;