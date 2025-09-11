import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import BookingDetailsModal from './BookingDetailsModal';

const BookingTable = ({ bookings, userType, onStatusUpdate, onReschedule, onCancel }) => {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-warning/10 text-warning border-warning/20',
      confirmed: 'bg-primary/10 text-primary border-primary/20',
      'in-progress': 'bg-accent/10 text-accent border-accent/20',
      completed: 'bg-success/10 text-success border-success/20',
      cancelled: 'bg-error/10 text-error border-error/20'
    };
    return colors?.[status] || 'bg-muted text-muted-foreground';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: 'Clock',
      confirmed: 'CheckCircle2',
      'in-progress': 'Play',
      completed: 'Check',
      cancelled: 'X'
    };
    return icons?.[status] || 'Circle';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`)?.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setIsDetailsModalOpen(true);
  };

  const canReschedule = (booking) => {
    return booking?.status === 'pending' || booking?.status === 'confirmed';
  };

  const canCancel = (booking) => {
    return booking?.status === 'pending' || booking?.status === 'confirmed';
  };

  const canMarkComplete = (booking) => {
    return booking?.status === 'in-progress' && userType === 'provider';
  };

  const canMarkInProgress = (booking) => {
    return booking?.status === 'confirmed' && userType === 'provider';
  };

  if (bookings?.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-12 text-center">
        <Icon name="Calendar" size={48} className="text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No bookings found</h3>
        <p className="text-muted-foreground mb-4">
          {userType === 'customer' ? "You haven't made any bookings yet. Start by finding a service provider." :"You don't have any bookings yet. Customers will find you soon!"
          }
        </p>
        <Button variant="default" iconName="Plus" iconPosition="left">
          {userType === 'customer' ? 'Find Services' : 'Update Profile'}
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden lg:block bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-foreground">Service</th>
                <th className="text-left py-3 px-4 font-medium text-foreground">
                  {userType === 'customer' ? 'Provider' : 'Customer'}
                </th>
                <th className="text-left py-3 px-4 font-medium text-foreground">Date & Time</th>
                <th className="text-left py-3 px-4 font-medium text-foreground">Status</th>
                <th className="text-left py-3 px-4 font-medium text-foreground">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings?.map((booking) => (
                <tr key={booking?.id} className="border-b border-border hover:bg-muted/30 micro-animation">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon name={booking?.serviceIcon} size={20} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{booking?.serviceName}</p>
                        <p className="text-sm text-muted-foreground">{booking?.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                        <Icon name="User" size={16} className="text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{booking?.otherPartyName}</p>
                        <div className="flex items-center space-x-1">
                          <Icon name="Star" size={12} className="text-warning fill-current" />
                          <span className="text-sm text-muted-foreground">{booking?.rating}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-foreground">{formatDate(booking?.date)}</p>
                      <p className="text-sm text-muted-foreground">{formatTime(booking?.time)}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(booking?.status)}`}>
                      <Icon name={getStatusIcon(booking?.status)} size={12} className="mr-1" />
                      {booking?.status?.charAt(0)?.toUpperCase() + booking?.status?.slice(1)?.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-semibold text-foreground">GHS {booking?.amount?.toLocaleString()}</p>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(booking)}
                        iconName="Eye"
                      />
                      {canReschedule(booking) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onReschedule(booking)}
                          iconName="Calendar"
                        />
                      )}
                      {canMarkInProgress(booking) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onStatusUpdate(booking?.id, 'in-progress')}
                          iconName="Play"
                        />
                      )}
                      {canMarkComplete(booking) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onStatusUpdate(booking?.id, 'completed')}
                          iconName="Check"
                        />
                      )}
                      {canCancel(booking) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onCancel(booking)}
                          iconName="X"
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {bookings?.map((booking) => (
          <div key={booking?.id} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name={booking?.serviceIcon} size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{booking?.serviceName}</p>
                  <p className="text-sm text-muted-foreground">{booking?.category}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(booking?.status)}`}>
                <Icon name={getStatusIcon(booking?.status)} size={12} className="mr-1" />
                {booking?.status?.charAt(0)?.toUpperCase() + booking?.status?.slice(1)?.replace('-', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {userType === 'customer' ? 'Provider' : 'Customer'}
                </p>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                    <Icon name="User" size={12} className="text-muted-foreground" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{booking?.otherPartyName}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Amount</p>
                <p className="text-sm font-semibold text-foreground">GHS {booking?.amount?.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Date & Time</p>
                <p className="text-sm font-medium text-foreground">
                  {formatDate(booking?.date)} at {formatTime(booking?.time)}
                </p>
              </div>
              <div className="flex items-center space-x-1">
                <Icon name="Star" size={12} className="text-warning fill-current" />
                <span className="text-sm text-muted-foreground">{booking?.rating}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewDetails(booking)}
                iconName="Eye"
                iconPosition="left"
                fullWidth
              >
                View Details
              </Button>
              {canReschedule(booking) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReschedule(booking)}
                  iconName="Calendar"
                />
              )}
              {canCancel(booking) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCancel(booking)}
                  iconName="X"
                />
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Booking Details Modal */}
      {isDetailsModalOpen && selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          userType={userType}
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedBooking(null);
          }}
          onStatusUpdate={onStatusUpdate}
          onReschedule={onReschedule}
          onCancel={onCancel}
        />
      )}
    </>
  );
};

export default BookingTable;