import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaPhoneAlt, FaMapMarkerAlt, FaEnvelope } from 'react-icons/fa';

export default function Contact() {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-4xl font-black text-white">Contact Us</h1>
        <p className="text-sm text-zinc-400 mt-2">Have a question or feedback? We'd love to hear from you.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Contact Info Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 flex flex-col gap-8 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-2">Get in Touch</h2>
          
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-lg border border-amber-500/20">
              <FaMapMarkerAlt className="text-xl" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-200">Our Store Address</h3>
              <p className="text-sm text-zinc-400 mt-1 leading-relaxed">
                Pattapan School, Junction Main Rd,<br />
                opposite Tharamangalam, Tharamangalam,<br />
                Tamil Nadu - 636502
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-lg border border-amber-500/20">
              <FaPhoneAlt className="text-xl" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-200">Phone Number</h3>
              <p className="text-sm text-zinc-400 mt-1 font-semibold hover:text-amber-400 transition-colors">
                <a href="tel:+919025553064">090255 53064</a>
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-lg border border-amber-500/20">
              <FaEnvelope className="text-xl" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-200">Support Email</h3>
              <p className="text-sm text-zinc-400 mt-1 hover:text-amber-400 transition-colors">
                <a href="mailto:support@brofusion.com">support@brofusion.com</a>
              </p>
            </div>
          </div>

          {/* Business Hours */}
          <div className="border-t border-zinc-800 pt-6">
            <h3 className="text-sm uppercase font-bold tracking-wider text-zinc-500 mb-2">Business Hours</h3>
            <div className="flex justify-between text-xs text-zinc-400">
              <span>Monday — Saturday</span>
              <span>10:00 AM — 9:00 PM</span>
            </div>
            <div className="flex justify-between text-xs text-zinc-400 mt-1">
              <span>Sunday</span>
              <span>Closed</span>
            </div>
          </div>
        </div>

        {/* Contact Form Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-6">Send Us a Message</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Your Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-200 focus:outline-none focus:border-zinc-700 text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Email ID</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-200 focus:outline-none focus:border-zinc-700 text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Message</label>
              <textarea
                required
                rows="5"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message here..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-200 focus:outline-none focus:border-zinc-700 text-sm resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg text-sm transition-all shadow-lg cursor-pointer mt-2"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
