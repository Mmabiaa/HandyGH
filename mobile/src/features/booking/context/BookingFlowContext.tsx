import React, { createContext, useContext, ReactNode } from 'react';
import { useBookingFlow, BookingFlowState, BookingFlowActions, BookingFlowStep } from '../hooks/useBookingFlow';

/**
 * Booking Flow Context
 *
 * Provides booking flow state and actions to all screens in the booking creation process.
 * Enables form state persistence and coordinated navigation across booking steps.
 */
interface BookingFlowContextValue {
  state: BookingFlowState;
  actions: BookingFlowActions;
}

const BookingFlowContext = createContext<BookingFlowContextValue | undefined>(undefined);

/**
 * BookingFlowProvider Props
 */
interface BookingFlowProviderProps {
  providerId: string;
  initialStep?: BookingFlowStep;
  children: ReactNode;
}

/**
 * BookingFlowProvider Component
 *
 * Wraps the booking flow screens and provides shared state management.
 *
 * Requirements:
 * - 4.13: Form state persistence across steps
 */
export const BookingFlowProvider: React.FC<BookingFlowProviderProps> = ({
  providerId,
  initialStep,
  children,
}) => {
  const [state, actions] = useBookingFlow(providerId, initialStep);

  const value: BookingFlowContextValue = {
    state,
    actions,
  };

  return (
    <BookingFlowContext.Provider value={value}>
      {children}
    </BookingFlowContext.Provider>
  );
};

/**
 * useBookingFlowContext Hook
 *
 * Access the booking flow state and actions from any child component.
 *
 * @throws Error if used outside of BookingFlowProvider
 */
export const useBookingFlowContext = (): BookingFlowContextValue => {
  const context = useContext(BookingFlowContext);

  if (!context) {
    throw new Error('useBookingFlowContext must be used within a BookingFlowProvider');
  }

  return context;
};
