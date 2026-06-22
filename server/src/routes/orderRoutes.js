const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

router.use(protect); // protect all order routes

router.post('/', placeOrder);
router.get('/my-orders', getMyOrders);
router.get('/stats', admin, getDashboardStats);
router.get('/:id', getOrder);
router.get('/', admin, getAllOrders);
router.put('/:id/status', admin, updateOrderStatus);

module.exports = router;