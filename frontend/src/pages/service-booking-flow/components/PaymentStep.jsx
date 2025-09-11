import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { bookingService } from '../../../services/bookingService';
import StripePaymentForm from '../../../components/payment/StripePaymentForm';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const PaymentStep = ({
  paymentData,
  onPaymentUpdate,
  onConfirmBooking,
  onPrevious,
  isProcessing,
  bookingData
}) => {
  const { user, userProfile } = useAuth();
  const [paymentIntentData, setPaymentIntentData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Create payment intent when component mounts
  useEffect(() => {
    if (user && userProfile && bookingData?.service) {
      createPaymentIntent();
    }
  }, [user, userProfile, bookingData?.service]);

  const createPaymentIntent = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Prepare booking data
      const bookingRequest = {
        serviceId: bookingData?.service?.id,
        serviceName: bookingData?.service?.name,
        serviceDescription: bookingData?.service?.description,
        providerId: bookingData?.service?.providerId,
        basePrice: bookingData?.service?.basePrice || bookingData?.service?.price,
        additionalCharges: 0,
        totalAmount: calculateTotalAmount(),
        duration: bookingData?.service?.duration || 60,
        dateTime: bookingData?.dateTime,
        location: bookingData?.location,
        serviceDetails: bookingData?.serviceDetails
      };

      // Customer info
      const customerInfo = {
        userId: user?.id,
        firstName: userProfile?.first_name || '',
        lastName: userProfile?.last_name || '',
        email: userProfile?.email || user?.email,
        phone: userProfile?.phone || '',
        stripeCustomerId: userProfile?.stripe_customer_id
      };

      const result = await bookingService?.createBookingPaymentIntent(bookingRequest, customerInfo);
      setPaymentIntentData(result);
    } catch (error) {
      console.error('Create payment intent error:', error);
      setError('Failed to initialize payment system. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalAmount = () => {
    if (!bookingData?.service) return 0;
    
    let total = parseFloat(bookingData?.service?.basePrice || bookingData?.service?.price || 0);
    
    // Add urgency modifier if needed
    if (bookingData?.serviceDetails?.urgentNotes) {
      total += 20; // Emergency fee
    }
    
    return total;
  };

  const handlePaymentSuccess = (result) => {
    // Call the parent's onConfirmBooking with the result
    onConfirmBooking?.(result);
  };

  const handlePaymentError = (error) => {
    setError(error?.message || 'Payment failed. Please try again.');
  };

  const handleRetry = () => {
    setError('');
    createPaymentIntent();
  };

  if (!user || !userProfile) {
    return (
      <div className="text-center py-8">
        <Icon name="UserX" size={48} className="mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Please log in to complete your booking.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Complete Payment</h2>
        <p className="text-muted-foreground">
          Secure payment powered by Stripe
        </p>
      </div>
      {/* Booking Summary */}
      <div className="bg-muted/30 rounded-lg p-4">
        <h3 className="font-medium text-foreground mb-3">Booking Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Service:</span>
            <span className="font-medium text-foreground">{bookingData?.service?.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Date & Time:</span>
            <span className="font-medium text-foreground">
              {bookingData?.dateTime?.date} at {bookingData?.dateTime?.time}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Location:</span>
            <span className="font-medium text-foreground">{bookingData?.location?.address}</span>
          </div>
          <div className="border-t border-border pt-2 mt-3">
            <div className="flex justify-between">
              <span className="font-medium text-foreground">Total Amount:</span>
              <span className="font-bold text-primary text-lg">
                {bookingService?.formatAmount(calculateTotalAmount())}
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Payment Form */}
      {isLoading ? (
        <div className="bg-card rounded-lg border border-border p-8">
          <div className="text-center">
            <Icon name="Loader2" size={32} className="mx-auto animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Initializing secure payment...</p>
          </div>
        </div>
      ) : error && !paymentIntentData ? (
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="text-center space-y-4">
            <Icon name="AlertCircle" size={32} className="mx-auto text-destructive" />
            <div>
              <p className="text-destructive font-medium">Payment Setup Failed</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
            <Button onClick={handleRetry} variant="outline">
              <Icon name="RefreshCw" size={16} className="mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      ) : paymentIntentData ? (
        <StripePaymentForm
          clientSecret={paymentIntentData?.clientSecret}
          amount={paymentIntentData?.amount}
          currency="GHS"
          bookingData={paymentIntentData}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          confirmButtonText={`Pay ${bookingService?.formatAmount(calculateTotalAmount())}`}
        />
      ) : null}
      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isProcessing || isLoading}
          className="sm:w-auto"
        >
          <Icon name="ArrowLeft" size={16} className="mr-2" />
          Back
        </Button>
      </div>
      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="Shield" size={20} className="text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Secure Payment</h4>
            <p className="text-sm text-blue-700">
              Your payment is processed securely by Stripe. We never store your payment information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentStep;