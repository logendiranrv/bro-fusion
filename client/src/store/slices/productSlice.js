import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchProducts = createAsyncThunk('products/fetchAll', async (queryParams, thunkAPI) => {
  try {
    const response = await api.get('/products', { params: queryParams });
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
  }
});

export const fetchFeaturedProducts = createAsyncThunk('products/fetchFeatured', async (_, thunkAPI) => {
  try {
    const response = await api.get('/products/featured');
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch featured products');
  }
});

export const fetchNewArrivals = createAsyncThunk('products/fetchNewArrivals', async (_, thunkAPI) => {
  try {
    const response = await api.get('/products/new-arrivals');
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch new arrivals');
  }
});

export const fetchBestSellers = createAsyncThunk('products/fetchBestSellers', async (_, thunkAPI) => {
  try {
    const response = await api.get('/products/best-sellers');
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch best sellers');
  }
});

export const fetchProductBySlug = createAsyncThunk('products/fetchSingle', async (slug, thunkAPI) => {
  try {
    const response = await api.get(`/products/${slug}`);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch product details');
  }
});

export const fetchCategories = createAsyncThunk('products/fetchCategories', async (_, thunkAPI) => {
  try {
    const response = await api.get('/categories');
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
  }
});

const initialState = {
  items: [],
  featured: [],
  newArrivals: [],
  bestSellers: [],
  categories: [],
  currentProduct: null,
  total: 0,
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch all products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.products;
        state.total = action.payload.total || action.payload.products.length;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetch featured
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.featured = action.payload.products;
      })
      // fetch new arrivals
      .addCase(fetchNewArrivals.fulfilled, (state, action) => {
        state.newArrivals = action.payload.products;
      })
      // fetch best sellers
      .addCase(fetchBestSellers.fulfilled, (state, action) => {
        state.bestSellers = action.payload.products;
      })
      // fetch single product
      .addCase(fetchProductBySlug.pending, (state) => {
        state.loading = true;
        state.currentProduct = null;
      })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload.product;
      })
      .addCase(fetchProductBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetch categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload.categories;
      });
  },
});

export const { clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;
