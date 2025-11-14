export { default as SocketManager, SocketEvent, ConnectionStatus } from './SocketManager';
export {
  useSocketStatus,
  useSocketEvent,
  useSocketEmit,
  useSocketConnection,
} from './hooks/useSocket';
export {
  useBookingStatusUpdates,
  useBookingConfirmation,
  useBookingCancellation,
  useBookingRequests,
  useAllBookingUpdates,
} from './hooks/useBookingUpdates';
