import { supabase } from '../lib/supabase';

export const bookingService = {
  // Create a new booking with payment intent
  async createBookingPaymentIntent(bookingData, customerInfo) {
    try {
      const { data, error } = await supabase?.functions?.invoke('create-booking-payment-intent', {
        body: {
          bookingData,
          customerInfo
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Create booking payment intent error:', error);
      throw error;
    }
  },

  // Confirm booking payment
  async confirmBookingPayment(paymentIntentId) {
    try {
      const { data, error } = await supabase?.functions?.invoke('confirm-booking-payment', {
        body: { paymentIntentId }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Confirm booking payment error:', error);
      throw error;
    }
  },

  // Get user bookings (customer or provider)
  async getUserBookings(userType = 'customer') {
    try {
      const { data: profile } = await supabase?.from('user_profiles')?.select('id, user_type')?.eq('id', (await supabase?.auth?.getUser())?.data?.user?.id)?.single();

      let query;
      if (userType === 'provider' || profile?.user_type === 'provider') {
        // Get provider profile first
        const { data: providerProfile } = await supabase?.from('provider_profiles')?.select('id')?.eq('user_id', profile?.id)?.single();

        if (!providerProfile) {
          return [];
        }

        // Get bookings for this provider
        query = supabase?.from('service_bookings')?.select(`
            *,
            customer:user_profiles!customer_id(first_name, last_name, email, phone),
            service:services(name, description)
          `)?.eq('provider_id', providerProfile?.id);
      } else {
        // Get bookings for customer
        query = supabase?.from('service_bookings')?.select(`
            *,
            provider:provider_profiles!provider_id(business_name, user:user_profiles!user_id(first_name, last_name, phone)),
            service:services(name, description)
          `)?.eq('customer_id', profile?.id);
      }

      const { data, error } = await query?.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get user bookings error:', error);
      return [];
    }
  },

  // Get booking details by ID
  async getBookingById(bookingId) {
    try {
      const { data, error } = await supabase?.from('service_bookings')?.select(`
          *,
          customer:user_profiles!customer_id(first_name, last_name, email, phone),
          provider:provider_profiles!provider_id(business_name, user:user_profiles!user_id(first_name, last_name, phone)),
          service:services(name, description, base_price),
          payment_transactions(*)
        `)?.eq('id', bookingId)?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get booking details error:', error);
      throw error;
    }
  },

  // Update booking status (for providers)
  async updateBookingStatus(bookingId, status, providerNotes = '') {
    try {
      const { data, error } = await supabase?.from('service_bookings')?.update({
          status,
          provider_notes: providerNotes,
          updated_at: new Date()?.toISOString(),
          ...(status === 'completed' && { completed_at: new Date()?.toISOString() }),
          ...(status === 'cancelled' && { cancelled_at: new Date()?.toISOString() })
        })?.eq('id', bookingId)?.select()?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update booking status error:', error);
      throw error;
    }
  },

  // Get available services
  async getAvailableServices(categoryId = null) {
    try {
      let query = supabase?.from('services')?.select(`
          *,
          provider:provider_profiles!provider_id(business_name, rating, total_reviews, user:user_profiles!user_id(first_name, last_name)),
          category:service_categories!category_id(name, icon_name)
        `)?.eq('status', 'active');

      if (categoryId) {
        query = query?.eq('category_id', categoryId);
      }

      const { data, error } = await query?.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get available services error:', error);
      return [];
    }
  },

  // Get service categories
  async getServiceCategories() {
    try {
      const { data, error } = await supabase?.from('service_categories')?.select('*')?.eq('is_active', true)?.order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get service categories error:', error);
      return [];
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