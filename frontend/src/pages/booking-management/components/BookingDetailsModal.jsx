import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const BookingDetailsModal = ({ 
  booking, 
  userType, 
  isOpen, 
  onClose, 
  onStatusUpdate, 
  onReschedule, 
  onCancel 
}) => {
  const [activeTab, setActiveTab] = useState('details');
  const [message, setMessage] = useState('');

  if (!isOpen || !booking) return null;

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
      weekday: 'long',
      day: '2-digit',
      month: 'long',
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

  const mockMessages = [
    {
      id: 1,
      sender: userType === 'customer' ? booking?.otherPartyName : 'You',
      message: "Hi! I\'m confirming our appointment for tomorrow. I\'ll arrive on time.",
      timestamp: new Date(Date.now() - 3600000),
      isOwn: userType !== 'customer'
    },
    {
      id: 2,
      sender: userType === 'customer' ? 'You' : booking?.otherPartyName,
      message: "Perfect! I'll be ready. Do you need any specific tools or materials?",
      timestamp: new Date(Date.now() - 1800000),
      isOwn: userType === 'customer'
    },
    {
      id: 3,
      sender: userType === 'customer' ? booking?.otherPartyName : 'You',
      message: "I\'ll bring everything needed. See you tomorrow!",
      timestamp: new Date(Date.now() - 900000),
      isOwn: userType !== 'customer'
    }
  ];

  const tabs = [
    { id: 'details', label: 'Details', icon: 'FileText' },
    { id: 'messages', label: 'Messages', icon: 'MessageCircle' },
    { id: 'payment', label: 'Payment', icon: 'CreditCard' }
  ];

  const handleSendMessage = () => {
    if (message?.trim()) {
      // Handle message sending
      setMessage('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden modal-shadow">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name={booking?.serviceIcon} size={24} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{booking?.serviceName}</h2>
              <p className="text-muted-foreground">Booking #{booking?.id}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium border ${getStatusColor(booking?.status)}`}>
              <Icon name={getStatusIcon(booking?.status)} size={16} className="mr-2" />
              {booking?.status?.charAt(0)?.toUpperCase() + booking?.status?.slice(1)?.replace('-', ' ')}
            </span>
            <Button variant="ghost" size="sm" onClick={onClose} iconName="X" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {tabs?.map((tab) => (
            <button
              key={tab?.id}
              onClick={() => setActiveTab(tab?.id)}
              className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 micro-animation ${
                activeTab === tab?.id
                  ? 'border-primary text-primary bg-primary/5' :'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Icon name={tab?.icon} size={16} className="mr-2" />
              {tab?.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Service Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Service Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Service</p>
                        <p className="font-medium text-foreground">{booking?.serviceName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Category</p>
                        <p className="font-medium text-foreground">{booking?.category}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Description</p>
                        <p className="text-foreground">{booking?.description}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium text-foreground">{booking?.location}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      {userType === 'customer' ? 'Provider' : 'Customer'} Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                          <Icon name="User" size={20} className="text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{booking?.otherPartyName}</p>
                          <div className="flex items-center space-x-1">
                            <Icon name="Star" size={14} className="text-warning fill-current" />
                            <span className="text-sm text-muted-foreground">{booking?.rating} rating</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium text-foreground">{booking?.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium text-foreground">{booking?.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule & Payment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Schedule</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium text-foreground">{formatDate(booking?.date)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p className="font-medium text-foreground">{formatTime(booking?.time)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium text-foreground">{booking?.duration} hours</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Payment</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="text-xl font-bold text-foreground">GHS {booking?.amount?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Status</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                        booking?.paymentStatus === 'paid' ?'bg-success/10 text-success' :'bg-warning/10 text-warning'
                      }`}>
                        {booking?.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Method</p>
                      <p className="font-medium text-foreground">{booking?.paymentMethod}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Messages</h3>
              
              {/* Messages List */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {mockMessages?.map((msg) => (
                  <div key={msg?.id} className={`flex ${msg?.isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg?.isOwn 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-foreground'
                    }`}>
                      <p className="text-sm">{msg?.message}</p>
                      <p className={`text-xs mt-1 ${
                        msg?.isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        {msg?.timestamp?.toLocaleTimeString('en-GB', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="flex items-center space-x-2 pt-4 border-t border-border">
                <Input
                  type="text"
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e?.target?.value)}
                  onKeyPress={(e) => e?.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button 
                  variant="default" 
                  onClick={handleSendMessage}
                  iconName="Send"
                  disabled={!message?.trim()}
                />
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Payment Details</h3>
              
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-foreground">Service Amount</span>
                  <span className="font-medium text-foreground">GHS {booking?.amount?.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-foreground">Platform Fee</span>
                  <span className="font-medium text-foreground">GHS {(booking?.amount * 0.05)?.toLocaleString()}</span>
                </div>
                <hr className="border-border mb-4" />
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-foreground">Total</span>
                  <span className="text-lg font-bold text-foreground">
                    GHS {(booking?.amount * 1.05)?.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Payment Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Method:</span>
                      <span className="text-foreground">{booking?.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className={`font-medium ${
                        booking?.paymentStatus === 'paid' ? 'text-success' : 'text-warning'
                      }`}>
                        {booking?.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transaction ID:</span>
                      <span className="text-foreground font-mono text-sm">TXN{booking?.id}2024</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-3">Billing Address</h4>
                  <div className="text-sm text-muted-foreground">
                    <p>{booking?.billingAddress?.street || '123 Main Street'}</p>
                    <p>{booking?.billingAddress?.city || 'Accra'}, {booking?.billingAddress?.region || 'Greater Accra'}</p>
                    <p>{booking?.billingAddress?.postalCode || 'GA-123-4567'}</p>
                    <p>{booking?.billingAddress?.country || 'Ghana'}</p>
                  </div>
                </div>
              </div>

              {booking?.paymentStatus === 'pending' && userType === 'customer' && (
                <div className="pt-4 border-t border-border">
                  <Button variant="default" iconName="CreditCard" iconPosition="left">
                    Complete Payment
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-border bg-muted/30">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            {booking?.status === 'pending' || booking?.status === 'confirmed' ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => onReschedule(booking)}
                  iconName="Calendar"
                  iconPosition="left"
                >
                  Reschedule
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => onCancel(booking)}
                  iconName="X"
                  iconPosition="left"
                >
                  Cancel
                </Button>
              </>
            ) : null}
            {booking?.status === 'confirmed' && userType === 'provider' && (
              <Button 
                variant="default" 
                onClick={() => onStatusUpdate(booking?.id, 'in-progress')}
                iconName="Play"
                iconPosition="left"
              >
                Start Service
              </Button>
            )}
            {booking?.status === 'in-progress' && userType === 'provider' && (
              <Button 
                variant="success" 
                onClick={() => onStatusUpdate(booking?.id, 'completed')}
                iconName="Check"
                iconPosition="left"
              >
                Mark Complete
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;