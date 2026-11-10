
const db = require('../config/db');

class CategoryModel {
    static async getAllCategories() {
        const [rows] = await db.query(`
            SELECT
                c.category_id,
                c.category_name,
                c.description,
                c.created_at,
                COUNT(b.book_id) AS total_books
            FROM categories c
            LEFT JOIN books b
                ON b.category_id = c.category_id
            GROUP BY
                c.category_id,
                c.category_name,
                c.description,
                c.created_at
            ORDER BY c.category_name ASC
        `);

        return rows;
    }

    static async getCategoryById(id) {
        const [rows] = await db.query(
            `SELECT
                c.category_id,
                c.category_name,
                c.description,
                c.created_at,
                COUNT(b.book_id) AS total_books
             FROM categories c
             LEFT JOIN books b
                ON b.category_id = c.category_id
             WHERE c.category_id = ?
             GROUP BY
                c.category_id,
                c.category_name,
                c.description,
                c.created_at`,
            [id]
        );

        return rows[0] || null;
    }

    static async createCategory(categoryName, description) {
        const [result] = await db.query(
            'INSERT INTO categories (category_name, description) VALUES (?, ?)',
            [categoryName, description || null]
        );

        return result.insertId;
    }

    static async updateCategory(id, categoryName, description) {
        const [result] = await db.query(
            `UPDATE categories
             SET category_name = ?, description = ?
             WHERE category_id = ?`,
            [categoryName, description || null, id]
        );

        return result.affectedRows;
    }

    static async deleteCategory(id) {
        const [result] = await db.query(
            'DELETE FROM categories WHERE category_id = ?',
            [id]
        );

        return result.affectedRows;
    }
}

module.exports = CategoryModel;
