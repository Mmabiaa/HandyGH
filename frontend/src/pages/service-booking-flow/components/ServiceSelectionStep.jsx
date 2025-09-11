import React, { useState, useEffect } from 'react';
import { bookingService } from '../../../services/bookingService';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { cn } from '../../../utils/cn';

const ServiceSelectionStep = ({ selectedService, onServiceSelect, onNext }) => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadServices();
  }, [selectedCategory]);

  const loadInitialData = async () => {
    try {
      const [categoriesData, servicesData] = await Promise.all([
        bookingService?.getServiceCategories(),
        bookingService?.getAvailableServices()
      ]);
      
      setCategories(categoriesData);
      setServices(servicesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      const servicesData = await bookingService?.getAvailableServices(selectedCategory);
      setServices(servicesData);
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const handleServiceSelect = (service) => {
    // Format service data for booking flow
    const formattedService = {
      id: service?.id,
      name: service?.name,
      description: service?.description,
      basePrice: service?.base_price,
      price: service?.base_price, // alias for compatibility
      duration: service?.duration_minutes,
      providerId: service?.provider_id,
      providerName: service?.provider?.business_name,
      providerRating: service?.provider?.rating,
      category: service?.category?.name,
      categoryIcon: service?.category?.icon_name
    };

    onServiceSelect(formattedService);
  };

  const filteredServices = services?.filter(service =>
    service?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    service?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    service?.provider?.business_name?.toLowerCase()?.includes(searchQuery?.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Icon name="Loader2" size={32} className="mx-auto animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading available services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Select a Service</h2>
        <p className="text-muted-foreground">
          Choose the service you need from our trusted providers
        </p>
      </div>
      {/* Search Bar */}
      <div className="relative">
        <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search services or providers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e?.target?.value)}
          className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
      {/* Service Categories */}
      <div className="space-y-3">
        <h3 className="font-medium text-foreground">Filter by Category</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              "px-3 py-2 rounded-full text-sm font-medium transition-colors",
              !selectedCategory
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            All Categories
          </button>
          {categories?.map((category) => (
            <button
              key={category?.id}
              onClick={() => setSelectedCategory(category?.id)}
              className={cn(
                "px-3 py-2 rounded-full text-sm font-medium transition-colors flex items-center space-x-1",
                selectedCategory === category?.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <Icon name={category?.icon_name} size={16} />
              <span>{category?.name}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Services Grid */}
      {filteredServices?.length === 0 ? (
        <div className="text-center py-8">
          <Icon name="Search" size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {searchQuery ? 'No services found matching your search.' : 'No services available.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredServices?.map((service) => (
            <div
              key={service?.id}
              className={cn(
                "border border-border rounded-lg p-4 cursor-pointer transition-all hover:border-primary hover:shadow-md",
                selectedService?.id === service?.id && "border-primary bg-primary/5"
              )}
              onClick={() => handleServiceSelect(service)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Icon name={service?.category?.icon_name || 'Wrench'} size={20} className="text-primary" />
                  <span className="text-sm text-muted-foreground">{service?.category?.name}</span>
                </div>
                <span className="text-lg font-bold text-primary">
                  {bookingService?.formatAmount(service?.base_price)}
                </span>
              </div>

              <h3 className="font-semibold text-foreground mb-2">{service?.name}</h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {service?.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    {service?.provider?.business_name}
                  </p>
                  <div className="flex items-center space-x-1">
                    <Icon name="Star" size={14} className="text-yellow-400 fill-current" />
                    <span className="text-sm text-muted-foreground">
                      {service?.provider?.rating?.toFixed(1) || '0.0'} 
                      ({service?.provider?.total_reviews || 0} reviews)
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="text-sm font-medium text-foreground">
                    {service?.duration_minutes || 60} mins
                  </p>
                </div>
              </div>

              {selectedService?.id === service?.id && (
                <div className="mt-3 flex items-center justify-center">
                  <div className="flex items-center space-x-1 text-primary">
                    <Icon name="Check" size={16} />
                    <span className="text-sm font-medium">Selected</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {/* Continue Button */}
      <div className="flex justify-end">
        <Button
          onClick={onNext}
          disabled={!selectedService}
          iconName="ArrowRight"
          iconPosition="right"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default ServiceSelectionStep;