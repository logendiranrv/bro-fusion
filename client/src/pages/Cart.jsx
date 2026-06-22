import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchCart, updateCartItem, removeFromCart } from '../store/slices/cartSlice';
import { FaTrash, FaArrowRight } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { items: cartItems, loading } = useSelector((state) => state.cart);

  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
    }
  }, [user, dispatch]);

  const handleQuantityChange = (item, newQty) => {
    if (newQty < 1) return;
    dispatch(
      updateCartItem({
        productId: item.product._id,
        quantity: newQty,
        size: item.size,
        color: item.color,
      })
    ).then((res) => {
      if (res.meta.requestStatus === 'fulfilled') {
        toast.success('Cart updated');
      }
    });
  };

  const handleRemove = (itemId) => {
    dispatch(removeFromCart(itemId)).then((res) => {
      if (res.meta.requestStatus === 'fulfilled') {
        toast.success('Item removed from cart');
      }
    });
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-24 px-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Please log in to view your cart</h2>
        <Link to="/login" className="bg-amber-500 hover:bg-amber-600 text-black font-bold py-2.5 px-6 rounded-full inline-block">
          Login
        </Link>
      </div>
    );
  }

  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price;
    return acc + price * item.quantity;
  }, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-white mb-8">Shopping Cart</h1>

      {loading ? (
        <div className="animate-pulse bg-zinc-900 border border-zinc-800 rounded-lg h-48 animate-duration-1000"></div>
      ) : cartItems?.length === 0 ? (
        <div className="text-center py-24 bg-zinc-900/30 border border-zinc-800 rounded-lg">
          <p className="text-zinc-500 mb-6">Your shopping cart is empty.</p>
          <Link to="/products" className="bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white font-semibold py-2.5 px-6 rounded-full inline-block">
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Items List */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {cartItems.map((item) => {
              if (!item.product) return null;
              const price = item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price;
              const itemImg = item.product.images?.[0]?.url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60';
              return (
                <div key={item._id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex gap-4 items-center">
                  <img src={itemImg} alt={item.product.name} className="w-20 h-24 object-cover rounded-md bg-zinc-950 border border-zinc-800" />
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.product.slug}`} className="font-semibold text-white hover:text-amber-400 transition-colors truncate block">
                      {item.product.name}
                    </Link>
                    <span className="text-xs text-zinc-500 block mt-1">
                      Size: <span className="text-zinc-300 font-semibold">{item.size || 'N/A'}</span> | Color:{' '}
                      <span className="text-zinc-300 font-semibold">{item.color || 'N/A'}</span>
                    </span>
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => handleQuantityChange(item, item.quantity - 1)}
                        className="text-zinc-400 hover:text-white text-base font-bold px-1 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-sm font-semibold text-white">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item, item.quantity + 1)}
                        className="text-zinc-400 hover:text-white text-base font-bold px-1 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-lg font-bold text-amber-400 block">₹{price * item.quantity}</span>
                    <span className="text-xs text-zinc-500 block">₹{price} each</span>
                    <button
                      onClick={() => handleRemove(item._id)}
                      className="text-zinc-500 hover:text-red-500 transition-colors p-2 mt-2 cursor-pointer"
                      title="Remove Item"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Checkout Summary */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 h-fit flex flex-col gap-6">
            <h2 className="text-xl font-bold text-white">Order Summary</h2>
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
              <span className="text-zinc-400">Subtotal</span>
              <span className="text-lg font-bold text-white">₹{subtotal}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Shipping</span>
              <span className="text-sm text-emerald-500 font-semibold">FREE</span>
            </div>
            <div className="border-t border-zinc-800 pt-4 flex justify-between items-center">
              <span className="font-bold text-white">Total</span>
              <span className="text-xl font-black text-amber-400">₹{subtotal}</span>
            </div>

            <Link
              to="/checkout"
              className="bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg text-center transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              Proceed to Checkout <FaArrowRight />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
