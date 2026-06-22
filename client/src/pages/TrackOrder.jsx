import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearchLocation } from 'react-icons/fa';

export default function TrackOrder() {
  const [orderId, setOrderId] = useState('');
  const navigate = useNavigate();

  const handleTrack = (e) => {
    e.preventDefault();
    if (orderId.trim()) {
      navigate(`/order/${orderId.trim()}`);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl flex flex-col gap-6">
        <div className="text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-zinc-950 rounded-full flex items-center justify-center border border-zinc-800 mb-4">
            <FaSearchLocation className="text-3xl text-amber-500" />
          </div>
          <h2 className="text-3xl font-extrabold text-white">Track Your Order</h2>
          <p className="text-sm text-zinc-400 mt-2">Enter your Order ID to check the current status and shipment details.</p>
        </div>

        <form onSubmit={handleTrack} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Order ID</label>
            <input
              type="text"
              required
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. 6a3951da41498352..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-200 focus:outline-none focus:border-zinc-700"
            />
          </div>

          <button
            type="submit"
            disabled={!orderId.trim()}
            className="w-full mt-2 bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-lg shadow-lg cursor-pointer transition-all"
          >
            Track Order
          </button>
        </form>
      </div>
    </div>
  );
}
