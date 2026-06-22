const User = require('../models/User');

// @desc    Get wishlist
// @route   GET /api/wishlist
exports.getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate(
      'wishlist',
      'name slug images price discountPrice discountPercent rating numReviews'
    );
    res.status(200).json({ success: true, wishlist: user.wishlist });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle wishlist item
// @route   POST /api/wishlist/toggle/:productId
exports.toggleWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const productId = req.params.productId;
    const index = user.wishlist.findIndex((id) => id.toString() === productId);

    let action;
    if (index === -1) {
      user.wishlist.push(productId);
      action = 'added';
    } else {
      user.wishlist.splice(index, 1);
      action = 'removed';
    }

    await user.save();
    res.status(200).json({ success: true, action, wishlist: user.wishlist });
  } catch (err) {
    next(err);
  }
};
