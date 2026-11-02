const PublisherModel = require('../models/publisherModel');

exports.getPublishers = async (req, res) => {
    try {
        const publishers = await PublisherModel.getAllPublishers();
        res.status(200).json({ success: true, data: publishers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getPublisherById = async (req, res) => {
    try {
        const publisher = await PublisherModel.getPublisherById(req.params.id);

        if (!publisher) {
            return res.status(404).json({
                success: false,
                message: 'Publisher not found.'
            });
        }

        res.status(200).json({ success: true, data: publisher });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createPublisher = async (req, res) => {
    try {
        const { publisher_name } = req.body;

        if (!publisher_name?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Publisher name is required.'
            });
        }

        const id = await PublisherModel.createPublisher({
            ...req.body,
            publisher_name: publisher_name.trim()
        });

        res.status(201).json({
            success: true,
            message: 'Publisher created successfully.',
            publisher_id: id
        });
    } catch (error) {
        res.status(error.code === 'ER_DUP_ENTRY' ? 409 : 500).json({
            success: false,
            message: error.code === 'ER_DUP_ENTRY'
                ? 'This publisher already exists.'
                : error.message
        });
    }
};

exports.updatePublisher = async (req, res) => {
    try {
        const { publisher_name } = req.body;

        if (!publisher_name?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Publisher name is required.'
            });
        }

        const affected = await PublisherModel.updatePublisher(
            req.params.id,
            {
                ...req.body,
                publisher_name: publisher_name.trim()
            }
        );

        if (!affected) {
            const existing = await PublisherModel.getPublisherById(req.params.id);

            if (!existing) {
                return res.status(404).json({
                    success: false,
                    message: 'Publisher not found.'
                });
            }
        }

        res.status(200).json({
            success: true,
            message: 'Publisher updated successfully.'
        });
    } catch (error) {
        res.status(error.code === 'ER_DUP_ENTRY' ? 409 : 500).json({
            success: false,
            message: error.code === 'ER_DUP_ENTRY'
                ? 'This publisher name already exists.'
                : error.message
        });
    }
};

exports.deletePublisher = async (req, res) => {
    try {
        const affected = await PublisherModel.deletePublisher(req.params.id);

        if (!affected) {
            return res.status(404).json({
                success: false,
                message: 'Publisher not found.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Publisher deleted successfully.'
        });
    } catch (error) {
        if (error.code === 'PUBLISHER_IN_USE' ||
            error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({
                success: false,
                message: 'This publisher is assigned to one or more books and cannot be deleted.'
            });
        }

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};