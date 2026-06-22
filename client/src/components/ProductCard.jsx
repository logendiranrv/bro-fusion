import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaHeart, FaRegHeart, FaStar } from 'react-icons/fa';
import { toggleWishlist } from '../store/slices/wishlistSlice';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const wishlistItems = useSelector((state) => state.wishlist.items);

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

  const imageUrl = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60';

  return (
    <div className="group relative bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700 shadow-md">
      {/* Product Image */}
      <Link to={`/product/${product.slug}`} className="block aspect-[3/4] overflow-hidden bg-zinc-950">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </Link>

      {/* Wishlist Button */}
      <button
        onClick={handleWishlistClick}
        className="absolute top-3 right-3 p-2 rounded-full bg-black/60 border border-zinc-800 text-zinc-300 hover:text-rose-500 hover:bg-black/95 transition-all duration-200 cursor-pointer z-10"
      >
        {isWishlisted ? <FaHeart className="text-rose-500" /> : <FaRegHeart />}
      </button>

      {/* Product Details */}
      <div className="p-4">
        {/* Rating */}
        <div className="flex items-center gap-1 text-xs text-amber-500 mb-1">
          <FaStar />
          <span className="text-zinc-400 text-xs">{product.rating ? product.rating.toFixed(1) : 'New'}</span>
        </div>

        <Link to={`/product/${product.slug}`}>
          <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-amber-400 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* Prices */}
        <div className="mt-2 flex items-baseline gap-2">
          {product.discountPrice > 0 ? (
            <>
              <span className="text-base font-bold text-amber-400">₹{product.discountPrice}</span>
              <span className="text-xs text-zinc-500 line-through">₹{product.price}</span>
              <span className="text-xs text-emerald-500 font-medium">-{product.discountPercent}%</span>
            </>
          ) : (
            <span className="text-base font-bold text-zinc-100">₹{product.price}</span>
          )}
        </div>
      </div>
    </div>
  );
}
