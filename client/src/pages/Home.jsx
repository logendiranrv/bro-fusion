import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchFeaturedProducts, fetchNewArrivals, fetchCategories } from '../store/slices/productSlice';
import ProductCard from '../components/ProductCard';
import { FaWhatsapp, FaShippingFast, FaCheckCircle, FaShieldAlt, FaArrowRight } from 'react-icons/fa';
import { generateWhatsAppChatUrl } from '../utils/whatsapp';

export default function Home() {
  const dispatch = useDispatch();
  const { featured, newArrivals, categories, loading } = useSelector((state) => state.products);
  const { settings } = useSelector((state) => state.settings || { settings: {} });

  const whatsappNumber = settings?.whatsappNumber || import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210';
  const chatUrl = generateWhatsAppChatUrl(whatsappNumber, 'Hi Bro Fusion! I want to check out your latest collection.');

  useEffect(() => {
    dispatch(fetchFeaturedProducts());
    dispatch(fetchNewArrivals());
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <div className="pb-24">
      {/* Luxury Hero Section */}
      <div className="relative bg-[#08090D] border-b border-[#202434] py-24 sm:py-36 overflow-hidden">
        {/* Subtle Atmospheric Gold & Amethyst Radial Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#202434_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-amber-300 mb-6 bg-amber-500/10 border border-amber-400/30 px-4 py-1.5 rounded-full shadow-lg">
            <span>✨ NEW DROP • VOL. 2024-25</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 font-['Syne'] max-w-4xl leading-[1.1]">
            ELEVATED <span className="gold-gradient-text drop-shadow-md">STREETWEAR</span> & LUXURY BASICS
          </h1>

          <p className="max-w-2xl text-base sm:text-lg text-zinc-400 mb-10 leading-relaxed font-normal">
            Engineered comfort meets unapologetic street aesthetics. Heavyweight 240+ GSM combed fabrics, drop-shoulder silhouettes, and direct WhatsApp ordering.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              to="/products"
              className="gold-gradient-btn w-full sm:w-auto px-9 py-4 rounded-full text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              Explore Drops <FaArrowRight className="text-xs" />
            </Link>

            <a
              href={chatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-[#10121A] hover:bg-[#161924] text-emerald-400 border border-emerald-500/40 hover:border-emerald-500 px-7 py-4 rounded-full text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
            >
              <FaWhatsapp className="text-lg text-emerald-400" /> Order via WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Luxury Trust Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#10121A]/90 backdrop-blur-md border border-[#202434] rounded-2xl p-5 flex items-center gap-4 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-400/20 text-amber-400 flex items-center justify-center text-xl flex-shrink-0">
              <FaShippingFast />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Free Express Delivery</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Complimentary shipping across India</p>
            </div>
          </div>

          <div className="bg-[#10121A]/90 backdrop-blur-md border border-[#202434] rounded-2xl p-5 flex items-center gap-4 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl flex-shrink-0">
              <FaWhatsapp />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Direct WhatsApp Orders</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Instant confirmation & GPay/COD support</p>
            </div>
          </div>

          <div className="bg-[#10121A]/90 backdrop-blur-md border border-[#202434] rounded-2xl p-5 flex items-center gap-4 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-xl flex-shrink-0">
              <FaShieldAlt />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">240 GSM Luxury Cotton</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Pre-shrunk French Terry & bio-washed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      {categories?.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <div className="flex justify-between items-end mb-8 border-b border-[#202434] pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Curated Lines</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-['Syne']">Shop by Category</h2>
            </div>
            <Link to="/products" className="text-xs font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 flex items-center gap-1">
              All Collections <FaArrowRight className="text-[10px]" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/products?category=${cat._id}`}
                className="group relative bg-[#10121A] border border-[#202434] hover:border-[#D4AF37]/50 rounded-2xl p-6 h-28 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-[0_10px_30px_-10px_rgba(212,175,55,0.15)] cursor-pointer overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/5 to-transparent rounded-full -mr-8 -mt-8 pointer-events-none group-hover:scale-150 transition-transform"></div>
                <span className="font-extrabold text-base sm:text-lg text-white group-hover:text-amber-300 transition-colors">
                  {cat.name}
                </span>
                <span className="text-[11px] uppercase tracking-wider text-zinc-500 group-hover:text-zinc-300 transition-colors flex items-center gap-1">
                  Explore drop <FaArrowRight className="text-[9px]" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Featured Drops */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="flex justify-between items-end mb-8 border-b border-[#202434] pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Handpicked Essentials</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-['Syne']">Featured Drops</h2>
          </div>
          <Link to="/products" className="text-xs font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 flex items-center gap-1">
            View All <FaArrowRight className="text-[10px]" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="animate-pulse bg-[#10121A] aspect-[3/4] rounded-2xl border border-[#202434]"></div>
            ))}
          </div>
        ) : featured?.length === 0 ? (
          <div className="text-center py-16 text-zinc-500 bg-[#10121A] border border-[#202434] rounded-2xl">
            <p className="text-sm">No featured products yet. Add your first drops in the Admin Panel!</p>
            <Link to="/admin" className="mt-4 inline-block text-xs font-bold text-amber-400 underline">
              Go to Admin Dashboard
            </Link>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="flex justify-between items-end mb-8 border-b border-[#202434] pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Fresh Silhouettes</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-['Syne']">New Arrivals</h2>
          </div>
          <Link to="/products" className="text-xs font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 flex items-center gap-1">
            View All <FaArrowRight className="text-[10px]" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="animate-pulse bg-[#10121A] aspect-[3/4] rounded-2xl border border-[#202434]"></div>
            ))}
          </div>
        ) : newArrivals?.length === 0 ? (
          <div className="text-center py-16 text-zinc-500 bg-[#10121A] border border-[#202434] rounded-2xl">
            <p className="text-sm">New arrivals will show up here once created.</p>
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
