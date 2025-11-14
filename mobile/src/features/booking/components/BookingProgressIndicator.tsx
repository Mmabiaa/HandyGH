import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BookingFlowStep } from '../hooks/useBookingFlow';

interface BookingProgressIndicatorProps {
  currentStep: BookingFlowStep;
  totalSteps: number;
  currentStepIndex: number;
}

/**
 * BookingProgressIndicator Component
 *
 * Displays a visual progress indicator for the booking creation flow.
 * Shows the current step and overall progress through the booking process.
 *
 * Requirements:
 * - 4.13: Progress indicator for booking flow
 */
export const BookingProgressIndicator: React.FC<BookingProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  currentStepIndex,
}) => {
  // Get step label
  const getStepLabel = (step: BookingFlowStep): string => {
    switch (step) {
      case BookingFlowStep.SERVICE_SELECTION:
        return 'Service';
      case BookingFlowStep.DATE_TIME_SELECTION:
        return 'Date & Time';
      case BookingFlowStep.LOCATION_SELECTION:
        return 'Location';
      case BookingFlowStep.BOOKING_SUMMARY:
        return 'Review';
      default:
        return '';
    }
  };

  // Calculate progress percentage
  const progressPercentage = ((currentStepIndex + 1) / totalSteps) * 100;

  return (
    <View style={styles.container}>
      {/* Step Label */}
      <View style={styles.labelContainer}>
        <Text style={styles.stepLabel}>
          Step {currentStepIndex + 1} of {totalSteps}
        </Text>
        <Text style={styles.stepName}>{getStepLabel(currentStep)}</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${progressPercentage}%` },
            ]}
          />
        </View>
      </View>

      {/* Step Dots */}
      <View style={styles.dotsContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index <= currentStepIndex && styles.dotActive,
              index === currentStepIndex && styles.dotCurrent,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepLabel: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '500',
  },
  stepName: {
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#007AFF',
  },
  dotCurrent: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
});
