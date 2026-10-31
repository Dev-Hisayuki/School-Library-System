const ReturnTransaction = require('../models/returnTransactionModel');
const ReturnDetail = require('../models/returnDetailModel');
const ActivityLog = require('../models/activityLogModel');

exports.processReturn = async (req, res) => {
  try {
    const { borrowId, processedBy, returnDate, items } = req.body;
    if (!borrowId || !processedBy || !items) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const returnId = await ReturnTransaction.create(borrowId, processedBy, returnDate);

    for (let item of items) {
      await ReturnDetail.create(returnId, item.itemId, item.quantityReturned, item.itemCondition);
    }

    await ActivityLog.create(processedBy, 'RETURN_ITEM', `Processed return ID #${returnId}`);

    return res.status(201).json({
      success: true,
      message: 'Return transaction processed successfully',
      data: { returnId }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getReturnLogs = async (req, res) => {
  try {
    const records = await ReturnTransaction.getAllWithDetails();
    return res.status(200).json({ success: true, data: records });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
