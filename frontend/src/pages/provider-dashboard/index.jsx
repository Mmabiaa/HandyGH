import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import EarningsCard from './components/EarningsCard';
import BookingCard from './components/BookingCard';
import PerformanceChart from './components/PerformanceChart';
import MessageCenter from './components/MessageCenter';
import AvailabilityCalendar from './components/AvailabilityCalendar';
import QuickActions from './components/QuickActions';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [availability, setAvailability] = useState({});

  // Mock data for earnings
  const earningsData = [
    { title: 'This Month Revenue', amount: 'GHS 2,450', change: 12, changeType: 'positive', icon: 'DollarSign', iconColor: 'bg-success' },
    { title: 'Pending Payments', amount: 'GHS 680', change: null, changeType: null, icon: 'Clock', iconColor: 'bg-warning' },
    { title: 'Total Bookings', amount: '24', change: 8, changeType: 'positive', icon: 'Calendar', iconColor: 'bg-primary' },
    { title: 'Average Rating', amount: '4.8', change: 2, changeType: 'positive', icon: 'Star', iconColor: 'bg-accent' }
  ];

  // Mock data for bookings
  const activeBookings = [
    {
      id: 1,
      customerName: 'Sarah Johnson',
      service: 'Plumbing Repair',
      date: '2025-01-12',
      time: '10:00',
      location: 'East Legon, Accra',
      amount: '150.00',
      status: 'pending'
    },
    {
      id: 2,
      customerName: 'Michael Asante',
      service: 'Electrical Installation',
      date: '2025-01-12',
      time: '14:00',
      location: 'Osu, Accra',
      amount: '280.00',
      status: 'confirmed'
    },
    {
      id: 3,
      customerName: 'Grace Mensah',
      service: 'Home Cleaning',
      date: '2025-01-13',
      time: '09:00',
      location: 'Tema, Greater Accra',
      amount: '120.00',
      status: 'confirmed'
    }
  ];

  // Mock data for performance charts
  const earningsChartData = [
    { month: 'Jul', earnings: 1800 },
    { month: 'Aug', earnings: 2100 },
    { month: 'Sep', earnings: 1950 },
    { month: 'Oct', earnings: 2300 },
    { month: 'Nov', earnings: 2150 },
    { month: 'Dec', earnings: 2450 }
  ];

  const bookingsChartData = [
    { month: 'Jul', bookings: 18 },
    { month: 'Aug', bookings: 22 },
    { month: 'Sep', bookings: 19 },
    { month: 'Oct', bookings: 26 },
    { month: 'Nov', bookings: 23 },
    { month: 'Dec', bookings: 24 }
  ];

  // Mock data for messages
  const recentMessages = [
    {
      id: 1,
      customerName: 'Sarah Johnson',
      content: 'Hi, I need to reschedule our appointment for tomorrow. Would 2 PM work instead?',
      timestamp: new Date(Date.now() - 300000),
      unread: true,
      bookingId: '1001'
    },
    {
      id: 2,
      customerName: 'Michael Asante',
      content: 'Thank you for the excellent work on the electrical installation. Everything is working perfectly!',
      timestamp: new Date(Date.now() - 1800000),
      unread: false,
      bookingId: '1002'
    },
    {
      id: 3,
      customerName: 'Grace Mensah',
      content: 'Could you please bring additional cleaning supplies for the kitchen deep clean?',
      timestamp: new Date(Date.now() - 3600000),
      unread: true,
      bookingId: '1003'
    }
  ];

  // Initialize availability data
  useEffect(() => {
    const today = new Date();
    const initialAvailability = {};
    
    // Set some mock availability for the next 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date?.setDate(today?.getDate() + i);
      const dateKey = date?.toISOString()?.split('T')?.[0];
      
      // Mock some available time slots
      initialAvailability[dateKey] = ['09:00', '10:00', '14:00', '15:00', '16:00'];
    }
    
    setAvailability(initialAvailability);
  }, []);

  const handleAcceptBooking = (bookingId) => {
    console.log('Accepting booking:', bookingId);
    // Handle booking acceptance logic
  };

  const handleRescheduleBooking = (bookingId) => {
    console.log('Rescheduling booking:', bookingId);
    // Handle booking reschedule logic
  };

  const handleCompleteBooking = (bookingId) => {
    console.log('Completing booking:', bookingId);
    // Handle booking completion logic
  };

  const handleViewBookingDetails = (bookingId) => {
    navigate('/booking-management');
  };

  const handleReplyMessage = (messageId) => {
    console.log('Replying to message:', messageId);
    // Handle message reply logic
  };

  const handleViewAllMessages = () => {
    console.log('Viewing all messages');
    // Navigate to messages page
  };

  const handleUpdateAvailability = (dateKey, timeSlots) => {
    setAvailability(prev => ({
      ...prev,
      [dateKey]: timeSlots
    }));
  };

  const handleQuickActions = {
    onUpdateAvailability: () => setActiveTab('availability'),
    onViewBookings: () => navigate('/booking-management'),
    onManageProfile: () => console.log('Navigate to profile management'),
    onViewAnalytics: () => setActiveTab('analytics')
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
    { id: 'bookings', label: 'Active Bookings', icon: 'Calendar' },
    { id: 'analytics', label: 'Analytics', icon: 'BarChart3' },
    { id: 'availability', label: 'Availability', icon: 'Clock' },
    { id: 'messages', label: 'Messages', icon: 'MessageCircle' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header userType="provider" isAuthenticated={true} notificationCount={3} />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Provider Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                  Welcome back, John! Here's your business overview for today.
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <Button variant="default" iconName="Plus" iconPosition="left">
                  Add New Service
                </Button>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="border-b border-border">
              <nav className="flex space-x-8 overflow-x-auto">
                {tabs?.map((tab) => (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap micro-animation ${
                      activeTab === tab?.id
                        ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    }`}
                  >
                    <Icon name={tab?.icon} size={16} className="mr-2" />
                    {tab?.label}
                    {tab?.id === 'messages' && recentMessages?.filter(m => m?.unread)?.length > 0 && (
                      <span className="ml-2 bg-error text-error-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {recentMessages?.filter(m => m?.unread)?.length}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Earnings Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {earningsData?.map((earning, index) => (
                  <EarningsCard key={index} {...earning} />
                ))}
              </div>

              {/* Quick Actions */}
              <QuickActions {...handleQuickActions} />

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Recent Bookings</h3>
                  <div className="space-y-4">
                    {activeBookings?.slice(0, 2)?.map((booking) => (
                      <BookingCard
                        key={booking?.id}
                        booking={booking}
                        onAccept={handleAcceptBooking}
                        onReschedule={handleRescheduleBooking}
                        onComplete={handleCompleteBooking}
                        onViewDetails={handleViewBookingDetails}
                      />
                    ))}
                  </div>
                </div>

                <MessageCenter
                  messages={recentMessages?.slice(0, 3)}
                  onReply={handleReplyMessage}
                  onViewAll={handleViewAllMessages}
                />
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Active Bookings</h2>
                <Button variant="outline" iconName="Filter" iconPosition="left">
                  Filter
                </Button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {activeBookings?.map((booking) => (
                  <BookingCard
                    key={booking?.id}
                    booking={booking}
                    onAccept={handleAcceptBooking}
                    onReschedule={handleRescheduleBooking}
                    onComplete={handleCompleteBooking}
                    onViewDetails={handleViewBookingDetails}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <PerformanceChart
                  type="earnings"
                  data={earningsChartData}
                  title="Monthly Earnings Trend"
                />
                <PerformanceChart
                  type="bookings"
                  data={bookingsChartData}
                  title="Monthly Bookings"
                />
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card border border-border rounded-lg p-6 card-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <Icon name="TrendingUp" size={24} className="text-success" />
                    <span className="text-sm text-success">+15%</span>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">92%</h3>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                </div>

                <div className="bg-card border border-border rounded-lg p-6 card-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <Icon name="Clock" size={24} className="text-primary" />
                    <span className="text-sm text-primary">-5 min</span>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">18 min</h3>
                  <p className="text-sm text-muted-foreground">Avg Response Time</p>
                </div>

                <div className="bg-card border border-border rounded-lg p-6 card-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <Icon name="Users" size={24} className="text-accent" />
                    <span className="text-sm text-success">+8</span>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">156</h3>
                  <p className="text-sm text-muted-foreground">Total Customers</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'availability' && (
            <div className="space-y-6">
              <AvailabilityCalendar
                availability={availability}
                onUpdateAvailability={handleUpdateAvailability}
              />
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="space-y-6">
              <MessageCenter
                messages={recentMessages}
                onReply={handleReplyMessage}
                onViewAll={handleViewAllMessages}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;