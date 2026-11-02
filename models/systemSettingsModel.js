const db = require('../config/db');

class SystemSettingsModel {
    static defaultSettings = [
        {
            setting_key: 'overdue_fine_per_day',
            setting_value: '5.00',
            description: 'Fine charged for each day a book is overdue.'
        },
        {
            setting_key: 'max_borrow_items',
            setting_value: '3',
            description: 'Maximum number of books a student may borrow.'
        },
        {
            setting_key: 'loan_duration_days',
            setting_value: '7',
            description: 'Default number of days allowed for borrowing.'
        },
        {
            setting_key: 'max_renewals',
            setting_value: '2',
            description: 'Maximum number of times a borrowing may be renewed.'
        },
        {
            setting_key: 'low_stock_threshold',
            setting_value: '5',
            description: 'Minimum available copies before a book is considered low in stock.'
        }
    ];

    static async ensureDefaultSettings() {
        for (const setting of this.defaultSettings) {
            await db.execute(
                `INSERT IGNORE INTO system_settings
                 (setting_key, setting_value, description)
                 VALUES (?, ?, ?)`,
                [
                    setting.setting_key,
                    setting.setting_value,
                    setting.description
                ]
            );
        }
    }

    static async getAllSettings() {
        await this.ensureDefaultSettings();

        const [rows] = await db.query(
            'SELECT * FROM system_settings ORDER BY setting_key ASC'
        );

        return rows;
    }

    static async createSetting(setting_key, setting_value, description) {
        const [result] = await db.execute(
            `INSERT INTO system_settings
             (setting_key, setting_value, description)
             VALUES (?, ?, ?)`,
            [setting_key, setting_value, description || null]
        );

        return result.insertId;
    }

    static async updateSetting(id, setting_value, description) {
        const [result] = await db.execute(
            `UPDATE system_settings
             SET setting_value = ?, description = ?
             WHERE id = ?`,
            [setting_value, description || null, id]
        );

        return result.affectedRows;
    }

    static async deleteSetting(id) {
        const [result] = await db.execute(
            'DELETE FROM system_settings WHERE id = ?',
            [id]
        );

        return result.affectedRows;
    }
}

module.exports = SystemSettingsModel;