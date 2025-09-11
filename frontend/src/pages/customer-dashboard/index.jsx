import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import WelcomePanel from './components/WelcomePanel';
import StatsCards from './components/StatsCards';
import StatusOverview from './components/StatusOverview';
import RecentActivity from './components/RecentActivity';
import FavoriteProviders from './components/FavoriteProviders';
import ServiceRecommendations from './components/ServiceRecommendations';
import QuickActions from './components/QuickActions';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // Mock user data
  const userData = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+233 24 123 4567",
    location: "Accra, Ghana"
  };

  // Mock stats data
  const statsData = {
    totalBookings: 24,
    activeBookings: 3,
    completedServices: 21,
    totalSpent: "2,450.00"
  };

  // Mock active bookings data
  const activeBookingsData = [
    {
      id: "BK001",
      serviceType: "Plumbing Repair",
      serviceIcon: "Wrench",
      providerName: "Kwame Asante",
      providerId: "PR001",
      scheduledDate: "Dec 15, 2024",
      scheduledTime: "10:00 AM",
      location: "East Legon",
      status: "Confirmed",
      amount: "150.00"
    },
    {
      id: "BK002",
      serviceType: "House Cleaning",
      serviceIcon: "Sparkles",
      providerName: "Ama Serwaa",
      providerId: "PR002",
      scheduledDate: "Dec 16, 2024",
      scheduledTime: "2:00 PM",
      location: "Cantonments",
      status: "Pending",
      amount: "80.00"
    },
    {
      id: "BK003",
      serviceType: "AC Maintenance",
      serviceIcon: "Wind",
      providerName: "Samuel Osei",
      providerId: "PR003",
      scheduledDate: "Dec 18, 2024",
      scheduledTime: "9:00 AM",
      location: "Airport Residential",
      status: "In-Progress",
      amount: "200.00"
    }
  ];

  // Mock recent activity data
  const recentActivityData = [
    {
      id: "ACT001",
      type: "booking_confirmed",
      title: "Booking Confirmed",
      description: "Your plumbing repair service has been confirmed for Dec 15, 2024",
      timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
      actionable: true,
      metadata: {
        bookingId: "BK001",
        provider: "Kwame Asante"
      }
    },
    {
      id: "ACT002",
      type: "message_received",
      title: "New Message",
      description: "Ama Serwaa sent you a message about your cleaning service",
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      actionable: true,
      metadata: {
        provider: "Ama Serwaa"
      }
    },
    {
      id: "ACT003",
      type: "service_completed",
      title: "Service Completed",
      description: "Your electrical repair service has been completed successfully",
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      actionable: true,
      metadata: {
        bookingId: "BK004",
        provider: "Joseph Mensah",
        amount: "120.00"
      }
    },
    {
      id: "ACT004",
      type: "payment_processed",
      title: "Payment Processed",
      description: "Payment of GHS 120.00 has been processed successfully",
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      actionable: false,
      metadata: {
        amount: "120.00"
      }
    },
    {
      id: "ACT005",
      type: "provider_assigned",
      title: "Provider Assigned",
      description: "Samuel Osei has been assigned to your AC maintenance service",
      timestamp: new Date(Date.now() - 172800000), // 2 days ago
      actionable: true,
      metadata: {
        bookingId: "BK003",
        provider: "Samuel Osei"
      }
    }
  ];

  // Mock favorite providers data
  const favoriteProvidersData = [
    {
      id: "PR001",
      name: "Kwame Asante",
      specialization: "Plumbing & Repairs",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      rating: 4.8,
      reviewCount: 127,
      hourlyRate: "50.00",
      isAvailable: true
    },
    {
      id: "PR002",
      name: "Ama Serwaa",
      specialization: "House Cleaning",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      rating: 4.9,
      reviewCount: 89,
      hourlyRate: "25.00",
      isAvailable: true
    },
    {
      id: "PR005",
      name: "Grace Adjei",
      specialization: "Tutoring & Education",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      rating: 4.7,
      reviewCount: 156,
      hourlyRate: "40.00",
      isAvailable: false
    },
    {
      id: "PR006",
      name: "Michael Boateng",
      specialization: "Gardening & Landscaping",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      rating: 4.6,
      reviewCount: 73,
      hourlyRate: "35.00",
      isAvailable: true
    }
  ];

  // Mock service recommendations data
  const serviceRecommendationsData = [
    {
      id: "REC001",
      serviceType: "Deep House Cleaning",
      providerId: "PR002",
      providerName: "Ama Serwaa",
      providerAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop",
      price: "120.00",
      originalPrice: "150.00",
      discount: 20,
      rating: 4.9,
      reviewCount: 89,
      location: "Accra Central",
      duration: "3-4 hours",
      description: "Comprehensive deep cleaning service for your entire home including kitchen, bathrooms, and living areas."
    },
    {
      id: "REC002",
      serviceType: "Electrical Installation",
      providerId: "PR007",
      providerName: "Joseph Mensah",
      providerAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
      image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop",
      price: "200.00",
      rating: 4.7,
      reviewCount: 134,
      location: "East Legon",
      duration: "2-3 hours",
      description: "Professional electrical installation and wiring services for homes and offices with safety guarantee."
    },
    {
      id: "REC003",
      serviceType: "Garden Maintenance",
      providerId: "PR006",
      providerName: "Michael Boateng",
      providerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
      price: "80.00",
      rating: 4.6,
      reviewCount: 73,
      location: "Airport Residential",
      duration: "2-3 hours",
      description: "Complete garden maintenance including lawn mowing, pruning, and plant care services."
    },
    {
      id: "REC004",
      serviceType: "Math Tutoring",
      providerId: "PR005",
      providerName: "Grace Adjei",
      providerAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=300&fit=crop",
      price: "60.00",
      originalPrice: "75.00",
      discount: 15,
      rating: 4.7,
      reviewCount: 156,
      location: "Cantonments",
      duration: "1 hour",
      description: "Expert mathematics tutoring for high school and university students with proven results."
    }
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleBookService = () => {
    navigate('/service-booking-flow');
  };

  const handleFindProviders = () => {
    navigate('/service-booking-flow');
  };

  const handleViewBooking = (bookingId) => {
    navigate(`/booking-management?booking=${bookingId}`);
  };

  const handleMessageProvider = (providerId) => {
    // Navigate to messages with provider filter
    console.log('Message provider:', providerId);
  };

  const handleViewActivity = (activity) => {
    if (activity?.metadata?.bookingId) {
      navigate(`/booking-management?booking=${activity?.metadata?.bookingId}`);
    }
  };

  const handleBookProvider = (providerId) => {
    navigate(`/service-booking-flow?provider=${providerId}`);
  };

  const handleViewProfile = (providerId) => {
    console.log('View provider profile:', providerId);
  };

  const handleRemoveFavorite = (providerId) => {
    console.log('Remove from favorites:', providerId);
  };

  const handleBookRecommendedService = (recommendation) => {
    navigate(`/service-booking-flow?service=${recommendation?.id}&provider=${recommendation?.providerId}`);
  };

  const handleViewRecommendedProvider = (providerId) => {
    console.log('View recommended provider:', providerId);
  };

  const handleQuickAction = (actionId) => {
    switch (actionId) {
      case 'book-service': navigate('/service-booking-flow');
        break;
      case 'messages': console.log('Navigate to messages');
        break;
      case 'bookings': navigate('/booking-management');
        break;
      case 'history': navigate('/booking-management?tab=history');
        break;
      default:
        console.log('Unknown action:', actionId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header userType="customer" isAuthenticated={true} notificationCount={2} />
        <div className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-32 bg-muted rounded-lg mb-6"></div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {Array.from({ length: 4 })?.map((_, index) => (
                  <div key={index} className="h-24 bg-muted rounded-lg"></div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-96 bg-muted rounded-lg"></div>
                <div className="h-96 bg-muted rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header userType="customer" isAuthenticated={true} notificationCount={2} />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Panel */}
          <WelcomePanel
            userName={userData?.name}
            onBookService={handleBookService}
            onFindProviders={handleFindProviders}
          />

          {/* Stats Cards */}
          <StatsCards stats={statsData} />

          {/* Quick Actions */}
          <div className="mb-6">
            <QuickActions onAction={handleQuickAction} />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Status Overview */}
            <StatusOverview
              activeBookings={activeBookingsData}
              onViewBooking={handleViewBooking}
              onMessageProvider={handleMessageProvider}
            />

            {/* Recent Activity */}
            <RecentActivity
              activities={recentActivityData}
              onViewActivity={handleViewActivity}
            />
          </div>

          {/* Secondary Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Favorite Providers */}
            <FavoriteProviders
              favoriteProviders={favoriteProvidersData}
              onBookProvider={handleBookProvider}
              onViewProfile={handleViewProfile}
              onRemoveFavorite={handleRemoveFavorite}
            />

            {/* Service Recommendations */}
            <ServiceRecommendations
              recommendations={serviceRecommendationsData}
              onBookService={handleBookRecommendedService}
              onViewProvider={handleViewRecommendedProvider}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;