const express = require('express');
const router = express.Router();
const { getSettings, updateSetting } = require('../controllers/settingsController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getSettings);
router.post('/', protect, admin, updateSetting);

module.exports = router;
