import React from 'react';
import Icon from '../../../components/AppIcon';


const QuickActions = ({ onAction }) => {
  const quickActions = [
    {
      id: 'book-service',
      title: 'Book Service',
      description: 'Find and book a new service',
      icon: 'Plus',
      color: 'bg-primary text-primary-foreground',
      action: () => onAction('book-service')
    },
    {
      id: 'messages',
      title: 'Messages',
      description: 'Chat with providers',
      icon: 'MessageCircle',
      color: 'bg-secondary text-secondary-foreground',
      action: () => onAction('messages')
    },
    {
      id: 'bookings',
      title: 'My Bookings',
      description: 'Manage your bookings',
      icon: 'Calendar',
      color: 'bg-accent text-accent-foreground',
      action: () => onAction('bookings')
    },
    {
      id: 'history',
      title: 'Service History',
      description: 'View past services',
      icon: 'History',
      color: 'bg-success text-success-foreground',
      action: () => onAction('history')
    }
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions?.map((action) => (
          <button
            key={action?.id}
            onClick={action?.action}
            className="group p-4 rounded-lg border border-border hover:border-primary/20 hover:shadow-md micro-animation text-left"
          >
            <div className={`w-12 h-12 rounded-lg ${action?.color} flex items-center justify-center mb-3 group-hover:scale-105 micro-animation`}>
              <Icon name={action?.icon} size={20} />
            </div>
            
            <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary micro-animation">
              {action?.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {action?.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;