const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get cart
// @route   GET /api/cart
exports.getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name images price stock');
    res.status(200).json({ success: true, cart: cart || { items: [] } });
  } catch (err) {
    next(err);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1, size, color } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingItem = cart.items.find(
      (i) => i.product.toString() === productId && i.size === size && i.color === color
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        name: product.name,
        image: product.images[0]?.url || '',
        price: product.discountPrice || product.price,
        quantity,
        size,
        color,
      });
    }

    await cart.save();
    res.status(200).json({ success: true, cart });
  } catch (err) {
    next(err);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
exports.updateCart = async (req, res, next) => {
  try {
    const { itemId, quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    item.quantity = quantity;
    await cart.save();
    res.status(200).json({ success: true, cart });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:itemId
exports.removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
    cart.items = cart.items.filter((i) => i._id.toString() !== req.params.itemId);
    await cart.save();
    res.status(200).json({ success: true, cart });
  } catch (err) {
    next(err);
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart/clear
exports.clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    res.status(200).json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    next(err);
  }
};
