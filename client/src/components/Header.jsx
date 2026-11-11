import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaShoppingCart, FaHeart, FaUser, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import { fetchCart } from '../store/slices/cartSlice';
import { fetchWishlist } from '../store/slices/wishlistSlice';
import { logoutUser } from '../store/slices/authSlice';
import { fetchCategories } from '../store/slices/productSlice';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const { settings } = useSelector((state) => state.settings || { settings: {} });
  const logoUrl = settings?.logoUrl;
  const { categories } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchCategories());
    if (user) {
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    }
  }, [user, dispatch]);

  const handleLogout = () => {
    dispatch(logoutUser()).then(() => {
      navigate('/login');
    });
  };

  const tShirtCat = categories?.find(c => c.slug === 't-shirt');
  const shirtCat = categories?.find(c => c.slug === 'shirt');
  const pantCat = categories?.find(c => c.slug === 'pant');
  const trackCat = categories?.find(c => c.slug === 'track');
  const hoodieCat = categories?.find(c => c.slug === 'hoodie');

  return (
    <div className="sticky top-0 z-50 w-full">
      {/* Top Scrolling Marquee Banner */}
      <div className="bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-black py-2 text-[11px] font-extrabold uppercase tracking-widest overflow-hidden whitespace-nowrap border-b border-[#202434] select-none shadow-md">
        <div className="animate-marquee flex gap-16">
          <span>✨ ELEVATED LUXURY STREETWEAR & APPAREL</span>
          <span>⚡ ORDER DIRECTLY ON WHATSAPP WITH FREE DELIVERY</span>
          <span>🔥 USE CODE FUSION10 FOR 10% OFF YOUR FIRST ORDER</span>
          <span>✨ ELEVATED LUXURY STREETWEAR & APPAREL</span>
          <span>⚡ ORDER DIRECTLY ON WHATSAPP WITH FREE DELIVERY</span>
          <span>🔥 USE CODE FUSION10 FOR 10% OFF YOUR FIRST ORDER</span>
        </div>
      </div>

      <header className="bg-[#08090D]/90 backdrop-blur-xl border-b border-[#202434] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            {logoUrl && (
              <img src={logoUrl} alt="Bro Fusion Logo" className="h-12 sm:h-14 w-auto object-contain rounded transition-all group-hover:scale-105" />
            )}
            <span className="text-2xl sm:text-3xl font-extrabold tracking-[0.2em] font-['Syne'] gold-gradient-text uppercase drop-shadow-sm">
              BRO FUSION
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-8 text-sm font-medium items-center">
            <Link to="/" className="hover:text-amber-400 text-zinc-300 transition-colors">Home</Link>
            
            {/* Hover Dropdown */}
            <div className="relative group py-4">
              <button className="hover:text-amber-400 text-zinc-300 transition-colors flex items-center gap-1 cursor-pointer">
                Categories
                <svg className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div className="absolute top-full left-0 w-56 bg-zinc-900 border border-zinc-800 rounded-md shadow-xl py-2 hidden group-hover:block z-50">
                {/* T-Shirt with Submenu */}
                {tShirtCat && (
                  <div className="relative group/sub">
                    <Link
                      to={`/products?category=${tShirtCat._id}`}
                      className="flex items-center justify-between px-4 py-2 hover:bg-zinc-800 hover:text-amber-400 text-zinc-100 transition-colors font-semibold"
                    >
                      <span>T-Shirt</span>
                      <svg className="w-3 h-3 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    <div className="absolute left-full top-0 ml-1 w-56 bg-zinc-900 border border-zinc-800 rounded-md shadow-xl py-2 hidden group-hover/sub:block z-50">
                      <Link to={`/products?category=${tShirtCat._id}&search=Five+Sleeve`} className="block px-4 py-2 hover:bg-zinc-800 hover:text-amber-400 text-zinc-100 transition-colors">
                        Five Sleeve T-Shirt
                      </Link>
                      <Link to={`/products?category=${tShirtCat._id}&search=Full+Sleeve`} className="block px-4 py-2 hover:bg-zinc-800 hover:text-amber-400 text-zinc-100 transition-colors">
                        Full Sleeve T-Shirt
                      </Link>
                      <Link to={`/products?category=${tShirtCat._id}&search=Short+Sleeve`} className="block px-4 py-2 hover:bg-zinc-800 hover:text-amber-400 text-zinc-100 transition-colors">
                        Short Sleeve T-Shirt
                      </Link>
                      <Link to={`/products?category=${tShirtCat._id}&search=Foot+Ball+Jersey`} className="block px-4 py-2 hover:bg-zinc-800 hover:text-amber-400 text-zinc-100 transition-colors">
                        Foot Ball Jersey
                      </Link>
                    </div>
                  </div>
                )}

                {/* Shirt with Submenu */}
                {shirtCat && (
                  <div className="relative group/sub">
                    <Link
                      to={`/products?category=${shirtCat._id}`}
                      className="flex items-center justify-between px-4 py-2 hover:bg-zinc-800 hover:text-amber-400 text-zinc-100 transition-colors font-semibold"
                    >
                      <span>Shirt</span>
                      <svg className="w-3 h-3 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    <div className="absolute left-full top-0 ml-1 w-56 bg-zinc-900 border border-zinc-800 rounded-md shadow-xl py-2 hidden group-hover/sub:block z-50">
                      <Link to={`/products?category=${shirtCat._id}&search=Casual`} className="block px-4 py-2 hover:bg-zinc-800 hover:text-amber-400 text-zinc-100 transition-colors">
                        Casual Shirt
                      </Link>
                      <Link to={`/products?category=${shirtCat._id}&search=Formal`} className="block px-4 py-2 hover:bg-zinc-800 hover:text-amber-400 text-zinc-100 transition-colors">
                        Formal Shirt
                      </Link>
                      <Link to={`/products?category=${shirtCat._id}&search=Denim`} className="block px-4 py-2 hover:bg-zinc-800 hover:text-amber-400 text-zinc-100 transition-colors">
                        Denim Shirt
                      </Link>
                      <Link to={`/products?category=${shirtCat._id}&search=Check`} className="block px-4 py-2 hover:bg-zinc-800 hover:text-amber-400 text-zinc-100 transition-colors">
                        Check Shirt
                      </Link>
                    </div>
                  </div>
                )}

                {/* Pant */}
                {pantCat && (
                  <Link to={`/products?category=${pantCat._id}`} className="block px-4 py-2 hover:bg-zinc-800 hover:text-amber-400 text-zinc-100 transition-colors font-semibold">
                    Pant
                  </Link>
                )}

                {/* Track */}
                {trackCat && (
                  <Link to={`/products?category=${trackCat._id}`} className="block px-4 py-2 hover:bg-zinc-800 hover:text-amber-400 text-zinc-100 transition-colors font-semibold">
                    Track
                  </Link>
                )}

                {/* Hoodie */}
                {hoodieCat && (
                  <Link to={`/products?category=${hoodieCat._id}`} className="block px-4 py-2 hover:bg-zinc-800 hover:text-amber-400 text-zinc-100 transition-colors font-semibold">
                    Hoodie
                  </Link>
                )}
              </div>
            </div>

            <Link to="/products" className="hover:text-amber-400 text-zinc-300 transition-colors">Shop All</Link>
            <Link to="/track-order" className="hover:text-amber-400 text-zinc-300 transition-colors">Track Order</Link>
            <Link to="/contact" className="hover:text-amber-400 text-zinc-300 transition-colors">Contact Us</Link>
            <Link to="/admin" className="text-amber-400 hover:text-amber-300 transition-all flex items-center gap-1.5 font-bold text-xs bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full shadow-sm hover:bg-amber-500/20">
              👑 Admin Panel
            </Link>
          </nav>

          {/* User Actions & Mobile Toggle */}
          <div className="flex items-center space-x-3 sm:space-x-6">
            {user ? (
              <>
                {/* Wishlist */}
                <Link to="/wishlist" className="relative p-2 text-zinc-400 hover:text-rose-500 transition-colors">
                  <FaHeart className="text-xl" />
                  {wishlistItems?.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {wishlistItems.length}
                    </span>
                  )}
                </Link>

                {/* Cart */}
                <Link to="/cart" className="relative p-2 text-zinc-400 hover:text-amber-400 transition-colors">
                  <FaShoppingCart className="text-xl" />
                  {cartItems?.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-amber-500 text-black text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                    </span>
                  )}
                </Link>

                {/* User Profile / Logout */}
                <div className="hidden sm:flex items-center gap-4 border-l border-zinc-800 pl-4">
                  <div className="flex flex-col text-right">
                    <span className="text-xs text-zinc-500">Welcome,</span>
                    <span className="text-sm font-semibold text-zinc-200">{user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                    title="Logout"
                  >
                    <FaSignOutAlt className="text-lg" />
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white font-medium py-1.5 px-4 rounded-full text-sm transition-all shadow-lg hover:shadow-purple-500/20"
              >
                <FaUser /> Login
              </Link>
            )}

            {/* Hamburger Toggle */}
            <button 
              className="md:hidden p-2 text-zinc-300 hover:text-amber-400 transition-colors ml-2 cursor-pointer"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-zinc-950 border-t border-zinc-800 absolute top-full left-0 w-full shadow-2xl z-40 max-h-[80vh] overflow-y-auto">
            <nav className="flex flex-col px-4 py-6 gap-4 font-medium">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-zinc-300 hover:text-amber-400 py-2 border-b border-zinc-800/50">Home</Link>
              
              <div className="py-2 border-b border-zinc-800/50 flex flex-col gap-2">
                <span className="text-zinc-500 text-sm uppercase tracking-wider font-bold">Categories</span>
                {categories?.map((cat) => (
                  <Link 
                    key={cat._id} 
                    to={`/products?category=${cat._id}`} 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className="text-zinc-300 hover:text-amber-400 pl-4 py-1"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>

              <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} className="text-zinc-300 hover:text-amber-400 py-2 border-b border-zinc-800/50">Shop All</Link>
              <Link to="/track-order" onClick={() => setIsMobileMenuOpen(false)} className="text-zinc-300 hover:text-amber-400 py-2 border-b border-zinc-800/50">Track Order</Link>
              <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-zinc-300 hover:text-amber-400 py-2 border-b border-zinc-800/50">Contact Us</Link>
              
              {user?.role === 'admin' && (
                <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-purple-400 hover:text-purple-300 py-2 border-b border-zinc-800/50 flex items-center gap-2">
                  Admin Portal
                </Link>
              )}

              {/* Mobile Logout / Login */}
              <div className="pt-4 mt-2">
                {user ? (
                  <button 
                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} 
                    className="w-full flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-red-400 py-3 rounded-lg cursor-pointer"
                  >
                    <FaSignOutAlt /> Logout ({user.name})
                  </button>
                ) : (
                  <Link 
                    to="/login" 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-purple-600 text-white font-bold py-3 rounded-lg shadow-lg"
                  >
                    <FaUser /> Login / Register
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>
    </div>
  );
}
