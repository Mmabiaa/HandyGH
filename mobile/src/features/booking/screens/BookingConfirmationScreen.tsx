import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Animated as RNAnimated,
} from 'react-native';
import { Text } from '../../../shared/components/Text';
import { Button } from '../../../shared/components/Button';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { useBookingFlowContext } from '../context/BookingFlowContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { formatDate, formatTime, formatCurrency } from '../../../shared/utils/formatting';

/**
 * BookingConfirmationScreen Component
 *
 * Displays booking success confirmation with details and navigation options.
 *
 * Requirements:
 * - 4.12: Display booking success confirmation
 * - Show booking details and reference number
 * - Add "View Booking" and "Return Home" CTAs
 * - Implement success animation
 */
export const BookingConfirmationScreen: React.FC = () => {
  const { theme } = useTheme();
  const { state, actions } = useBookingFlowContext();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  // Animation values
  const scaleAnim = useRef(new RNAnimated.Value(0)).current;
  const fadeAnim = useRef(new RNAnimated.Value(0)).current;
  const slideAnim = useRef(new RNAnimated.Value(50)).current;

  // Run success animation on mount
  useEffect(() => {
    // Checkmark scale animation
    RNAnimated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Content fade in
    RNAnimated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      delay: 200,
      useNativeDriver: true,
    }).start();

    // Content slide up
    RNAnimated.timing(slideAnim, {
      toValue: 0,
      duration: 600,
      delay: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleViewBooking = () => {
    if (state.bookingData.bookingId) {
      // Navigate to booking details
      navigation.navigate('BookingDetails', {
        bookingId: state.bookingData.bookingId,
      });

      // Reset booking flow
      actions.resetFlow();
    }
  };

  const handleReturnHome = () => {
    // Navigate to home screen
    navigation.navigate('Home');

    // Reset booking flow
    actions.resetFlow();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Animation */}
        <View style={styles.animationContainer}>
          <RNAnimated.View
            style={[
              styles.checkmarkCircle,
              {
                backgroundColor: theme.colors.success || theme.colors.primary,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Ionicons name="checkmark" size={64} color="#FFFFFF" />
          </RNAnimated.View>
        </View>

        {/* Success Message */}
        <RNAnimated.View
          style={[
            styles.messageContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text variant="h1" style={styles.title}>
            Booking Confirmed!
          </Text>
          <Text variant="body" style={styles.subtitle}>
            Your service has been successfully booked
          </Text>
        </RNAnimated.View>

        {/* Booking Reference */}
        <RNAnimated.View
          style={[
            styles.referenceCard,
            {
              backgroundColor: theme.colors.surface,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text variant="caption" style={styles.referenceLabel}>
            Booking Reference
          </Text>
          <Text variant="h3" style={[styles.referenceNumber, { color: theme.colors.primary }]}>
            {state.bookingData.bookingId?.substring(0, 8).toUpperCase() || 'N/A'}
          </Text>
        </RNAnimated.View>

        {/* Booking Details */}
        <RNAnimated.View
          style={[
            styles.detailsCard,
            {
              backgroundColor: theme.colors.surface,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text variant="h4" style={styles.detailsTitle}>
            Booking Details
          </Text>

          {/* Date */}
          {state.scheduledDate && (
            <DetailRow
              icon="calendar-outline"
              label="Date"
              value={formatDate(state.scheduledDate)}
              theme={theme}
            />
          )}

          {/* Time */}
          {state.scheduledTime && (
            <DetailRow
              icon="time-outline"
              label="Time"
              value={formatTime(state.scheduledTime)}
              theme={theme}
            />
          )}

          {/* Location */}
          {state.location && (
            <DetailRow
              icon="location-outline"
              label="Location"
              value={state.location.address}
              theme={theme}
            />
          )}

          {/* Payment Method */}
          {state.paymentMethod && (
            <DetailRow
              icon="card-outline"
              label="Payment"
              value={getPaymentMethodLabel(state.paymentMethod.type)}
              theme={theme}
            />
          )}

          {/* Amount */}
          {state.bookingData.totalAmount && (
            <DetailRow
              icon="cash-outline"
              label="Amount Paid"
              value={formatCurrency(state.bookingData.totalAmount)}
              theme={theme}
              highlight
            />
          )}
        </RNAnimated.View>

        {/* Next Steps */}
        <RNAnimated.View
          style={[
            styles.nextStepsCard,
            {
              backgroundColor: theme.colors.surface,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.nextStepsHeader}>
            <Ionicons name="information-circle-outline" size={24} color={theme.colors.primary} />
            <Text variant="h4" style={styles.nextStepsTitle}>
              What's Next?
            </Text>
          </View>

          <View style={styles.nextStep}>
            <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text variant="body" style={styles.stepText}>
              You'll receive a confirmation notification shortly
            </Text>
          </View>

          <View style={styles.nextStep}>
            <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text variant="body" style={styles.stepText}>
              The provider will review and confirm your booking
            </Text>
          </View>

          <View style={styles.nextStep}>
            <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text variant="body" style={styles.stepText}>
              You can track your booking status in real-time
            </Text>
          </View>
        </RNAnimated.View>
      </ScrollView>

      {/* Action Buttons */}
      <RNAnimated.View
        style={[
          styles.footer,
          {
            backgroundColor: theme.colors.background,
            opacity: fadeAnim,
          },
        ]}
      >
        <Button
          onPress={handleViewBooking}
          variant="primary"
          style={styles.primaryButton}
          accessibilityLabel="View booking details"
        >
          View Booking
        </Button>
        <Button
          onPress={handleReturnHome}
          variant="outline"
          style={styles.secondaryButton}
          accessibilityLabel="Return to home screen"
        >
          Return Home
        </Button>
      </RNAnimated.View>
    </View>
  );
};

/**
 * DetailRow Component
 */
interface DetailRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  theme: any;
  highlight?: boolean;
}

const DetailRow: React.FC<DetailRowProps> = ({ icon, label, value, theme, highlight }) => {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <Ionicons
          name={icon}
          size={20}
          color={highlight ? theme.colors.primary : theme.colors.text}
        />
      </View>
      <View style={styles.detailContent}>
        <Text variant="caption" style={styles.detailLabel}>
          {label}
        </Text>
        <Text
          variant={highlight ? 'h5' : 'body'}
          style={[styles.detailValue, highlight && { color: theme.colors.primary }]}
        >
          {value}
        </Text>
      </View>
    </View>
  );
};

/**
 * Helper function to get payment method label
 */
const getPaymentMethodLabel = (type: string): string => {
  const labels: Record<string, string> = {
    momo: 'Mobile Money',
    card: 'Credit/Debit Card',
    cash: 'Cash on Delivery',
  };
  return labels[type] || type;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 140,
  },
  animationContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 24,
  },
  checkmarkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  referenceCard: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  referenceLabel: {
    opacity: 0.7,
    marginBottom: 8,
  },
  referenceNumber: {
    letterSpacing: 2,
  },
  detailsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  detailsTitle: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailIcon: {
    width: 32,
    marginRight: 12,
    paddingTop: 2,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    opacity: 0.7,
    marginBottom: 4,
  },
  detailValue: {},
  nextStepsCard: {
    padding: 16,
    borderRadius: 12,
  },
  nextStepsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  nextStepsTitle: {
    marginLeft: 8,
  },
  nextStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    paddingTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  primaryButton: {
    marginBottom: 12,
  },
  secondaryButton: {},
});
