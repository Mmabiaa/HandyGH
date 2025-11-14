/**
 * WebSocket configuration
 * In production, this should be loaded from environment variables
 */

// Get the WebSocket URL based on environment
const getWebSocketUrl = (): string => {
  // For development, use the local backend
  if (__DEV__) {
    // For Android emulator, use 10.0.2.2 instead of localhost
    // For iOS simulator and physical devices, use your machine's IP
    return 'http://10.0.2.2:8000'; // Android emulator
    // return 'http://localhost:8000'; // iOS simulator
    // return 'http://192.168.1.100:8000'; // Physical device (replace with your IP)
  }

  // For production, use the production WebSocket URL
  return 'https://api.handygh.com';
};

export const SOCKET_CONFIG = {
  url: getWebSocketUrl(),
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
};
