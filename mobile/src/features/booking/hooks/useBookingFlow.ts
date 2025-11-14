import { useState, useCallback, useMemo } from 'react';
import { Location, PaymentMethod } from '../../../core/api/types';

/**
 * Booking Flow Steps
 * Defines the sequence of steps in the booking creation process
 */
export enum BookingFlowStep {
  SERVICE_SELECTION = 'service_selection',
  DATE_TIME_SELECTION = 'date_time_selection',
  LOCATION_SELECTION = 'location_selection',
  BOOKING_SUMMARY = 'booking_summary',
  PAYMENT_METHOD = 'payment_method',
  PAYMENT_PROCESSING = 'payment_processing',
  BOOKING_CONFIRMATION = 'booking_confirmation',
}

/**
 * Booking Flow State
 * Maintains the state of the booking creation process
 */
export interface BookingFlowState {
  // Provider and service
  providerId: string;
  serviceId?: string;
  selectedAddOnIds?: string[];

  // Date and time
  scheduledDate?: string;
  scheduledTime?: string;

  // Location
  location?: Location;
  locationNotes?: string;

  // Payment
  paymentMethod?: PaymentMethod;
  transactionId?: string;

  // Booking data
  bookingData: {
    totalAmount?: number;
    bookingId?: string;
  };

  // Current step
  currentStep: BookingFlowStep;

  // Validation
  isStepValid: boolean;
}

/**
 * Booking Flow Actions
 * Actions that can be performed on the booking flow state
 */
export interface BookingFlowActions {
  // Step navigation
  goToNextStep: () => boolean;
  goToPreviousStep: () => boolean;
  goToStep: (step: BookingFlowStep) => void;
  canGoNext: () => boolean;
  canGoBack: () => boolean;

  // State updates
  setServiceSelection: (serviceId: string, addOnIds?: string[]) => void;
  setDateTimeSelection: (date: string, time: string) => void;
  setLocationSelection: (location: Location, notes?: string) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setTransactionId: (transactionId: string) => void;
  setBookingData: (data: { totalAmount?: number; bookingId?: string }) => void;

  // State management
  resetFlow: () => void;
  getProgress: () => number;
  getCurrentStepIndex: () => number;
  getTotalSteps: () => number;
}

/**
 * useBookingFlow Hook
 *
 * Manages the booking creation flow state machine.
 * Handles step navigation, form state persistence, and validation.
 *
 * Requirements:
 * - 4.13: Finite state machine for booking flow
 * - Step navigation with validation
 * - Form state persistence across steps
 * - Progress indicator support
 */
