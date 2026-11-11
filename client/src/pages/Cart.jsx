import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchCart, updateCartItem, removeFromCart } from '../store/slices/cartSlice';
import { FaTrash, FaArrowRight } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function Cart() {
  const dispatch = useDispatch();
  const { items: cartItems, loading } = useSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleQuantityChange = (item, newQty) => {
    if (newQty < 1) return;
    dispatch(updateCartItem({ itemId: item._id, quantity: newQty }));
  };

  const handleRemove = (itemId) => {
    dispatch(removeFromCart(itemId));
    toast.success('Item removed from cart');
  };

  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price;
    return acc + price * item.quantity;
  }, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2F1D15] mb-8 font-['Syne']">Shopping Cart</h1>

      {loading ? (
        <div className="animate-pulse bg-[#FDFBF7] border border-[#E5D9CB] rounded-2xl h-48"></div>
      ) : cartItems?.length === 0 ? (
        <div className="text-center py-24 bg-[#FDFBF7] border border-[#E5D9CB] rounded-2xl shadow-sm">
          <p className="text-[#7A6451] mb-6 font-medium">Your shopping cart is empty.</p>
          {/* Rule 7: Buttons: Gold with dark text */}
          <Link to="/products" className="gold-gradient-btn py-3.5 px-8 rounded-full inline-block uppercase tracking-wider text-xs shadow-md">
            Shop Drops Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Items List in Ivory / Cream cards */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {cartItems.map((item) => {
              if (!item.product) return null;
              const price = item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price;
              const itemImg = item.product.images?.[0]?.url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60';
              return (
                /* Rule 3: Ivory / Cream card */
                <div key={item._id} className="bg-[#FDFBF7] border border-[#E5D9CB] rounded-2xl p-4 flex gap-4 items-center shadow-sm">
                  <img src={itemImg} alt={item.product.name} className="w-20 h-24 object-cover rounded-xl bg-[#F5EDE3] border border-[#E5D9CB]" />
                  <div className="flex-1 min-w-0">
                    {/* Rule 4: Product names: Dark Brown */}
                    <Link to={`/product/${item.product.slug}`} className="font-bold text-[#2F1D15] hover:text-[#B88E28] transition-colors truncate block">
                      {item.product.name}
                    </Link>
                    <span className="text-xs text-[#7A6451] block mt-1">
                      Size: <span className="text-[#2F1D15] font-semibold">{item.size || 'N/A'}</span> | Color:{' '}
                      <span className="text-[#2F1D15] font-semibold">{item.color || 'N/A'}</span>
                    </span>
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() => handleQuantityChange(item, item.quantity - 1)}
                        className="w-7 h-7 rounded-lg bg-[#F5EDE3] border border-[#E5D9CB] text-[#2F1D15] hover:bg-[#EAE0D3] flex items-center justify-center font-bold text-sm cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-sm font-bold text-[#2F1D15]">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item, item.quantity + 1)}
                        className="w-7 h-7 rounded-lg bg-[#F5EDE3] border border-[#E5D9CB] text-[#2F1D15] hover:bg-[#EAE0D3] flex items-center justify-center font-bold text-sm cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  {/* Rule 5: Prices: Dark Brown */}
                  <div className="text-right flex flex-col items-end">
                    <span className="text-lg font-black text-[#2F1D15] block">₹{price * item.quantity}</span>
                    <span className="text-xs text-[#8C7765] block">₹{price} each</span>
                    <button
                      onClick={() => handleRemove(item._id)}
                      className="text-[#7A6451] hover:text-red-500 transition-colors p-2 mt-2 cursor-pointer"
                      title="Remove Item"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Checkout Summary in Ivory / Cream card */}
          <div className="bg-[#FDFBF7] border border-[#E5D9CB] rounded-2xl p-6 h-fit flex flex-col gap-6 shadow-md">
            <h2 className="text-xl font-bold text-[#2F1D15] font-['Syne']">Order Summary</h2>
            <div className="flex justify-between items-center border-b border-[#E5D9CB] pb-4">
              <span className="text-[#7A6451]">Subtotal</span>
              <span className="text-lg font-bold text-[#2F1D15]">₹{subtotal}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#7A6451]">Shipping</span>
              <span className="text-sm text-emerald-700 font-bold">FREE DELIVERY</span>
            </div>
            <div className="border-t border-[#E5D9CB] pt-4 flex justify-between items-center">
              <span className="font-bold text-[#2F1D15]">Total</span>
              <span className="text-2xl font-black text-[#2F1D15]">₹{subtotal}</span>
            </div>

            {/* Rule 7: Buttons: Gold with dark text */}
            <Link
              to="/checkout"
              className="gold-gradient-btn w-full py-4 px-6 rounded-xl text-center uppercase tracking-wider text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              Proceed to WhatsApp Checkout <FaArrowRight />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
