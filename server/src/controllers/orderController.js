const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { sendOrderConfirmation, sendAdminOrderNotification } = require('../utils/sendEmail');

// @desc    Place order
// @route   POST /api/orders
exports.placeOrder = async (req, res, next) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, itemsPrice, shippingPrice, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items' });
    }

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'Cash on Delivery',
      itemsPrice,
      shippingPrice,
      totalPrice,
      statusHistory: [{ status: 'pending', note: 'Order placed' }],
    });

    // Clear cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    // Send emails (non-blocking)
    try {
      await sendOrderConfirmation(order, req.user.email);
      await sendAdminOrderNotification(order, req.user.name);
    } catch (emailErr) {
      console.error('Email error:', emailErr.message);
    }

    res.status(201).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user orders
// @route   GET /api/orders/my-orders
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Check ownership or admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.status(200).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders
exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.status(200).json({ success: true, total, orders });
  } catch (err) {
    next(err);
  }
};

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note, trackingId, courierService } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.status = status;
    order.statusHistory.push({ status, note: note || '' });
    
    if (trackingId !== undefined) order.trackingId = trackingId;
    if (courierService !== undefined) order.courierService = courierService;

    if (status === 'delivered') order.deliveredAt = Date.now();
    if (status === 'cancelled') {
      order.cancelledAt = Date.now();
      if (req.body.cancelReason) order.cancelReason = req.body.cancelReason;
    }

    await order.save();
    res.status(200).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin dashboard stats
// @route   GET /api/orders/stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

    const revenueData = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);
    const totalRevenue = revenueData[0]?.total || 0;

    // Monthly revenue (last 6 months)
    const monthlyRevenue = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 },
    ]);

    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue,
        monthlyRevenue,
        recentOrders,
      },
    });
  } catch (err) {
    next(err);
  }
};
