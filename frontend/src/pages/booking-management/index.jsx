import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { bookingService } from '../../services/bookingService';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import BookingStats from './components/BookingStats';
import BookingFilters from './components/BookingFilters';
import BookingTable from './components/BookingTable';
import BulkActions from './components/BulkActions';
import BookingDetailsModal from './components/BookingDetailsModal';

const BookingManagement = () => {
  const { user, userProfile, isAuthenticated, loading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    searchQuery: '',
    paymentStatus: 'all'
  });

  // Load bookings on component mount
  useEffect(() => {
    if (isAuthenticated && userProfile) {
      loadBookings();
    }
  }, [isAuthenticated, userProfile]);

  // Filter bookings when filters change
  useEffect(() => {
    filterBookings();
  }, [bookings, filters]);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const userBookings = await bookingService?.getUserBookings(userProfile?.user_type);
      setBookings(userBookings || []);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    // Filter by status
    if (filters?.status !== 'all') {
      filtered = filtered?.filter(booking => booking?.status === filters?.status);
    }

    // Filter by payment status
    if (filters?.paymentStatus !== 'all') {
      filtered = filtered?.filter(booking => booking?.payment_status === filters?.paymentStatus);
    }

    // Filter by date range
    if (filters?.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters?.dateRange) {
        case 'today':
          filterDate?.setHours(0, 0, 0, 0);
          filtered = filtered?.filter(booking => 
            new Date(booking.scheduled_date) >= filterDate
          );
          break;
        case 'week':
          filterDate?.setDate(now?.getDate() - 7);
          filtered = filtered?.filter(booking => 
            new Date(booking.created_at) >= filterDate
          );
          break;
        case 'month':
          filterDate?.setMonth(now?.getMonth() - 1);
          filtered = filtered?.filter(booking => 
            new Date(booking.created_at) >= filterDate
          );
          break;
      }
    }

    // Filter by search query
    if (filters?.searchQuery) {
      const query = filters?.searchQuery?.toLowerCase();
      filtered = filtered?.filter(booking =>
        booking?.service_name?.toLowerCase()?.includes(query) ||
        booking?.booking_number?.toLowerCase()?.includes(query) ||
        booking?.customer?.first_name?.toLowerCase()?.includes(query) ||
        booking?.customer?.last_name?.toLowerCase()?.includes(query) ||
        booking?.provider?.business_name?.toLowerCase()?.includes(query)
      );
    }

    setFilteredBookings(filtered);
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus, notes = '') => {
    try {
      await bookingService?.updateBookingStatus(bookingId, newStatus, notes);
      await loadBookings(); // Refresh bookings
      
      // Close modal if it was open
      if (selectedBooking?.id === bookingId) {
        setShowDetailsModal(false);
      }
    } catch (error) {
      console.error('Failed to update booking status:', error);
    }
  };

  const handleBookingSelect = (bookingId, checked) => {
    if (checked) {
      setSelectedBookings([...selectedBookings, bookingId]);
    } else {
      setSelectedBookings(selectedBookings?.filter(id => id !== bookingId));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedBookings(filteredBookings?.map(booking => booking?.id));
    } else {
      setSelectedBookings([]);
    }
  };

  const handleBulkAction = async (action) => {
    try {
      // Handle bulk actions
      for (const bookingId of selectedBookings) {
        await bookingService?.updateBookingStatus(bookingId, action);
      }
      setSelectedBookings([]);
      await loadBookings();
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  const handleViewDetails = async (booking) => {
    try {
      const detailedBooking = await bookingService?.getBookingById(booking?.id);
      setSelectedBooking(detailedBooking);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Failed to load booking details:', error);
    }
  };

  // Stats calculations
  const getStats = () => {
    const total = bookings?.length;
    const pending = bookings?.filter(b => b?.status === 'pending')?.length;
    const confirmed = bookings?.filter(b => b?.status === 'confirmed')?.length;
    const completed = bookings?.filter(b => b?.status === 'completed')?.length;
    const cancelled = bookings?.filter(b => b?.status === 'cancelled')?.length;
    
    const totalRevenue = bookings?.filter(b => b?.payment_status === 'succeeded')?.reduce((sum, b) => sum + parseFloat(b?.total_amount || 0), 0);

    return {
      total,
      pending,
      confirmed,
      completed,
      cancelled,
      totalRevenue
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header userType={userProfile?.user_type || 'customer'} isAuthenticated={true} />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <Icon name="Loader2" size={32} className="animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header isAuthenticated={false} />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Icon name="UserX" size={48} className="mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Access Denied</h2>
            <p className="text-muted-foreground">Please log in to view your bookings.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header userType={userProfile?.user_type || 'customer'} isAuthenticated={true} />
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {userProfile?.user_type === 'provider' ? 'Service Bookings' : 'My Bookings'}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {userProfile?.user_type === 'provider' ?'Manage and track your service appointments' :'View and manage your service requests'
                  }
                </p>
              </div>
              
              <Button
                onClick={() => window.location.href = '/service-booking-flow'}
                iconName="Plus"
                iconPosition="left"
                className="mt-4 sm:mt-0"
              >
                New Booking
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-8">
            <BookingStats stats={getStats()} userType={userProfile?.user_type} />
          </div>

          {/* Filters */}
          <div className="mb-6">
            <BookingFilters
              filters={filters}
              onFiltersChange={setFilters}
              onFilterChange={setFilters}
              onClearFilters={() => setFilters({
                status: 'all',
                dateRange: 'all',
                searchQuery: '',
                paymentStatus: 'all'
              })}
              userType={userProfile?.user_type}
            />
          </div>

          {/* Bulk Actions */}
          {selectedBookings?.length > 0 && userProfile?.user_type === 'provider' && (
            <div className="mb-6">
              <BulkActions
                selectedCount={selectedBookings?.length}
                onBulkAction={handleBulkAction}
                onClearSelection={() => setSelectedBookings([])}
              />
            </div>
          )}

          {/* Bookings Table */}
          <div className="bg-card rounded-lg border border-border card-shadow">
            {isLoading ? (
              <div className="p-8 text-center">
                <Icon name="Loader2" size={32} className="mx-auto animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading bookings...</p>
              </div>
            ) : filteredBookings?.length === 0 ? (
              <div className="p-8 text-center">
                <Icon name="Calendar" size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No bookings found</h3>
                <p className="text-muted-foreground">
                  {filters?.searchQuery || filters?.status !== 'all' || filters?.dateRange !== 'all' 
                    ? 'Try adjusting your filters to see more results.'
                    : userProfile?.user_type === 'provider' 
                      ? 'You have no service bookings yet.' 
                      : 'You have not made any bookings yet.'
                  }
                </p>
              </div>
            ) : (
              <BookingTable
                bookings={filteredBookings}
                selectedBookings={selectedBookings}
                onBookingSelect={handleBookingSelect}
                onSelectAll={handleSelectAll}
                onViewDetails={handleViewDetails}
                onUpdateStatus={handleUpdateBookingStatus}
                onStatusUpdate={handleUpdateBookingStatus}
                onReschedule={(bookingId) => console.log('Reschedule:', bookingId)}
                onCancel={(bookingId) => handleUpdateBookingStatus(bookingId, 'cancelled')}
                userType={userProfile?.user_type}
              />
            )}
          </div>
        </div>
      </div>
      {/* Booking Details Modal */}
      <BookingDetailsModal
        booking={selectedBooking}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onUpdateStatus={handleUpdateBookingStatus}
        onStatusUpdate={handleUpdateBookingStatus}
        onReschedule={(bookingId) => console.log('Reschedule:', bookingId)}
        onCancel={(bookingId) => handleUpdateBookingStatus(bookingId, 'cancelled')}
        userType={userProfile?.user_type}
      />
    </div>
  );
};

export default BookingManagement;