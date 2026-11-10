
const db = require('../config/db');

class BookModel {


    static async getAllBooks() {
        const sql = `
            SELECT
                b.book_id,
                b.title,
                b.isbn,
                b.category_id,
                b.publisher_id,
                b.publication_year,
                b.total_copies,
                b.available_copies,
                c.category_name,
                p.publisher_name
            FROM books b
            LEFT JOIN categories c
                ON b.category_id = c.category_id
            LEFT JOIN publishers p
                ON b.publisher_id = p.publisher_id
            WHERE b.is_archived = 0
            ORDER BY b.title ASC
        `;

        const [rows] = await db.query(sql);
        return rows;
    }


    static async getBookById(id) {
        const sql = `
            SELECT
                b.book_id,
                b.title,
                b.isbn,
                b.category_id,
                b.publisher_id,
                b.publication_year,
                b.total_copies,
                b.available_copies,
                c.category_name,
                p.publisher_name
            FROM books b
            LEFT JOIN categories c
                ON b.category_id = c.category_id
            LEFT JOIN publishers p
                ON b.publisher_id = p.publisher_id
            WHERE b.book_id = ?
              AND b.is_archived = 0
        `;

        const [rows] = await db.query(sql, [id]);
        return rows[0] || null;
    }


    static async createBook(data) {
        const {
            title,
            isbn,
            category_id,
            publisher_id,
            publication_year,
            total_copies = 0,
            available_copies = total_copies
        } = data;

        const sql = `
            INSERT INTO books (
                title,
                isbn,
                category_id,
                publisher_id,
                publication_year,
                total_copies,
                available_copies,
                is_archived
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, 0)
        `;

        const [result] = await db.query(sql, [
            title,
            isbn,
            category_id || null,
            publisher_id || null,
            publication_year || null,
            total_copies,
            available_copies
        ]);

        return result.insertId;
    }


    static async updateBook(id, data) {
        const {
            title,
            isbn,
            category_id,
            publisher_id,
            publication_year,
            total_copies,
            available_copies
        } = data;

        const sql = `
            UPDATE books
            SET
                title = ?,
                isbn = ?,
                category_id = ?,
                publisher_id = ?,
                publication_year = ?,
                total_copies = ?,
                available_copies = ?
            WHERE book_id = ?
              AND is_archived = 0
        `;

        const [result] = await db.query(sql, [
            title,
            isbn,
            category_id || null,
            publisher_id || null,
            publication_year || null,
            total_copies,
            available_copies,
            id
        ]);

        return result.affectedRows;
    }


    static async deleteBook(id) {
        const sql = `
            UPDATE books
            SET is_archived = 1
            WHERE book_id = ?
              AND is_archived = 0
        `;

        const [result] = await db.query(sql, [id]);
        return result.affectedRows;
    }
}

module.exports = BookModel;
