import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import Header from '../../components/ui/Header';
import LoginForm from './components/LoginForm';
import SocialLoginSection from './components/SocialLoginSection';
import OTPVerification from './components/OTPVerification';
import WelcomeSection from './components/WelcomeSection';
import Icon from '../../components/AppIcon';

// Add mockCredentials object
const mockCredentials = {
  customer: {
    email: 'customer@handygh.com',
    password: 'customer123'
  },
  provider: {
    email: 'provider@handygh.com',
    password: 'provider123'
  },
  admin: {
    email: 'admin@handygh.com',
    password: 'admin123'
  }
};

const UserLogin = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState('login'); // 'login' | 'otp'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Determine redirect based on user type
      redirectToDashboard();
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogin = async (formData) => {
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Check mock credentials
      const userType = Object.keys(mockCredentials)?.find(type => 
        mockCredentials?.[type]?.email === formData?.email && 
        mockCredentials?.[type]?.password === formData?.password
      );

      if (!userType) {
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      }

      // Create user data
      const userData = {
        email: formData?.email,
        type: userType,
        isAuthenticated: true,
        rememberMe: formData?.rememberMe
      };

      // Store user data in localStorage
      localStorage.setItem('handygh_user', JSON.stringify(userData));

      setUserEmail(formData?.email);

      // Simulate OTP requirement for some accounts
      if (userType === 'provider') {
        setCurrentStep('otp');
      } else {
        // Direct login for customers and admins
        redirectToDashboard(userType);
      }

    } catch (err) {
      setError(err?.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await authService?.signInWithOAuth(provider);
      
      if (error) {
        setError(`Failed to sign in with ${provider}. Please try again.`);
      }
      // OAuth will redirect, so we don't handle success here
    } catch (err) {
      setError(`Failed to sign in with ${provider}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerify = async (otpCode) => {
    setIsLoading(true);
    setError('');

    try {
      // For now, accept any OTP
      if (otpCode) {
        redirectToDashboard();
      } else {
        setError('Please enter a valid verification code.');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPResend = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Mock resend functionality
      setTimeout(() => {
        setIsLoading(false);
        // Success feedback could be added here
      }, 1000);
    } catch (err) {
      setError('Failed to resend code. Please try again.');
      setIsLoading(false);
    }
  };

  const redirectToDashboard = async (userType) => {
    try {
      // Get user data from localStorage
      const userData = JSON.parse(localStorage.getItem('handygh_user') || '{}');
      
      if (userData?.type === 'provider') {
        navigate('/provider-dashboard');
      } else if (userData?.type === 'admin') {
        navigate('/customer-dashboard'); // Default for demo
      } else {
        navigate('/customer-dashboard');
      }
    } catch (error) {
      console.error('Redirect error:', error);
      navigate('/customer-dashboard');
    }
  };

  const handleLoginSuccess = () => {
    redirectToDashboard();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header isAuthenticated={false} />
      
      <div className="pt-16 min-h-screen flex">
        {/* Left Panel - Welcome Section (Hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 bg-primary/5 p-8 lg:p-12 items-center">
          <div className="w-full max-w-md mx-auto">
            <WelcomeSection />
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-md space-y-8">
            {/* Mobile Logo (Visible only on mobile) */}
            <div className="lg:hidden text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3">
                  <Icon name="Wrench" size={20} color="white" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">HandyGH</h1>
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Welcome Back</h2>
              <p className="text-muted-foreground text-sm">
                Sign in to your account
              </p>
            </div>

            {/* Login Content */}
            <div className="bg-card rounded-lg border border-border p-6 sm:p-8 card-shadow">
              {currentStep === 'login' ? (
                <>
                  <div className="hidden lg:block text-center mb-6">
                    <h2 className="text-2xl font-semibold text-foreground mb-2">Sign In</h2>
                    <p className="text-muted-foreground">
                      Enter your credentials to access your account
                    </p>
                  </div>

                  <SocialLoginSection 
                    onSocialLogin={handleSocialLogin}
                    isLoading={isLoading}
                  />

                  <LoginForm 
                    onSubmit={handleLogin}
                    isLoading={isLoading}
                    error={error}
                  />
                </>
              ) : (
                <OTPVerification
                  email={userEmail}
                  onVerify={handleOTPVerify}
                  onResend={handleOTPResend}
                  isLoading={isLoading}
                  error={error}
                />
              )}
            </div>

            {/* Registration Link */}
            {currentStep === 'login' && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <Link 
                    to="/user-registration" 
                    className="text-primary hover:text-primary/80 font-medium micro-animation"
                  >
                    Create Account
                  </Link>
                </p>
              </div>
            )}

            {/* Back to Login Link */}
            {currentStep === 'otp' && (
              <div className="text-center">
                <button
                  onClick={() => {
                    setCurrentStep('login');
                    setError('');
                  }}
                  className="text-sm text-primary hover:text-primary/80 font-medium micro-animation flex items-center justify-center"
                  disabled={isLoading}
                >
                  <Icon name="ArrowLeft" size={16} className="mr-2" />
                  Back to Sign In
                </button>
              </div>
            )}

            {/* Demo Credentials Info */}
            <div className="bg-muted/30 rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground mb-2">Demo Credentials:</p>
              <div className="space-y-1 text-xs">
                <p><span className="font-medium">Customer:</span> customer@handygh.com / customer123</p>
                <p><span className="font-medium">Provider:</span> provider@handygh.com / provider123</p>
                <p className="text-warning">Provider accounts require OTP: 123456</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;