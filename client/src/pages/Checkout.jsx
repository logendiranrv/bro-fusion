import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { clearCart } from '../store/slices/cartSlice';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FaWhatsapp, FaCheckCircle, FaCopy, FaArrowLeft } from 'react-icons/fa';
import { generateOrderWhatsAppUrl } from '../utils/whatsapp';
import { isSupabaseConfigured, supabaseCreateOrder } from '../services/supabase';

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart);
  const { settings } = useSelector((state) => state.settings || { settings: {} });

  const whatsappNumber = settings?.whatsappNumber || import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210';
  const upiId = settings?.upiId || 'brofusion@upi';

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState(user?.address || '');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('Tamil Nadu');
  const [pincode, setPincode] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [paymentMethod, setPaymentMethod] = useState('WhatsApp Order (UPI / GPay / COD)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [whatsappOrderUrl, setWhatsappOrderUrl] = useState('');

  useEffect(() => {
    if (cartItems?.length === 0 && !completedOrder) {
      toast.error('Your cart is empty');
      navigate('/cart');
    }
  }, [cartItems, navigate, completedOrder]);

  const itemsPrice = cartItems?.reduce((acc, item) => {
    if (!item.product) return acc;
    const price = item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price;
    return acc + price * item.quantity;
  }, 0) || 0;

  const shippingPrice = 0; // Free delivery
  const totalPrice = itemsPrice + shippingPrice;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      toast.error('Please enter a valid 10-digit WhatsApp phone number');
      return;
    }
    if (!address.trim() || !city.trim() || !pincode.trim()) {
      toast.error('Please fill in complete shipping address details');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderItems = cartItems
        .filter((item) => item.product)
        .map((item) => ({
          product: item.product._id || item.product.id,
          name: item.product.name,
          image: item.product.images?.[0]?.url || '',
          price: item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price,
          quantity: item.quantity,
          size: item.size || 'Standard',
          color: item.color || 'Standard',
        }));

      const shippingAddress = {
        name,
        email: email || '',
        address,
        city,
        state: stateName,
        pincode,
        phone,
      };

      let createdOrder = null;
      let orderIdStr = 'BF-' + Math.floor(100000 + Math.random() * 900000);

      // Attempt Supabase insert if configured
      if (isSupabaseConfigured()) {
        try {
          createdOrder = await supabaseCreateOrder({
            shippingAddress,
            orderItems,
            itemsPrice,
            shippingPrice,
            totalPrice,
            paymentMethod,
          });
          if (createdOrder?.id) {
            orderIdStr = createdOrder.id.slice(0, 8).toUpperCase();
          }
        } catch (supaErr) {
          console.warn('Supabase order creation fallback:', supaErr);
        }
      }

      // Also try local API if server is alive
      if (!createdOrder) {
        try {
          const res = await api.post('/orders', {
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            shippingPrice,
            totalPrice,
          });
          if (res.data?.order?._id) {
            orderIdStr = res.data.order._id.slice(-6).toUpperCase();
          }
        } catch (apiErr) {
          console.warn('Local API order creation fallback:', apiErr);
        }
      }

      // Generate structured WhatsApp message
      const waUrl = generateOrderWhatsAppUrl({
        orderId: orderIdStr,
        customerName: name,
        phone,
        shippingAddress,
        items: orderItems,
        totalPrice,
        paymentMethod,
        whatsappNumber,
      });

      // Clear local shopping cart
      dispatch(clearCart());

      // Save state to show success screen
      setCompletedOrder({
        orderId: orderIdStr,
        totalPrice,
        shippingAddress,
        orderItems,
      });
      setWhatsappOrderUrl(waUrl);

      toast.success('Order details created! Opening WhatsApp...');

      // Open WhatsApp in a new tab immediately
      window.open(waUrl, '_blank');
    } catch (err) {
      toast.error(err.message || 'Failed to process order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    toast.success('UPI ID copied to clipboard!');
  };

  // SUCCESS / CONFIRMATION SCREEN
  if (completedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-[#FDFBF7] border border-[#E5D9CB] rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center gap-6 shadow-xl">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-4xl shadow-sm">
            <FaCheckCircle />
          </div>

          <div>
            <h1 className="text-3xl font-extrabold text-[#2F1D15] font-['Syne']">Order Placed Successfully!</h1>
            <p className="text-[#7A6451] mt-2 text-sm">
              Your Order ID is <span className="text-[#B88E28] font-mono font-bold">#{completedOrder.orderId}</span>
            </p>
          </div>

          <div className="w-full bg-[#F5EDE3] border border-[#E5D9CB] rounded-2xl p-6 text-left flex flex-col gap-3">
            <h3 className="text-xs uppercase font-bold tracking-wider text-[#B88E28]">Delivery To</h3>
            <p className="text-sm font-bold text-[#2F1D15]">{completedOrder.shippingAddress.name} ({completedOrder.shippingAddress.phone})</p>
            <p className="text-xs text-[#7A6451]">
              {completedOrder.shippingAddress.address}, {completedOrder.shippingAddress.city}, {completedOrder.shippingAddress.state} - {completedOrder.shippingAddress.pincode}
            </p>
            <div className="border-t border-[#E5D9CB] pt-3 flex justify-between items-center">
              <span className="text-xs text-[#7A6451]">Total Bill Amount:</span>
              <span className="text-xl font-black text-[#2F1D15]">₹{completedOrder.totalPrice}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="w-full flex flex-col sm:flex-row gap-4">
            {/* Rule 7: Buttons: Gold with dark text */}
            <a
              href={whatsappOrderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 gold-gradient-btn py-4 px-6 rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer text-base uppercase tracking-wider font-extrabold"
            >
              <FaWhatsapp className="text-2xl text-[#23170F]" /> Send Order on WhatsApp
            </a>

            <Link
              to="/products"
              className="bg-[#FDFBF7] hover:bg-[#F5EDE3] border border-[#E5D9CB] text-[#2F1D15] font-semibold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-sm shadow-sm"
            >
              <FaArrowLeft /> Continue Shopping
            </Link>
          </div>

          {/* UPI Payment Info */}
          <div className="w-full bg-[#F5EDE3]/60 border border-[#E5D9CB] rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="text-left">
              <p className="text-xs text-[#B88E28] font-bold">Instant GPay / PhonePe / Paytm Payment:</p>
              <p className="text-sm text-[#2F1D15] font-mono font-bold mt-0.5">{upiId}</p>
            </div>
            <button
              onClick={copyUpiId}
              type="button"
              className="bg-[#FDFBF7] hover:bg-[#EAE0D3] border border-[#E5D9CB] text-xs text-[#2F1D15] font-semibold py-2 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <FaCopy /> Copy UPI ID
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2F1D15] font-['Syne']">Checkout & WhatsApp Order</h1>
        <p className="text-sm text-[#7A6451] mt-1">
          Complete your delivery details to send your order directly to our WhatsApp!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Shipping Form in Ivory / Cream card */}
        <div className="lg:col-span-2 bg-[#FDFBF7] border border-[#E5D9CB] rounded-3xl p-8 flex flex-col gap-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#2F1D15] font-['Syne'] flex items-center gap-2">
            📍 Delivery & Contact Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#7A6451] block mb-1 font-semibold">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Logendiran"
                className="w-full bg-[#F5EDE3]/50 border border-[#E5D9CB] rounded-xl px-4 py-2.5 text-[#2F1D15] focus:outline-none focus:border-[#D4AF37] focus:bg-[#FDFBF7]"
              />
            </div>
            <div>
              <label className="text-xs text-[#7A6451] block mb-1 font-semibold">WhatsApp Phone Number *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full bg-[#F5EDE3]/50 border border-[#E5D9CB] rounded-xl px-4 py-2.5 text-[#2F1D15] focus:outline-none focus:border-[#D4AF37] focus:bg-[#FDFBF7]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-[#7A6451] block mb-1 font-semibold">Email ID (Optional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. logan@gmail.com"
              className="w-full bg-[#F5EDE3]/50 border border-[#E5D9CB] rounded-xl px-4 py-2.5 text-[#2F1D15] focus:outline-none focus:border-[#D4AF37] focus:bg-[#FDFBF7]"
            />
          </div>

          <div>
            <label className="text-xs text-[#7A6451] block mb-1 font-semibold">Street Address (Door No, Building, Street) *</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 24, Gandhi Road, Near Bus Stand"
              className="w-full bg-[#F5EDE3]/50 border border-[#E5D9CB] rounded-xl px-4 py-2.5 text-[#2F1D15] focus:outline-none focus:border-[#D4AF37] focus:bg-[#FDFBF7]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-[#7A6451] block mb-1 font-semibold">City / Town *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Madurai / Chennai"
                className="w-full bg-[#F5EDE3]/50 border border-[#E5D9CB] rounded-xl px-4 py-2.5 text-[#2F1D15] focus:outline-none focus:border-[#D4AF37] focus:bg-[#FDFBF7]"
              />
            </div>
            <div>
              <label className="text-xs text-[#7A6451] block mb-1 font-semibold">State *</label>
              <input
                type="text"
                required
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                placeholder="e.g. Tamil Nadu"
                className="w-full bg-[#F5EDE3]/50 border border-[#E5D9CB] rounded-xl px-4 py-2.5 text-[#2F1D15] focus:outline-none focus:border-[#D4AF37] focus:bg-[#FDFBF7]"
              />
            </div>
            <div>
              <label className="text-xs text-[#7A6451] block mb-1 font-semibold">Pincode *</label>
              <input
                type="text"
                required
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="e.g. 625020"
                className="w-full bg-[#F5EDE3]/50 border border-[#E5D9CB] rounded-xl px-4 py-2.5 text-[#2F1D15] focus:outline-none focus:border-[#D4AF37] focus:bg-[#FDFBF7]"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="border-t border-[#E5D9CB] pt-6">
            <h3 className="text-lg font-bold text-[#2F1D15] mb-3 font-['Syne']">Payment & Confirmation</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="bg-[#F5EDE3]/40 border border-[#D4AF37] rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:bg-[#F5EDE3] transition-all">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'WhatsApp Order (UPI / GPay / COD)'}
                  onChange={() => setPaymentMethod('WhatsApp Order (UPI / GPay / COD)')}
                  className="accent-[#D4AF37] w-4 h-4 cursor-pointer"
                />
                <div>
                  <span className="text-sm font-bold text-[#2F1D15] block">WhatsApp Order</span>
                  <span className="text-xs text-[#7A6451]">Pay via GPay, PhonePe, or COD</span>
                </div>
              </label>

              <label className="bg-[#F5EDE3]/40 border border-[#E5D9CB] rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:bg-[#F5EDE3] transition-all">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'Cash on Delivery (COD)'}
                  onChange={() => setPaymentMethod('Cash on Delivery (COD)')}
                  className="accent-[#D4AF37] w-4 h-4 cursor-pointer"
                />
                <div>
                  <span className="text-sm font-bold text-[#2F1D15] block">Cash on Delivery</span>
                  <span className="text-xs text-[#7A6451]">Pay cash upon parcel delivery</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary in Ivory / Cream card */}
        <div className="bg-[#FDFBF7] border border-[#E5D9CB] rounded-3xl p-6 h-fit flex flex-col gap-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#2F1D15] font-['Syne']">Order Summary</h2>

          <div className="flex flex-col gap-3 max-h-60 overflow-y-auto border-b border-[#E5D9CB] pb-4">
            {cartItems?.filter(item => item.product).map((item) => (
              <div key={item._id} className="flex justify-between items-center text-xs text-[#7A6451] gap-2">
                <div className="truncate max-w-[70%]">
                  {/* Rule 4: Product names: Dark Brown */}
                  <span className="font-bold text-[#2F1D15] block truncate">{item.product.name}</span>
                  <span className="text-[11px] text-[#7A6451]">Size: {item.size || 'N/A'} | Qty: {item.quantity}</span>
                </div>
                {/* Rule 5: Prices: Dark Brown */}
                <span className="font-bold text-[#2F1D15] whitespace-nowrap">
                  ₹{(item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price) * item.quantity}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-[#7A6451]">Subtotal</span>
            <span className="font-bold text-[#2F1D15]">₹{itemsPrice}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-[#7A6451]">Shipping</span>
            <span className="text-emerald-700 font-bold">FREE DELIVERY</span>
          </div>
          <div className="border-t border-[#E5D9CB] pt-4 flex justify-between items-center">
            <span className="font-bold text-[#2F1D15]">Total Amount</span>
            {/* Rule 5: Prices: Dark Brown */}
            <span className="text-2xl font-black text-[#2F1D15]">₹{totalPrice}</span>
          </div>

          {/* Rule 7: Buttons: Gold with dark text */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full gold-gradient-btn disabled:opacity-50 py-4 px-6 rounded-xl text-center uppercase tracking-wider font-extrabold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer text-base"
          >
            <FaWhatsapp className="text-2xl text-[#23170F]" />
            {isSubmitting ? 'Creating Order...' : 'Confirm Order via WhatsApp'}
          </button>

          <p className="text-[11px] text-[#7A6451] text-center leading-relaxed">
            Clicking will save your order and open WhatsApp with your order items pre-formatted for instant confirmation.
          </p>
        </div>
      </form>
    </div>
  );
}
