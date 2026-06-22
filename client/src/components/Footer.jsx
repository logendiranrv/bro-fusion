import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800 text-zinc-500 py-8 text-center text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex flex-col gap-3">
        <div className="flex justify-center gap-6 text-zinc-400 font-semibold mb-2">
          <Link to="/" className="hover:text-amber-400 transition-colors">Home</Link>
          <Link to="/products" className="hover:text-amber-400 transition-colors">Shop All</Link>
          <Link to="/track-order" className="hover:text-amber-400 transition-colors">Track Order</Link>
          <Link to="/contact" className="hover:text-amber-400 transition-colors">Contact Us</Link>
        </div>
        <p>&copy; {new Date().getFullYear()} Bro Fusion. All rights reserved.</p>
        <p className="text-zinc-600">Elevated Streetwear & Apparel</p>
      </div>
    </footer>
  );
}
