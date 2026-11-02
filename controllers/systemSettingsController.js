const SystemSettingsModel = require('../models/systemSettingsModel');

const numericSettings = {
    overdue_fine_per_day: {
        min: 0,
        max: 10000
    },
    max_borrow_items: {
        min: 1,
        max: 100
    },
    loan_duration_days: {
        min: 1,
        max: 365
    },
    max_renewals: {
        min: 0,
        max: 20
    },
    low_stock_threshold: {
        min: 0,
        max: 10000
    }
};

function validateSettingValue(key, value) {
    if (value === undefined || value === null || String(value).trim() === '') {
        return 'Setting value is required.';
    }

    const rule = numericSettings[key];

    if (!rule) {
        return null;
    }

    const number = Number(value);

    if (
        !Number.isFinite(number) ||
        number < rule.min ||
        number > rule.max
    ) {
        return `${key} must be a number between ${rule.min} and ${rule.max}.`;
    }

    if (!Number.isInteger(number) && key !== 'overdue_fine_per_day') {
        return `${key} must be a whole number.`;
    }

    if (key === 'overdue_fine_per_day' && !/^\d+(\.\d{1,2})?$/.test(String(value))) {
        return 'The overdue fine must have no more than two decimal places.';
    }

    return null;
}

exports.getSettings = async (req, res) => {
    try {
        const settings = await SystemSettingsModel.getAllSettings();

        res.status(200).json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Get settings error:', error);

        res.status(500).json({
            success: false,
            message: 'Unable to load system settings.'
        });
    }
};

exports.createSetting = async (req, res) => {
    try {
        const { setting_key, setting_value, description } = req.body;

        if (
            typeof setting_key !== 'string' ||
            !/^[a-z][a-z0-9_]*$/.test(setting_key.trim())
        ) {
            return res.status(400).json({
                success: false,
                message: 'Enter a valid setting key using lowercase letters, numbers, and underscores.'
            });
        }

        const key = setting_key.trim();
        const validationError = validateSettingValue(key, setting_value);

        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError
            });
        }

        const id = await SystemSettingsModel.createSetting(
            key,
            String(setting_value).trim(),
            description
        );

        res.status(201).json({
            success: true,
            message: 'Setting created successfully.',
            setting_id: id
        });
    } catch (error) {
        const duplicate = error.code === 'ER_DUP_ENTRY';

        res.status(duplicate ? 409 : 500).json({
            success: false,
            message: duplicate
                ? 'This setting key already exists.'
                : 'Unable to create setting.'
        });
    }
};

exports.updateSetting = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { setting_value, description } = req.body;

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: 'A valid setting ID is required.'
            });
        }

        const [existingSettings] = await require('../config/db').execute(
            'SELECT setting_key FROM system_settings WHERE id = ?',
            [id]
        );

        if (existingSettings.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Setting not found.'
            });
        }

        const validationError = validateSettingValue(
            existingSettings[0].setting_key,
            setting_value
        );

        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError
            });
        }

        await SystemSettingsModel.updateSetting(
            id,
            String(setting_value).trim(),
            description
        );

        res.status(200).json({
            success: true,
            message: 'Setting updated successfully.'
        });
    } catch (error) {
        console.error('Update setting error:', error);

        res.status(500).json({
            success: false,
            message: 'Unable to update setting.'
        });
    }
};

exports.deleteSetting = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: 'A valid setting ID is required.'
            });
        }

        const deleted = await SystemSettingsModel.deleteSetting(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Setting not found.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Setting deleted successfully.'
        });
    } catch (error) {
        console.error('Delete setting error:', error);

        res.status(500).json({
            success: false,
            message: 'Unable to delete setting.'
        });
    }
};