export const useBookingFlow = (
  providerId: string,
  initialStep: BookingFlowStep = BookingFlowStep.SERVICE_SELECTION
): [BookingFlowState, BookingFlowActions] => {
  // Define step order
  const stepOrder: BookingFlowStep[] = [
    BookingFlowStep.SERVICE_SELECTION,
    BookingFlowStep.DATE_TIME_SELECTION,
    BookingFlowStep.LOCATION_SELECTION,
    BookingFlowStep.BOOKING_SUMMARY,
    BookingFlowStep.PAYMENT_METHOD,
    BookingFlowStep.PAYMENT_PROCESSING,
    BookingFlowStep.BOOKING_CONFIRMATION,
  ];

  // Initialize state
  const [state, setState] = useState<BookingFlowState>({
    providerId,
    currentStep: initialStep,
    isStepValid: false,
    bookingData: {},
  });

  // Get current step index
  const getCurrentStepIndex = useCallback((): number => {
    return stepOrder.indexOf(state.currentStep);
  }, [state.currentStep, stepOrder]);

  // Get total steps
  const getTotalSteps = useCallback((): number => {
    return stepOrder.length;
  }, [stepOrder]);

  // Calculate progress percentage
  const getProgress = useCallback((): number => {
    const currentIndex = getCurrentStepIndex();
    return ((currentIndex + 1) / getTotalSteps()) * 100;
  }, [getCurrentStepIndex, getTotalSteps]);

  // Validate current step
  const validateCurrentStep = useCallback((): boolean => {
    switch (state.currentStep) {
      case BookingFlowStep.SERVICE_SELECTION:
        return !!state.serviceId;

      case BookingFlowStep.DATE_TIME_SELECTION:
        return !!state.scheduledDate && !!state.scheduledTime;

      case BookingFlowStep.LOCATION_SELECTION:
        return !!state.location?.address && !!state.location?.city && !!state.location?.region;

      case BookingFlowStep.BOOKING_SUMMARY:
        // All previous steps must be valid
        return (
          !!state.serviceId &&
          !!state.scheduledDate &&
          !!state.scheduledTime &&
          !!state.location?.address
        );

      case BookingFlowStep.PAYMENT_METHOD:
        return !!state.paymentMethod;

      case BookingFlowStep.PAYMENT_PROCESSING:
        // Payment processing step is valid when transaction is initiated
        return !!state.transactionId || state.paymentMethod?.type === 'cash';

      case BookingFlowStep.BOOKING_CONFIRMATION:
        // Confirmation step is always valid (final step)
        return true;

      default:
        return false;
    }
  }, [state]);

  // Check if can go to next step
  const canGoNext = useCallback((): boolean => {
    const currentIndex = getCurrentStepIndex();
    const isLastStep = currentIndex === stepOrder.length - 1;
    const isCurrentStepValid = validateCurrentStep();

    return !isLastStep && isCurrentStepValid;
  }, [getCurrentStepIndex, stepOrder, validateCurrentStep]);

  // Check if can go back
  const canGoBack = useCallback((): boolean => {
    const currentIndex = getCurrentStepIndex();
    return currentIndex > 0;
  }, [getCurrentStepIndex]);

  // Go to next step
  const goToNextStep = useCallback((): boolean => {
    if (!canGoNext()) {
      return false;
    }

    const currentIndex = getCurrentStepIndex();
    const nextStep = stepOrder[currentIndex + 1];

    setState((prev) => ({
      ...prev,
      currentStep: nextStep,
      isStepValid: false, // Reset validation for new step
    }));

    return true;
  }, [canGoNext, getCurrentStepIndex, stepOrder]);

  // Go to previous step
  const goToPreviousStep = useCallback((): boolean => {
    if (!canGoBack()) {
      return false;
    }

    const currentIndex = getCurrentStepIndex();
    const previousStep = stepOrder[currentIndex - 1];

    setState((prev) => ({
      ...prev,
      currentStep: previousStep,
      isStepValid: true, // Previous step was already validated
    }));

    return true;
  }, [canGoBack, getCurrentStepIndex, stepOrder]);

  // Go to specific step
  const goToStep = useCallback((step: BookingFlowStep): void => {
    setState((prev) => ({
      ...prev,
      currentStep: step,
      isStepValid: validateCurrentStep(),
    }));
  }, [validateCurrentStep]);

  // Set service selection
  const setServiceSelection = useCallback((serviceId: string, addOnIds?: string[]): void => {
    setState((prev) => ({
      ...prev,
      serviceId,
      selectedAddOnIds: addOnIds,
      isStepValid: true,
    }));
  }, []);

  // Set date and time selection
  const setDateTimeSelection = useCallback((date: string, time: string): void => {
    setState((prev) => ({
      ...prev,
      scheduledDate: date,
      scheduledTime: time,
      isStepValid: true,
    }));
  }, []);

  // Set location selection
  const setLocationSelection = useCallback((location: Location, notes?: string): void => {
    setState((prev) => ({
      ...prev,
      location,
      locationNotes: notes,
      isStepValid: true,
    }));
  }, []);

  // Set payment method
  const setPaymentMethod = useCallback((method: PaymentMethod): void => {
    setState((prev) => ({
      ...prev,
      paymentMethod: method,
      isStepValid: true,
    }));
  }, []);

  // Set transaction ID
  const setTransactionId = useCallback((transactionId: string): void => {
    setState((prev) => ({
      ...prev,
      transactionId,
      isStepValid: true,
    }));
  }, []);

  // Set booking data
  const setBookingData = useCallback((data: { totalAmount?: number; bookingId?: string }): void => {
    setState((prev) => ({
      ...prev,
      bookingData: {
        ...prev.bookingData,
        ...data,
      },
    }));
  }, []);

  // Reset flow
  const resetFlow = useCallback((): void => {
    setState({
      providerId,
      currentStep: BookingFlowStep.SERVICE_SELECTION,
      isStepValid: false,
      bookingData: {},
    });
  }, [providerId]);

  // Create actions object
  const actions: BookingFlowActions = useMemo(
    () => ({
      goToNextStep,
      goToPreviousStep,
      goToStep,
      canGoNext,
      canGoBack,
      setServiceSelection,
      setDateTimeSelection,
      setLocationSelection,
      setPaymentMethod,
      setTransactionId,
      setBookingData,
      resetFlow,
      getProgress,
      getCurrentStepIndex,
      getTotalSteps,
    }),
    [
      goToNextStep,
      goToPreviousStep,
      goToStep,
      canGoNext,
      canGoBack,
      setServiceSelection,
      setDateTimeSelection,
      setLocationSelection,
      setPaymentMethod,
      setTransactionId,
      setBookingData,
      resetFlow,
      getProgress,
      getCurrentStepIndex,
      getTotalSteps,
    ]
  );

  return [state, actions];
};
