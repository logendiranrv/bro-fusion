import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaHeart, FaRegHeart, FaStar, FaWhatsapp } from 'react-icons/fa';
import { toggleWishlist } from '../store/slices/wishlistSlice';
import toast from 'react-hot-toast';
import { generateProductWhatsAppUrl } from '../utils/whatsapp';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const { settings } = useSelector((state) => state.settings || { settings: {} });

  const isWishlisted = wishlistItems?.some((item) => item._id === product._id);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to use wishlist');
      return;
    }
    dispatch(toggleWishlist(product._id)).then(() => {
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    });
  };

  const handleWhatsAppQuickOrder = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = generateProductWhatsAppUrl({
      product,
      size: product.sizes?.[0] || 'Standard',
      color: product.colors?.[0] || 'Default',
      quantity: 1,
      whatsappNumber: settings?.whatsappNumber || import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210',
      currentUrl: window.location.origin + `/product/${product.slug}`,
    });
    window.open(url, '_blank');
  };

  const imageUrl = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60';
  const discountPercent = product.discountPrice > 0 && product.price > product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div className="group relative bg-[#10121A] border border-[#202434] hover:border-[#D4AF37]/50 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 shadow-xl hover:shadow-[0_10px_30px_-10px_rgba(212,175,55,0.15)] flex flex-col justify-between">
      {/* Product Image */}
      <Link to={`/product/${product.slug}`} className="block relative aspect-[3/4] overflow-hidden bg-[#08090D]">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
          loading="lazy"
        />

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <span className="absolute top-3 left-3 bg-[#08090D]/80 backdrop-blur-md text-amber-300 border border-amber-400/40 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-md">
            -{discountPercent}% OFF
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-[#08090D]/80 backdrop-blur-md border border-[#202434] text-zinc-300 hover:text-rose-500 hover:scale-110 flex items-center justify-center transition-all duration-200 cursor-pointer z-10"
        >
          {isWishlisted ? <FaHeart className="text-rose-500 text-sm" /> : <FaRegHeart className="text-sm" />}
        </button>
      </Link>

      {/* Product Details */}
      <div className="p-4 sm:p-5 flex flex-col gap-2 flex-grow justify-between">
        <div>
          {/* Rating & Stock status */}
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-1 text-amber-400 font-bold">
              <FaStar className="text-xs" />
              <span>{product.rating ? Number(product.rating).toFixed(1) : '5.0'}</span>
            </div>
            {product.stock > 0 ? (
              <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
                In Stock
              </span>
            ) : (
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                Sold Out
              </span>
            )}
          </div>

          <Link to={`/product/${product.slug}`}>
            <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1 leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Prices & Quick WhatsApp action */}
        <div className="pt-2 border-t border-[#202434]/80 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            {product.discountPrice > 0 ? (
              <>
                <span className="text-lg font-black text-amber-400">₹{product.discountPrice}</span>
                <span className="text-xs text-zinc-500 line-through">₹{product.price}</span>
              </>
            ) : (
              <span className="text-lg font-black text-white">₹{product.price}</span>
            )}
          </div>

          {/* Quick WhatsApp Order Button */}
          <button
            onClick={handleWhatsAppQuickOrder}
            title="Order quickly on WhatsApp"
            className="w-8 h-8 rounded-full bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/30 flex items-center justify-center transition-all duration-200 cursor-pointer"
          >
            <FaWhatsapp className="text-base" />
          </button>
        </div>
      </div>
    </div>
  );
}
