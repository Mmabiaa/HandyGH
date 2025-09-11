import React from 'react';
import Icon from '../../../components/AppIcon';

const BookingStats = ({ stats, userType }) => {
  const statCards = [
    {
      title: 'Total Bookings',
      value: stats?.total,
      icon: 'Calendar',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Pending',
      value: stats?.pending,
      icon: 'Clock',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      title: 'Completed',
      value: stats?.completed,
      icon: 'CheckCircle',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      title: userType === 'customer' ? 'Total Spent' : 'Total Earned',
      value: `GHS ${stats?.totalAmount?.toLocaleString()}`,
      icon: 'DollarSign',
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    }
  ];

  const completionRate = stats?.total > 0 ? ((stats?.completed / stats?.total) * 100)?.toFixed(1) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {statCards?.map((stat, index) => (
        <div key={index} className="bg-card border border-border rounded-lg p-6 hover-shadow micro-animation">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat?.title}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stat?.value}</p>
              {stat?.title === 'Completed' && (
                <p className="text-xs text-muted-foreground mt-1">
                  {completionRate}% completion rate
                </p>
              )}
            </div>
            <div className={`w-12 h-12 rounded-lg ${stat?.bgColor} flex items-center justify-center`}>
              <Icon name={stat?.icon} size={24} className={stat?.color} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BookingStats;