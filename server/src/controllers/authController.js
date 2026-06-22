const crypto = require('crypto');
const User = require('../models/User');
const { sendTokenResponse } = require('../utils/generateToken');
const { sendPasswordResetEmail } = require('../utils/sendEmail');

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    const user = await User.create({ name, email, password, phone });
    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter email and password' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Admin Login
// @route   POST /api/auth/admin-login
exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, role: 'admin' }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }
    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Logout
// @route   POST /api/auth/logout
exports.logout = (req, res) => {
  res.cookie('token', '', { expires: new Date(0), httpOnly: true });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name images price discountPrice slug');
  res.status(200).json({ success: true, user });
};

// @desc    Update profile
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone },
      { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user found with that email' });
    }
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendPasswordResetEmail(user.email, resetUrl);
    res.status(200).json({ success: true, message: 'Password reset email sent' });
  } catch (err) {
    next(err);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};
