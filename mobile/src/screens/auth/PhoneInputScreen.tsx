import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { AuthStackScreenProps } from '@/navigation/types';
import { colors, spacing, typography } from '@/constants/theme';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useAppDispatch, useAppSelector } from '@/store';
import { requestOTP, clearError } from '@/store/slices/authSlice';

type Props = AuthStackScreenProps<'PhoneInput'>;

// Phone number validation regex for Ghana format
const GHANA_PHONE_REGEX = /^\+233[0-9]{9}$/;

export const PhoneInputScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error, otpRequested } = useAppSelector((state) => state.auth);

  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Validate phone number format
  const validatePhone = (phoneNumber: string): boolean => {
    if (!phoneNumber) {
      setPhoneError('Phone number is required');
      return false;
    }

    if (!GHANA_PHONE_REGEX.test(phoneNumber)) {
      setPhoneError('Please enter a valid Ghana phone number (e.g., +233XXXXXXXXX)');
      return false;
    }

    setPhoneError('');
    return true;
  };

  // Format phone number as user types
  const handlePhoneChange = (text: string) => {
    // Remove all non-numeric characters except +
    let formatted = text.replace(/[^\d+]/g, '');

    // Ensure it starts with +233
    if (!formatted.startsWith('+')) {
      formatted = '+' + formatted;
    }
    if (!formatted.startsWith('+233')) {
      if (formatted.startsWith('+2')) {
        formatted = '+233';
      } else if (formatted.startsWith('+23')) {
        formatted = '+233';
      } else if (formatted.length > 1) {
        formatted = '+233' + formatted.substring(1);
      }
    }

    // Limit to +233 + 9 digits
    if (formatted.length > 13) {
      formatted = formatted.substring(0, 13);
    }

    setPhone(formatted);
    if (phoneError) {
      setPhoneError('');
    }
  };

  // Handle OTP request
  const handleRequestOTP = async () => {
    // Clear any previous errors
    dispatch(clearError());

    // Validate phone number
    if (!validatePhone(phone)) {
      return;
    }

    try {
      const result = await dispatch(requestOTP(phone)).unwrap();

      // Show success message
      Alert.alert(
        'OTP Sent',
        'A verification code has been sent to your phone number.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to OTP verification screen
              navigation.navigate('OTPVerification', { phone });
            },
          },
        ]
      );
    } catch (err: any) {
      // Error is handled by Redux, but we can show an alert
      Alert.alert(
        'Error',
        err || 'Failed to send OTP. Please try again.',
        [{ text: 'OK' }]
      );
    }
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
            <Text style={styles.title}>Welcome to HandyGH</Text>
            <Text style={styles.subtitle}>
              Enter your phone number to get started
            </Text>
          </View>

          {/* Phone Input */}
          <View style={styles.form}>
            <Input
              label="Phone Number"
              placeholder="+233XXXXXXXXX"
              value={phone}
              onChangeText={handlePhoneChange}
              error={phoneError}
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
              maxLength={13}
              disabled={isLoading}
              left={<Text style={styles.countryCode}>🇬🇭</Text>}
            />

            <Text style={styles.helperText}>
              We'll send you a verification code via SMS
            </Text>
          </View>

          {/* Submit Button */}
          <Button
            title={isLoading ? 'Sending...' : 'Send OTP'}
            onPress={handleRequestOTP}
            loading={isLoading}
            disabled={isLoading || !phone}
            fullWidth
            style={styles.button}
          />

          {/* Terms and Privacy */}
          <Text style={styles.termsText}>
            By continuing, you agree to our{' '}
            <Text style={styles.link}>Terms of Service</Text> and{' '}
            <Text style={styles.link}>Privacy Policy</Text>
          </Text>
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
  },
  form: {
    marginBottom: spacing.xl,
  },
  countryCode: {
    fontSize: 24,
    marginLeft: spacing.sm,
  },
  helperText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  button: {
    marginBottom: spacing.lg,
  },
  termsText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  link: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});
