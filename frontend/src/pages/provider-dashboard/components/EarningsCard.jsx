import React from 'react';
import Icon from '../../../components/AppIcon';

const EarningsCard = ({ title, amount, change, changeType, icon, iconColor }) => {
  return (
    <div className="bg-card border border-border rounded-lg p-6 card-shadow hover-shadow micro-animation">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconColor}`}>
          <Icon name={icon} size={24} color="white" />
        </div>
        {change && (
          <div className={`flex items-center text-sm ${
            changeType === 'positive' ? 'text-success' : 'text-error'
          }`}>
            <Icon 
              name={changeType === 'positive' ? 'TrendingUp' : 'TrendingDown'} 
              size={16} 
              className="mr-1" 
            />
            {change}%
          </div>
        )}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-1">{amount}</h3>
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
    </div>
  );
};

export default EarningsCard;