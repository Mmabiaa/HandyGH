import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RecentActivity = ({ activities, onViewActivity }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'booking_confirmed':
        return 'CheckCircle';
      case 'message_received':
        return 'MessageCircle';
      case 'service_completed':
        return 'Check';
      case 'payment_processed':
        return 'CreditCard';
      case 'booking_cancelled':
        return 'X';
      case 'provider_assigned':
        return 'User';
      default:
        return 'Bell';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'booking_confirmed': case'service_completed':
        return 'text-success';
      case 'message_received':
        return 'text-primary';
      case 'payment_processed':
        return 'text-accent';
      case 'booking_cancelled':
        return 'text-error';
      case 'provider_assigned':
        return 'text-secondary';
      default:
        return 'text-muted-foreground';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
          <Button variant="ghost" size="sm" iconName="MoreHorizontal">
            <span className="sr-only">More options</span>
          </Button>
        </div>
      </div>
      <div className="divide-y divide-border max-h-96 overflow-y-auto">
        {activities?.length === 0 ? (
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <Icon name="Activity" size={20} className="text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No recent activity</p>
          </div>
        ) : (
          activities?.map((activity) => (
            <div key={activity?.id} className="p-4 hover:bg-muted/50 micro-animation">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 ${getActivityColor(activity?.type)}`}>
                  <Icon name={getActivityIcon(activity?.type)} size={16} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground mb-1">
                        {activity?.title}
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">
                        {activity?.description}
                      </p>
                      
                      {activity?.metadata && (
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {activity?.metadata?.bookingId && (
                            <span>Booking #{activity?.metadata?.bookingId}</span>
                          )}
                          {activity?.metadata?.provider && (
                            <span>Provider: {activity?.metadata?.provider}</span>
                          )}
                          {activity?.metadata?.amount && (
                            <span>Amount: GHS {activity?.metadata?.amount}</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(activity?.timestamp)}
                      </span>
                      {activity?.actionable && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewActivity(activity)}
                          className="mt-1 h-6 px-2 text-xs"
                        >
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {activities?.length > 0 && (
        <div className="p-4 border-t border-border">
          <Button variant="ghost" size="sm" fullWidth>
            View All Activity
          </Button>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;