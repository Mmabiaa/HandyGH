import api from '../lib/apiClient';

export const paymentService = {
  // Create MoMo payment
  async createMoMoPayment(bookingId, paymentData) {
    try {
      const response = await api.post('/api/v1/payments/momo/charge', {
        bookingId,
        ...paymentData
      });
      return response.data;
    } catch (error) {
      console.error('Create MoMo payment error:', error);
      throw error;
    }
  },

  // Verify MoMo payment
  async verifyMoMoPayment(transactionId) {
    try {
      const response = await api.post('/api/v1/payments/momo/verify', {
        transactionId
      });
      return response.data;
    } catch (error) {
      console.error('Verify MoMo payment error:', error);
      throw error;
    }
  },

  // Get payment status
  async getPaymentStatus(bookingId) {
    try {
      const response = await api.get(`/api/v1/payments/status/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error('Get payment status error:', error);
      throw error;
    }
  },

  // Get payment history
  async getPaymentHistory(filters = {}) {
    try {
      const response = await api.get('/api/v1/payments/history', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Get payment history error:', error);
      return [];
    }
  },

  // Refund payment
  async refundPayment(bookingId, reason) {
    try {
      const response = await api.post(`/api/v1/payments/refund/${bookingId}`, {
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Refund payment error:', error);
      throw error;
    }
  },

  // Format amount for display
  formatAmount(amount, currency = 'GHS') {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  },

  // Format phone number for MoMo
  formatPhoneNumber(phone) {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Add country code if not present
    if (cleaned.startsWith('0')) {
      return `+233${cleaned.substring(1)}`;
    } else if (cleaned.startsWith('233')) {
      return `+${cleaned}`;
    } else if (cleaned.startsWith('+233')) {
      return cleaned;
    } else {
      return `+233${cleaned}`;
    }
  }
};
