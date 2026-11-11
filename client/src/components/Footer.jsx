import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaWhatsapp, FaShieldAlt, FaShippingFast, FaHeart } from 'react-icons/fa';
import { sanitizeWhatsAppNumber } from '../utils/whatsapp';

export default function Footer() {
  const { settings } = useSelector((state) => state.settings || { settings: {} });
  const whatsappNumber = settings?.whatsappNumber || import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210';
  const cleanPhone = sanitizeWhatsAppNumber(whatsappNumber);

  return (
    <footer className="bg-[#08090D] border-t border-[#202434] text-zinc-400 py-12 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-8 text-center">
        {/* Brand */}
        <div>
          <span className="text-2xl font-extrabold tracking-[0.25em] font-['Syne'] gold-gradient-text uppercase block">
            BRO FUSION
          </span>
          <p className="text-zinc-500 text-xs mt-1 tracking-wide">
            Elevated Contemporary Streetwear • Designed for Comfort & Style
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap justify-center gap-8 text-zinc-300 font-semibold text-xs uppercase tracking-wider">
          <Link to="/" className="hover:text-amber-400 transition-colors">Home</Link>
          <Link to="/products" className="hover:text-amber-400 transition-colors">Shop All</Link>
          <Link to="/track-order" className="hover:text-amber-400 transition-colors">Track Order</Link>
          <Link to="/contact" className="hover:text-amber-400 transition-colors">Contact Us</Link>
          <Link to="/admin" className="text-amber-400 hover:text-amber-300 transition-colors">Admin Portal</Link>
        </div>

        {/* WhatsApp support badge */}
        <div className="inline-flex items-center gap-2 bg-[#10121A] border border-[#202434] px-4 py-2 rounded-full text-xs text-zinc-300">
          <span>Need help with sizes or orders?</span>
          <a
            href={`https://wa.me/${cleanPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 font-bold hover:underline flex items-center gap-1"
          >
            <FaWhatsapp /> Chat with us
          </a>
        </div>

        {/* Copyright */}
        <div className="border-t border-[#202434]/80 w-full pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-zinc-600 text-[11px]">
          <p>&copy; {new Date().getFullYear()} Bro Fusion. All rights reserved.</p>
          <p className="flex items-center gap-1 text-zinc-500">
            Crafted with <FaHeart className="text-rose-500 text-[10px]" /> for Luxury Streetwear
          </p>
        </div>
      </div>
    </footer>
  );
}
