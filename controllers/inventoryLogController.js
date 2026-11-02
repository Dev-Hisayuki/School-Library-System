const ActivityLog = require('../models/activityLogModel');

exports.getActivityLogs = async (req, res) => {
    try {
        const logs = await ActivityLog.getAll();

        return res.status(200).json({
            success: true,
            data: logs
        });
    } catch (error) {
        console.error('Activity log error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve activity logs.'
        });
    }
};