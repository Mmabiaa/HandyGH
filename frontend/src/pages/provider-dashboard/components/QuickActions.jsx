import React from 'react';
import Button from '../../../components/ui/Button';

const QuickActions = ({ onUpdateAvailability, onViewBookings, onManageProfile, onViewAnalytics }) => {
  const actions = [
    {
      title: 'Update Availability',
      description: 'Manage your schedule and time slots',
      icon: 'Calendar',
      variant: 'default',
      onClick: onUpdateAvailability
    },
    {
      title: 'View All Bookings',
      description: 'See all your upcoming and past bookings',
      icon: 'BookOpen',
      variant: 'outline',
      onClick: onViewBookings
    },
    {
      title: 'Manage Profile',
      description: 'Update your services and portfolio',
      icon: 'User',
      variant: 'outline',
      onClick: onManageProfile
    },
    {
      title: 'View Analytics',
      description: 'Track your performance and earnings',
      icon: 'BarChart3',
      variant: 'outline',
      onClick: onViewAnalytics
    }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6 card-shadow">
      <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions?.map((action, index) => (
          <Button
            key={index}
            variant={action?.variant}
            size="lg"
            iconName={action?.icon}
            iconPosition="left"
            onClick={action?.onClick}
            className="h-auto p-4 text-left justify-start"
          >
            <div>
              <div className="font-medium">{action?.title}</div>
              <div className="text-sm opacity-80 mt-1">{action?.description}</div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;