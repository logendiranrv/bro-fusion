import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, thunkAPI) => {
  try {
    const response = await api.get('/wishlist');
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch wishlist');
  }
});

export const toggleWishlist = createAsyncThunk('wishlist/toggle', async (productId, thunkAPI) => {
  try {
    const response = await api.post(`/wishlist/toggle/${productId}`);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to toggle wishlist');
  }
});

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.wishlist || [];
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        state.items = action.payload.wishlist || [];
      });
  },
});

export default wishlistSlice.reducer;
