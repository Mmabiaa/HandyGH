import io from 'socket.io-client';
import { SecureTokenStorage } from '../storage/SecureTokenStorage';

// Socket type from socket.io-client
type Socket = ReturnType<typeof io>;

/**
 * WebSocket event types for real-time updates
 */
export enum SocketEvent {
  // Connection events
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  CONNECT_ERROR = 'connect_error',
  RECONNECT = 'reconnect',
  RECONNECT_ATTEMPT = 'reconnect_attempt',
  RECONNECT_ERROR = 'reconnect_error',
  RECONNECT_FAILED = 'reconnect_failed',

  // Booking events
  BOOKING_REQUEST = 'booking:request',
  BOOKING_STATUS_UPDATE = 'booking:status_update',
  BOOKING_CONFIRMED = 'booking:confirmed',
  BOOKING_CANCELLED = 'booking:cancelled',

  // Message events
  MESSAGE_RECEIVED = 'message:received',
  MESSAGE_READ = 'message:read',
  MESSAGE_TYPING = 'message:typing',

  // Provider events
  PROVIDER_ONLINE = 'provider:online',
  PROVIDER_OFFLINE = 'provider:offline',
  PROVIDER_LOCATION_UPDATE = 'provider:location_update',
}

/**
 * Connection status enum
 */
export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error',
}

/**
 * Event handler type
 */
type EventHandler = (data: any) => void;

/**
 * Socket configuration options
 */
interface SocketConfig {
  url: string;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  reconnectionDelayMax?: number;
  timeout?: number;
}

/**
 * SocketManager class for managing WebSocket connections
 * Implements singleton pattern to ensure single connection instance
 */
class SocketManager {
  private static instance: SocketManager;
  private socket: Socket | null = null;
  private config: SocketConfig;
  private connectionStatus: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  private eventHandlers: Map<string, Set<EventHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private statusListeners: Set<(status: ConnectionStatus) => void> = new Set();

  private constructor(config: SocketConfig) {
    this.config = {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      ...config,
    };
    this.maxReconnectAttempts = this.config.reconnectionAttempts || 5;
  }

  /**
   * Get singleton instance of SocketManager
   */
  public static getInstance(config?: SocketConfig): SocketManager {
    if (!SocketManager.instance) {
      if (!config) {
        throw new Error('SocketManager must be initialized with config on first call');
      }
      SocketManager.instance = new SocketManager(config);
    }
    return SocketManager.instance;
  }

  /**
   * Connect to WebSocket server with authentication
   */
  public async connect(): Promise<void> {
    if (this.socket?.connected) {
      console.log('[SocketManager] Already connected');
      return;
    }

    try {
      this.setConnectionStatus(ConnectionStatus.CONNECTING);

      // Get authentication token
      const tokens = await SecureTokenStorage.getTokens();
      if (!tokens?.accessToken) {
        throw new Error('No authentication token available');
      }
      const token = tokens.accessToken;

      // Create socket connection
      this.socket = io(this.config.url, {
        auth: {
          token,
        },
        reconnection: true,
        reconnectionAttempts: this.config.reconnectionAttempts,
        reconnectionDelay: this.config.reconnectionDelay,
        reconnectionDelayMax: this.config.reconnectionDelayMax,
        timeout: this.config.timeout,
        transports: ['websocket', 'polling'],
      });

      this.setupConnectionHandlers();
      this.resubscribeToEvents();

      console.log('[SocketManager] Connection initiated');
    } catch (error) {
      console.error('[SocketManager] Connection error:', error);
      this.setConnectionStatus(ConnectionStatus.ERROR);
      throw error;
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  public disconnect(): void {
    if (this.socket) {
      console.log('[SocketManager] Disconnecting...');
      this.socket.disconnect();
      this.socket = null;
      this.setConnectionStatus(ConnectionStatus.DISCONNECTED);
      this.reconnectAttempts = 0;
    }
  }

  /**
   * Subscribe to a specific event
   * Returns unsubscribe function
   */
  public subscribe(event: SocketEvent | string, handler: EventHandler): () => void {
    // Add handler to internal map
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);

    // Subscribe to socket event if connected
    if (this.socket?.connected) {
      this.socket.on(event, handler);
    }

    // Return unsubscribe function
    return () => {
      this.unsubscribe(event, handler);
    };
  }

  /**
   * Unsubscribe from a specific event
   */
  public unsubscribe(event: SocketEvent | string, handler: EventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.eventHandlers.delete(event);
      }
    }

