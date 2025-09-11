import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const OTPVerification = ({ email, phone, onVerify, onResend, isLoading }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState('email');

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleOtpChange = (index, value) => {
    if (value?.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e?.key === 'Backspace' && !otp?.[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput?.focus();
    }
  };

  const handlePaste = (e) => {
    e?.preventDefault();
    const pastedData = e?.clipboardData?.getData('text')?.slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedData?.length && i < 6; i++) {
      if (/^\d$/?.test(pastedData?.[i])) {
        newOtp[i] = pastedData?.[i];
      }
    }
    setOtp(newOtp);
  };

  const handleVerify = () => {
    const otpCode = otp?.join('');
    if (otpCode?.length === 6) {
      onVerify(otpCode);
    }
  };

  const handleResend = () => {
    onResend(verificationMethod);
    setCountdown(60);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
  };

  const isComplete = otp?.every(digit => digit !== '');

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Shield" size={32} className="text-primary" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Verify Your Account</h2>
        <p className="text-muted-foreground">
          We've sent a 6-digit verification code to your {verificationMethod}
        </p>
      </div>
      {/* Verification Method Toggle */}
      <div className="flex justify-center mb-6">
        <div className="bg-muted p-1 rounded-lg flex">
          <button
            onClick={() => setVerificationMethod('email')}
            className={`px-4 py-2 rounded-md text-sm font-medium micro-animation ${
              verificationMethod === 'email' ?'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name="Mail" size={16} className="mr-2" />
            Email
          </button>
          <button
            onClick={() => setVerificationMethod('sms')}
            className={`px-4 py-2 rounded-md text-sm font-medium micro-animation ${
              verificationMethod === 'sms' ?'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name="Phone" size={16} className="mr-2" />
            SMS
          </button>
        </div>
      </div>
      {/* Contact Info Display */}
      <div className="bg-muted/50 p-4 rounded-lg text-center">
        <div className="flex items-center justify-center text-sm text-muted-foreground">
          <Icon 
            name={verificationMethod === 'email' ? 'Mail' : 'Phone'} 
            size={16} 
            className="mr-2" 
          />
          {verificationMethod === 'email' ? email : phone}
        </div>
      </div>
      {/* OTP Input */}
      <div className="space-y-4">
        <div className="flex justify-center space-x-3">
          {otp?.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e?.target?.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-12 h-12 text-center text-lg font-semibold border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent micro-animation"
            />
          ))}
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Enter the 6-digit code sent to your {verificationMethod}
        </div>
      </div>
      {/* Verify Button */}
      <Button
        variant="default"
        fullWidth
        onClick={handleVerify}
        disabled={!isComplete}
        loading={isLoading}
        className="mt-6"
      >
        Verify Account
      </Button>
      {/* Resend Section */}
      <div className="text-center space-y-2">
        {!canResend ? (
          <p className="text-sm text-muted-foreground">
            Resend code in {countdown} seconds
          </p>
        ) : (
          <button
            onClick={handleResend}
            className="text-sm text-primary hover:text-primary/80 font-medium micro-animation"
          >
            Resend verification code
          </button>
        )}
        
        <div className="text-xs text-muted-foreground">
          Didn't receive the code? Check your spam folder or try SMS verification
        </div>
      </div>
      {/* Mock Credentials Info */}
      <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mt-6">
        <div className="flex items-start">
          <Icon name="Info" size={16} className="text-warning mr-2 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <div className="font-medium text-warning mb-1">Demo Mode</div>
            <div className="text-muted-foreground">
              For testing purposes, use verification code: <span className="font-mono font-semibold">123456</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;