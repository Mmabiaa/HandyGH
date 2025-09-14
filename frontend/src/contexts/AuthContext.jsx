// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in on app start
    const userData = localStorage.getItem('handygh_user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.isAuthenticated) {
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('handygh_user');
      }
    }
  }, []);

  const loginUser = async (credentials) => {
    try {
      // This would normally make an API call
      // For now, we'll use the mock logic from the login page
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const registerUser = async (userData) => {
    try {
      // This would normally make an API call
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('handygh_user');
    localStorage.removeItem('accessToken');
    setUser(null);
    setIsAuthenticated(false);
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

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login: loginUser,
        logout: logoutUser,
        register: registerUser,
        updateUser,
        isLoading: false,
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