import api from '../lib/apiClient';

export const authService = {
  // Sign up a new user
  async signUp(userData) {
    try {
      const response = await api.post('/api/v1/auth/register', userData);
      
      // Store tokens
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Sign in user
  async signIn(email, password) {
    try {
      const response = await api.post('/api/v1/auth/login', { email, password });
      
      // Store tokens
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Sign out user
  async signOut() {
    try {
      // Clear local tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Call backend logout if needed
      try {
        await api.post('/api/v1/auth/logout');
      } catch (error) {
        // Ignore backend logout errors
        console.warn('Backend logout failed:', error);
      }
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  // Get current user session
  async getSession() {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        return { session: null, error: null };
      }
      
      const response = await api.get('/api/v1/auth/me');
      return { session: response.data, error: null };
    } catch (error) {
      return { session: null, error };
    }
  },

  // Get user profile
  async getUserProfile(userId) {
    try {
      const response = await api.get(`/api/v1/users/${userId}`);
      return { profile: response.data, error: null };
    } catch (error) {
      return { profile: null, error };
    }
  },

  // Get provider profile (if user is a provider)
  async getProviderProfile(userId) {
    try {
      const response = await api.get(`/api/v1/providers/profile/${userId}`);
      return { profile: response.data, error: null };
    } catch (error) {
      return { profile: null, error };
    }
  },

  // Update user profile
  async updateUserProfile(userId, updates) {
    try {
      const response = await api.patch(`/api/v1/users/${userId}`, updates);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update provider profile
  async updateProviderProfile(userId, updates) {
    try {
      const response = await api.patch(`/api/v1/providers/profile/${userId}`, updates);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Social login
  async signInWithOAuth(provider) {
    try {
      const response = await api.post('/api/v1/auth/oauth', { provider });
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Reset password
  async resetPassword(email) {
    try {
      const response = await api.post('/api/v1/auth/reset-password', { email });
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Verify OTP
  async verifyOTP(email, otp) {
    try {
      const response = await api.post('/api/v1/auth/verify-otp', { email, otp });
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
};