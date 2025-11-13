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
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Config } from '@/constants/config';
import { error } from 'console';

type Props = AuthStackScreenProps<'OTPVerification'>;

export const OTPVerificationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { verifyOTP, requestOTP, isVerifyingOTP, isRequestingOTP, user, biometric } = useAuth();
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
  const handleVerifyOTP = (otpCode?: string) => {
    const otpValue = otpCode || otp.join('');

    if (otpValue.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit code');
      return;
    }

    // Verify OTP using React Query mutation
    verifyOTP(
      { phone, otp: otpValue },
      {
        onSuccess: async (data) => {
          // Check if biometric is available and prompt setup
          const biometricAvailable = await biometric.checkAvailability();

          if (biometricAvailable) {
            Alert.alert(
              'Enable Biometric Login?',
              'Would you like to use Face ID/Touch ID for faster login?',
              [
                {
                  text: 'Not Now',
                  style: 'cancel',
                  onPress: () => navigateAfterAuth(data.user),
                },
                {
                  text: 'Enable',
                  onPress: async () => {
                    await biometric.enableBiometric();
                    navigateAfterAuth(data.user);
                  },
                },
              ]
            );
          } else {
            navigateAfterAuth(data.user);
          }
        },
        onError: (err: any) => {
          Alert.alert('Verification Failed', err?.message || 'Invalid OTP. Please try again.', [
            {
              text: 'OK',
              onPress: () => {
                // Clear OTP inputs
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
              },
            },
          ]);
        },
      }
    );
  };

  // Navigate after successful authentication
  const navigateAfterAuth = (user: any) => {
    // Check if user needs to select role
    if (!user.role || user.role === 'ADMIN') {
      navigation.replace('RoleSelection');
    }
    // Otherwise, AppNavigator will handle navigation based on isAuthenticated
  };

  // Resend OTP
  const handleResendOTP = () => {
    if (!canResend) {
      return;
    }

    // Request new OTP using React Query mutation
    requestOTP(phone, {
      onSuccess: () => {
        Alert.alert('OTP Sent', 'A new verification code has been sent to your phone.');

        // Reset timer
        setResendTimer(Config.OTP_RESEND_TIMEOUT);
        setCanResend(false);

        // Clear OTP inputs
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      },
      onError: (err: any) => {
        Alert.alert('Error', err?.message || 'Failed to resend OTP. Please try again.');
      },
    });
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
                  digit ? styles.otpInputFilled : null,
                  error ? styles.otpInputError : null,
                ]}
                value={digit}
                onChangeText={(value) => handleOTPChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                editable={!isVerifyingOTP}
                autoFocus={index === 0}
              />
            ))}
          </View>

          {/* Verify Button */}
          <Button
            title={isVerifyingOTP ? 'Verifying...' : 'Verify OTP'}
            onPress={() => handleVerifyOTP()}
            loading={isVerifyingOTP}
            disabled={isVerifyingOTP || otp.some((digit) => !digit)}
            fullWidth
            style={styles.button}
          />

          {/* Resend OTP */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code?</Text>
            {canResend ? (
              <TouchableOpacity onPress={handleResendOTP} disabled={isRequestingOTP || isVerifyingOTP}>
                <Text style={styles.resendLink}>
                  {isRequestingOTP ? 'Sending...' : 'Resend OTP'}
                </Text>
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
            disabled={isVerifyingOTP}
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
