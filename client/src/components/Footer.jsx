import { useSelector } from 'react-redux';
import { FaWhatsapp, FaHeart } from 'react-icons/fa';
import { sanitizeWhatsAppNumber } from '../utils/whatsapp';

export default function Footer() {
  const { settings } = useSelector((state) => state.settings || { settings: {} });
  const whatsappNumber = settings?.whatsappNumber || import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210';
  const cleanPhone = sanitizeWhatsAppNumber(whatsappNumber);

  return (
    /* Rule 8: Footer: Dark Chocolate (Nav links removed from footer as requested) */
    <footer className="bg-[#23170F] border-t border-[#3D2A1D] text-[#C4B5A5] py-12 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-7 text-center">
        {/* Brand with Logo */}
        <div className="flex flex-col items-center gap-2">
          <img
            src="/logo.jpg"
            alt="Bro Fusion Logo"
            className="h-14 w-14 object-cover rounded-xl shadow-md border border-[#D4AF37]/40"
          />
          <span className="text-xl font-extrabold tracking-[0.25em] font-['Syne'] text-[#E8C86A] uppercase block mt-1 drop-shadow-sm">
            BRO FUSION
          </span>
          <p className="text-[#A89887] text-xs tracking-wide">
            Elevated Contemporary Streetwear • Designed for Comfort & Style
          </p>
        </div>

        {/* WhatsApp support badge */}
        <div className="inline-flex items-center gap-2 bg-[#2D1F16] border border-[#483324] px-5 py-2.5 rounded-full text-xs text-[#E8DDD1] shadow-sm">
          <span>Need help with sizes or orders?</span>
          <a
            href={`https://wa.me/${cleanPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#E8C86A] font-bold hover:underline flex items-center gap-1"
          >
            <FaWhatsapp className="text-[#34D399] text-sm" /> Chat with us
          </a>
        </div>

        {/* Copyright */}
        <div className="border-t border-[#3D2A1D] w-full pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[#8C7765] text-[11px]">
          <p>&copy; {new Date().getFullYear()} Bro Fusion. All rights reserved.</p>
          <p className="flex items-center gap-1 text-[#8C7765]">
            Crafted with <FaHeart className="text-rose-500 text-[10px]" /> for Luxury Streetwear
          </p>
        </div>
      </div>
    </footer>
  );
}
