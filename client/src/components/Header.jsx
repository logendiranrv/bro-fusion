import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaShoppingCart, FaHeart, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import { fetchCart } from '../store/slices/cartSlice';
import { fetchWishlist } from '../store/slices/wishlistSlice';
import { logoutUser } from '../store/slices/authSlice';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    }
  }, [user, dispatch]);

  const handleLogout = () => {
    dispatch(logoutUser()).then(() => {
      navigate('/');
    });
  };

  const totalCartQty = cartItems?.reduce((acc, item) => acc + (item.quantity || 1), 0) || 0;

  return (
    <div className="sticky top-0 z-50 w-full">
      {/* Top Scrolling Marquee Banner */}
      <div className="bg-[#1C120C] text-[#E8C86A] py-2 text-[11px] font-extrabold uppercase tracking-widest overflow-hidden whitespace-nowrap border-b border-[#352317] select-none shadow-sm">
        <div className="animate-marquee flex gap-16">
          <span>✨ ELEVATED LUXURY STREETWEAR & APPAREL</span>
          <span>⚡ ORDER DIRECTLY ON WHATSAPP WITH FREE DELIVERY</span>
          <span>🔥 USE CODE FUSION10 FOR 10% OFF YOUR FIRST ORDER</span>
          <span>✨ ELEVATED LUXURY STREETWEAR & APPAREL</span>
          <span>⚡ ORDER DIRECTLY ON WHATSAPP WITH FREE DELIVERY</span>
          <span>🔥 USE CODE FUSION10 FOR 10% OFF YOUR FIRST ORDER</span>
        </div>
      </div>

      {/* Navbar: Dark Chocolate */}
      <header className="bg-[#23170F]/95 backdrop-blur-xl border-b border-[#3D2A1D] shadow-lg transition-all relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <img
              src="/logo.jpg"
              alt="Bro Fusion Logo"
              className="h-12 w-12 sm:h-14 sm:w-14 object-cover rounded-xl shadow-md border border-[#D4AF37]/40 transition-transform duration-300 group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-[0.2em] font-['Syne'] text-[#E8C86A] uppercase leading-none drop-shadow-sm">
                BRO FUSION
              </span>
              <span className="text-[10px] tracking-[0.25em] text-[#C4B5A5] font-bold uppercase mt-1">
                Luxury Streetwear
              </span>
            </div>
          </Link>

          {/* Top Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-bold uppercase tracking-widest">
            <Link to="/" className="text-[#E8DDD1] hover:text-[#E8C86A] transition-colors py-2">
              Home
            </Link>
            <Link to="/products" className="text-[#E8DDD1] hover:text-[#E8C86A] transition-colors py-2">
              Shop All
            </Link>
            <Link to="/track-order" className="text-[#E8DDD1] hover:text-[#E8C86A] transition-colors py-2">
              Track Order
            </Link>
            <Link to="/contact" className="text-[#E8DDD1] hover:text-[#E8C86A] transition-colors py-2">
              Contact Us
            </Link>
          </nav>

          {/* User Actions: Wishlist, Cart & Mobile Menu Toggle */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2.5 rounded-xl bg-[#2D1F16] border border-[#483324] text-[#E8DDD1] hover:text-[#E8C86A] hover:border-[#D4AF37]/50 transition-all shadow-sm cursor-pointer"
              title="Wishlist"
            >
              <FaHeart className="text-lg" />
              {wishlistItems?.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-xl bg-[#2D1F16] border border-[#483324] text-[#E8DDD1] hover:text-[#E8C86A] hover:border-[#D4AF37]/50 transition-all shadow-sm cursor-pointer"
              title="Cart"
            >
              <FaShoppingCart className="text-lg" />
              {totalCartQty > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#D4AF37] text-[#23170F] text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow">
                  {totalCartQty}
                </span>
              )}
            </Link>

            {/* Logout (Only if logged in) */}
            {user && (
              <div className="flex items-center gap-2 border-l border-[#3D2A1D] pl-3">
                <span className="text-xs text-[#E8DDD1] font-semibold hidden sm:inline">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="p-2 text-[#C4B5A5] hover:text-red-400 transition-colors cursor-pointer"
                  title="Logout"
                >
                  <FaSignOutAlt className="text-base" />
                </button>
              </div>
            )}

            {/* Hamburger Toggle (Mobile) */}
            <button
              className="md:hidden p-2.5 rounded-xl bg-[#2D1F16] border border-[#483324] text-[#E8DDD1] hover:text-[#E8C86A] transition-colors cursor-pointer"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#23170F] border-t border-[#3D2A1D] px-6 py-6 shadow-2xl animate-in slide-in-from-top duration-200">
            <nav className="flex flex-col gap-4 text-xs font-bold uppercase tracking-widest">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-[#E8DDD1] hover:text-[#E8C86A] py-2 border-b border-[#3D2A1D]"
              >
                Home
              </Link>
              <Link
                to="/products"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-[#E8DDD1] hover:text-[#E8C86A] py-2 border-b border-[#3D2A1D]"
              >
                Shop All
              </Link>
              <Link
                to="/track-order"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-[#E8DDD1] hover:text-[#E8C86A] py-2 border-b border-[#3D2A1D]"
              >
                Track Order
              </Link>
              <Link
                to="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-[#E8DDD1] hover:text-[#E8C86A] py-2"
              >
                Contact Us
              </Link>
            </nav>
          </div>
        )}
      </header>
    </div>
  );
}
