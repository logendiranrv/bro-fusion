import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearCart } from '../store/slices/cartSlice';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OTP phone verification state
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const handleSendOtp = () => {
    if (!phone) {
      toast.error('Please enter a phone number first');
      return;
    }
    setIsSendingOtp(true);
    setTimeout(() => {
      setIsSendingOtp(false);
      setShowOtpInput(true);
      toast.success("Simulated OTP sent! Enter '1234' to verify.");
    }, 800);
  };

  const handleVerifyOtp = () => {
    if (otpCode === '1234') {
      setIsPhoneVerified(true);
      setShowOtpInput(false);
      toast.success('Phone number verified successfully!');
    } else {
      toast.error("Invalid verification code! Use '1234' for testing.");
    }
  };

  useEffect(() => {
    if (!user) {
      toast.error('Please log in to checkout');
      navigate('/login');
    } else if (cartItems?.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
    }
  }, [user, cartItems, navigate]);

  const itemsPrice = cartItems?.reduce((acc, item) => {
    if (!item.product) return acc;
    const price = item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price;
    return acc + price * item.quantity;
  }, 0) || 0;

  const shippingPrice = 0;
  const totalPrice = itemsPrice + shippingPrice;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address || !city || !stateName || !pincode) {
      toast.error('Please fill in all shipping details');
      return;
    }
    if (!isPhoneVerified) {
      toast.error('Please verify your phone number first');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderItems = cartItems
        .filter((item) => item.product)
        .map((item) => ({
          product: item.product._id,
          name: item.product.name,
          image: item.product.images?.[0]?.url || '',
          price: item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        }));

      const shippingAddress = { name, email, address, city, state: stateName, pincode, phone };

      const response = await api.post('/orders', {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        totalPrice,
      });

      if (response.data.success) {
        toast.success('Order placed successfully!');
        dispatch(clearCart());
        navigate(`/order/${response.data.order._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-white mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Shipping Form */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-lg p-8 flex flex-col gap-6">
          <h2 className="text-xl font-bold text-white">Shipping Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Recipient Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-200 focus:outline-none focus:border-zinc-700"
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
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-200 focus:outline-none focus:border-zinc-700"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1">Contact Phone</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="tel"
                  required
                  disabled={isPhoneVerified}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-4 pr-24 py-2.5 text-zinc-200 focus:outline-none focus:border-zinc-700 disabled:opacity-75"
                />
                {isPhoneVerified && (
                  <span className="absolute right-3 top-2.5 text-xs text-emerald-500 font-bold flex items-center gap-1 select-none py-1 px-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                    ✓ Verified
                  </span>
                )}
              </div>
              
              {!isPhoneVerified && (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp || !phone}
                  className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black text-xs font-bold py-2.5 px-4 rounded-lg cursor-pointer transition-all border-0 shadow"
                >
                  {isSendingOtp ? 'Sending...' : showOtpInput ? 'Resend' : 'Verify'}
                </button>
              )}
            </div>

            {showOtpInput && !isPhoneVerified && (
              <div className="mt-3 p-4 bg-zinc-950 border border-zinc-800 rounded-lg flex flex-col gap-2">
                <p className="text-xs text-zinc-400">Enter validation code (Use <strong className="text-amber-500">1234</strong> for testing):</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength="4"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="OTP Code"
                    className="w-24 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-center text-sm font-bold text-zinc-200 tracking-widest focus:outline-none focus:border-zinc-700"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2 px-4 rounded-lg cursor-pointer transition-colors border-0"
                  >
                    Confirm OTP
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1">Street Address</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Apartment, suite, unit, building, street, etc."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-200 focus:outline-none focus:border-zinc-700"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">City</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-200 focus:outline-none focus:border-zinc-700"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">State / Province</label>
              <input
                type="text"
                required
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                placeholder="State"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-200 focus:outline-none focus:border-zinc-700"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Pincode</label>
              <input
                type="text"
                required
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Pincode"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-200 focus:outline-none focus:border-zinc-700"
              />
            </div>
          </div>

          {/* Payment Options */}
          <div className="border-t border-zinc-800 pt-6">
            <h3 className="text-lg font-bold text-white mb-4">Payment Method</h3>
            <div className="flex gap-4">
              <label className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg p-4 flex items-center gap-3 cursor-pointer hover:border-zinc-700 transition-all">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'Cash on Delivery'}
                  onChange={() => setPaymentMethod('Cash on Delivery')}
                  className="accent-amber-500"
                />
                <span className="text-sm font-semibold text-zinc-200">Cash on Delivery (COD)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 h-fit flex flex-col gap-6">
          <h2 className="text-xl font-bold text-white">Summary</h2>

          <div className="flex flex-col gap-3 max-h-48 overflow-y-auto border-b border-zinc-800 pb-4">
            {cartItems?.filter(item => item.product).map((item) => (
              <div key={item._id} className="flex justify-between text-xs text-zinc-400">
                <span className="truncate max-w-[70%]">
                  {item.product.name} (x{item.quantity})
                </span>
                <span className="font-bold text-zinc-200">
                  ₹{(item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price) * item.quantity}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-400">Items Total</span>
            <span className="font-bold text-white">₹{itemsPrice}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-400">Shipping</span>
            <span className="text-emerald-500 font-bold">FREE</span>
          </div>
          <div className="border-t border-zinc-800 pt-4 flex justify-between items-center">
            <span className="font-bold text-white">Order Total</span>
            <span className="text-xl font-black text-amber-400">₹{totalPrice}</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !isPhoneVerified}
            className="w-full bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-lg text-center transition-all shadow-lg flex items-center justify-center cursor-pointer"
          >
            {isSubmitting ? 'Processing Order...' : !isPhoneVerified ? 'Verify Phone to Order' : 'Place Order'}
          </button>
        </div>
      </form>
    </div>
  );
}
