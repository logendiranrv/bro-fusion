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
      <div className="max-w-md w-full bg-[#10121A] border border-[#202434] rounded-2xl p-8 shadow-2xl flex flex-col gap-6">
        <div className="text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-[#08090D] rounded-full flex items-center justify-center border border-[#202434] mb-4">
            <FaSearchLocation className="text-3xl text-amber-400" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Shipment Status</span>
          <h2 className="text-3xl font-extrabold text-white mt-1 font-['Syne']">Track Your Order</h2>
          <p className="text-xs text-zinc-400 mt-2">Enter your Order ID (e.g. #BF-123456) to check the current delivery progress.</p>
        </div>

        <form onSubmit={handleTrack} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">Order ID</label>
            <input
              type="text"
              required
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. BF-839201 or order number"
              className="w-full bg-[#08090D] border border-[#202434] rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          <button
            type="submit"
            disabled={!orderId.trim()}
            className="gold-gradient-btn w-full mt-2 py-3.5 rounded-xl uppercase tracking-wider text-xs cursor-pointer shadow-xl disabled:opacity-50"
          >
            Track Shipment
          </button>
        </form>
      </div>
    </div>
  );
}
