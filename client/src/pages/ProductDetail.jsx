import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProductBySlug, clearCurrentProduct } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import { toggleWishlist } from '../store/slices/wishlistSlice';
import { FaHeart, FaRegHeart, FaStar, FaShoppingCart, FaWhatsapp } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { generateProductWhatsAppUrl } from '../utils/whatsapp';

export default function ProductDetail() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { currentProduct: product, loading } = useSelector((state) => state.products);
  const { settings } = useSelector((state) => state.settings || { settings: {} });
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        product,
        quantity,
        size: selectedSize || product.sizes?.[0] || 'Standard',
        color: selectedColor || product.colors?.[0] || 'Default',
      })
    );
    toast.success('Added to shopping cart!');
  };

  const handleBuyNow = () => {
    dispatch(
      addToCart({
        product,
        quantity,
        size: selectedSize || product.sizes?.[0] || 'Standard',
        color: selectedColor || product.colors?.[0] || 'Default',
      })
    );
    navigate('/checkout');
  };

  const handleWhatsAppOrder = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      toast.error('Please select a size first');
      return;
    }
    const whatsappUrl = generateProductWhatsAppUrl({
      product,
      size: selectedSize || product.sizes?.[0] || 'Standard',
      color: selectedColor || product.colors?.[0] || 'Default',
      quantity,
      whatsappNumber: settings?.whatsappNumber || import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210',
      currentUrl: window.location.href,
    });
    window.open(whatsappUrl, '_blank');
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
  const discountPercent = product.discountPrice > 0 && product.price > product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left Column: Images */}
        <div className="flex flex-col gap-4">
          <div className="aspect-[3/4] overflow-hidden bg-[#F5EDE3] border border-[#E5D9CB] rounded-2xl shadow-sm">
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
                  className={`aspect-square overflow-hidden bg-[#F5EDE3] border rounded-xl cursor-pointer transition-all ${
                    selectedImage === index ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/50 scale-95' : 'border-[#E5D9CB]'
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
            <span className="text-xs uppercase font-bold tracking-widest text-[#B88E28]">{product.brand || 'Bro Fusion'}</span>
            {/* Rule 4: Product names: Dark Brown */}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2F1D15] mt-1 font-['Syne']">{product.name}</h1>

            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 text-[#D4AF37]">
                <FaStar />
                <span className="text-sm font-semibold text-[#2F1D15]">{product.rating ? product.rating.toFixed(1) : '5.0'}</span>
              </div>
              <span className="text-sm text-[#7A6451]">({product.numReviews || 0} reviews)</span>
            </div>
          </div>

          {/* Rule 5: Prices: Dark Brown */}
          <div className="flex items-baseline gap-3 border-y border-[#E5D9CB] py-4">
            {product.discountPrice > 0 ? (
              <>
                <span className="text-3xl font-extrabold text-[#2F1D15]">₹{product.discountPrice}</span>
                <span className="text-lg text-[#8C7765] line-through font-semibold">₹{product.price}</span>
                {/* Rule 6: Sale badges: Muted Gold */}
                <span className="text-xs bg-[#C6A15B] text-[#23170F] border border-[#B38E46] font-extrabold px-2.5 py-1 rounded-full shadow-sm tracking-wider">
                  -{discountPercent}% OFF
                </span>
              </>
            ) : (
              <span className="text-3xl font-extrabold text-[#2F1D15]">₹{product.price}</span>
            )}
          </div>

          <p className="text-[#554435] text-sm leading-relaxed">{product.description}</p>

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <div>
              <span className="text-sm font-semibold text-[#2F1D15] block mb-2">Select Size</span>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[44px] h-11 px-3 flex items-center justify-center rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                      selectedSize === size
                        ? 'bg-[#23170F] border-[#23170F] text-[#E8C86A] shadow'
                        : 'bg-[#FDFBF7] border-[#E5D9CB] text-[#2F1D15] hover:border-[#D4AF37]'
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
              <span className="text-sm font-semibold text-[#2F1D15] block mb-2">Select Color</span>
              <div className="flex flex-wrap gap-2">
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
                    className={`h-11 px-4 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                      selectedColor === color
                        ? 'bg-[#23170F] border-[#23170F] text-[#E8C86A] shadow'
                        : 'bg-[#FDFBF7] border-[#E5D9CB] text-[#2F1D15] hover:border-[#D4AF37]'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity and Actions */}
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-[#FDFBF7] border border-[#E5D9CB] rounded-xl shadow-sm">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-11 flex items-center justify-center text-[#2F1D15] hover:text-[#D4AF37] cursor-pointer font-bold"
                >
                  -
                </button>
                <span className="w-8 text-center font-bold text-[#2F1D15] text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-11 flex items-center justify-center text-[#2F1D15] hover:text-[#D4AF37] cursor-pointer font-bold"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 bg-[#23170F] hover:bg-[#352317] text-[#E8DDD1] border border-[#23170F] font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow cursor-pointer"
              >
                <FaShoppingCart className="text-[#E8C86A]" /> Add to Cart
              </button>

              <button
                onClick={handleWishlist}
                className="p-3.5 rounded-xl border border-[#E5D9CB] bg-[#FDFBF7] hover:border-rose-400 text-[#2F1D15] hover:text-rose-500 cursor-pointer shadow-sm"
              >
                {isWishlisted ? <FaHeart className="text-rose-500" /> : <FaRegHeart />}
              </button>
            </div>

            {/* Rule 7: Buttons: Gold with dark text */}
            <button
              onClick={handleBuyNow}
              className="gold-gradient-btn w-full py-4 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer border-0 select-none text-sm uppercase tracking-wider"
            >
              ⚡ Instant Checkout
            </button>

            <button
              onClick={handleWhatsAppOrder}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer border-0 select-none text-sm uppercase tracking-wider"
            >
              <FaWhatsapp className="text-xl" /> Order Directly on WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section in Ivory / Cream */}
      <div className="mt-16 border-t border-[#E5D9CB] pt-12">
        <h2 className="text-2xl font-bold text-[#2F1D15] mb-8 font-['Syne']">Customer Reviews</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Write a Review */}
          <div>
            <h3 className="text-lg font-semibold text-[#2F1D15] mb-4">Write a Review</h3>
            {user ? (
              <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs text-[#7A6451] block mb-1">Rating</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full bg-[#FDFBF7] border border-[#E5D9CB] rounded-xl px-4 py-2.5 text-[#2F1D15] focus:outline-none focus:border-[#D4AF37] cursor-pointer shadow-sm"
                  >
                    <option value="5">5 Stars — Excellent</option>
                    <option value="4">4 Stars — Good</option>
                    <option value="3">3 Stars — Average</option>
                    <option value="2">2 Stars — Poor</option>
                    <option value="1">1 Star — Terrible</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#7A6451] block mb-1">Comment</label>
                  <textarea
                    rows="4"
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts about this product..."
                    className="w-full bg-[#FDFBF7] border border-[#E5D9CB] rounded-xl px-4 py-2.5 text-sm text-[#2F1D15] focus:outline-none focus:border-[#D4AF37] resize-none shadow-sm"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="gold-gradient-btn py-2.5 px-5 rounded-xl text-sm cursor-pointer shadow"
                >
                  Submit Review
                </button>
              </form>
            ) : (
              <p className="text-[#7A6451] text-sm">Please login to write a review.</p>
            )}
          </div>

          {/* Review List in Ivory / Cream cards */}
          <div className="md:col-span-2 flex flex-col gap-6">
            {product.reviews?.length === 0 ? (
              <p className="text-[#7A6451]">No reviews yet. Be the first to review this product!</p>
            ) : (
              product.reviews.map((rev) => (
                <div key={rev._id} className="bg-[#FDFBF7] border border-[#E5D9CB] rounded-2xl p-6 flex flex-col gap-2 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[#2F1D15]">{rev.name}</span>
                    <span className="text-xs text-[#7A6451]">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#D4AF37] text-xs">
                    {[...Array(rev.rating)].map((_, i) => (
                      <FaStar key={i} />
                    ))}
                  </div>
                  <p className="text-sm text-[#554435] leading-relaxed">{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
