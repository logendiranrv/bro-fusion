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
      <div className="max-w-md w-full bg-[#FDFBF7] border border-[#E5D9CB] rounded-3xl p-8 shadow-sm flex flex-col gap-6">
        <div className="text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-[#F5EDE3] rounded-2xl flex items-center justify-center border border-[#E5D9CB] mb-4">
            <FaSearchLocation className="text-3xl text-[#B88E28]" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#B88E28]">Shipment Status</span>
          <h2 className="text-3xl font-extrabold text-[#2F1D15] mt-1 font-['Syne']">Track Your Order</h2>
          <p className="text-xs text-[#7A6451] mt-2">Enter your Order ID (e.g. #BF-123456) to check the current delivery progress.</p>
        </div>

        <form onSubmit={handleTrack} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#7A6451] block mb-1.5">Order ID</label>
            <input
              type="text"
              required
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. BF-839201 or order number"
              className="w-full bg-[#F5EDE3]/50 border border-[#E5D9CB] rounded-xl px-4 py-3 text-sm text-[#2F1D15] focus:outline-none focus:border-[#D4AF37] focus:bg-[#FDFBF7]"
            />
          </div>

          {/* Rule 7: Buttons: Gold with dark text */}
          <button
            type="submit"
            disabled={!orderId.trim()}
            className="gold-gradient-btn w-full mt-2 py-3.5 rounded-xl uppercase tracking-wider text-xs cursor-pointer shadow-md disabled:opacity-50"
          >
            Track Shipment
          </button>
        </form>
      </div>
    </div>
  );
}
