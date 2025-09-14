import api from '../lib/apiClient';

export const bookingService = {
  // Create a new booking
  async createBooking(bookingData) {
    try {
      const response = await api.post('/api/v1/bookings', bookingData);
      return response.data;
    } catch (error) {
      console.error('Create booking error:', error);
      throw error;
    }
  },

  // Create payment intent for booking
  async createPaymentIntent(bookingId, paymentData) {
    try {
      const response = await api.post(`/api/v1/payments/momo/charge`, {
        bookingId,
        ...paymentData
      });
      return response.data;
    } catch (error) {
      console.error('Create payment intent error:', error);
      throw error;
    }
  },

  // Confirm booking payment
  async confirmBookingPayment(bookingId, paymentData) {
    try {
      const response = await api.post(`/api/v1/bookings/${bookingId}/confirm-payment`, paymentData);
      return response.data;
    } catch (error) {
      console.error('Confirm booking payment error:', error);
      throw error;
    }
  },

  // Get user bookings (customer or provider)
  async getUserBookings(userType = 'customer') {
    try {
      const response = await api.get(`/api/v1/bookings?role=${userType}`);
      return response.data;
    } catch (error) {
      console.error('Get user bookings error:', error);
      return [];
    }
  },

  // Get booking details by ID
  async getBookingById(bookingId) {
    try {
      const response = await api.get(`/api/v1/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error('Get booking details error:', error);
      throw error;
    }
  },

  // Update booking status (for providers)
  async updateBookingStatus(bookingId, status, providerNotes = '') {
    try {
      const response = await api.patch(`/api/v1/bookings/${bookingId}/status`, {
          status,
        providerNotes
      });
      return response.data;
    } catch (error) {
      console.error('Update booking status error:', error);
      throw error;
    }
  },

  // Get available services
  async getAvailableServices(categoryId = null) {
    try {
      const params = categoryId ? { categoryId } : {};
      const response = await api.get('/api/v1/services', { params });
      return response.data;
    } catch (error) {
      console.error('Get available services error:', error);
      return [];
    }
  },

  // Get service categories
  async getServiceCategories() {
    try {
      const response = await api.get('/api/v1/categories');
      return response.data;
    } catch (error) {
      console.error('Get service categories error:', error);
      return [];
    }
  },

  // Get providers
  async getProviders(filters = {}) {
    try {
      const response = await api.get('/api/v1/providers', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Get providers error:', error);
      return [];
    }
  },

  // Get provider by ID
  async getProviderById(providerId) {
    try {
      const response = await api.get(`/api/v1/providers/${providerId}`);
      return response.data;
    } catch (error) {
      console.error('Get provider details error:', error);
      throw error;
    }
  },

  // Send message to booking
  async sendMessage(bookingId, message) {
    try {
      const response = await api.post(`/api/v1/bookings/${bookingId}/messages`, { message });
      return response.data;
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  },

  // Get booking messages
  async getBookingMessages(bookingId) {
    try {
      const response = await api.get(`/api/v1/bookings/${bookingId}/messages`);
      return response.data;
    } catch (error) {
      console.error('Get booking messages error:', error);
      return [];
    }
  },

  // Submit review
  async submitReview(bookingId, reviewData) {
    try {
      const response = await api.post(`/api/v1/bookings/${bookingId}/reviews`, reviewData);
      return response.data;
    } catch (error) {
      console.error('Submit review error:', error);
      throw error;
    }
  },

  // Format booking data for display
  formatBookingData(booking) {
    if (!booking) return null;

    return {
      id: booking?.id,
      bookingNumber: booking?.booking_number,
      serviceName: booking?.service_name,
      serviceDescription: booking?.service_description,
      scheduledDate: booking?.scheduled_date,
      scheduledTime: booking?.scheduled_time,
      duration: booking?.duration_minutes,
      location: booking?.service_address,
      basePrice: booking?.base_price,
      additionalCharges: booking?.additional_charges,
      totalAmount: booking?.total_amount,
      currency: booking?.currency,
      status: booking?.status,
      paymentStatus: booking?.payment_status,
      specialInstructions: booking?.special_instructions,
      customerNotes: booking?.customer_notes,
      providerNotes: booking?.provider_notes,
      customer: booking?.customer,
      provider: booking?.provider,
      service: booking?.service,
      createdAt: booking?.created_at,
      updatedAt: booking?.updated_at
    };
  },

  // Format amount for display
  formatAmount(amount, currency = 'GHS') {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: currency,
    })?.format(amount);
  }
};