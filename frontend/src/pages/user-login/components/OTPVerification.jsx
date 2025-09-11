import React, { useState, useEffect, useRef } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const OTPVerification = ({ email, onVerify, onResend, isLoading, error }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleOtpChange = (index, value) => {
    if (value?.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs?.current?.[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp?.every(digit => digit !== '') && newOtp?.join('')?.length === 6) {
      onVerify(newOtp?.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e?.key === 'Backspace' && !otp?.[index] && index > 0) {
      inputRefs?.current?.[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    onResend();
    setTimeLeft(60);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    const otpCode = otp?.join('');
    if (otpCode?.length === 6) {
      onVerify(otpCode);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Shield" size={24} className="text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Verify Your Account</h3>
        <p className="text-sm text-muted-foreground">
          We've sent a 6-digit verification code to
          <br />
          <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>
      {error && (
        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-md flex items-center">
          <Icon name="AlertCircle" size={16} className="mr-2 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center space-x-3">
          {otp?.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e?.target?.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-12 text-center text-lg font-semibold border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent micro-animation"
              disabled={isLoading}
            />
          ))}
        </div>

        <Button
          type="submit"
          variant="default"
          fullWidth
          loading={isLoading}
          disabled={isLoading || otp?.join('')?.length !== 6}
        >
          Verify Code
        </Button>
      </form>
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">
          Didn't receive the code?
        </p>
        {canResend ? (
          <button
            onClick={handleResend}
            className="text-sm text-primary hover:text-primary/80 font-medium micro-animation"
            disabled={isLoading}
          >
            Resend Code
          </button>
        ) : (
          <p className="text-sm text-muted-foreground">
            Resend in {timeLeft}s
          </p>
        )}
      </div>
    </div>
  );
};

export default OTPVerification;