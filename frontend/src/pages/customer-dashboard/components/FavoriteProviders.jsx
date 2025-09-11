import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const FavoriteProviders = ({ favoriteProviders, onBookProvider, onViewProfile, onRemoveFavorite }) => {
  const getAvailabilityStatus = (isAvailable) => {
    return isAvailable 
      ? { color: 'text-success', bg: 'bg-success/10', text: 'Available' }
      : { color: 'text-error', bg: 'bg-error/10', text: 'Busy' };
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Icon
        key={index}
        name="Star"
        size={14}
        className={index < Math.floor(rating) ? 'text-accent fill-current' : 'text-muted-foreground'}
      />
    ));
  };

  if (favoriteProviders?.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-6 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Heart" size={24} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Favorite Providers</h3>
        <p className="text-muted-foreground mb-4">
          Save providers you love for quick access and easy rebooking.
        </p>
        <Button variant="default" iconName="Search" iconPosition="left">
          Find Providers
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Favorite Providers</h2>
          <span className="text-sm text-muted-foreground">
            {favoriteProviders?.length} saved
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favoriteProviders?.map((provider) => {
            const availability = getAvailabilityStatus(provider?.isAvailable);
            
            return (
              <div key={provider?.id} className="border border-border rounded-lg p-4 hover:shadow-md micro-animation">
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <Image
                        src={provider?.avatar}
                        alt={provider?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${provider?.isAvailable ? 'bg-success' : 'bg-error'}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground truncate">
                          {provider?.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {provider?.specialization}
                        </p>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveFavorite(provider?.id)}
                        iconName="Heart"
                        className="text-error hover:text-error/80 fill-current"
                      >
                        <span className="sr-only">Remove from favorites</span>
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        {renderStars(provider?.rating)}
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {provider?.rating}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({provider?.reviewCount} reviews)
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${availability?.bg} ${availability?.color}`}>
                          <div className={`w-2 h-2 rounded-full ${provider?.isAvailable ? 'bg-success' : 'bg-error'}`} />
                          {availability?.text}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          GHS {provider?.hourlyRate}/hr
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onBookProvider(provider?.id)}
                        disabled={!provider?.isAvailable}
                        iconName="Calendar"
                        iconPosition="left"
                        className="flex-1"
                      >
                        Book Now
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewProfile(provider?.id)}
                        iconName="Eye"
                      >
                        <span className="sr-only">View Profile</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 pt-4 border-t border-border">
          <Button variant="ghost" size="sm" fullWidth iconName="Plus" iconPosition="left">
            Find More Providers
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FavoriteProviders;