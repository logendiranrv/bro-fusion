import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchFeaturedProducts, fetchNewArrivals, fetchCategories } from '../store/slices/productSlice';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const dispatch = useDispatch();
  const { featured, newArrivals, categories, loading } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchFeaturedProducts());
    dispatch(fetchNewArrivals());
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <div className="pb-16">
      {/* Hero Section */}
      <div className="relative bg-zinc-950 border-b border-zinc-800 py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-4 bg-amber-500/10 px-3 py-1 rounded-full">
            New Drop Available
          </span>
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white mb-6">
            ELEVATED <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-purple-500 animate-gradient-flow typing inline-block">STREETWEAR</span>
          </h1>
          <p className="max-w-xl text-lg text-zinc-400 mb-8">
            Engineered comfort. Striking silhouettes. Discover the latest collections from Bro Fusion.
          </p>
          <Link
            to="/products"
            className="bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white font-semibold py-3.5 px-8 rounded-full shadow-lg transition-all"
          >
            Shop Collection
          </Link>
        </div>
      </div>

      {/* Categories */}
      {categories?.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <h2 className="text-2xl font-bold tracking-tight text-white mb-8">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/products?category=${cat._id}`}
                className="group relative bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden h-24 flex items-center justify-center hover:border-zinc-700 transition-all cursor-pointer"
              >
                <span className="font-semibold text-lg text-zinc-200 group-hover:text-amber-400 transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Featured Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Featured Drops</h2>
            <p className="text-sm text-zinc-400 mt-1">Handpicked style selections.</p>
          </div>
          <Link to="/products" className="text-sm text-amber-500 hover:underline">View All</Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="animate-pulse bg-zinc-900 aspect-[3/4] rounded-lg border border-zinc-800"></div>
            ))}
          </div>
        ) : featured?.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            No featured products found. Create some in the Admin Portal!
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featured?.slice(0, 4).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* New Arrivals Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">New Arrivals</h2>
            <p className="text-sm text-zinc-400 mt-1">Fresh off the line.</p>
          </div>
          <Link to="/products" className="text-sm text-amber-500 hover:underline">View All</Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="animate-pulse bg-zinc-900 aspect-[3/4] rounded-lg border border-zinc-800"></div>
            ))}
          </div>
        ) : newArrivals?.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            No new arrivals found.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {newArrivals?.slice(0, 4).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
