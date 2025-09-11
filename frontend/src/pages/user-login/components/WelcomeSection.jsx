import React from 'react';
import Icon from '../../../components/AppIcon';

const WelcomeSection = () => {
  const features = [
    {
      icon: 'Users',
      title: 'Trusted Providers',
      description: 'Connect with verified local service professionals'
    },
    {
      icon: 'Shield',
      title: 'Secure Payments',
      description: 'Safe transactions with MTN MoMo integration'
    },
    {
      icon: 'Clock',
      title: 'Quick Booking',
      description: 'Book services instantly with real-time availability'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mr-4">
            <Icon name="Wrench" size={24} color="white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">HandyGH</h1>
        </div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Welcome Back</h2>
        <p className="text-muted-foreground">
          Sign in to access Ghana's premier local services marketplace
        </p>
      </div>
      <div className="space-y-6">
        {features?.map((feature, index) => (
          <div key={index} className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon name={feature?.icon} size={18} className="text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">{feature?.title}</h3>
              <p className="text-sm text-muted-foreground">{feature?.description}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-center mb-2">
          <Icon name="Star" size={16} className="text-warning mr-2" />
          <span className="text-sm font-medium text-foreground">4.8/5 Rating</span>
        </div>
        <p className="text-sm text-muted-foreground">
          "HandyGH made finding a reliable plumber so easy. Highly recommended!"
        </p>
        <p className="text-xs text-muted-foreground mt-2">- Sarah K., Accra</p>
      </div>
    </div>
  );
};

export default WelcomeSection;