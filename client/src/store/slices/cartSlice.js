import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchCart = createAsyncThunk('cart/fetch', async (_, thunkAPI) => {
  try {
    const response = await api.get('/cart');
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
  }
});

export const addToCart = createAsyncThunk('cart/add', async (itemData, thunkAPI) => {
  try {
    const response = await api.post('/cart/add', itemData);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to add item');
  }
});

export const updateCartItem = createAsyncThunk('cart/update', async (itemData, thunkAPI) => {
  try {
    const response = await api.put('/cart/update', itemData);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update item');
  }
});

export const removeFromCart = createAsyncThunk('cart/remove', async (itemId, thunkAPI) => {
  try {
    const response = await api.delete(`/cart/remove/${itemId}`);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to remove item');
  }
});

export const clearCart = createAsyncThunk('cart/clear', async (_, thunkAPI) => {
  try {
    const response = await api.delete('/cart/clear');
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
  }
});

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.cart?.items || [];
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items = action.payload.cart?.items || [];
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.items = action.payload.cart?.items || [];
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = action.payload.cart?.items || [];
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
      });
  },
});

export default cartSlice.reducer;
