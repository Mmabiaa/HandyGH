import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const StatusOverview = ({ activeBookings, onViewBooking, onMessageProvider }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-success/10 text-success border-success/20';
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'in-progress':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'completed':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'CheckCircle';
      case 'pending':
        return 'Clock';
      case 'in-progress':
        return 'Play';
      case 'completed':
        return 'Check';
      default:
        return 'Circle';
    }
  };

  if (activeBookings?.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-6 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Calendar" size={24} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Active Bookings</h3>
        <p className="text-muted-foreground mb-4">
          You don't have any active bookings at the moment.
        </p>
        <Button variant="default" iconName="Plus" iconPosition="left">
          Book Your First Service
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Active Bookings</h2>
          <span className="text-sm text-muted-foreground">
            {activeBookings?.length} active
          </span>
        </div>
      </div>
      <div className="divide-y divide-border">
        {activeBookings?.map((booking) => (
          <div key={booking?.id} className="p-6 hover:bg-muted/50 micro-animation">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon name={booking?.serviceIcon} size={20} className="text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground truncate">
                        {booking?.serviceType}
                      </h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking?.status)}`}>
                        <Icon name={getStatusIcon(booking?.status)} size={12} />
                        {booking?.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      Provider: <span className="font-medium text-foreground">{booking?.providerName}</span>
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Icon name="Calendar" size={14} />
                        <span>{booking?.scheduledDate}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Icon name="Clock" size={14} />
                        <span>{booking?.scheduledTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Icon name="MapPin" size={14} />
                        <span>{booking?.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 lg:flex-col lg:items-end">
                <div className="text-right mb-2 hidden lg:block">
                  <div className="text-lg font-semibold text-foreground">
                    GHS {booking?.amount}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Booking #{booking?.id}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewBooking(booking?.id)}
                    iconName="Eye"
                    iconPosition="left"
                  >
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMessageProvider(booking?.providerId)}
                    iconName="MessageCircle"
                  >
                    <span className="sr-only">Message Provider</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusOverview;