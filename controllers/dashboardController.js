const DashboardModel = require('../models/dashboardModel');

exports.getDashboard = async (req, res) => {
    try {
        const [
            statistics,
            categories,
            activities,
            lowStockBooks
        ] = await Promise.all([
            DashboardModel.getStatistics(),
            DashboardModel.getCategoryDistribution(),
            DashboardModel.getRecentActivity(),
            DashboardModel.getLowStockBooks()
        ]);

        return res.status(200).json({
            success: true,
            data: {
                statistics,
                categories,
                activities,
                lowStockBooks
            }
        });

    } catch (error) {
        console.error('Dashboard error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to load dashboard information.'
        });
    }
};