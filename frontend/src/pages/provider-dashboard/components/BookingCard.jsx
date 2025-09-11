import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BookingCard = ({ booking, onAccept, onReschedule, onComplete, onViewDetails }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-warning/10 text-warning border-warning/20';
      case 'confirmed': return 'bg-success/10 text-success border-success/20';
      case 'in-progress': return 'bg-primary/10 text-primary border-primary/20';
      case 'completed': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    const time = new Date(`2000-01-01T${timeString}`);
    return time?.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 card-shadow hover-shadow micro-animation">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Icon name="User" size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{booking?.customerName}</h3>
            <p className="text-sm text-muted-foreground">{booking?.service}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking?.status)}`}>
          {booking?.status?.charAt(0)?.toUpperCase() + booking?.status?.slice(1)}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <Icon name="Calendar" size={16} className="mr-2" />
          {formatDate(booking?.date)}
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Icon name="Clock" size={16} className="mr-2" />
          {formatTime(booking?.time)}
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Icon name="MapPin" size={16} className="mr-2" />
          {booking?.location}
        </div>
        <div className="flex items-center text-sm text-foreground font-medium">
          <Icon name="DollarSign" size={16} className="mr-2" />
          GHS {booking?.amount}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {booking?.status === 'pending' && (
          <>
            <Button 
              variant="default" 
              size="sm" 
              iconName="Check" 
              iconPosition="left"
              onClick={() => onAccept(booking?.id)}
            >
              Accept
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              iconName="Calendar" 
              iconPosition="left"
              onClick={() => onReschedule(booking?.id)}
            >
              Reschedule
            </Button>
          </>
        )}
        {booking?.status === 'confirmed' && (
          <Button 
            variant="success" 
            size="sm" 
            iconName="CheckCircle" 
            iconPosition="left"
            onClick={() => onComplete(booking?.id)}
          >
            Mark Complete
          </Button>
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          iconName="Eye" 
          iconPosition="left"
          onClick={() => onViewDetails(booking?.id)}
        >
          View Details
        </Button>
      </div>
    </div>
  );
};

export default BookingCard;