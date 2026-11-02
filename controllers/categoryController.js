const CategoryModel = require('../models/categoryModel');

exports.getCategories = async (req, res) => {
    try {
        const categories = await CategoryModel.getAllCategories();
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getCategoryById = async (req, res) => {
    try {
        const category = await CategoryModel.getCategoryById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found.'
            });
        }

        res.status(200).json({ success: true, data: category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { category_name, description } = req.body;

        if (!category_name?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required.'
            });
        }

        const id = await CategoryModel.createCategory(
            category_name.trim(),
            description
        );

        res.status(201).json({
            success: true,
            message: 'Category created successfully.',
            category_id: id
        });
    } catch (error) {
        res.status(error.code === 'ER_DUP_ENTRY' ? 409 : 500).json({
            success: false,
            message: error.code === 'ER_DUP_ENTRY'
                ? 'This category already exists.'
                : error.message
        });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { category_name, description } = req.body;

        if (!category_name?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required.'
            });
        }

        const affected = await CategoryModel.updateCategory(
            req.params.id,
            category_name.trim(),
            description
        );

        if (!affected) {
            const existing = await CategoryModel.getCategoryById(req.params.id);

            if (!existing) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found.'
                });
            }
        }

        res.status(200).json({
            success: true,
            message: 'Category updated successfully.'
        });
    } catch (error) {
        res.status(error.code === 'ER_DUP_ENTRY' ? 409 : 500).json({
            success: false,
            message: error.code === 'ER_DUP_ENTRY'
                ? 'This category name already exists.'
                : error.message
        });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const affected = await CategoryModel.deleteCategory(req.params.id);

        if (!affected) {
            return res.status(404).json({
                success: false,
                message: 'Category not found.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Category deleted successfully.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.code === 'ER_ROW_IS_REFERENCED_2'
                ? 'This category is still referenced by a book and cannot be deleted.'
                : error.message
        });
    }
};