const Settings = require('../models/Settings');

// @desc    Get all settings
// @route   GET /api/settings
// @access  Public
exports.getSettings = async (req, res, next) => {
  try {
    const settings = await Settings.find();
    // Format into a single key-value object
    const settingsObj = {};
    settings.forEach((s) => {
      settingsObj[s.key] = s.value;
    });
    res.status(200).json({ success: true, settings: settingsObj });
  } catch (err) {
    next(err);
  }
};

// @desc    Update/Create a setting
// @route   POST /api/settings
// @access  Private/Admin
exports.updateSetting = async (req, res, next) => {
  try {
    const { key, value } = req.body;
    if (!key) {
      return res.status(400).json({ success: false, message: 'Setting key is required' });
    }

    const setting = await Settings.findOneAndUpdate(
      { key },
      { value },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, setting });
  } catch (err) {
    next(err);
  }
};