    if (this.socket) {
      this.socket.off(event, handler);
    }
  }

  /**
   * Emit an event to the server
   */
  public emit(event: SocketEvent | string, data?: any): void {
    if (!this.socket?.connected) {
      console.warn('[SocketManager] Cannot emit event, not connected:', event);
      return;
    }

    this.socket.emit(event, data);
    console.log('[SocketManager] Emitted event:', event, data);
  }

  /**
   * Check if socket is connected
   */
  public isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Get current connection status
   */
  public getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  /**
   * Subscribe to connection status changes
   */
  public onStatusChange(listener: (status: ConnectionStatus) => void): () => void {
    this.statusListeners.add(listener);
    // Immediately call with current status
    listener(this.connectionStatus);

    // Return unsubscribe function
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  /**
   * Setup connection event handlers
   */
  private setupConnectionHandlers(): void {
    if (!this.socket) return;

    // Connection successful
    this.socket.on(SocketEvent.CONNECT, () => {
      console.log('[SocketManager] Connected successfully');
      this.setConnectionStatus(ConnectionStatus.CONNECTED);
      this.reconnectAttempts = 0;
    });

    // Disconnection
    this.socket.on(SocketEvent.DISCONNECT, (reason: string) => {
      console.log('[SocketManager] Disconnected:', reason);
      this.setConnectionStatus(ConnectionStatus.DISCONNECTED);

      // Auto-reconnect for certain disconnect reasons
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        this.handleReconnection();
      }
    });

    // Connection error
    this.socket.on(SocketEvent.CONNECT_ERROR, (error: Error) => {
      console.error('[SocketManager] Connection error:', error);
      this.setConnectionStatus(ConnectionStatus.ERROR);
    });

    // Reconnection attempt
    this.socket.on(SocketEvent.RECONNECT_ATTEMPT, (attemptNumber: number) => {
      console.log('[SocketManager] Reconnection attempt:', attemptNumber);
      this.setConnectionStatus(ConnectionStatus.RECONNECTING);
      this.reconnectAttempts = attemptNumber;
    });

    // Reconnection successful
    this.socket.on(SocketEvent.RECONNECT, (attemptNumber: number) => {
      console.log('[SocketManager] Reconnected after', attemptNumber, 'attempts');
      this.setConnectionStatus(ConnectionStatus.CONNECTED);
      this.reconnectAttempts = 0;
    });

    // Reconnection error
    this.socket.on(SocketEvent.RECONNECT_ERROR, (error: Error) => {
      console.error('[SocketManager] Reconnection error:', error);
      this.setConnectionStatus(ConnectionStatus.ERROR);
    });

    // Reconnection failed
    this.socket.on(SocketEvent.RECONNECT_FAILED, () => {
      console.error('[SocketManager] Reconnection failed after max attempts');
      this.setConnectionStatus(ConnectionStatus.ERROR);
    });
  }

  /**
   * Handle reconnection logic
   */
  private async handleReconnection(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[SocketManager] Max reconnection attempts reached');
      this.setConnectionStatus(ConnectionStatus.ERROR);
      return;
    }

    this.reconnectAttempts++;
    this.setConnectionStatus(ConnectionStatus.RECONNECTING);

    try {
      // Get fresh token in case it expired
      const tokens = await SecureTokenStorage.getTokens();
      if (!tokens?.accessToken) {
        throw new Error('No authentication token available for reconnection');
      }
      const token = tokens.accessToken;

      // Update auth token
      if (this.socket) {
        (this.socket as any).auth = { token };
        this.socket.connect();
      }
    } catch (error) {
      console.error('[SocketManager] Reconnection failed:', error);
      this.setConnectionStatus(ConnectionStatus.ERROR);

      // Retry with exponential backoff
      const delay = Math.min(
        this.config.reconnectionDelay! * Math.pow(2, this.reconnectAttempts - 1),
        this.config.reconnectionDelayMax!
      );

      setTimeout(() => {
        this.handleReconnection();
      }, delay);
    }
  }

  /**
   * Resubscribe to all events after reconnection
   */
  private resubscribeToEvents(): void {
    if (!this.socket) return;

    this.eventHandlers.forEach((handlers, event) => {
      handlers.forEach(handler => {
        this.socket!.on(event, handler);
      });
    });

    console.log('[SocketManager] Resubscribed to', this.eventHandlers.size, 'events');
  }

  /**
   * Set connection status and notify listeners
   */
  private setConnectionStatus(status: ConnectionStatus): void {
    if (this.connectionStatus !== status) {
      this.connectionStatus = status;
      console.log('[SocketManager] Status changed to:', status);

      // Notify all status listeners
      this.statusListeners.forEach(listener => {
        try {
          listener(status);
        } catch (error) {
          console.error('[SocketManager] Error in status listener:', error);
        }
      });
    }
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  public static reset(): void {
    if (SocketManager.instance) {
      SocketManager.instance.disconnect();
      SocketManager.instance = null as any;
    }
  }
}

export default SocketManager;
