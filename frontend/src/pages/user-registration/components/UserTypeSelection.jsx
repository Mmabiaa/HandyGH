import React from 'react';
import Icon from '../../../components/AppIcon';

const UserTypeSelection = ({ selectedType, onTypeSelect }) => {
  const userTypes = [
    {
      id: 'customer',
      title: 'Customer',
      description: 'I need services and want to book providers',
      icon: 'User',
      features: ['Book services', 'Find providers', 'Track bookings', 'Leave reviews']
    },
    {
      id: 'provider',
      title: 'Service Provider',
      description: 'I offer services and want to find customers',
      icon: 'Briefcase',
      features: ['List services', 'Manage bookings', 'Build portfolio', 'Earn income']
    }
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-foreground mb-2">Choose Your Account Type</h2>
        <p className="text-muted-foreground">Select how you plan to use HandyGH</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {userTypes?.map((type) => (
          <div
            key={type?.id}
            onClick={() => onTypeSelect(type?.id)}
            className={`p-6 rounded-lg border-2 cursor-pointer micro-animation hover-shadow ${
              selectedType === type?.id
                ? 'border-primary bg-primary/5' :'border-border bg-card hover:border-primary/50'
            }`}
          >
            <div className="flex items-center mb-4">
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${
                  selectedType === type?.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <Icon name={type?.icon} size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{type?.title}</h3>
                <p className="text-sm text-muted-foreground">{type?.description}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              {type?.features?.map((feature, index) => (
                <div key={index} className="flex items-center text-sm text-muted-foreground">
                  <Icon name="Check" size={14} className="mr-2 text-success" />
                  {feature}
                </div>
              ))}
            </div>
            
            {selectedType === type?.id && (
              <div className="mt-4 flex items-center text-primary text-sm font-medium">
                <Icon name="CheckCircle" size={16} className="mr-2" />
                Selected
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserTypeSelection;