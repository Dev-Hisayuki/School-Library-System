const ActivityLog = require('../models/activityLogModel');

exports.getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.getAll();
    return res.status(200).json({ success: true, data: logs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
