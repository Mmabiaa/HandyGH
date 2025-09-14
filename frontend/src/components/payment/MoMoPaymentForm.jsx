import React, { useState, useEffect } from 'react';
import { paymentService } from '../../services/paymentService';
import Button from '../ui/Button';
import Icon from '../AppIcon';

const MoMoPaymentForm = ({
  bookingId,
  amount,
  currency = 'GHS',
  customerPhone,
  onSuccess,
  onError,
  confirmButtonText = 'Pay with MoMo',
  className = ''
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [phone, setPhone] = useState(customerPhone || '');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    setErrorMessage('');
  }, [bookingId]);

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    // Allow only digits and basic formatting
    const cleaned = value.replace(/\D/g, '');
    setPhone(cleaned);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!phone || phone.length < 10) {
      setErrorMessage('Please enter a valid phone number');
      return;
    }

    if (!bookingId || !amount) {
      setErrorMessage('Missing booking or payment information');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const formattedPhone = paymentService.formatPhoneNumber(phone);
      
      const paymentInfo = {
        phone: formattedPhone,
        amount: amount,
        currency: currency,
        description: `Payment for booking #${bookingId}`
      };

      const result = await paymentService.createMoMoPayment(bookingId, paymentInfo);
      
      setPaymentData(result);
      setShowSuccessAnimation(true);

      // Simulate payment processing
      setTimeout(() => {
        setShowSuccessAnimation(false);
        onSuccess?.(result);
      }, 3000);

    } catch (error) {
      console.error('MoMo payment error:', error);
      setErrorMessage(error.message || 'Payment failed. Please try again.');
      onError?.(error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (showSuccessAnimation) {
    return (
      <div className={`relative bg-card rounded-lg border border-border p-6 ${className}`}>
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-lg flex items-center justify-center z-50">
          <div className="text-center space-y-6 p-8">
            <div className="relative">
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center animate-pulse">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                  <Icon name="Check" size={32} className="text-white animate-pulse" />
                </div>
              </div>
              <div className="absolute inset-0 w-20 h-20 mx-auto border-4 border-green-300 rounded-full animate-ping opacity-30"></div>
              <div className="absolute inset-0 w-20 h-20 mx-auto border-2 border-green-400 rounded-full animate-ping opacity-50" style={{ animationDelay: '0.5s' }}></div>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-green-600">
                Payment Initiated! 📱
              </h3>
              <p className="text-green-700 font-medium">
                Check your phone for MoMo prompt
              </p>
              {paymentData?.transactionId && (
                <p className="text-sm text-green-600">
                  Transaction ID: {paymentData.transactionId}
                </p>
              )}
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-lg font-semibold text-green-800">
                {paymentService.formatAmount(amount, currency)} to be paid
              </p>
              <p className="text-xs text-green-600 mt-1">
                Complete payment on your phone...
              </p>
            </div>

            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card rounded-lg border border-border p-6 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-card-foreground">
              Mobile Money Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-muted-foreground text-sm">+233</span>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="123456789"
                className="block w-full pl-12 pr-3 py-2 border border-input rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                disabled={isProcessing}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enter your MoMo registered phone number
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Amount to pay:</span>
              <span className="text-lg font-bold text-primary">
                {paymentService.formatAmount(amount, currency)}
              </span>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-destructive text-sm">{errorMessage}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={!phone || phone.length < 10 || isProcessing || !bookingId || !amount}
          className="w-full"
          size="lg"
          iconName={isProcessing ? "Loader2" : "Smartphone"}
          iconClassName={isProcessing ? "animate-spin" : ""}
          iconPosition="left"
        >
          {isProcessing ? 'Processing Payment...' : confirmButtonText}
        </Button>

        <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
          <Icon name="Shield" size={14} />
          <span>Secured by MTN MoMo • Your payment is protected</span>
        </div>
      </form>
    </div>
  );
};

export default MoMoPaymentForm;
