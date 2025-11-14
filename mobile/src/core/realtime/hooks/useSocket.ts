import { useEffect, useState, useCallback } from 'react';
import SocketManager, { ConnectionStatus, SocketEvent } from '../SocketManager';

/**
 * Hook to access socket connection status
 */
export function useSocketStatus() {
  const [status, setStatus] = useState<ConnectionStatus>(
    SocketManager.getInstance().getConnectionStatus()
  );

  useEffect(() => {
    const socketManager = SocketManager.getInstance();
    const unsubscribe = socketManager.onStatusChange(setStatus);

    return unsubscribe;
  }, []);

  return {
    status,
    isConnected: status === ConnectionStatus.CONNECTED,
    isConnecting: status === ConnectionStatus.CONNECTING,
    isReconnecting: status === ConnectionStatus.RECONNECTING,
    isDisconnected: status === ConnectionStatus.DISCONNECTED,
    hasError: status === ConnectionStatus.ERROR,
  };
}

/**
 * Hook to subscribe to socket events
 */
export function useSocketEvent<T = any>(
  event: SocketEvent | string,
  handler: (data: T) => void,
  dependencies: any[] = []
) {
  useEffect(() => {
    const socketManager = SocketManager.getInstance();

    // Wrap handler to ensure it's called with the latest closure
    const wrappedHandler = (data: T) => {
      handler(data);
    };

    const unsubscribe = socketManager.subscribe(event, wrappedHandler);

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, ...dependencies]);
}

/**
 * Hook to emit socket events
 */
export function useSocketEmit() {
  const emit = useCallback((event: SocketEvent | string, data?: any) => {
    const socketManager = SocketManager.getInstance();
    socketManager.emit(event, data);
  }, []);

  return emit;
}

/**
 * Hook to manage socket connection lifecycle
 */
export function useSocketConnection() {
  const socketStatus = useSocketStatus();

  const connect = useCallback(async () => {
    const socketManager = SocketManager.getInstance();
    await socketManager.connect();
  }, []);

  const disconnect = useCallback(() => {
    const socketManager = SocketManager.getInstance();
    socketManager.disconnect();
  }, []);

  return {
    ...socketStatus,
    connect,
    disconnect,
  };
}
