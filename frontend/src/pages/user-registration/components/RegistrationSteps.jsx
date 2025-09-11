import React from 'react';
import Icon from '../../../components/AppIcon';

const RegistrationSteps = ({ currentStep, totalSteps }) => {
  const steps = [
    { id: 1, title: 'Account Type', icon: 'User' },
    { id: 2, title: 'Personal Info', icon: 'FileText' },
    { id: 3, title: 'Verification', icon: 'Shield' }
  ];

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between">
        {steps?.map((step, index) => (
          <React.Fragment key={step?.id}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 micro-animation ${
                  currentStep >= step?.id
                    ? 'bg-primary border-primary text-primary-foreground'
                    : currentStep === step?.id
                    ? 'bg-primary/10 border-primary text-primary' :'bg-muted border-border text-muted-foreground'
                }`}
              >
                {currentStep > step?.id ? (
                  <Icon name="Check" size={16} />
                ) : (
                  <Icon name={step?.icon} size={16} />
                )}
              </div>
              <div className="mt-2 text-center">
                <div
                  className={`text-xs font-medium ${
                    currentStep >= step?.id ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {step?.title}
                </div>
              </div>
            </div>
            {index < steps?.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-4 micro-animation ${
                  currentStep > step?.id ? 'bg-primary' : 'bg-border'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="mt-4 text-center">
        <span className="text-sm text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </span>
      </div>
    </div>
  );
};

export default RegistrationSteps;