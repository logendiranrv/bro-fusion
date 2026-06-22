const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 0 },
    sizes: [{ type: String }],
    colors: [{ type: String }],
    stock: { type: Number, required: true, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    reviews: [reviewSchema],
    numReviews: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    tags: [{ type: String }],
    material: { type: String, default: '' },
    brand: { type: String, default: 'Bro Fusion' },
  },
  { timestamps: true }
);

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')          // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-');        // Replace multiple - with single -
};

// Auto-generate slug from name if not provided
productSchema.pre('validate', function () {
  if (this.name && !this.slug) {
    this.slug = slugify(this.name);
  }
});

// Update rating on save
productSchema.pre('save', function () {
  if (this.reviews && this.reviews.length > 0) {
    this.numReviews = this.reviews.length;
    this.rating =
      this.reviews.reduce((acc, r) => acc + r.rating, 0) / this.reviews.length;
  }
});

module.exports = mongoose.model('Product', productSchema);
