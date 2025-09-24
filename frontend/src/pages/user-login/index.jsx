import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/ui/Header';
import LoginForm from './components/LoginForm';
import SocialLoginSection from './components/SocialLoginSection';
import OTPVerification from './components/OTPVerification';
import WelcomeSection from './components/WelcomeSection';
import Icon from '../../components/AppIcon';

// Add mockCredentials object with types displayed
const mockCredentials = {
  customer: {
    email: 'customer@handygh.com',
    password: 'customer123',
    type: 'customer',
    displayName: 'Customer'
  },
  provider: {
    email: 'provider@handygh.com',
    password: 'provider123',
    type: 'provider',
    displayName: 'Service Provider'
  },
  admin: {
    email: 'admin@handygh.com',
    password: 'admin123',
    type: 'admin',
    displayName: 'Administrator'
  }
};

const UserLogin = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, login } = useAuth();
  const [currentStep, setCurrentStep] = useState('login'); // 'login' | 'otp'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [currentUserType, setCurrentUserType] = useState('');
  const [pendingUserData, setPendingUserData] = useState(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      redirectToDashboard(user.type);
    }
  }, [isAuthenticated, user]);

  const handleLogin = async (formData) => {
    setIsLoading(true);
    setError('');

    try {
      if (!formData || !formData.email || !formData.password) {
        throw new Error('Email and password are required.');
      }

      await new Promise(resolve => setTimeout(resolve, 800));

      const userType = Object.keys(mockCredentials).find(type => {
        const credentials = mockCredentials[type];
        return credentials &&
               credentials.email === formData.email &&
               credentials.password === formData.password;
      });

      if (!userType) {
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      }

      setUserEmail(formData.email);
      setCurrentUserType(userType);

      const userData = {
        id: Date.now(),
        email: formData.email,
        type: userType,
        name: mockCredentials[userType].displayName,
        isAuthenticated: true,
        rememberMe: formData.rememberMe || false
      };

      setPendingUserData(userData);
      setCurrentStep('otp'); // Always show OTP for all users

    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loginUser = async (userData) => {
    try {
      console.log('Completing login for user:', userData);
          localStorage.setItem('handygh_user', JSON.stringify(userData));
        if (setDemoAuth) {
         setDemoAuth(pendingUserData);
        }
      setTimeout(() => {
        redirectToDashboard(userData.type);
      }, 100);
    } catch (error) {
      console.error('Login user error:', error);
      setError('Failed to complete login. Please try again.');
    }
  };

  const handleSocialLogin = async (provider) => {
    setIsLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const userData = {
        id: Date.now(),
        email: `${provider}.user@handygh.com`,
        type: 'customer',
        name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
        isAuthenticated: true,
        socialProvider: provider
      };

      setUserEmail(userData.email);
      setCurrentUserType('customer');
      setPendingUserData(userData);
      setCurrentStep('otp');
    } catch (err) {
      console.error('Social login error:', err);
      setError(`Failed to sign in with ${provider}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerify = async (otpCode) => {
    setIsLoading(true);
    setError('');

    try {
      if (otpCode === '123456') {
        if (pendingUserData) {
          // Save user and set fake access token for demo/mock login
          localStorage.setItem('handygh_user', JSON.stringify(pendingUserData));
          localStorage.setItem('accessToken', 'demo-access-token');

          // Optionally, call login to update AuthContext state
          if (login) {
            await login(pendingUserData);
          }

          // Immediately navigate to dashboard (prevents fallback to login)
          redirectToDashboard(pendingUserData.type);
        } else {
          throw new Error('Session expired. Please login again.');
        }
      } else {
        throw new Error('Invalid verification code. Please enter 123456.');
      }
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPResend = async () => {
    setIsLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('OTP resent');
      setError('');
    } catch (err) {
      console.error('OTP resend error:', err);
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const redirectToDashboard = (userType) => {
    try {
      switch (userType) {
        case 'provider':
          navigate('/provider-dashboard', { replace: true });
          break;
        case 'admin':
          navigate('/admin-dashboard', { replace: true });
          break;
        case 'customer':
        default:
          navigate('/customer-dashboard', { replace: true });
          break;
      }
    } catch (error) {
      console.error('Redirect error:', error);
      navigate('/customer-dashboard', { replace: true });
    }
  };

  const handleBackToLogin = () => {
    setCurrentStep('login');
    setError('');
    setUserEmail('');
    setCurrentUserType('');
    setPendingUserData(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header isAuthenticated={false} />
      <div className="pt-16 min-h-screen flex">
        <div className="hidden lg:flex lg:w-1/2 bg-primary/5 p-8 lg:p-12 items-center">
          <div className="w-full max-w-md mx-auto">
            <WelcomeSection />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-md space-y-8">
            <div className="lg:hidden text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3">
                  <Icon name="Wrench" size={20} color="white" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">HandyGH</h1>
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Welcome Back</h2>
              <p className="text-muted-foreground text-sm">Sign in to your account</p>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 sm:p-8 card-shadow">
              {currentStep === 'login' ? (
                <>
                  <div className="hidden lg:block text-center mb-6">
                    <h2 className="text-2xl font-semibold text-foreground mb-2">Sign In</h2>
                    <p className="text-muted-foreground">Enter your credentials to access your account</p>
                  </div>

                  <SocialLoginSection
                    onSocialLogin={handleSocialLogin}
                    isLoading={isLoading}
                  />

                  <LoginForm
                    onSubmit={handleLogin}
                    isLoading={isLoading}
                    error={error}
                    mockCredentials={mockCredentials}
                  />
                </>
              ) : (
                <OTPVerification
                  email={userEmail}
                  userType={currentUserType}
                  displayName={mockCredentials[currentUserType]?.displayName}
                  onVerify={handleOTPVerify}
                  onResend={handleOTPResend}
                  isLoading={isLoading}
                  error={error}
                />
              )}
            </div>

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

            {currentStep === 'otp' && (
              <div className="text-center">
                <button
                  onClick={handleBackToLogin}
                  className="text-sm text-primary hover:text-primary/80 font-medium micro-animation flex items-center justify-center"
                  disabled={isLoading}
                >
                  <Icon name="ArrowLeft" size={16} className="mr-2" />
                  Back to Sign In
                </button>
              </div>
            )}

            {currentStep === 'login' && (
              <div className="bg-muted/30 rounded-lg p-4 text-center">
                <p className="text-xs text-muted-foreground mb-2">Demo Credentials:</p>
                <div className="space-y-1 text-xs">
                  <p><span className="font-medium">Customer:</span> customer@handygh.com / customer123</p>
                  <p><span className="font-medium">Provider:</span> provider@handygh.com / provider123</p>
                  <p><span className="font-medium">Admin:</span> admin@handygh.com / admin123</p>
                  <p className="text-warning mt-2">All accounts require OTP: 123456</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
