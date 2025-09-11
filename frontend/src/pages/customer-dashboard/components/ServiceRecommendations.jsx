import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ServiceRecommendations = ({ recommendations, onBookService, onViewProvider }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 3;
  const maxIndex = Math.max(0, recommendations?.length - itemsPerPage);

  const nextSlide = () => {
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Icon
        key={index}
        name="Star"
        size={12}
        className={index < Math.floor(rating) ? 'text-accent fill-current' : 'text-muted-foreground'}
      />
    ));
  };

  if (recommendations?.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-6 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Sparkles" size={24} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Recommendations Yet</h3>
        <p className="text-muted-foreground">
          Book a few services to get personalized recommendations.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Sparkles" size={20} className="text-accent" />
            <h2 className="text-xl font-semibold text-foreground">Recommended for You</h2>
          </div>
          
          {recommendations?.length > itemsPerPage && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevSlide}
                disabled={currentIndex === 0}
                iconName="ChevronLeft"
              >
                <span className="sr-only">Previous</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={nextSlide}
                disabled={currentIndex >= maxIndex}
                iconName="ChevronRight"
              >
                <span className="sr-only">Next</span>
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="p-6">
        <div className="overflow-hidden">
          <div 
            className="flex transition-transform duration-300 ease-in-out gap-4"
            style={{ transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)` }}
          >
            {recommendations?.map((recommendation) => (
              <div key={recommendation?.id} className="flex-shrink-0 w-full md:w-1/3">
                <div className="border border-border rounded-lg overflow-hidden hover:shadow-md micro-animation">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={recommendation?.image}
                      alt={recommendation?.serviceType}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                        <Icon name="TrendingUp" size={12} />
                        Recommended
                      </span>
                    </div>
                    {recommendation?.discount && (
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-error text-error-foreground">
                          {recommendation?.discount}% OFF
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">
                        {recommendation?.serviceType}
                      </h3>
                      <div className="text-right">
                        <div className="text-lg font-bold text-foreground">
                          GHS {recommendation?.price}
                        </div>
                        {recommendation?.originalPrice && (
                          <div className="text-sm text-muted-foreground line-through">
                            GHS {recommendation?.originalPrice}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        <Image
                          src={recommendation?.providerAvatar}
                          alt={recommendation?.providerName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {recommendation?.providerName}
                        </p>
                        <div className="flex items-center gap-1">
                          {renderStars(recommendation?.rating)}
                          <span className="text-xs text-muted-foreground ml-1">
                            ({recommendation?.reviewCount})
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Icon name="MapPin" size={12} />
                        <span>{recommendation?.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Icon name="Clock" size={12} />
                        <span>{recommendation?.duration}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {recommendation?.description}
                    </p>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onBookService(recommendation)}
                        iconName="Calendar"
                        iconPosition="left"
                        className="flex-1"
                      >
                        Book Now
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewProvider(recommendation?.providerId)}
                        iconName="Eye"
                      >
                        <span className="sr-only">View Provider</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {recommendations?.length > itemsPerPage && (
          <div className="flex justify-center mt-4">
            <div className="flex gap-2">
              {Array.from({ length: Math.ceil(recommendations?.length / itemsPerPage) }, (_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full micro-animation ${
                    Math.floor(currentIndex / itemsPerPage) === index
                      ? 'bg-primary' :'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceRecommendations;