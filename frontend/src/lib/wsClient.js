import { io } from 'socket.io-client';

class WebSocketClient {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  connect() {
    if (this.socket?.connected) {
      return this.socket;
    }

    const token = localStorage.getItem('accessToken');
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:4001';

    this.socket = io(wsUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('WebSocket reconnected after', attemptNumber, 'attempts');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_failed', () => {
      console.error('WebSocket reconnection failed');
      this.isConnected = false;
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Subscribe to booking updates
  onBookingUpdate(callback) {
    if (this.socket) {
      this.socket.on('booking_update', callback);
    }
  }

  // Subscribe to new messages
  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('new_message', callback);
    }
  }

  // Subscribe to provider notifications
  onProviderNotification(callback) {
    if (this.socket) {
      this.socket.on('provider_notification', callback);
    }
  }

  // Subscribe to customer notifications
  onCustomerNotification(callback) {
    if (this.socket) {
      this.socket.on('customer_notification', callback);
    }
  }

  // Send message
  sendMessage(bookingId, message) {
    if (this.socket && this.isConnected) {
      this.socket.emit('send_message', { bookingId, message });
    }
  }

  // Join booking room
  joinBookingRoom(bookingId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_booking', { bookingId });
    }
  }

  // Leave booking room
  leaveBookingRoom(bookingId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_booking', { bookingId });
    }
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      socketId: this.socket?.id
    };
  }
}

// Create singleton instance
const wsClient = new WebSocketClient();

export default wsClient;
