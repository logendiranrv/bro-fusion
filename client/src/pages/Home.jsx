import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchFeaturedProducts, fetchNewArrivals, fetchCategories } from '../store/slices/productSlice';
import ProductCard from '../components/ProductCard';
import { FaWhatsapp, FaShippingFast, FaShieldAlt, FaArrowRight } from 'react-icons/fa';
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
      {/* Rule 2: Hero Section: Dark Brown + Gold typography */}
      <div className="relative bg-gradient-to-b from-[#35231B] via-[#2F1D15] to-[#251710] border-b border-[#4A3424] py-24 sm:py-36 overflow-hidden">
        {/* Shimmering Gold Ambient Glows */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-[650px] h-[360px] bg-gradient-to-b from-[#D4AF37]/25 via-[#C6A15B]/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
          {/* Badge: Gold on Dark Brown */}
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-[#E8C86A] mb-6 bg-[#23170F]/80 border border-[#D4AF37]/40 px-4 py-1.5 rounded-full shadow-lg">
            <span>✨ NEW DROP • VOL. 2024-25</span>
          </div>

          {/* Heading: Gold typography */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#E8C86A] mb-6 font-['Syne'] max-w-4xl leading-[1.1] drop-shadow-md">
            ELEVATED <span className="gold-text-hero">STREETWEAR</span> & LUXURY BASICS
          </h1>

          <p className="max-w-2xl text-base sm:text-lg text-[#E5D9CC] mb-10 leading-relaxed font-normal">
            Engineered comfort meets unapologetic street aesthetics. Heavyweight 240+ GSM combed fabrics, drop-shoulder silhouettes, and direct WhatsApp ordering.
          </p>

          {/* Rule 7: Buttons: Gold with dark text */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              to="/products"
              className="gold-gradient-btn w-full sm:w-auto px-9 py-4 rounded-full text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              Explore Drops <FaArrowRight className="text-xs" />
            </Link>

            <a
              href={chatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-[#10B981] hover:bg-[#059669] text-white px-7 py-4 rounded-full text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
            >
              <FaWhatsapp className="text-lg text-white" /> Order via WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Trust Pillars in Ivory / Cream */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#FDFBF7] border border-[#E5D9CB] rounded-2xl p-5 flex items-center gap-4 shadow-md">
            <div className="w-12 h-12 rounded-xl bg-[#F5EDE3] border border-[#E5D9CB] text-[#B88E28] flex items-center justify-center text-xl flex-shrink-0">
              <FaShippingFast />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#2F1D15]">Free Express Delivery</h2>
              <p className="text-xs text-[#7A6451] mt-0.5">Complimentary shipping across India</p>
            </div>
          </div>

          <div className="bg-[#FDFBF7] border border-[#E5D9CB] rounded-2xl p-5 flex items-center gap-4 shadow-md">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center text-xl flex-shrink-0">
              <FaWhatsapp />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#2F1D15]">Direct WhatsApp Orders</h2>
              <p className="text-xs text-[#7A6451] mt-0.5">Instant confirmation & GPay/COD support</p>
            </div>
          </div>

          <div className="bg-[#FDFBF7] border border-[#E5D9CB] rounded-2xl p-5 flex items-center gap-4 shadow-md">
            <div className="w-12 h-12 rounded-xl bg-[#F5EDE3] border border-[#E5D9CB] text-[#B88E28] flex items-center justify-center text-xl flex-shrink-0">
              <FaShieldAlt />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#2F1D15]">240 GSM Luxury Cotton</h2>
              <p className="text-xs text-[#7A6451] mt-0.5">Pre-shrunk French Terry & bio-washed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories in Ivory / Cream */}
      {categories?.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <div className="flex justify-between items-end mb-8 border-b border-[#E5D9CB] pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#B88E28]">Curated Lines</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2F1D15] mt-1 font-['Syne']">Shop by Category</h2>
            </div>
            <Link to="/products" className="text-xs font-bold uppercase tracking-wider text-[#B88E28] hover:text-[#2F1D15] flex items-center gap-1 transition-colors">
              All Collections <FaArrowRight className="text-[10px]" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/products?category=${cat._id}`}
                className="group relative bg-[#FDFBF7] border border-[#E5D9CB] hover:border-[#D4AF37] rounded-2xl p-6 h-28 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md cursor-pointer overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-200/30 to-transparent rounded-full -mr-8 -mt-8 pointer-events-none group-hover:scale-150 transition-transform"></div>
                <span className="font-extrabold text-base sm:text-lg text-[#2F1D15] group-hover:text-[#B88E28] transition-colors">
                  {cat.name}
                </span>
                <span className="text-[11px] uppercase tracking-wider text-[#7A6451] group-hover:text-[#2F1D15] transition-colors flex items-center gap-1">
                  Explore drop <FaArrowRight className="text-[9px]" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Featured Drops */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="flex justify-between items-end mb-8 border-b border-[#E5D9CB] pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#B88E28]">Handpicked Essentials</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2F1D15] mt-1 font-['Syne']">Featured Drops</h2>
          </div>
          <Link to="/products" className="text-xs font-bold uppercase tracking-wider text-[#B88E28] hover:text-[#2F1D15] flex items-center gap-1 transition-colors">
            View All <FaArrowRight className="text-[10px]" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="animate-pulse bg-[#FDFBF7] aspect-[3/4] rounded-2xl border border-[#E5D9CB]"></div>
            ))}
          </div>
        ) : featured?.length === 0 ? (
          <div className="text-center py-16 text-[#7A6451] bg-[#FDFBF7] border border-[#E5D9CB] rounded-2xl">
            <p className="text-sm">No featured products yet. Add your first drops in the Admin Panel!</p>
            <Link to="/admin" className="mt-4 inline-block text-xs font-bold text-[#B88E28] underline">
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
        <div className="flex justify-between items-end mb-8 border-b border-[#E5D9CB] pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#B88E28]">Fresh Silhouettes</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2F1D15] mt-1 font-['Syne']">New Arrivals</h2>
          </div>
          <Link to="/products" className="text-xs font-bold uppercase tracking-wider text-[#B88E28] hover:text-[#2F1D15] flex items-center gap-1 transition-colors">
            View All <FaArrowRight className="text-[10px]" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="animate-pulse bg-[#FDFBF7] aspect-[3/4] rounded-2xl border border-[#E5D9CB]"></div>
            ))}
          </div>
        ) : newArrivals?.length === 0 ? (
          <div className="text-center py-16 text-[#7A6451] bg-[#FDFBF7] border border-[#E5D9CB] rounded-2xl">
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
