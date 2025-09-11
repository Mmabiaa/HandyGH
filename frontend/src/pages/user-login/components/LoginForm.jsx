import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const LoginForm = ({ onSubmit, isLoading, error }) => {
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [formErrors, setFormErrors] = useState({});

  // Mock credentials for testing
  const mockCredentials = [
    { type: 'Customer', email: 'customer@handygh.com', password: 'customer123' },
    { type: 'Provider', email: 'provider@handygh.com', password: 'provider123' },
    { type: 'Admin', email: 'admin@handygh.com', password: 'admin123' }
  ];

  const validateForm = () => {
    const errors = {};
    
    if (!formData?.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData?.password) {
      errors.password = 'Password is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const { data, error } = await signIn(formData?.email, formData?.password);
      
      if (error) {
        setFormErrors({ general: error?.message });
      } else if (data?.user) {
        // Success handled by AuthContext
        onSubmit?.();
      }
    } catch (err) {
      setFormErrors({ general: 'An unexpected error occurred. Please try again.' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear specific field error when user starts typing
    if (formErrors?.[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleQuickLogin = (credentials) => {
    setFormData({
      email: credentials?.email,
      password: credentials?.password,
      rememberMe: false
    });
    setFormErrors({});
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* General Error */}
        {(error || formErrors?.general) && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Icon name="AlertCircle" size={16} className="text-destructive" />
              <p className="text-destructive text-sm">{error || formErrors?.general}</p>
            </div>
          </div>
        )}

        {/* Email Field */}
        <div className="space-y-2">
          <Input
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData?.email}
            onChange={handleInputChange}
            error={formErrors?.email}
            disabled={isLoading}
            iconName="Mail"
          />
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Input
            name="password"
            type="password"
            placeholder="Enter your password"
            value={formData?.password}
            onChange={handleInputChange}
            error={formErrors?.password}
            disabled={isLoading}
            iconName="Lock"
          />
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <Checkbox
            name="rememberMe"
            label="Remember me"
            checked={formData?.rememberMe}
            onChange={handleInputChange}
            disabled={isLoading}
          />
          <button
            type="button"
            className="text-sm text-primary hover:text-primary/80 font-medium micro-animation"
            disabled={isLoading}
          >
            Forgot password?
          </button>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          fullWidth
          loading={isLoading}
          disabled={isLoading}
          iconName="LogIn"
          iconPosition="right"
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>
      {/* Demo Credentials */}
      <div className="bg-muted/30 rounded-lg p-4">
        <p className="text-xs text-muted-foreground mb-3 text-center">Demo Credentials (Click to use):</p>
        <div className="space-y-2">
          {mockCredentials?.map((cred, index) => (
            <button
              key={index}
              onClick={() => handleQuickLogin(cred)}
              className="w-full text-left p-2 rounded-md hover:bg-muted/50 transition-colors"
              disabled={isLoading}
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm font-medium text-foreground">{cred?.type}:</span>
                  <span className="text-xs text-muted-foreground ml-2">{cred?.email}</span>
                </div>
                <span className="text-xs text-muted-foreground">{cred?.password}</span>
              </div>
            </button>
          ))}
        </div>
        {mockCredentials?.find(c => c?.type === 'Provider') && (
          <p className="text-xs text-warning mt-2 text-center">
            * Provider accounts may require additional verification
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginForm;