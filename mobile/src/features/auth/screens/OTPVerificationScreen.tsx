/**
 * OTP Verification Screen
 *
 * Allows users to enter the OTP code sent to their phone.
 * Includes auto-focus, countdown timer, and resend functionality.
 *
 * Requirements: 1.6, 1.7
 * - Create 6-digit OTP input with auto-focus
 * - Implement countdown timer for resend functionality
 * - Add SMS auto-read permission and functionality
 * - Handle OTP verification with error states
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TextInput as RNTextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { Text } from '../../../shared/components/Text';
import { Button } from '../../../shared/components/Button';
import { spacing } from '../../../core/theme/spacing';
import { borderRadius } from '../../../core/theme/borderRadius';
import { formatPhoneNumberDisplay } from '../../../shared/utils/validation';
import type { AuthStackParamList } from '../../../core/navigation/types';

type OTPVerificationScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'OTPVerification'
>;

type OTPVerificationScreenRouteProp = RouteProp<
  AuthStackParamList,
  'OTPVerification'
>;

const OTP_LENGTH = 6;
const RESEND_TIMEOUT = 60; // seconds

const OTPVerificationScreen: React.FC = () => {
  const navigation = useNavigation<OTPVerificationScreenNavigationProp>();
  const route = useRoute<OTPVerificationScreenRouteProp>();
  const { theme } = useTheme();

  const { phoneNumber } = route.params;

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_TIMEOUT);
  const [canResend, setCanResend] = useState(false);

  // Refs for OTP inputs
  const inputRefs = useRef<(RNTextInput | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
      return undefined;
    }
  }, [resendTimer]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Handle OTP input change
  const handleOtpChange = (text: string, index: number) => {
    // Only allow numeric input
    const numericText = text.replace(/[^0-9]/g, '');

    if (numericText.length === 0) {
      // Handle backspace
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      setError('');

      // Focus previous input
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (numericText.length === 1) {
      // Handle single digit input
      const newOtp = [...otp];
      newOtp[index] = numericText;
      setOtp(newOtp);
      setError('');

      // Auto-focus next input
      if (index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      } else {
        // All digits entered, verify OTP
        verifyOtp([...newOtp.slice(0, index), numericText, ...newOtp.slice(index + 1)]);
      }
    } else if (numericText.length > 1) {
      // Handle paste of multiple digits
      const digits = numericText.slice(0, OTP_LENGTH).split('');
      const newOtp = [...otp];

      digits.forEach((digit, i) => {
        if (index + i < OTP_LENGTH) {
          newOtp[index + i] = digit;
        }
      });

      setOtp(newOtp);
      setError('');

      // Focus last filled input or verify if complete
      const lastFilledIndex = Math.min(index + digits.length - 1, OTP_LENGTH - 1);
      if (lastFilledIndex === OTP_LENGTH - 1 && newOtp.every(d => d !== '')) {
        verifyOtp(newOtp);
      } else {
        inputRefs.current[Math.min(lastFilledIndex + 1, OTP_LENGTH - 1)]?.focus();
      }
    }
  };

  // Handle key press for backspace
  const handleKeyPress = (e: any, index: number): void => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Verify OTP
  const verifyOtp = async (otpArray: string[]) => {
    const otpCode = otpArray.join('');

    if (otpCode.length !== OTP_LENGTH) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // TODO: Call API to verify OTP
      // const response = await authService.verifyOTP(phoneNumber, otpCode);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate success/failure
      const isValid = otpCode === '123456'; // Mock validation

      if (isValid) {
        // Navigate to role selection
        navigation.navigate('RoleSelection');
      } else {
        setError('Invalid verification code. Please try again.');
        setOtp(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;

    setIsLoading(true);
    setError('');

    try {
      // TODO: Call API to resend OTP
      // await authService.requestOTP(phoneNumber);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Reset timer
      setResendTimer(RESEND_TIMEOUT);
      setCanResend(false);

      // Clear OTP inputs
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Format timer display
  const formatTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="h2" color="text" style={styles.title}>
            Enter Verification Code
          </Text>
          <Text variant="body" color="textSecondary" style={styles.description}>
            We sent a 6-digit code to
          </Text>
          <Text variant="labelLarge" color="text" style={styles.phoneNumber}>
            {formatPhoneNumberDisplay(phoneNumber)}
          </Text>
        </View>

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <RNTextInput
              key={index}
              ref={ref => (inputRefs.current[index] = ref)}
              style={[
                styles.otpInput,
                {
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: error
                    ? theme.colors.error
                    : digit
                    ? theme.colors.primary
                    : theme.colors.inputBorder,
                  color: theme.colors.text,
                },
              ]}
              value={digit}
              onChangeText={text => handleOtpChange(text, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              accessibilityLabel={`OTP digit ${index + 1}`}
              accessibilityHint={`Enter digit ${index + 1} of 6`}
            />
          ))}
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text variant="body" color="error" align="center">
              {error}
            </Text>
          </View>
        )}

        {/* Resend Section */}
        <View style={styles.resendSection}>
          {canResend ? (
            <TouchableOpacity
              onPress={handleResendOtp}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel="Resend verification code"
            >
              <Text variant="labelLarge" color="primary">
                Resend Code
              </Text>
            </TouchableOpacity>
          ) : (
            <Text variant="body" color="textSecondary">
              Resend code in {formatTimer(resendTimer)}
            </Text>
          )}
        </View>

        {/* Verify Button */}
        <View style={styles.buttonContainer}>
          <Button
            variant="primary"
            size="large"
            fullWidth
            onPress={() => verifyOtp(otp)}
            loading={isLoading}
            disabled={otp.some(d => d === '') || isLoading}
            accessibilityLabel="Verify code"
            accessibilityHint="Verifies the entered OTP code"
          >
            Verify Code
          </Button>
        </View>

        {/* Help Text */}
        <View style={styles.helpSection}>
          <Text variant="caption" color="textTertiary" align="center">
            Didn't receive the code? Check your SMS messages or try resending.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  title: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  phoneNumber: {
    marginTop: spacing.xs,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderRadius: borderRadius.md,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorContainer: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  resendSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  buttonContainer: {
    marginBottom: spacing.lg,
  },
  helpSection: {
    marginTop: 'auto',
    paddingTop: spacing.lg,
  },
});

export default OTPVerificationScreen;
