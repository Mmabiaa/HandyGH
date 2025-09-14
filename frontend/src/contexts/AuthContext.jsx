// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation, useRegisterMutation } from '../store/slices/apiSlice';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [login, { isLoading: loginLoading }] = useLoginMutation();
  const [register, { isLoading: registerLoading }] = useRegisterMutation();

  const loginUser = async (credentials) => {
    try {
      const result = await login(credentials).unwrap();
      localStorage.setItem('token', result.token);
      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.data?.message || 'Login failed' };
    }
  };

  const registerUser = async (userData) => {
    try {
      const result = await register(userData).unwrap();
      localStorage.setItem('token', result.token);
      navigate('/onboarding');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.data?.message || 'Registration failed' };
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    dispatch(logout());
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login: loginUser,
        logout: logoutUser,
        register: registerUser,
        isLoading: loginLoading || registerLoading,
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