import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import ProgressIndicator from './components/ProgressIndicator';
import ServiceSelectionStep from './components/ServiceSelectionStep';
import DateTimeStep from './components/DateTimeStep';
import LocationStep from './components/LocationStep';
import ServiceDetailsStep from './components/ServiceDetailsStep';
import PaymentStep from './components/PaymentStep';
import BookingSummary from './components/BookingSummary';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const ServiceBookingFlow = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  
  // Booking data state
  const [bookingData, setBookingData] = useState({
    service: null,
    dateTime: { date: '', time: '' },
    location: {
      address: '',
      city: 'Accra',
      region: 'Greater Accra',
      landmark: '',
      instructions: '',
      useCurrentLocation: false
    },
    serviceDetails: {
      requirements: '',
      accessInstructions: '',
      preferredContact: 'phone',
      hasTools: false,
      hasMaterials: false,
      petFriendly: false,
      urgentNotes: ''
    },
    payment: {
      method: 'momo',
      momoNumber: '',
      momoProvider: 'mtn',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardName: '',
      savePayment: false
    }
  });

  const steps = [
    { id: 1, title: 'Service', component: 'service' },
    { id: 2, title: 'Date & Time', component: 'datetime' },
    { id: 3, title: 'Location', component: 'location' },
    { id: 4, title: 'Details', component: 'details' },
    { id: 5, title: 'Payment', component: 'payment' }
  ];

  // Calculate total amount
  const calculateTotalAmount = () => {
    if (!bookingData?.service) return 0;
    
    let total = bookingData?.service?.basePrice;
    
    // Add size modifier
    if (bookingData?.service?.customizations?.size) {
      const sizeOption = bookingData?.service?.customizations?.size?.find(s => s?.value === bookingData?.service?.customizations?.size);
      if (sizeOption) total += sizeOption?.priceModifier;
    }
    
    // Add urgency modifier
    if (bookingData?.service?.customizations?.urgency === 'urgent') total += 50;
    if (bookingData?.service?.customizations?.urgency === 'emergency') total += 100;
    
    // Add additional services
    if (bookingData?.service?.customizations?.additionalServices) {
      bookingData?.service?.customizations?.additionalServices?.forEach(serviceId => {
        const service = bookingData?.service?.customizations?.additionalServices?.find(s => s?.id === serviceId);
        if (service) total += service?.price;
      });
    }
    
    return total;
  };

  // Step handlers
  const handleServiceSelect = (service) => {
    setBookingData(prev => ({ ...prev, service }));
  };

  const handleDateTimeSelect = (dateTime) => {
    setBookingData(prev => ({ ...prev, dateTime }));
  };

  const handleLocationSelect = (location) => {
    setBookingData(prev => ({ ...prev, location }));
  };

  const handleDetailsUpdate = (serviceDetails) => {
    setBookingData(prev => ({ ...prev, serviceDetails }));
  };

  const handlePaymentUpdate = (payment) => {
    setBookingData(prev => ({ ...prev, payment }));
  };

  const handleNextStep = () => {
    if (currentStep < steps?.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleModifyBooking = (section) => {
    const sectionMap = {
      'service': 1,
      'datetime': 2,
      'location': 3,
      'details': 4,
      'payment': 5
    };
    
    setCurrentStep(sectionMap?.[section] || 1);
  };

  const handleConfirmBooking = async () => {
    setIsProcessing(true);
    
    try {
      // Mock booking confirmation process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock success
      setBookingComplete(true);
      setIsProcessing(false);
      
      // Redirect to booking management after success
      setTimeout(() => {
        navigate('/booking-management');
      }, 3000);
      
    } catch (error) {
      setIsProcessing(false);
      console.error('Booking failed:', error);
    }
  };

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-background">
        <Header userType="customer" isAuthenticated={true} />
        <div className="pt-20 pb-12">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="CheckCircle" size={40} color="white" />
              </div>
              
              <h1 className="text-3xl font-bold text-foreground mb-4">
                Booking Confirmed!
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8">
                Your service has been successfully booked. The provider will contact you shortly to confirm the details.
              </p>
              
              <div className="bg-card rounded-lg p-6 border card-shadow mb-8">
                <h3 className="text-lg font-semibold text-foreground mb-4">Booking Details</h3>
                <div className="space-y-3 text-left">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Booking ID:</span>
                    <span className="font-medium text-foreground">#BK-2025-001</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service:</span>
                    <span className="font-medium text-foreground">{bookingData?.service?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Amount:</span>
                    <span className="font-bold text-primary">GHS {calculateTotalAmount()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="default"
                  onClick={() => navigate('/booking-management')}
                  iconName="Calendar"
                  iconPosition="left"
                >
                  View My Bookings
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => navigate('/customer-dashboard')}
                  iconName="Home"
                  iconPosition="left"
                >
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header userType="customer" isAuthenticated={true} />
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <ProgressIndicator
                currentStep={currentStep}
                totalSteps={steps?.length}
                steps={steps}
              />
              
              <div className="bg-card rounded-lg p-6 card-shadow">
                {currentStep === 1 && (
                  <ServiceSelectionStep
                    selectedService={bookingData?.service}
                    onServiceSelect={handleServiceSelect}
                    onNext={handleNextStep}
                  />
                )}
                
                {currentStep === 2 && (
                  <DateTimeStep
                    selectedDateTime={bookingData?.dateTime}
                    onDateTimeSelect={handleDateTimeSelect}
                    onNext={handleNextStep}
                    onPrevious={handlePreviousStep}
                  />
                )}
                
                {currentStep === 3 && (
                  <LocationStep
                    selectedLocation={bookingData?.location}
                    onLocationSelect={handleLocationSelect}
                    onNext={handleNextStep}
                    onPrevious={handlePreviousStep}
                  />
                )}
                
                {currentStep === 4 && (
                  <ServiceDetailsStep
                    serviceDetails={bookingData?.serviceDetails}
                    onDetailsUpdate={handleDetailsUpdate}
                    onNext={handleNextStep}
                    onPrevious={handlePreviousStep}
                  />
                )}
                
                {currentStep === 5 && (
                  <PaymentStep
                    paymentData={bookingData?.payment}
                    onPaymentUpdate={handlePaymentUpdate}
                    onConfirmBooking={handleConfirmBooking}
                    onPrevious={handlePreviousStep}
                    isProcessing={isProcessing}
                  />
                )}
              </div>
            </div>
            
            {/* Booking Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <BookingSummary
                  bookingData={{
                    ...bookingData,
                    totalAmount: calculateTotalAmount(),
                    paymentMethod: bookingData?.payment?.method
                  }}
                  onModifyBooking={handleModifyBooking}
                />
                
                {/* Help Section */}
                <div className="bg-card rounded-lg p-6 border card-shadow mt-6">
                  <h4 className="font-medium text-foreground mb-3 flex items-center">
                    <Icon name="HelpCircle" size={20} className="mr-2" />
                    Need Help?
                  </h4>
                  
                  <div className="space-y-3">
                    <button className="flex items-center w-full text-left text-sm text-muted-foreground hover:text-foreground micro-animation">
                      <Icon name="MessageCircle" size={16} className="mr-2" />
                      Chat with Support
                    </button>
                    
                    <button className="flex items-center w-full text-left text-sm text-muted-foreground hover:text-foreground micro-animation">
                      <Icon name="Phone" size={16} className="mr-2" />
                      Call: +233 20 123 4567
                    </button>
                    
                    <button className="flex items-center w-full text-left text-sm text-muted-foreground hover:text-foreground micro-animation">
                      <Icon name="Mail" size={16} className="mr-2" />
                      Email Support
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceBookingFlow;