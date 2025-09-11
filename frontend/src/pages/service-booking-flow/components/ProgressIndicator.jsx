import React from 'react';
import Icon from '../../../components/AppIcon';

const ProgressIndicator = ({ currentStep, totalSteps, steps }) => {
  return (
    <div className="bg-card rounded-lg p-6 card-shadow mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Booking Progress</h2>
        <span className="text-sm text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </span>
      </div>
      <div className="flex items-center space-x-2">
        {steps?.map((step, index) => (
          <React.Fragment key={step?.id}>
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium micro-animation ${
                  index + 1 < currentStep
                    ? 'bg-success text-success-foreground'
                    : index + 1 === currentStep
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {index + 1 < currentStep ? (
                  <Icon name="Check" size={16} />
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`ml-2 text-sm font-medium hidden sm:block ${
                  index + 1 <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {step?.title}
              </span>
            </div>
            {index < steps?.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 ${
                  index + 1 < currentStep ? 'bg-success' : 'bg-border'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ProgressIndicator;