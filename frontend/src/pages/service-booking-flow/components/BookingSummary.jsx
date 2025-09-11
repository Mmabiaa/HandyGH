import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BookingSummary = ({ bookingData, onModifyBooking }) => {
  const {
    service,
    dateTime,
    location,
    serviceDetails,
    paymentMethod,
    totalAmount
  } = bookingData;

  const formatDateTime = (dateTime) => {
    if (!dateTime?.date || !dateTime?.time) return 'Not selected';
    
    const date = new Date(dateTime.date);
    const formattedDate = date?.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const time = new Date(`2000-01-01T${dateTime.time}`)?.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    return `${formattedDate} at ${time}`;
  };

  const calculateServiceDuration = () => {
    if (!service?.customizations?.size) return '2-3 hours';
    
    const sizeMap = {
      'small': '1-2 hours',
      'medium': '2-4 hours',
      'large': '4-6 hours',
      'studio': '2-3 hours',
      '2br': '3-4 hours',
      '4br': '4-6 hours',
      '1hour': '1 hour',
      '2hour': '2 hours',
      'package': '5 sessions'
    };
    
    return sizeMap?.[service?.customizations?.size] || '2-3 hours';
  };

  const getPaymentMethodDisplay = () => {
    const methodMap = {
      'momo': 'Mobile Money',
      'card': 'Credit/Debit Card',
      'cash': 'Pay on Service'
    };
    
    return methodMap?.[paymentMethod] || 'Not selected';
  };

  return (
    <div className="bg-card rounded-lg border card-shadow">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground mb-2">Booking Summary</h3>
        <p className="text-sm text-muted-foreground">Review your booking details before confirmation</p>
      </div>
      <div className="p-6 space-y-6">
        {/* Service Information */}
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name={service?.icon || 'Wrench'} size={24} className="text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-foreground">{service?.name || 'Service not selected'}</h4>
              <p className="text-sm text-muted-foreground">{service?.description}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-sm text-muted-foreground">
                  Duration: {calculateServiceDuration()}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onModifyBooking('service')}
                  iconName="Edit"
                  iconPosition="left"
                >
                  Modify
                </Button>
              </div>
            </div>
          </div>

          {/* Service Customizations */}
          {service?.customizations && (
            <div className="bg-muted/50 rounded-lg p-4">
              <h5 className="font-medium text-foreground mb-2">Service Details</h5>
              <div className="space-y-2 text-sm">
                {service?.customizations?.size && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size:</span>
                    <span className="text-foreground">
                      {service?.customizations?.size?.charAt(0)?.toUpperCase() + service?.customizations?.size?.slice(1)}
                    </span>
                  </div>
                )}
                {service?.customizations?.urgency && service?.customizations?.urgency !== 'normal' && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Urgency:</span>
                    <span className="text-foreground capitalize">{service?.customizations?.urgency}</span>
                  </div>
                )}
                {service?.customizations?.additionalServices?.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Additional Services:</span>
                    <ul className="mt-1 space-y-1">
                      {service?.customizations?.additionalServices?.map((serviceId) => (
                        <li key={serviceId} className="text-foreground text-xs">
                          • {serviceId?.charAt(0)?.toUpperCase() + serviceId?.slice(1)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Date & Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon name="Calendar" size={20} className="text-muted-foreground" />
            <div>
              <p className="font-medium text-foreground">Date & Time</p>
              <p className="text-sm text-muted-foreground">{formatDateTime(dateTime)}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onModifyBooking('datetime')}
            iconName="Edit"
            iconPosition="left"
          >
            Modify
          </Button>
        </div>

        {/* Location */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon name="MapPin" size={20} className="text-muted-foreground" />
            <div>
              <p className="font-medium text-foreground">Service Location</p>
              <p className="text-sm text-muted-foreground">
                {location?.address || 'Address not provided'}
              </p>
              {location?.city && location?.region && (
                <p className="text-xs text-muted-foreground">
                  {location?.city}, {location?.region}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onModifyBooking('location')}
            iconName="Edit"
            iconPosition="left"
          >
            Modify
          </Button>
        </div>

        {/* Special Requirements */}
        {serviceDetails?.requirements && (
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <Icon name="FileText" size={20} className="text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Special Requirements</p>
                <p className="text-sm text-muted-foreground">{serviceDetails?.requirements}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onModifyBooking('details')}
              iconName="Edit"
              iconPosition="left"
            >
              Modify
            </Button>
          </div>
        )}

        {/* Payment Method */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon name="CreditCard" size={20} className="text-muted-foreground" />
            <div>
              <p className="font-medium text-foreground">Payment Method</p>
              <p className="text-sm text-muted-foreground">{getPaymentMethodDisplay()}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onModifyBooking('payment')}
            iconName="Edit"
            iconPosition="left"
          >
            Modify
          </Button>
        </div>

        {/* Price Breakdown */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h5 className="font-medium text-foreground mb-3">Price Breakdown</h5>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Base Service</span>
              <span className="text-foreground">GHS {service?.basePrice || 0}</span>
            </div>
            
            {service?.customizations?.urgency === 'urgent' && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Urgent Service</span>
                <span className="text-foreground">GHS 50</span>
              </div>
            )}
            
            {service?.customizations?.urgency === 'emergency' && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Emergency Service</span>
                <span className="text-foreground">GHS 100</span>
              </div>
            )}
            
            <hr className="border-border" />
            
            <div className="flex justify-between font-medium">
              <span className="text-foreground">Total Amount</span>
              <span className="text-primary text-lg">GHS {totalAmount || 0}</span>
            </div>
          </div>
        </div>

        {/* Provider Information */}
        <div className="bg-primary/5 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Icon name="User" size={20} color="white" />
            </div>
            <div>
              <p className="font-medium text-foreground">John Mensah</p>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5]?.map((star) => (
                    <Icon
                      key={star}
                      name="Star"
                      size={12}
                      className={star <= 4 ? 'text-warning fill-current' : 'text-muted-foreground'}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">4.8 (127 reviews)</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Experienced plumber with 8+ years in residential and commercial services.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingSummary;