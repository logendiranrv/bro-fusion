const Category = require('../models/Category');

// @desc    Get all categories
// @route   GET /api/categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort('sortOrder');
    res.status(200).json({ success: true, categories });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all categories (admin - including inactive)
// @route   GET /api/categories/all
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort('sortOrder');
    res.status(200).json({ success: true, categories });
  } catch (err) {
    next(err);
  }
};

// @desc    Create category (admin)
// @route   POST /api/categories
exports.createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, category });
  } catch (err) {
    next(err);
  }
};

// @desc    Update category (admin)
// @route   PUT /api/categories/:id
exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.status(200).json({ success: true, category });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete category (admin)
// @route   DELETE /api/categories/:id
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.status(200).json({ success: true, message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
};
