import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const LocationStep = ({ selectedLocation, onLocationSelect, onNext, onPrevious }) => {
  const [locationData, setLocationData] = useState(selectedLocation || {
    address: '',
    city: 'Accra',
    region: 'Greater Accra',
    landmark: '',
    instructions: '',
    useCurrentLocation: false
  });

  const [isValidatingAddress, setIsValidatingAddress] = useState(false);
  const [addressValidated, setAddressValidated] = useState(false);

  const cityOptions = [
    { value: 'Accra', label: 'Accra' },
    { value: 'Kumasi', label: 'Kumasi' },
    { value: 'Tamale', label: 'Tamale' },
    { value: 'Cape Coast', label: 'Cape Coast' },
    { value: 'Sekondi-Takoradi', label: 'Sekondi-Takoradi' },
    { value: 'Ho', label: 'Ho' },
    { value: 'Koforidua', label: 'Koforidua' },
    { value: 'Sunyani', label: 'Sunyani' }
  ];

  const regionOptions = [
    { value: 'Greater Accra', label: 'Greater Accra Region' },
    { value: 'Ashanti', label: 'Ashanti Region' },
    { value: 'Northern', label: 'Northern Region' },
    { value: 'Central', label: 'Central Region' },
    { value: 'Western', label: 'Western Region' },
    { value: 'Volta', label: 'Volta Region' },
    { value: 'Eastern', label: 'Eastern Region' },
    { value: 'Brong Ahafo', label: 'Brong Ahafo Region' }
  ];

  const handleInputChange = (field, value) => {
    const updatedLocation = { ...locationData, [field]: value };
    setLocationData(updatedLocation);
    onLocationSelect(updatedLocation);
    
    if (field === 'address') {
      setAddressValidated(false);
    }
  };

  const handleUseCurrentLocation = () => {
    setIsValidatingAddress(true);
    
    // Mock geolocation
    setTimeout(() => {
      const mockLocation = {
        address: 'East Legon, Accra',
        city: 'Accra',
        region: 'Greater Accra',
        landmark: 'Near A&C Mall',
        instructions: '',
        useCurrentLocation: true
      };
      
      setLocationData(mockLocation);
      onLocationSelect(mockLocation);
      setAddressValidated(true);
      setIsValidatingAddress(false);
    }, 2000);
  };

  const validateAddress = () => {
    if (!locationData?.address?.trim()) return;
    
    setIsValidatingAddress(true);
    
    // Mock address validation
    setTimeout(() => {
      setAddressValidated(true);
      setIsValidatingAddress(false);
    }, 1500);
  };

  const canProceed = locationData?.address && locationData?.city && locationData?.region;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Service Location</h3>
        <p className="text-muted-foreground">Provide the address where the service should be performed.</p>
      </div>
      {/* Current Location Option */}
      <div className="bg-muted/50 rounded-lg p-4">
        <Button
          variant="outline"
          onClick={handleUseCurrentLocation}
          loading={isValidatingAddress && locationData?.useCurrentLocation}
          iconName="MapPin"
          iconPosition="left"
          fullWidth
        >
          Use Current Location
        </Button>
      </div>
      {/* Manual Address Entry */}
      <div className="space-y-4">
        <div>
          <Input
            label="Street Address"
            type="text"
            placeholder="Enter your street address"
            required
            value={locationData?.address}
            onChange={(e) => handleInputChange('address', e?.target?.value)}
            description="Include house number, street name, and area"
          />
          
          {locationData?.address && !addressValidated && !isValidatingAddress && (
            <Button
              variant="ghost"
              size="sm"
              onClick={validateAddress}
              iconName="MapPin"
              iconPosition="left"
              className="mt-2"
            >
              Validate Address
            </Button>
          )}
          
          {isValidatingAddress && !locationData?.useCurrentLocation && (
            <div className="flex items-center space-x-2 mt-2 text-sm text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span>Validating address...</span>
            </div>
          )}
          
          {addressValidated && (
            <div className="flex items-center space-x-2 mt-2 text-sm text-success">
              <Icon name="CheckCircle" size={16} />
              <span>Address validated successfully</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="City"
            required
            options={cityOptions}
            value={locationData?.city}
            onChange={(value) => handleInputChange('city', value)}
          />
          
          <Select
            label="Region"
            required
            options={regionOptions}
            value={locationData?.region}
            onChange={(value) => handleInputChange('region', value)}
          />
        </div>

        <Input
          label="Nearby Landmark"
          type="text"
          placeholder="e.g., Near Shoprite, Behind GCB Bank"
          value={locationData?.landmark}
          onChange={(e) => handleInputChange('landmark', e?.target?.value)}
          description="Help the service provider locate you easily"
        />

        <Input
          label="Special Instructions"
          type="text"
          placeholder="Additional directions or access instructions"
          value={locationData?.instructions}
          onChange={(e) => handleInputChange('instructions', e?.target?.value)}
          description="Gate codes, parking instructions, etc."
        />
      </div>
      {/* Map Preview */}
      {addressValidated && (
        <div className="bg-card rounded-lg p-4 border">
          <h5 className="font-medium text-foreground mb-3">Location Preview</h5>
          <div className="w-full h-48 bg-muted rounded-lg overflow-hidden">
            <iframe
              width="100%"
              height="100%"
              loading="lazy"
              title="Service Location"
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps?q=5.6037,-0.1870&z=14&output=embed"
              className="border-0"
            />
          </div>
          <div className="mt-3 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-start space-x-3">
              <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">{locationData?.address}</p>
                <p className="text-xs text-muted-foreground">
                  {locationData?.city}, {locationData?.region}
                </p>
                {locationData?.landmark && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Near: {locationData?.landmark}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Service Area Notice */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={20} className="text-primary mt-0.5" />
          <div>
            <h5 className="font-medium text-primary mb-1">Service Area Coverage</h5>
            <p className="text-sm text-primary/80">
              This location is within our service area. Additional travel charges may apply for locations outside the city center.
            </p>
          </div>
        </div>
      </div>
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onPrevious}
          iconName="ArrowLeft"
          iconPosition="left"
        >
          Back to Date & Time
        </Button>
        
        <Button
          variant="default"
          disabled={!canProceed}
          onClick={onNext}
          iconName="ArrowRight"
          iconPosition="right"
        >
          Continue to Details
        </Button>
      </div>
    </div>
  );
};

export default LocationStep;