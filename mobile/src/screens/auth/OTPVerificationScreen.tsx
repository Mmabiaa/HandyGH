import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TextInput as RNTextInput,
  TouchableOpacity,
} from 'react-native';
import { AuthStackScreenProps } from '@/navigation/types';
import { colors, spacing, typography } from '@/constants/theme';
import { Button } from '@/components/common/Button';
import { useAppDispatch, useAppSelector } from '@/store';
import { verifyOTP, requestOTP, clearError } from '@/store/slices/authSlice';
import { Config } from '@/constants/config';

type Props = AuthStackScreenProps<'OTPVerification'>;

export const OTPVerificationScreen: React.FC<Props> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error, user } = useAppSelector((state) => state.auth);
  const { phone } = route.params;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(Config.OTP_RESEND_TIMEOUT);
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
    }
  }, [resendTimer]);

  // Handle OTP input change
  const handleOTPChange = (value: string, index: number) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are entered
    if (value && index === 5 && newOtp.every((digit) => digit !== '')) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  // Handle backspace
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (otpCode?: string) => {
    const otpValue = otpCode || otp.join('');

    if (otpValue.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit code');
      return;
    }

    dispatch(clearError());

    try {
      const result = await dispatch(
        verifyOTP({
          phone,
          otp: otpValue,
        })
      ).unwrap();

      // Check if user needs to select role
      if (!result.user.role || result.user.role === 'ADMIN') {
        // Navigate to role selection
        navigation.replace('RoleSelection');
      } else {
        // User already has a role, navigation will be handled by AppNavigator
        // The AppNavigator will detect isAuthenticated and navigate to appropriate screen
      }
    } catch (err: any) {
      Alert.alert('Verification Failed', err || 'Invalid OTP. Please try again.', [
        {
          text: 'OK',
          onPress: () => {
            // Clear OTP inputs
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
          },
        },
      ]);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (!canResend) {
      return;
    }

    dispatch(clearError());

    try {
      await dispatch(requestOTP(phone)).unwrap();

      Alert.alert('OTP Sent', 'A new verification code has been sent to your phone.');

      // Reset timer
      setResendTimer(Config.OTP_RESEND_TIMEOUT);
      setCanResend(false);

      // Clear OTP inputs
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      Alert.alert('Error', err || 'Failed to resend OTP. Please try again.');
    }
  };

  // Format phone number for display
  const formatPhoneDisplay = (phoneNumber: string) => {
    if (phoneNumber.startsWith('+233')) {
      return phoneNumber.replace('+233', '+233 *** *** ');
    }
    return phoneNumber;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Verify Your Phone</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit code sent to{'\n'}
              <Text style={styles.phoneNumber}>{formatPhoneDisplay(phone)}</Text>
            </Text>
          </View>

          {/* OTP Input */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <RNTextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={[
                  styles.otpInput,
                  digit && styles.otpInputFilled,
                  error && styles.otpInputError,
                ]}
                value={digit}
                onChangeText={(value) => handleOTPChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                editable={!isLoading}
                autoFocus={index === 0}
              />
            ))}
          </View>

          {/* Error Message */}
          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* Verify Button */}
          <Button
            title={isLoading ? 'Verifying...' : 'Verify OTP'}
            onPress={() => handleVerifyOTP()}
            loading={isLoading}
            disabled={isLoading || otp.some((digit) => !digit)}
            fullWidth
            style={styles.button}
          />

          {/* Resend OTP */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code?</Text>
            {canResend ? (
              <TouchableOpacity onPress={handleResendOTP} disabled={isLoading}>
                <Text style={styles.resendLink}>Resend OTP</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.resendTimer}>
                Resend in {resendTimer}s
              </Text>
            )}
          </View>

          {/* Change Phone Number */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            disabled={isLoading}
            style={styles.changePhoneButton}
          >
            <Text style={styles.changePhoneText}>Change Phone Number</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  header: {
    marginBottom: spacing.xxl,
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  phoneNumber: {
    ...typography.body1,
    color: colors.text,
    fontWeight: '600',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    backgroundColor: colors.white,
  },
  otpInputFilled: {
    borderColor: colors.primary,
  },
  otpInputError: {
    borderColor: colors.error,
  },
  errorText: {
    ...typography.body2,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  button: {
    marginBottom: spacing.lg,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  resendText: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  resendLink: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
  },
  resendTimer: {
    ...typography.body2,
    color: colors.textTertiary,
  },
  changePhoneButton: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  changePhoneText: {
    ...typography.body2,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});
