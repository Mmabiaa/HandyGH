import React from 'react';
import Button from '../../../components/ui/Button';


const WelcomePanel = ({ userName, onBookService, onFindProviders }) => {
  const currentHour = new Date()?.getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-6 text-white mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {greeting}, {userName}!
          </h1>
          <p className="text-white/90 text-lg">
            Ready to book your next service? Let's get started.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={onBookService}
            iconName="Plus"
            iconPosition="left"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
          >
            Book Service
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={onFindProviders}
            iconName="Search"
            iconPosition="left"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
          >
            Find Providers
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePanel;