import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import RegistrationSteps from './components/RegistrationSteps';
import UserTypeSelection from './components/UserTypeSelection';
import PersonalInfoForm from './components/PersonalInfoForm';
import OTPVerification from './components/OTPVerification';
import SocialLoginSection from './components/SocialLoginSection';
import SuccessMessage from './components/SuccessMessage';

const UserRegistration = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    userType: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    serviceCategory: '',
    experience: '',
    description: ''
  });
  const [errors, setErrors] = useState({});

  const totalSteps = 3;

  // Enhanced validation function
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData?.userType) {
        newErrors.userType = 'Please select an account type';
      }
    }

    if (step === 2) {
      // Basic information validation
      if (!formData?.firstName?.trim()) {
        newErrors.firstName = 'First name is required';
      } else if (formData?.firstName?.trim().length < 2) {
        newErrors.firstName = 'First name must be at least 2 characters';
      }

      if (!formData?.lastName?.trim()) {
        newErrors.lastName = 'Last name is required';
      } else if (formData?.lastName?.trim().length < 2) {
        newErrors.lastName = 'Last name must be at least 2 characters';
      }

      if (!formData?.email?.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData?.email)) {
        newErrors.email = 'Please enter a valid email address';
      }

      if (!formData?.phone?.trim()) {
        newErrors.phone = 'Phone number is required';
      } else {
        // Ghana phone number validation
        const phoneRegex = /^(\+233|0)\s?[0-9]{2}\s?[0-9]{3}\s?[0-9]{4}$/;
        const cleanPhone = formData?.phone?.replace(/\s/g, '');
        if (!phoneRegex.test(cleanPhone)) {
          newErrors.phone = 'Please enter a valid Ghana phone number (+233 XX XXX XXXX or 0XX XXX XXXX)';
        }
      }

      // Password validation
      if (!formData?.password) {
        newErrors.password = 'Password is required';
      } else {
        const passwordRequirements = [
          { test: formData?.password?.length >= 8, message: 'Password must be at least 8 characters' },
          { test: /[A-Z]/.test(formData?.password), message: 'Password must contain an uppercase letter' },
          { test: /[a-z]/.test(formData?.password), message: 'Password must contain a lowercase letter' },
          { test: /\d/.test(formData?.password), message: 'Password must contain a number' },
          { test: /[!@#$%^&*]/.test(formData?.password), message: 'Password must contain a special character' }
        ];
        
        const failedRequirement = passwordRequirements.find(req => !req.test);
        if (failedRequirement) {
          newErrors.password = failedRequirement.message;
        }
      }

      if (!formData?.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData?.password !== formData?.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }

      // Provider-specific validation
      if (formData?.userType === 'provider') {
        if (!formData?.businessName?.trim()) {
          newErrors.businessName = 'Business name is required';
        } else if (formData?.businessName?.trim().length < 2) {
          newErrors.businessName = 'Business name must be at least 2 characters';
        }

        if (!formData?.serviceCategory) {
          newErrors.serviceCategory = 'Please select a service category';
        }

        if (formData?.description && formData?.description?.length > 500) {
          newErrors.description = 'Description must be less than 500 characters';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (validateStep(currentStep)) {
      if (currentStep === 2) {
        // Sign up the user with backend API
        setIsLoading(true);
        
        try {
          console.log('Attempting to sign up user with data:', {
            ...formData,
            password: '[HIDDEN]',
            confirmPassword: '[HIDDEN]'
          });

          const { data, error } = await authService?.signUp(formData);
          
          if (error) {
            console.error('Signup error:', error);
            setErrors({ general: error?.message || 'Registration failed. Please try again.' });
            setIsLoading(false);
            return;
          }

          if (data?.user || data?.accessToken) {
            console.log('User created successfully:', data);
            // Skip OTP for now and go to success
            setCurrentStep(4);
          } else {
            setCurrentStep(currentStep + 1);
          }
        } catch (err) {
          console.error('Registration error:', err);
          setErrors({ general: 'Registration failed. Please try again.' });
        } finally {
          setIsLoading(false);
        }
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleOTPVerify = async (otpCode) => {
    setIsLoading(true);
    
    try {
      console.log('Verifying OTP:', otpCode);
      
      // For now, accept any OTP and proceed
      setTimeout(() => {
        setIsLoading(false);
        setCurrentStep(4); // Success step
      }, 1000);
      
      // TODO: Implement actual OTP verification
      // const { error } = await authService.verifyOTP(formData.email, otpCode);
      // if (error) {
      //   setErrors({ otp: error.message });
      //   setIsLoading(false);
      //   return;
      // }
      
    } catch (err) {
      console.error('OTP verification error:', err);
      setErrors({ otp: 'Invalid verification code. Please try again.' });
      setIsLoading(false);
    }
  };

  const handleOTPResend = (method) => {
    console.log(`Resending OTP via ${method}`);
    // TODO: Implement OTP resend logic
  };

  const handleSocialLogin = async (provider) => {
    setIsLoading(true);
    
    try {
      console.log(`Attempting ${provider} login`);
      
      const { data, error } = await authService?.signInWithOAuth(provider);
      
      if (error) {
        console.error(`${provider} login error:`, error);
        setErrors({ general: error?.message || `Failed to sign in with ${provider}. Please try again.` });
      } else {
        console.log(`${provider} login successful:`, data);
        // OAuth will redirect, so we don't need to handle success here
      }
    } catch (err) {
      console.error(`${provider} login error:`, err);
      setErrors({ general: `Failed to sign in with ${provider}. Please try again.` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    const dashboardRoute = formData?.userType === 'customer' ? '/customer-dashboard' : '/provider-dashboard';
    console.log('Registration complete, navigating to:', dashboardRoute);
    navigate(dashboardRoute);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <UserTypeSelection
            selectedType={formData?.userType}
            onTypeSelect={(type) => {
              console.log('User type selected:', type);
              setFormData({ ...formData, userType: type });
              setErrors({}); // Clear errors when selection changes
            }}
          />
        );
      
      case 2:
        return (
          <PersonalInfoForm
            userType={formData?.userType}
            formData={formData}
            onFormChange={setFormData}
            errors={errors}
          />
        );
      
      case 3:
        return (
          <OTPVerification
            email={formData?.email}
            phone={formData?.phone}
            onVerify={handleOTPVerify}
            onResend={handleOTPResend}
            isLoading={isLoading}
          />
        );
      
      case 4:
        return (
          <SuccessMessage
            userType={formData?.userType}
            userName={`${formData?.firstName} ${formData?.lastName}`}
            onContinue={handleSuccess}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header isAuthenticated={false} />
      <div className="pt-16 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full">
          <div className="bg-card rounded-lg card-shadow p-6 sm:p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mr-3">
                  <Icon name="Wrench" size={24} color="white" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Join HandyGH</h1>
              </div>
              <p className="text-muted-foreground">
                Create your account to get started with Ghana's trusted service marketplace
              </p>
            </div>

            {/* General Error */}
            {errors?.general && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Icon name="AlertCircle" size={16} className="text-destructive" />
                  <p className="text-destructive text-sm">{errors?.general}</p>
                </div>
              </div>
            )}

            {/* Social Login - Only show on first step */}
            {currentStep === 1 && (
              <div className="mb-8">
                <SocialLoginSection
                  onSocialLogin={handleSocialLogin}
                  isLoading={isLoading}
                />
              </div>
            )}

            {/* Progress Steps - Don't show on success step */}
            {currentStep <= totalSteps && (
              <RegistrationSteps currentStep={currentStep} totalSteps={totalSteps} />
            )}

            {/* Step Content */}
            <div className="mb-8">
              {renderStepContent()}
            </div>

            {/* Navigation Buttons - Don't show on success step */}
            {currentStep <= totalSteps && (
              <div className="flex flex-col sm:flex-row gap-3">
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={isLoading}
                    className="sm:w-auto"
                  >
                    <Icon name="ArrowLeft" size={16} className="mr-2" />
                    Back
                  </Button>
                )}
                
                <Button
                  variant="default"
                  onClick={handleNext}
                  disabled={isLoading || (currentStep === 1 && !formData?.userType)}
                  loading={isLoading && currentStep === 2}
                  fullWidth={currentStep === 1}
                  className="sm:ml-auto"
                >
                  {currentStep === totalSteps - 1 ? 'Create Account' : 'Continue'}
                  {currentStep < totalSteps - 1 && (
                    <Icon name="ArrowRight" size={16} className="ml-2" />
                  )}
                </Button>
              </div>
            )}

            {/* Login Link */}
            {currentStep <= totalSteps && (
              <div className="text-center mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <button
                    onClick={() => navigate('/user-login')}
                    className="text-primary hover:text-primary/80 font-medium micro-animation"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRegistration;