import { useSelector } from 'react-redux';
import { FaWhatsapp } from 'react-icons/fa';
import { generateWhatsAppChatUrl } from '../utils/whatsapp';

export default function WhatsAppButton() {
  const { settings } = useSelector((state) => state.settings || { settings: {} });
  const whatsappNumber = settings?.whatsappNumber || import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210';

  const chatUrl = generateWhatsAppChatUrl(whatsappNumber, 'Hi Bro Fusion! I have a question about your products.');

  return (
    <aside aria-label="WhatsApp Support" className="fixed bottom-6 right-6 z-50 flex items-center group">
      {/* Tooltip */}
      <span className="hidden sm:inline-block mr-3 px-3 py-1.5 bg-zinc-900 border border-zinc-700 text-white text-xs font-semibold rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 select-none">
        Order on WhatsApp 💬
      </span>

      {/* Button */}
      <a
        href={chatUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 cursor-pointer relative"
      >
        <FaWhatsapp className="w-8 h-8" />
        {/* Pulsing indicator */}
        <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-300 rounded-full animate-ping"></span>
        <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-zinc-950"></span>
      </a>
    </aside>
  );
}

