import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${id}`);
        if (response.data.success) {
          setOrder(response.data.order);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto my-24 px-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Order not found</h2>
        <Link to="/products" className="bg-amber-500 hover:bg-amber-600 text-black font-bold py-2.5 px-6 rounded-full inline-block">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-8">
      <div>
        <span className="text-sm text-zinc-500">Thank you for your order!</span>
        <h1 className="text-3xl font-extrabold text-white mt-1">Order #{order._id}</h1>
        <p className="text-xs text-zinc-400 mt-1">Placed on {new Date(order.createdAt).toLocaleString()}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col gap-2">
          <span className="text-xs uppercase text-zinc-500 font-bold">Status</span>
          <span className="text-lg font-bold text-amber-400 capitalize">{order.status}</span>
        </div>

        {/* Payment */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col gap-2">
          <span className="text-xs uppercase text-zinc-500 font-bold">Payment Method</span>
          <span className="text-lg font-bold text-zinc-200">{order.paymentMethod}</span>
        </div>

        {/* Total Price */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col gap-2">
          <span className="text-xs uppercase text-zinc-500 font-bold">Order Total</span>
          <span className="text-lg font-bold text-emerald-400">₹{order.totalPrice}</span>
        </div>
      </div>

      {/* Tracking Stepper */}
      {order.status !== 'cancelled' ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 flex flex-col gap-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-2">Order Tracking</h2>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative select-none">
            {/* Horizontal Line between steps (hidden on mobile) */}
            <div className="absolute top-5 left-12 right-12 h-1 bg-zinc-800 hidden md:block -z-10">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500" 
                style={{ 
                  width: order.status === 'delivered' ? '100%' : 
                         order.status === 'shipped' ? '66%' : 
                         (order.status === 'confirmed' || order.status === 'processing') ? '33%' : '0%' 
                }}
              />
            </div>

            {/* Step 1: Placed */}
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-amber-500 text-black shadow-lg">
                1
              </div>
              <span className="text-sm font-semibold text-zinc-100 mt-2">Ordered</span>
              <span className="text-[10px] text-zinc-400 mt-0.5">We have received your order</span>
            </div>

            {/* Step 2: Processing */}
            <div className="flex flex-col items-center text-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status)
                  ? 'bg-amber-500 text-black shadow-lg' 
                  : 'bg-zinc-850 text-zinc-500 border border-zinc-800'
              }`}>
                2
              </div>
              <span className="text-sm font-semibold text-zinc-100 mt-2">Processing</span>
              <span className="text-[10px] text-zinc-400 mt-0.5">Preparing your streetwear drops</span>
            </div>

            {/* Step 3: Shipped */}
            <div className="flex flex-col items-center text-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                ['shipped', 'delivered'].includes(order.status)
                  ? 'bg-amber-500 text-black shadow-lg' 
                  : 'bg-zinc-850 text-zinc-500 border border-zinc-800'
              }`}>
                3
              </div>
              <span className="text-sm font-semibold text-zinc-100 mt-2">Shipped</span>
              <span className="text-[10px] text-zinc-400 mt-0.5">In transit via courier partners</span>
            </div>

            {/* Step 4: Delivered */}
            <div className="flex flex-col items-center text-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                order.status === 'delivered'
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' 
                  : 'bg-zinc-850 text-zinc-500 border border-zinc-800'
              }`}>
                4
              </div>
              <span className="text-sm font-semibold text-zinc-100 mt-2">Delivered</span>
              <span className="text-[10px] text-zinc-400 mt-0.5">Package arrived safely</span>
            </div>
          </div>

          {/* Courier Details and Tracking ID */}
          {order.trackingId && (
            <div className="mt-6 p-4 bg-zinc-950 border border-zinc-800 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-xs uppercase text-zinc-500 font-bold block">Courier Service</span>
                <span className="text-sm font-semibold text-zinc-200 block">{order.courierService}</span>
                <span className="text-[10px] text-zinc-400 mt-0.5 block">Your package has been dispatched.</span>
              </div>
              <div className="flex-1 max-w-xs">
                <span className="text-xs uppercase text-zinc-500 font-bold block">Tracking ID</span>
                <code className="text-sm font-mono font-bold text-amber-500 block">{order.trackingId}</code>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(order.trackingId);
                  toast.success('Tracking ID copied to clipboard!');
                }}
                className="bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold py-2 px-4 rounded-lg cursor-pointer transition-colors border-0"
              >
                Copy Tracking ID
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-red-950/20 border border-red-900/50 text-red-400 rounded-lg p-6 flex flex-col gap-1">
          <h2 className="text-lg font-bold">Order Cancelled</h2>
          <p className="text-sm">This order was cancelled. Reason: {order.cancelReason || 'Not provided'}</p>
        </div>
      )}

      {/* Shipping Address */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-white">Shipping Address</h2>
        <div className="text-sm text-zinc-300 flex flex-col gap-1">
          <p className="font-bold text-zinc-100">{order.shippingAddress.name}</p>
          <p>{order.shippingAddress.address}</p>
          <p>{order.shippingAddress.city}</p>
          <p className="mt-2 text-xs text-zinc-500">Phone: {order.shippingAddress.phone}</p>
        </div>
      </div>

      {/* Items list */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-white">Order Items</h2>
        <div className="flex flex-col gap-4">
          {order.orderItems.map((item) => (
            <div key={item._id} className="flex items-center gap-4 border-b border-zinc-800/50 pb-4 last:border-0 last:pb-0">
              <img src={item.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60'} alt={item.name} className="w-16 h-20 object-cover rounded bg-zinc-950 border border-zinc-800" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{item.name}</p>
                <span className="text-xs text-zinc-500">
                  Size: <span className="text-zinc-300 font-semibold">{item.size || 'N/A'}</span> | Color:{' '}
                  <span className="text-zinc-300 font-semibold">{item.color || 'N/A'}</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-amber-400 block">₹{item.price * item.quantity}</span>
                <span className="text-xs text-zinc-500 block">
                  ₹{item.price} x {item.quantity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
