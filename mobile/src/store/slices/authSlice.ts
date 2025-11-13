import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authAPI } from '@/api/auth';
import { User, OTPVerifyData } from '@/types/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  otpRequested: boolean;
  otpPhone: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  otpRequested: false,
  otpPhone: null,
};

/**
 * Async Thunks
 */

// Request OTP
export const requestOTP = createAsyncThunk(
  'auth/requestOTP',
  async (phone: string, { rejectWithValue }) => {
    try {
      const response = await authAPI.requestOTP(phone);
      return { phone, message: response.message };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to request OTP');
    }
  }
);

// Verify OTP
export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async (data: OTPVerifyData, { rejectWithValue }) => {
    try {
      const response = await authAPI.verifyOTP(data);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.error || 'OTP verification failed');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to verify OTP');
    }
  }
);

// Logout
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      if (state.auth.refreshToken) {
        await authAPI.logout(state.auth.refreshToken);
      }
      return null;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Logout failed');
    }
  }
);

// Load stored auth data
export const loadStoredAuth = createAsyncThunk(
  'auth/loadStored',
  async (_, { rejectWithValue }) => {
    try {
      const accessToken = await AsyncStorage.getItem('@handygh:access_token');
      const refreshToken = await AsyncStorage.getItem('@handygh:refresh_token');
      const userJson = await AsyncStorage.getItem('@handygh:user');

      if (accessToken && refreshToken && userJson) {
        const user = JSON.parse(userJson);
        return { accessToken, refreshToken, user };
      }

      return null;
    } catch (error) {
      return rejectWithValue('Failed to load stored authentication');
    }
  }
);

/**
 * Auth Slice
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearOTPRequest: (state) => {
      state.otpRequested = false;
      state.otpPhone = null;
    },
  },
  extraReducers: (builder) => {
    // Request OTP
    builder
      .addCase(requestOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(requestOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.otpRequested = true;
        state.otpPhone = action.payload.phone;
      })
      .addCase(requestOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Verify OTP
    builder
      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        state.otpRequested = false;
        state.otpPhone = null;

        // Store user data
        AsyncStorage.setItem('@handygh:user', JSON.stringify(action.payload.user));
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.error = null;

        // Clear stored data
        AsyncStorage.removeItem('@handygh:user');
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Load stored auth
    builder
      .addCase(loadStoredAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;
        }
      });
  },
});

export const { clearError, clearOTPRequest } = authSlice.actions;
export default authSlice.reducer;
