import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';

const ServiceDetailsStep = ({ serviceDetails, onDetailsUpdate, onNext, onPrevious }) => {
  const [details, setDetails] = useState(serviceDetails || {
    requirements: '',
    accessInstructions: '',
    preferredContact: 'phone',
    hasTools: false,
    hasMaterials: false,
    petFriendly: false,
    urgentNotes: ''
  });

  const handleInputChange = (field, value) => {
    const updatedDetails = { ...details, [field]: value };
    setDetails(updatedDetails);
    onDetailsUpdate(updatedDetails);
  };

  const commonRequirements = [
    'Bring all necessary tools',
    'Provide materials estimate',
    'Clean up after work',
    'Wear protective equipment',
    'Take before/after photos'
  ];

  const toggleRequirement = (requirement) => {
    const currentReqs = details?.requirements?.split('\n')?.filter(r => r?.trim());
    const hasRequirement = currentReqs?.includes(requirement);
    
    let updatedReqs;
    if (hasRequirement) {
      updatedReqs = currentReqs?.filter(r => r !== requirement);
    } else {
      updatedReqs = [...currentReqs, requirement];
    }
    
    handleInputChange('requirements', updatedReqs?.join('\n'));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Service Details</h3>
        <p className="text-muted-foreground">Provide additional information to help the service provider prepare.</p>
      </div>
      {/* Special Requirements */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Special Requirements
        </label>
        <textarea
          value={details?.requirements}
          onChange={(e) => handleInputChange('requirements', e?.target?.value)}
          placeholder="Describe any specific requirements, preferences, or details about the work needed..."
          rows={4}
          className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
        />
        
        {/* Quick Requirements */}
        <div className="mt-3">
          <p className="text-sm text-muted-foreground mb-2">Quick add common requirements:</p>
          <div className="flex flex-wrap gap-2">
            {commonRequirements?.map((req) => (
              <button
                key={req}
                onClick={() => toggleRequirement(req)}
                className={`px-3 py-1 rounded-full text-sm micro-animation ${
                  details?.requirements?.includes(req)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-primary/10'
                }`}
              >
                {req}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Access Instructions */}
      <div>
        <Input
          label="Access Instructions"
          type="text"
          placeholder="Gate codes, parking instructions, building access, etc."
          value={details?.accessInstructions}
          onChange={(e) => handleInputChange('accessInstructions', e?.target?.value)}
          description="Help the service provider access your location easily"
        />
      </div>
      {/* Contact Preferences */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Preferred Contact Method
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { value: 'phone', label: 'Phone Call', icon: 'Phone' },
            { value: 'sms', label: 'SMS/Text', icon: 'MessageSquare' },
            { value: 'whatsapp', label: 'WhatsApp', icon: 'MessageCircle' }
          ]?.map((method) => (
            <div
              key={method?.value}
              onClick={() => handleInputChange('preferredContact', method?.value)}
              className={`p-3 rounded-lg border-2 cursor-pointer text-center micro-animation ${
                details?.preferredContact === method?.value
                  ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
              }`}
            >
              <Icon name={method?.icon} size={20} className="mx-auto mb-2" />
              <span className="text-sm font-medium">{method?.label}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Additional Options */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-foreground">Additional Information</h4>
        
        <div className="space-y-3">
          <Checkbox
            label="I have the necessary tools available"
            description="Check if you have tools that the provider can use"
            checked={details?.hasTools}
            onChange={(e) => handleInputChange('hasTools', e?.target?.checked)}
          />
          
          <Checkbox
            label="I will provide materials"
            description="Check if you're supplying materials for the job"
            checked={details?.hasMaterials}
            onChange={(e) => handleInputChange('hasMaterials', e?.target?.checked)}
          />
          
          <Checkbox
            label="Pet-friendly service required"
            description="Check if pets will be present during service"
            checked={details?.petFriendly}
            onChange={(e) => handleInputChange('petFriendly', e?.target?.checked)}
          />
        </div>
      </div>
      {/* Urgent Notes */}
      <div>
        <Input
          label="Urgent Notes"
          type="text"
          placeholder="Any urgent information the provider should know immediately"
          value={details?.urgentNotes}
          onChange={(e) => handleInputChange('urgentNotes', e?.target?.value)}
          description="This will be highlighted in the provider notification"
        />
      </div>
      {/* Service Preparation Tips */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h5 className="font-medium text-foreground mb-2 flex items-center">
          <Icon name="Lightbulb" size={16} className="mr-2" />
          Preparation Tips
        </h5>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Clear the work area of personal items</li>
          <li>• Ensure easy access to the service location</li>
          <li>• Have any relevant documents ready (warranties, manuals)</li>
          <li>• Prepare a list of questions for the service provider</li>
        </ul>
      </div>
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onPrevious}
          iconName="ArrowLeft"
          iconPosition="left"
        >
          Back to Location
        </Button>
        
        <Button
          variant="default"
          onClick={onNext}
          iconName="ArrowRight"
          iconPosition="right"
        >
          Continue to Payment
        </Button>
      </div>
    </div>
  );
};

export default ServiceDetailsStep;