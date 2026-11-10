const db = require('../config/db');

const ActivityLog = {
    create: async (adminId, action, description) => {
        const sql = `
            INSERT INTO activity_logs
                (admin_id, action, description)
            VALUES (?, ?, ?)
        `;

        const [result] = await db.execute(sql, [
            adminId || null,
            action,
            description
        ]);

        return result;
    },

    getAll: async () => {
        const sql = `
            SELECT
                al.id,
                al.admin_id,
                a.full_name AS admin_name,
                a.username,
                al.action,
                al.description,
                al.created_at
            FROM activity_logs AS al
            LEFT JOIN admins AS a
                ON al.admin_id = a.id
            ORDER BY al.created_at DESC, al.id DESC
        `;

        const [rows] = await db.execute(sql);
        return rows;
    }
};

module.exports = ActivityLog;