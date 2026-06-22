import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProductBySlug, clearCurrentProduct } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import { toggleWishlist } from '../store/slices/wishlistSlice';
import { FaHeart, FaRegHeart, FaStar, FaShoppingCart } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function ProductDetail() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { currentProduct: product, loading } = useSelector((state) => state.products);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Review states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const isWishlisted = wishlistItems?.some((item) => item._id === product?._id);

  useEffect(() => {
    dispatch(fetchProductBySlug(slug));
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [slug, dispatch]);

  useEffect(() => {
    if (product) {
      if (product.sizes?.length > 0) setSelectedSize(product.sizes[0]);
      if (product.colors?.length > 0) {
        const defaultColor = product.colors[0];
        setSelectedColor(defaultColor);
        const lowerColor = defaultColor.toLowerCase();
        const imgIndex = product.images?.findIndex((img) => 
          img.url.toLowerCase().includes(lowerColor)
        );
        if (imgIndex !== undefined && imgIndex !== -1) {
          setSelectedImage(imgIndex);
        } else {
          setSelectedImage(0);
        }
      }
    }
  }, [product]);

  if (loading || !product) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!user) {
      toast.error('Please login to add to cart');
      navigate('/login');
      return;
    }
    dispatch(
      addToCart({
        productId: product._id,
        quantity,
        size: selectedSize,
        color: selectedColor,
      })
    ).then((res) => {
      if (res.meta.requestStatus === 'fulfilled') {
        toast.success('Added to shopping cart!');
      } else {
        toast.error(res.payload || 'Failed to add item');
      }
    });
  };

  const handleBuyNow = () => {
    if (!user) {
      toast.error('Please login to checkout');
      navigate('/login');
      return;
    }
    dispatch(
      addToCart({
        productId: product._id,
        quantity,
        size: selectedSize,
        color: selectedColor,
      })
    ).then((res) => {
      if (res.meta.requestStatus === 'fulfilled') {
        navigate('/checkout');
      } else {
        toast.error(res.payload || 'Failed to process checkout');
      }
    });
  };

  const handleWishlist = () => {
    if (!user) {
      toast.error('Please login to use wishlist');
      return;
    }
    dispatch(toggleWishlist(product._id)).then(() => {
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to write a review');
      return;
    }
    try {
      const response = await api.post(`/products/${product._id}/reviews`, { rating, comment });
      if (response.data.success) {
        toast.success('Review added successfully');
        dispatch(fetchProductBySlug(slug));
        setComment('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add review');
    }
  };

  const currentImageUrl = product.images?.[selectedImage]?.url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left Column: Images */}
        <div className="flex flex-col gap-4">
          <div className="aspect-[3/4] overflow-hidden bg-zinc-950 border border-zinc-800 rounded-lg">
            <img src={currentImageUrl} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {product.images?.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedImage(index);
                    if (product.colors) {
                      const lowerUrl = img.url.toLowerCase();
                      const matchedColor = product.colors.find((color) => 
                        lowerUrl.includes(color.toLowerCase())
                      );
                      if (matchedColor) {
                        setSelectedColor(matchedColor);
                      } else if (index < product.colors.length) {
                        setSelectedColor(product.colors[index]);
                      }
                    }
                  }}
                  className={`aspect-square overflow-hidden bg-zinc-950 border rounded-lg cursor-pointer transition-all ${
                    selectedImage === index ? 'border-amber-500 scale-95' : 'border-zinc-800'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Info */}
        <div className="flex flex-col gap-6">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-zinc-500">{product.brand}</span>
            <h1 className="text-3xl font-extrabold text-white mt-1">{product.name}</h1>

            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 text-amber-500">
                <FaStar />
                <span className="text-sm font-semibold">{product.rating ? product.rating.toFixed(1) : 'New'}</span>
              </div>
              <span className="text-sm text-zinc-500">({product.numReviews} reviews)</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 border-y border-zinc-800 py-4">
            {product.discountPrice > 0 ? (
              <>
                <span className="text-3xl font-extrabold text-amber-400">₹{product.discountPrice}</span>
                <span className="text-lg text-zinc-500 line-through">₹{product.price}</span>
                <span className="text-xs bg-emerald-500/10 text-emerald-500 font-bold px-2 py-1 rounded">
                  -{product.discountPercent}% OFF
                </span>
              </>
            ) : (
              <span className="text-3xl font-extrabold text-white">₹{product.price}</span>
            )}
          </div>

          <p className="text-zinc-400 text-sm leading-relaxed">{product.description}</p>

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <div>
              <span className="text-sm font-semibold text-zinc-300 block mb-2">Select Size</span>
              <div className="flex gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[40px] h-10 px-2 flex items-center justify-center rounded border text-sm font-medium transition-all cursor-pointer ${
                      selectedSize === size
                        ? 'bg-amber-500 border-amber-500 text-black font-bold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colors */}
          {product.colors?.length > 0 && (
            <div>
              <span className="text-sm font-semibold text-zinc-300 block mb-2">Select Color</span>
              <div className="flex gap-2">
                {product.colors.map((color, index) => (
                  <button
                    key={color}
                    onClick={() => {
                      setSelectedColor(color);
                      if (product.images) {
                        const lowerColor = color.toLowerCase();
                        const imgIndex = product.images.findIndex((img) => 
                          img.url.toLowerCase().includes(lowerColor)
                        );
                        if (imgIndex !== -1) {
                          setSelectedImage(imgIndex);
                        } else if (index < product.images.length) {
                          setSelectedImage(index);
                        }
                      }
                    }}
                    className={`h-10 px-4 rounded border text-sm font-medium transition-all cursor-pointer ${
                      selectedColor === color
                        ? 'bg-amber-500 border-amber-500 text-black font-bold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity and Actions */}
          <div className="flex flex-col gap-4 mt-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
                >
                  -
                </button>
                <span className="w-8 text-center font-bold text-white text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <FaShoppingCart /> Add to Cart
              </button>

              <button
                onClick={handleWishlist}
                className="p-3 rounded-lg border border-zinc-800 bg-zinc-900 hover:border-zinc-700 hover:bg-zinc-850 text-zinc-300 hover:text-rose-500 cursor-pointer"
              >
                {isWishlisted ? <FaHeart className="text-rose-500" /> : <FaRegHeart />}
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-3.5 px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer border-0 select-none text-base"
            >
              ⚡ Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16 border-t border-zinc-800 pt-12">
        <h2 className="text-2xl font-bold text-white mb-8">Customer Reviews</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Write a Review */}
          <div>
            <h3 className="text-lg font-semibold text-zinc-200 mb-4">Write a Review</h3>
            {user ? (
              <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Rating</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-200 focus:outline-none focus:border-zinc-700 cursor-pointer"
                  >
                    <option value="5">5 Stars — Excellent</option>
                    <option value="4">4 Stars — Good</option>
                    <option value="3">3 Stars — Average</option>
                    <option value="2">2 Stars — Poor</option>
                    <option value="1">1 Star — Terrible</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Comment</label>
                  <textarea
                    rows="4"
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts about this product..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700 resize-none"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-black font-bold py-2 rounded-lg text-sm transition-colors cursor-pointer"
                >
                  Submit Review
                </button>
              </form>
            ) : (
              <p className="text-zinc-500 text-sm">Please login to write a review.</p>
            )}
          </div>

          {/* Review List */}
          <div className="md:col-span-2 flex flex-col gap-6">
            {product.reviews?.length === 0 ? (
              <p className="text-zinc-500">No reviews yet. Be the first to review this product!</p>
            ) : (
              product.reviews.map((rev) => (
                <div key={rev._id} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-zinc-200">{rev.name}</span>
                    <span className="text-xs text-zinc-500">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 text-xs">
                    {[...Array(rev.rating)].map((_, i) => (
                      <FaStar key={i} />
                    ))}
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
