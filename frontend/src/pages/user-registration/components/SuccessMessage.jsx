import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const SuccessMessage = ({ userType, userName, onContinue }) => {
  return (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto">
        <Icon name="CheckCircle" size={40} className="text-success" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">Welcome to HandyGH!</h2>
        <p className="text-muted-foreground">
          Hi {userName}, your account has been successfully created and verified.
        </p>
      </div>

      <div className="bg-success/5 border border-success/20 rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-foreground">What's next?</h3>
        <div className="space-y-3 text-left">
          {userType === 'customer' ? (
            <>
              <div className="flex items-start">
                <Icon name="Search" size={16} className="text-success mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-muted-foreground">
                  Browse and discover trusted service providers in your area
                </div>
              </div>
              <div className="flex items-start">
                <Icon name="Calendar" size={16} className="text-success mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-muted-foreground">
                  Book services with flexible scheduling options
                </div>
              </div>
              <div className="flex items-start">
                <Icon name="CreditCard" size={16} className="text-success mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-muted-foreground">
                  Pay securely with MTN MoMo or other payment methods
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start">
                <Icon name="User" size={16} className="text-success mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-muted-foreground">
                  Complete your profile and add your service portfolio
                </div>
              </div>
              <div className="flex items-start">
                <Icon name="MapPin" size={16} className="text-success mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-muted-foreground">
                  Set your service areas and availability
                </div>
              </div>
              <div className="flex items-start">
                <Icon name="DollarSign" size={16} className="text-success mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-muted-foreground">
                  Start receiving bookings and earning income
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <Button variant="default" fullWidth onClick={onContinue}>
          {userType === 'customer' ? 'Explore Services' : 'Complete Profile'}
        </Button>
        
        <div className="text-sm text-muted-foreground">
          You can always update your information later in account settings
        </div>
      </div>
    </div>
  );
};

export default SuccessMessage;