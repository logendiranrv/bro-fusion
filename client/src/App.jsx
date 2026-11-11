import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe } from './store/slices/authSlice';
import { fetchSettings } from './store/slices/settingsSlice';
import { Toaster } from 'react-hot-toast';

import Header from './components/Header';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import OrderDetails from './pages/OrderDetails';
import AdminDashboard from './pages/AdminDashboard';
import Contact from './pages/Contact';
import TrackOrder from './pages/TrackOrder';
export default function App() {
  const dispatch = useDispatch();
  const { settings } = useSelector((state) => state.settings || { settings: {} });
  const logoUrl = settings?.logoUrl;

  useEffect(() => {
    dispatch(fetchSettings());
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(fetchMe());
    }
  }, [dispatch]);

  useEffect(() => {
    if (logoUrl) {
      const link = document.querySelector("link[rel~='icon']");
      if (link) {
        link.href = logoUrl;
      }
    }
  }, [logoUrl]);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 selection:bg-purple-500/30 selection:text-purple-200">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order/:id" element={<OrderDetails />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/track-order" element={<TrackOrder />} />
        </Routes>
      </main>
      <WhatsAppButton />
      <Footer />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#1c1917',
            border: '1px solid #e5dfd3',
          },
        }}
      />
    </div>
  );
}
