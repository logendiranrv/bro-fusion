import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchWishlist } from '../store/slices/wishlistSlice';
import ProductCard from '../components/ProductCard';

export default function Wishlist() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items: wishlistItems, loading } = useSelector((state) => state.wishlist);

  useEffect(() => {
    if (user) {
      dispatch(fetchWishlist());
    }
  }, [user, dispatch]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-24 px-4 text-center">
        <h2 className="text-2xl font-bold text-[#2F1D15] mb-4 font-['Syne']">Please log in to view your wishlist</h2>
        <Link to="/login" className="gold-gradient-btn py-2.5 px-6 rounded-full inline-block text-xs uppercase tracking-wider shadow">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-[#2F1D15] mb-8 font-['Syne']">My Wishlist</h1>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="animate-pulse bg-[#FDFBF7] aspect-[3/4] rounded-2xl border border-[#E5D9CB]"></div>
          ))}
        </div>
      ) : wishlistItems?.length === 0 ? (
        <div className="text-center py-24 bg-[#FDFBF7] border border-[#E5D9CB] rounded-2xl shadow-sm">
          <p className="text-[#7A6451] mb-6 font-medium">Your wishlist is empty.</p>
          <Link to="/products" className="gold-gradient-btn py-3 px-8 rounded-full inline-block uppercase tracking-wider text-xs shadow-md">
            Explore Collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {wishlistItems.map((product) => {
            if (!product) return null;
            return <ProductCard key={product._id} product={product} />;
          })}
        </div>
      )}
    </div>
  );
}
