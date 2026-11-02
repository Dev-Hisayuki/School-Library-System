
const db = require('../config/db');

const Admin = {
    findByUsername: async (username) => {
        const sql = `
            SELECT id, full_name, username, email, password_hash, is_active
            FROM admins
            WHERE username = ?
            LIMIT 1
        `;

        const [rows] = await db.execute(sql, [username]);
        return rows[0] || null;
    }
};

module.exports = Admin;
