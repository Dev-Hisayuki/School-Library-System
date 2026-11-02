
const express = require('express');
const router = express.Router();

const systemSettingsController = require('../controllers/systemSettingsController');

router.get('/', systemSettingsController.getSettings);
router.post('/', systemSettingsController.createSetting);
router.put('/:id', systemSettingsController.updateSetting);
router.delete('/:id', systemSettingsController.deleteSetting);

module.exports = router;
