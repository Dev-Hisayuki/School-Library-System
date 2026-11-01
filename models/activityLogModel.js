const db = require('../config/db');

const ActivityLog = {
  create: async (userId, action, description) => {
    const sql = `INSERT INTO activity_logs (user_id, action, description, created_at) VALUES (?, ?, ?, NOW())`;
    const [result] = await db.execute(sql, [userId, action, description]);
    return result;
  },

  getAll: async () => {
    const sql = `
      SELECT al.id, al.action, al.description, al.created_at, u.username 
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
    `;
    const [rows] = await db.execute(sql);
    return rows;
  }
};

module.exports = ActivityLog;
