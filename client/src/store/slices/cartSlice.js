import { createSlice } from '@reduxjs/toolkit';

const CART_STORAGE_KEY = 'bro_fusion_cart';

const loadCartFromStorage = () => {
  try {
    const data = localStorage.getItem(CART_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Failed to load cart from storage:', err);
    return [];
  }
};

const saveCartToStorage = (items) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save cart to storage:', err);
  }
};

const initialState = {
  items: loadCartFromStorage(),
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    fetchCart: (state) => {
      state.items = loadCartFromStorage();
    },
    addItemToCart: (state, action) => {
      const { product, quantity = 1, size = 'Standard', color = 'Default' } = action.payload;
      const productId = product._id || product.id;
      
      const existingIndex = state.items.findIndex(
        (item) =>
          (item.product?._id === productId || item.product?.id === productId) &&
          item.size === size &&
          item.color === color
      );

      if (existingIndex > -1) {
        state.items[existingIndex].quantity += Number(quantity);
      } else {
        const newItem = {
          _id: `${productId}-${size}-${color}-${Date.now()}`,
          product: {
            _id: productId,
            id: productId,
            name: product.name,
            slug: product.slug,
            price: Number(product.price),
            discountPrice: Number(product.discountPrice || 0),
            images: product.images || [],
          },
          quantity: Number(quantity),
          size,
          color,
        };
        state.items.push(newItem);
      }
      saveCartToStorage(state.items);
    },
    updateCartItemQuantity: (state, action) => {
      const { itemId, quantity } = action.payload;
      const item = state.items.find((i) => i._id === itemId);
      if (item) {
        item.quantity = Math.max(1, Number(quantity));
        saveCartToStorage(state.items);
      }
    },
    removeItemFromCart: (state, action) => {
      const itemId = action.payload;
      state.items = state.items.filter((i) => i._id !== itemId);
      saveCartToStorage(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      saveCartToStorage([]);
    },
  },
});

export const {
  fetchCart,
  addItemToCart,
  updateCartItemQuantity,
  removeItemFromCart,
  clearCart,
} = cartSlice.actions;

// Backwards compatibility aliases
export const addToCart = addItemToCart;
export const updateCartItem = updateCartItemQuantity;
export const removeFromCart = removeItemFromCart;

export default cartSlice.reducer;
