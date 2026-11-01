const CategoryModel = require('../models/categoryModel');

exports.getCategories = async (req, res) => {
  try {
    const categories = await CategoryModel.getAllCategories();
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { category_name, description } = req.body;
    if (!category_name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }
    const id = await CategoryModel.createCategory(category_name, description);
    res.status(201).json({ success: true, message: 'Category created', category_id: id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};