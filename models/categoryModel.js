const db = require('../config/db');

class CategoryModel {
  static async getAllCategories() {
    const [rows] = await db.query('SELECT * FROM categories ORDER BY category_name ASC');
    return rows;
  }

  static async createCategory(category_name, description) {
    const query = 'INSERT INTO categories (category_name, description) VALUES (?, ?)';
    const [result] = await db.query(query, [category_name, description]);
    return result.insertId;
  }
}

module.exports = CategoryModel;