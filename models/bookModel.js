const db = require('../config/db');

class BookModel {
  static async getAllBooks() {
    const query = `
        SELECT
            item_id,
            item_name,
            total_copies,
            available_copies
        FROM items
        ORDER BY item_name ASC
    `;
    const [rows] = await db.query(query);
    return rows;
  }

  static async getBookById(id) {
    const query = `
        SELECT
            item_id,
            item_name,
            total_copies,
            available_copies
        FROM items
        WHERE item_id = ?
    `;
    const [rows] = await db.query(query, [id]);
    return rows[0];
  }

  static async createBook(data) {
    const { item_name, isbn, category_id, publisher_id, publication_year, available_copies, total_copies } = data;
    const query = `
      INSERT INTO items (item_name, isbn, category_id, publisher_id, publication_year, available_copies, total_copies)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [
      item_name, isbn, category_id, publisher_id, publication_year, available_copies, total_copies
    ]);
    return result.insertId;
  }

  static async updateBook(id, data) {
    const { item_name, isbn, category_id, publisher_id, publication_year, available_copies, total_copies } = data;
    const query = `
      UPDATE items 
      SET item_name = ?, isbn = ?, category_id = ?, publisher_id = ?, publication_year = ?, available_copies = ?, total_copies = ?
      WHERE item_id = ?
    `;
    const [result] = await db.query(query, [
      item_name, isbn, category_id, publisher_id, publication_year, available_copies, total_copies, id
    ]);
    return result.affectedRows;
  }

  static async deleteBook(id) {
    const query = `DELETE FROM items WHERE item_id = ?`;
    const [result] = await db.query(query, [id]);
    return result.affectedRows;
  }
}

module.exports = BookModel;