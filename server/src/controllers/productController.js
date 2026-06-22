const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');

// @desc    Get all products with filters
// @route   GET /api/products
exports.getProducts = async (req, res, next) => {
  try {
    const { category, minPrice, maxPrice, size, color, sort, search, page = 1, limit = 12 } = req.query;

    const query = {};
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (size) query.sizes = { $in: size.split(',') };
    if (color) query.colors = { $in: color.split(',') };
    if (search) query.name = { $regex: search, $options: 'i' };

    let sortObj = { createdAt: -1 };
    if (sort === 'price_asc') sortObj = { price: 1 };
    else if (sort === 'price_desc') sortObj = { price: -1 };
    else if (sort === 'rating') sortObj = { rating: -1 };
    else if (sort === 'newest') sortObj = { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      products,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single product by slug
// @route   GET /api/products/:slug
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate('category', 'name slug');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
exports.getFeatured = async (req, res, next) => {
  try {
    const products = await Product.find({ isFeatured: true }).populate('category', 'name slug').limit(8);
    res.status(200).json({ success: true, products });
  } catch (err) {
    next(err);
  }
};

// @desc    Get new arrivals
// @route   GET /api/products/new-arrivals
exports.getNewArrivals = async (req, res, next) => {
  try {
    const products = await Product.find({ isNewArrival: true }).populate('category', 'name slug').limit(8);
    res.status(200).json({ success: true, products });
  } catch (err) {
    next(err);
  }
};

// @desc    Get best sellers
// @route   GET /api/products/best-sellers
exports.getBestSellers = async (req, res, next) => {
  try {
    const products = await Product.find({ isBestSeller: true }).populate('category', 'name slug').limit(8);
    res.status(200).json({ success: true, products });
  } catch (err) {
    next(err);
  }
};

// @desc    Get related products
// @route   GET /api/products/:id/related
exports.getRelated = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    }).limit(4);
    res.status(200).json({ success: true, products: related });
  } catch (err) {
    next(err);
  }
};

// @desc    Create product (admin)
// @route   POST /api/products
exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

// @desc    Update product (admin)
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete product (admin)
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    // Delete images from Cloudinary
    for (const img of product.images) {
      if (img.publicId) await cloudinary.uploader.destroy(img.publicId);
    }
    await product.deleteOne();
    res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};

// @desc    Add review
// @route   POST /api/products/:id/reviews
exports.addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'Product already reviewed' });
    }

    product.reviews.push({ user: req.user._id, name: req.user.name, rating: Number(rating), comment });
    await product.save();
    res.status(201).json({ success: true, message: 'Review added' });
  } catch (err) {
    next(err);
  }
};
