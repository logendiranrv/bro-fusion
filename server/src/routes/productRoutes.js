const express = require('express');
const router = express.Router();
const {
  getProducts, getProduct, getFeatured, getNewArrivals, getBestSellers, getRelated,
  createProduct, updateProduct, deleteProduct, addReview,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');

router.get('/featured', getFeatured);
router.get('/new-arrivals', getNewArrivals);
router.get('/best-sellers', getBestSellers);
router.get('/', getProducts);
router.get('/:slug', getProduct);
router.get('/:id/related', getRelated);
router.post('/:id/reviews', protect, addReview);
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
