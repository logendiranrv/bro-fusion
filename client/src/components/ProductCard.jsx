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
    /* Rule 3: Product cards: Ivory / Cream */
    <div className="group relative bg-[#FDFBF7] border border-[#E5D9CB] hover:border-[#D4AF37] rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 shadow-sm hover:shadow-xl flex flex-col justify-between">
      {/* Product Image */}
      <Link to={`/product/${product.slug}`} className="block relative aspect-[3/4] overflow-hidden bg-[#F5EDE3]">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
          loading="lazy"
        />

        {/* Rule 6: Sale badges: Muted Gold */}
        {discountPercent > 0 && (
          <span className="absolute top-3 left-3 bg-[#C6A15B] text-[#23170F] border border-[#B38E46] text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-sm tracking-wider">
            -{discountPercent}% OFF
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-[#FDFBF7]/90 backdrop-blur-md border border-[#E5D9CB] text-[#2F1D15] hover:text-rose-500 hover:scale-110 flex items-center justify-center transition-all duration-200 cursor-pointer z-10 shadow-sm"
        >
          {isWishlisted ? <FaHeart className="text-rose-500 text-sm" /> : <FaRegHeart className="text-sm" />}
        </button>
      </Link>

      {/* Product Details */}
      <div className="p-4 sm:p-5 flex flex-col gap-2 flex-grow justify-between">
        <div>
          {/* Rating & Stock status */}
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-1 text-[#B88E28] font-bold">
              <FaStar className="text-xs text-[#D4AF37]" />
              <span>{product.rating ? Number(product.rating).toFixed(1) : '5.0'}</span>
            </div>
            {product.stock > 0 ? (
              <span className="text-[10px] uppercase tracking-wider text-emerald-700 font-bold">
                In Stock
              </span>
            ) : (
              <span className="text-[10px] uppercase tracking-wider text-[#7A6451] font-bold">
                Sold Out
              </span>
            )}
          </div>

          {/* Rule 4: Product names: Dark Brown */}
          <Link to={`/product/${product.slug}`}>
            <h3 className="text-sm sm:text-base font-bold text-[#2F1D15] group-hover:text-[#B88E28] transition-colors line-clamp-1 leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Prices & Quick Action */}
        <div className="pt-2 border-t border-[#E5D9CB] flex items-center justify-between gap-2">
          {/* Rule 5: Prices: Dark Brown */}
          <div className="flex items-baseline gap-2">
            {product.discountPrice > 0 ? (
              <>
                <span className="text-lg font-black text-[#2F1D15]">₹{product.discountPrice}</span>
                <span className="text-xs text-[#8C7765] line-through font-semibold">₹{product.price}</span>
              </>
            ) : (
              <span className="text-lg font-black text-[#2F1D15]">₹{product.price}</span>
            )}
          </div>

          {/* Rule 7: Buttons: Gold with dark text */}
          <button
            onClick={handleWhatsAppQuickOrder}
            title="Order quickly on WhatsApp"
            className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E8C86A] to-[#D4AF37] hover:from-[#F0D584] hover:to-[#DEBC48] text-[#23170F] font-bold flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md"
          >
            <FaWhatsapp className="text-lg text-[#23170F]" />
          </button>
        </div>
      </div>
    </div>
  );
}
