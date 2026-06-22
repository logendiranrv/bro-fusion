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
        <h2 className="text-2xl font-bold text-white mb-4">Please log in to view your wishlist</h2>
        <Link to="/login" className="bg-amber-500 hover:bg-amber-600 text-black font-bold py-2.5 px-6 rounded-full inline-block">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-white mb-8">My Wishlist</h1>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="animate-pulse bg-zinc-900 aspect-[3/4] rounded-lg border border-zinc-800 animate-duration-1000"></div>
          ))}
        </div>
      ) : wishlistItems?.length === 0 ? (
        <div className="text-center py-24 bg-zinc-900/30 border border-zinc-800 rounded-lg">
          <p className="text-zinc-500 mb-6">Your wishlist is empty.</p>
          <Link to="/products" className="bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white font-semibold py-2.5 px-6 rounded-full inline-block">
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
