import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Text } from '../../../shared/components/Text';
import { TextInput } from '../../../shared/components/TextInput';
import { Button } from '../../../shared/components/Button';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { useBookingFlowContext } from '../context/BookingFlowContext';
import { useMutation } from '@tanstack/react-query';
import { PaymentService } from '../../../core/api/services/PaymentService';
import { BookingService } from '../../../core/api/services/BookingService';
import { MoMoPaymentRequest, PaymentStatus } from '../../../core/api/types';
import { Ionicons } from '@expo/vector-icons';
import { validatePhoneNumber } from '../../auth/utils/phoneValidation';
import {
  parsePaymentError,
  formatPaymentErrorAlert,
  PAYMENT_TIMEOUTS,
  hasPaymentVerificationTimedOut,
  createTimeoutError,
} from '../utils/paymentErrors';

/**
 * MobileMoneyPaymentScreen Component
 *
 * Handles Mobile Money payment processing for booking.
 *
 * Requirements:
 * - 4.10: Create MoMo payment form with phone number and provider
 * - 4.11: Implement payment initiation API call
 * - Handle payment verification polling
 */
export const MobileMoneyPaymentScreen: React.FC = () => {
  const { theme } = useTheme();
  const { state, actions } = useBookingFlowContext();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<'mtn' | 'vodafone' | 'airteltigo' | null>(
    state.paymentMethod?.provider || null
  );
  const [phoneError, setPhoneError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'verifying' | 'completed' | 'failed'>('idle');

  // Pre-fill phone number if saved in payment method
  useEffect(() => {
    if (state.paymentMethod?.phoneNumber) {
      setPhoneNumber(state.paymentMethod.phoneNumber);
    }
  }, [state.paymentMethod]);

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: () => {
      if (!state.serviceId || !state.scheduledDate || !state.scheduledTime || !state.location) {
        throw new Error('Missing required booking data');
      }

      return BookingService.createBooking({
        providerId: state.providerId,
        serviceId: state.serviceId,
        scheduledDate: state.scheduledDate,
        scheduledTime: state.scheduledTime,
        location: state.location,
        locationNotes: state.locationNotes,
        addOnIds: state.selectedAddOnIds,
      });
    },
  });

  // Payment initiation mutation
  const initiatePaymentMutation = useMutation({
    mutationFn: (data: MoMoPaymentRequest) => PaymentService.initiateMoMoPayment(data),
  });

  // Validate phone number
  const validatePhone = (phone: string): boolean => {
    if (!phone) {
      setPhoneError('Phone number is required');
      return false;
    }

    const formattedPhone = phone.startsWith('+233') ? phone : `+233${phone.replace(/^0/, '')}`;

    if (!validatePhoneNumber(formattedPhone)) {
      setPhoneError('Please enter a valid Ghana phone number');
      return false;
    }

    setPhoneError('');
    return true;
  };

  // Handle payment processing
  const handlePayment = async () => {
    // Validate inputs
    if (!validatePhone(phoneNumber)) {
      return;
    }

    if (!selectedProvider) {
      Alert.alert('Provider Required', 'Please select your mobile money provider');
      return;
    }

    try {
      setPaymentStatus('processing');

      // Step 1: Create booking first
      const booking = await createBookingMutation.mutateAsync();
      actions.setBookingData({
        bookingId: booking.id,
        totalAmount: booking.totalAmount,
      });

      // Step 2: Initiate payment
      const formattedPhone = phoneNumber.startsWith('+233')
        ? phoneNumber
        : `+233${phoneNumber.replace(/^0/, '')}`;

      const paymentRequest: MoMoPaymentRequest = {
        amount: booking.totalAmount,
        currency: 'GHS',
        phoneNumber: formattedPhone,
        provider: selectedProvider,
        bookingId: booking.id,
      };

      const paymentResponse = await initiatePaymentMutation.mutateAsync(paymentRequest);
      actions.setTransactionId(paymentResponse.transactionId);

      // Step 3: Handle payment status
      if (paymentResponse.status === 'completed') {
        setPaymentStatus('completed');
        actions.goToNextStep(); // Go to confirmation
      } else if (paymentResponse.status === 'pending') {
        // Start polling for payment verification
        setPaymentStatus('verifying');
        await pollPaymentStatus(paymentResponse.transactionId);
      } else {
        throw new Error(paymentResponse.message || 'Payment initiation failed');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');

      // Use payment error handler
      const errorAlert = formatPaymentErrorAlert(
        error,
        () => {
          setPaymentStatus('idle');
          handlePayment();
        },
        () => actions.goToPreviousStep(),
        () => setPaymentStatus('idle')
      );

      Alert.alert(errorAlert.title, errorAlert.message, errorAlert.buttons);
    }
  };

  // Poll payment status
  const pollPaymentStatus = async (transactionId: string) => {
    const startTime = Date.now();

    try {
      const result = await PaymentService.pollPaymentStatus(
        transactionId,
        PAYMENT_TIMEOUTS.VERIFICATION_MAX_ATTEMPTS,
        PAYMENT_TIMEOUTS.VERIFICATION_POLL_INTERVAL
      );

      if (result.status === 'completed') {
        setPaymentStatus('completed');
        actions.goToNextStep(); // Go to confirmation
      } else if (result.status === 'failed') {
        throw new Error(result.message || 'Payment verification failed');
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      setPaymentStatus('failed');

      // Check if timeout
      const isTimeout = hasPaymentVerificationTimedOut(
        startTime,
        PAYMENT_TIMEOUTS.VERIFICATION_TOTAL
      );

      const finalError = isTimeout ? createTimeoutError() : error;

      // Use payment error handler
      const errorAlert = formatPaymentErrorAlert(
        finalError,
        () => {
          setPaymentStatus('verifying');
          pollPaymentStatus(transactionId);
        },
        () => actions.goToPreviousStep(),
        () => setPaymentStatus('idle')
      );

      Alert.alert(errorAlert.title, errorAlert.message, errorAlert.buttons);
    }
  };

  const getProviderLogo = (provider: string) => {
    const logos: Record<string, string> = {
      mtn: '📱', // In production, use actual logo images
      vodafone: '📱',
      airteltigo: '📱',
    };
    return logos[provider] || '📱';
  };

  const isProcessing = paymentStatus === 'processing' || paymentStatus === 'verifying';
  const canProceed = phoneNumber && selectedProvider && !isProcessing;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text variant="h2" style={styles.title}>
          Mobile Money Payment
        </Text>
        <Text variant="body" style={styles.subtitle}>
          Enter your mobile money details to complete payment
        </Text>

        {/* Provider Selection */}
        <View style={styles.section}>
          <Text variant="subtitle" style={styles.sectionTitle}>
            Select Provider
          </Text>
          <View style={styles.providerGrid}>
            <ProviderButton
              provider="mtn"
              label="MTN"
              logo={getProviderLogo('mtn')}
              isSelected={selectedProvider === 'mtn'}
              onSelect={() => setSelectedProvider('mtn')}
              theme={theme}
            />
            <ProviderButton
              provider="vodafone"
              label="Vodafone"
              logo={getProviderLogo('vodafone')}
              isSelected={selectedProvider === 'vodafone'}
              onSelect={() => setSelectedProvider('vodafone')}
              theme={theme}
            />
            <ProviderButton
              provider="airteltigo"
              label="AirtelTigo"
              logo={getProviderLogo('airteltigo')}
              isSelected={selectedProvider === 'airteltigo'}
              onSelect={() => setSelectedProvider('airteltigo')}
              theme={theme}
            />
          </View>
        </View>

        {/* Phone Number Input */}
        <View style={styles.section}>
          <TextInput
            label="Mobile Money Number"
            value={phoneNumber}
            onChangeText={(text) => {
              setPhoneNumber(text);
              setPhoneError('');
            }}
            onBlur={() => validatePhone(phoneNumber)}
            placeholder="024 123 4567"
            keyboardType="phone-pad"
            error={phoneError}
            accessibilityLabel="Mobile money phone number"
            editable={!isProcessing}
          />
          <Text variant="caption" style={styles.hint}>
            Enter the phone number linked to your mobile money account
          </Text>
        </View>

        {/* Payment Summary */}
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
          <Text variant="subtitle" style={styles.summaryTitle}>
            Payment Summary
          </Text>
          <View style={styles.summaryRow}>
            <Text variant="body">Amount to Pay</Text>
            <Text variant="h3" style={{ color: theme.colors.primary }}>
              GHS {state.bookingData.totalAmount?.toFixed(2) || '0.00'}
            </Text>
          </View>
        </View>

        {/* Payment Status */}
        {isProcessing && (
          <View style={[styles.statusCard, { backgroundColor: theme.colors.surface }]}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text variant="subtitle" style={styles.statusText}>
              {paymentStatus === 'processing' && 'Initiating payment...'}
              {paymentStatus === 'verifying' && 'Verifying payment...'}
            </Text>
            <Text variant="caption" style={styles.statusHint}>
              {paymentStatus === 'processing' && 'Please wait while we process your request'}
              {paymentStatus === 'verifying' && 'Please approve the payment on your phone'}
            </Text>
          </View>
        )}

        {/* Instructions */}
        {!isProcessing && (
          <View style={[styles.instructionsCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.instructionHeader}>
              <Ionicons name="information-circle-outline" size={24} color={theme.colors.primary} />
              <Text variant="subtitle" style={styles.instructionTitle}>
                How it works
              </Text>
            </View>
            <View style={styles.instructionStep}>
              <Text variant="body">1. Select your mobile money provider</Text>
            </View>
            <View style={styles.instructionStep}>
              <Text variant="body">2. Enter your mobile money number</Text>
            </View>
            <View style={styles.instructionStep}>
              <Text variant="body">3. Tap "Pay Now" to initiate payment</Text>
            </View>
            <View style={styles.instructionStep}>
              <Text variant="body">4. Approve the payment prompt on your phone</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Pay Button */}
      <View style={[styles.footer, { backgroundColor: theme.colors.background }]}>
        <Button
          onPress={handlePayment}
          disabled={!canProceed}
          loading={isProcessing}
          accessibilityLabel="Pay now with mobile money"
        >
          {isProcessing ? 'Processing...' : 'Pay Now'}
        </Button>
      </View>
    </View>
  );
};

/**
 * ProviderButton Component
 */
interface ProviderButtonProps {
  provider: string;
  label: string;
  logo: string;
  isSelected: boolean;
  onSelect: () => void;
  theme: any;
}

const ProviderButton: React.FC<ProviderButtonProps> = ({
  provider,
  label,
  logo,
  isSelected,
  onSelect,
  theme,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.providerButton,
        {
          backgroundColor: theme.colors.surface,
          borderColor: isSelected ? theme.colors.primary : theme.colors.border,
          borderWidth: isSelected ? 2 : 1,
        },
      ]}
      onPress={onSelect}
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected }}
      accessibilityLabel={`${label} mobile money provider`}
    >
      <Text style={styles.providerLogo}>{logo}</Text>
      <Text variant="body" style={styles.providerLabel}>
        {label}
      </Text>
      {isSelected && (
        <View style={[styles.checkmark, { backgroundColor: theme.colors.primary }]}>
          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
        </View>
      )}
    </TouchableOpacity>
  );
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
    paddingBottom: 100,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 24,
    opacity: 0.7,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  providerGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  providerButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    position: 'relative',
  },
  providerLogo: {
    fontSize: 32,
    marginBottom: 8,
  },
  providerLabel: {
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hint: {
    marginTop: 8,
    opacity: 0.7,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  summaryTitle: {
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusCard: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  statusText: {
    marginTop: 16,
    textAlign: 'center',
  },
  statusHint: {
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.7,
  },
  instructionsCard: {
    padding: 16,
    borderRadius: 12,
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  instructionTitle: {
    marginLeft: 8,
  },
  instructionStep: {
    marginBottom: 8,
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
});
