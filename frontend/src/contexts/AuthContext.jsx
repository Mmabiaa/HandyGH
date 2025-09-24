// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../lib/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const userData = localStorage.getItem('handygh_user');
    const accessToken = localStorage.getItem('accessToken');
    
    if (userData && accessToken) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser && parsedUser.id) {
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('handygh_user');
        localStorage.removeItem('accessToken');
      }
    }
    setIsLoading(false);
  }, []);

  const requestOTP = async (phone) => {
    try {
      const response = await apiClient.post('/auth/otp/request', { phone });
      return response.data;
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.errors?.message || 'Failed to send OTP' 
      };
    }
  };

  const verifyOTP = async (phone, otp) => {
    try {
      const response = await apiClient.post('/auth/otp/verify', { phone, otp });
      const { user, accessToken, refreshToken } = response.data.data;
      
      // Store tokens and user data
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('handygh_user', JSON.stringify(user));
      
      setUser(user);
      setIsAuthenticated(true);
      
      return { success: true, user };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.errors?.message || 'OTP verification failed' 
      };
    }
  };

  const loginUser = async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      const { user, accessToken, refreshToken } = response.data;
      
      // Store tokens and user data
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('handygh_user', JSON.stringify(user));
      
      setUser(user);
      setIsAuthenticated(true);
      
      return { success: true, user };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error?.message || 'Login failed' 
      };
    }
  };

  const registerUser = async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      const { user, accessToken, refreshToken } = response.data;
      
      // Store tokens and user data
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('handygh_user', JSON.stringify(user));
      
      setUser(user);
      setIsAuthenticated(true);
      
      return { success: true, user };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error?.message || 'Registration failed' 
      };
    }
  };

  const logoutUser = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('handygh_user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    setIsAuthenticated(!!userData);
    if (userData) {
      localStorage.setItem('handygh_user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('handygh_user');
    }
  };

  // Helper functions for role-based access
  const isCustomer = () => user?.role === 'CUSTOMER';
  const isProvider = () => user?.role === 'PROVIDER';
  const isAdmin = () => user?.role === 'ADMIN';
  const hasRole = (role) => user?.role === role;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login: loginUser,
        logout: logoutUser,
        register: registerUser,
        requestOTP,
        verifyOTP,
        updateUser,
        isCustomer,
        isProvider,
        isAdmin,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};