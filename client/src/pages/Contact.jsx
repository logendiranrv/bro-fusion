import { useState } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { FaMapMarkerAlt, FaEnvelope, FaWhatsapp } from 'react-icons/fa';
import { generateWhatsAppChatUrl } from '../utils/whatsapp';

export default function Contact() {
  const { settings } = useSelector((state) => state.settings || { settings: {} });
  const whatsappNumber = settings?.whatsappNumber || import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210';
  const chatUrl = generateWhatsAppChatUrl(whatsappNumber, 'Hi Bro Fusion! I have an inquiry.');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success('Thank you for contacting Bro Fusion! We will get back to you soon.');
      setName('');
      setEmail('');
      setMessage('');
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-xs font-bold uppercase tracking-widest text-[#B88E28]">Direct Support</span>
        <h1 className="text-4xl sm:text-5xl font-black text-[#2F1D15] mt-1 font-['Syne']">Get in Touch</h1>
        <p className="text-xs sm:text-sm text-[#7A6451] mt-2">Have a question regarding sizes, custom fits, or an existing order?</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Contact Info Card in Ivory / Cream */}
        <div className="bg-[#FDFBF7] border border-[#E5D9CB] rounded-3xl p-8 flex flex-col gap-8 shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-[#2F1D15] mb-1 font-['Syne']">Bro Fusion Headquarters</h2>
            <p className="text-xs text-[#7A6451]">Visit our studio or reach out digitally</p>
          </div>
          
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-[#F5EDE3] text-[#B88E28] rounded-2xl border border-[#E5D9CB] text-lg">
              <FaMapMarkerAlt />
            </div>
            <div>
              <h3 className="font-bold text-[#2F1D15] text-sm">Store & Studio Address</h3>
              <p className="text-xs text-[#7A6451] mt-1 leading-relaxed">
                Pattapan School, Junction Main Rd,<br />
                opposite Tharamangalam, Tharamangalam,<br />
                Tamil Nadu - 636502
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-200 text-lg">
              <FaWhatsapp />
            </div>
            <div>
              <h3 className="font-bold text-[#2F1D15] text-sm">WhatsApp Priority Support</h3>
              <p className="text-xs text-[#7A6451] mt-0.5">Quick replies on orders & sizing advice</p>
              <a
                href={chatUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-emerald-700 hover:underline mt-1 inline-block"
              >
                +91 {whatsappNumber} (Chat Now) →
              </a>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="p-3 bg-[#F5EDE3] text-[#B88E28] rounded-2xl border border-[#E5D9CB] text-lg">
              <FaEnvelope />
            </div>
            <div>
              <h3 className="font-bold text-[#2F1D15] text-sm">Support Email</h3>
              <p className="text-xs text-[#7A6451] mt-0.5">Official brand inquiries & collaborations</p>
              <a href="mailto:support@brofusion.com" className="text-xs text-[#2F1D15] hover:text-[#B88E28] transition-colors font-medium">
                support@brofusion.com
              </a>
            </div>
          </div>

          {/* Business Hours */}
          <div className="border-t border-[#E5D9CB] pt-6">
            <h3 className="text-xs uppercase font-bold tracking-wider text-[#B88E28] mb-2">Business Hours</h3>
            <div className="flex justify-between text-xs text-[#7A6451]">
              <span>Monday — Saturday</span>
              <span className="text-[#2F1D15] font-semibold">10:00 AM — 9:00 PM</span>
            </div>
            <div className="flex justify-between text-xs text-[#7A6451] mt-1">
              <span>Sunday</span>
              <span className="text-emerald-700 font-semibold">Online WhatsApp Support Active</span>
            </div>
          </div>
        </div>

        {/* Contact Form Card in Ivory / Cream */}
        <div className="bg-[#FDFBF7] border border-[#E5D9CB] rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-[#2F1D15] mb-2 font-['Syne']">Send Direct Message</h2>
          <p className="text-xs text-[#7A6451] mb-6">Leave a note and our team will get back to you within 24 hours.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#7A6451] block mb-1.5">Your Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Logendiran"
                className="w-full bg-[#F5EDE3]/50 border border-[#E5D9CB] rounded-xl px-4 py-3 text-[#2F1D15] focus:outline-none focus:border-[#D4AF37] focus:bg-[#FDFBF7] text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#7A6451] block mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. logan@gmail.com"
                className="w-full bg-[#F5EDE3]/50 border border-[#E5D9CB] rounded-xl px-4 py-3 text-[#2F1D15] focus:outline-none focus:border-[#D4AF37] focus:bg-[#FDFBF7] text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#7A6451] block mb-1.5">Your Message</label>
              <textarea
                required
                rows="4"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message here..."
                className="w-full bg-[#F5EDE3]/50 border border-[#E5D9CB] rounded-xl p-4 text-[#2F1D15] focus:outline-none focus:border-[#D4AF37] focus:bg-[#FDFBF7] text-sm resize-none leading-relaxed"
              ></textarea>
            </div>

            {/* Rule 7: Buttons: Gold with dark text */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="gold-gradient-btn w-full mt-2 py-4 rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-sm"
            >
              {isSubmitting ? 'Sending Message...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
