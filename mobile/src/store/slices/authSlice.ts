import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '@/api/auth';
import { User, OTPVerifyData } from '@/types/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

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

// Storage keys
const USER_KEY = '@handygh:user';
const TOKEN_KEY = 'handygh_access_token';
const REFRESH_TOKEN_KEY = 'handygh_refresh_token';

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
      return rejectWithValue(
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to request OTP'
      );
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
        // Store tokens securely
        await SecureStore.setItemAsync(TOKEN_KEY, response.data.access_token);
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, response.data.refresh_token);

        // Store user data in AsyncStorage
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data.user));

        return response.data;
      }
      return rejectWithValue(response.error || 'OTP verification failed');
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to verify OTP'
      );
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
        // Call logout API (best effort - don't fail if it errors)
        try {
          await authAPI.logout(state.auth.refreshToken);
        } catch (apiError) {
          console.warn('Logout API call failed:', apiError);
        }
      }

      // Clear all stored data
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);

      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

// Load stored auth data
export const loadStoredAuth = createAsyncThunk(
  'auth/loadStored',
  async (_, { rejectWithValue }) => {
    try {
      // Load tokens from secure storage
      const accessToken = await SecureStore.getItemAsync(TOKEN_KEY);
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

      // Load user data from AsyncStorage
      const userJson = await AsyncStorage.getItem(USER_KEY);

      if (accessToken && refreshToken && userJson) {
        const user = JSON.parse(userJson);
        return { accessToken, refreshToken, user };
      }

      return null;
    } catch (error) {
      console.error('Failed to load stored auth:', error);
      return rejectWithValue('Failed to load stored authentication');
    }
  }
);

// Update user role (for role selection)
export const updateUserRole = createAsyncThunk(
  'auth/updateRole',
  async (role: 'CUSTOMER' | 'PROVIDER', { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      if (!state.auth.user) {
        return rejectWithValue('No user found');
      }

      // Update user role via API
      const response = await authAPI.getCurrentUser();

      if (response.success && response.data) {
        // Update stored user data
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data));
        return response.data;
      }

      return rejectWithValue('Failed to update user role');
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to update user role'
      );
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
    setUser: (state, action) => {
      state.user = action.payload;
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
        // Reset to initial state
        return { ...initialState };
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        // Even if logout fails, clear local state
        return { ...initialState, error: action.payload as string };
      });

    // Load stored auth
    builder
      .addCase(loadStoredAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadStoredAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;
        }
      })
      .addCase(loadStoredAuth.rejected, (state) => {
        state.isLoading = false;
      });

    // Update user role
    builder
      .addCase(updateUserRole.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearOTPRequest, setUser } = authSlice.actions;
export default authSlice.reducer;
