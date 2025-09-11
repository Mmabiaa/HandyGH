import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const MessageCenter = ({ messages, onReply, onViewAll }) => {
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 card-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Recent Messages</h3>
        <Button variant="ghost" size="sm" onClick={onViewAll}>
          View All
        </Button>
      </div>
      <div className="space-y-4">
        {messages?.map((message) => (
          <div key={message?.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 micro-animation">
            <div className="relative">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon name="User" size={16} className="text-primary" />
              </div>
              {message?.unread && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full"></div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium text-foreground truncate">
                  {message?.customerName}
                </h4>
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(message?.timestamp)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {message?.content}
              </p>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="xs" 
                  iconName="Reply" 
                  iconPosition="left"
                  onClick={() => onReply(message?.id)}
                >
                  Reply
                </Button>
                {message?.bookingId && (
                  <span className="text-xs text-muted-foreground">
                    Booking #{message?.bookingId}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {messages?.length === 0 && (
        <div className="text-center py-8">
          <Icon name="MessageCircle" size={48} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No recent messages</p>
        </div>
      )}
    </div>
  );
};

export default MessageCenter;