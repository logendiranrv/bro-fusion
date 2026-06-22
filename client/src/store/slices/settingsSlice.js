import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Fetch all settings
export const fetchSettings = createAsyncThunk('settings/fetchSettings', async (_, thunkAPI) => {
  try {
    const response = await api.get('/settings');
    return response.data.settings;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch settings');
  }
});

// Update or create a single setting
export const updateSetting = createAsyncThunk('settings/updateSetting', async ({ key, value }, thunkAPI) => {
  try {
    const response = await api.post('/settings', { key, value });
    return { key, value };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update setting');
  }
});

const initialState = {
  settings: {},
  loading: false,
  error: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Settings
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Setting
      .addCase(updateSetting.fulfilled, (state, action) => {
        state.settings[action.payload.key] = action.payload.value;
      });
  },
});

export default settingsSlice.reducer;
