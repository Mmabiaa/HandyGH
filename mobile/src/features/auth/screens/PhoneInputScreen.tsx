/**
 * Phone Input Screen
 *
 * Allows users to enter their phone number for OTP verification.
 * Includes Ghana phone number validation and country code picker.
 *
 * Requirements: 1.3, 1.4, 17.2
 * - Create phone input field with Ghana format validation
 * - Add country code picker with Ghana default
 * - Implement real-time validation with error messages
 * - Add "Send Code" button with loading state
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { Text } from '../../../shared/components/Text';
import { TextInput } from '../../../shared/components/TextInput';
import { Button } from '../../../shared/components/Button';
import { spacing } from '../../../core/theme/spacing';
import {
  validateGhanaPhoneNumber,
  formatGhanaPhoneNumber,
} from '../../../shared/utils/validation';
import type { AuthStackParamList } from '../../../core/navigation/types';

type PhoneInputScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'PhoneInput'
>;

const PhoneInputScreen: React.FC = () => {
  const navigation = useNavigation<PhoneInputScreenNavigationProp>();
  const { theme } = useTheme();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countryCode] = useState('+233'); // Ghana default

  // Real-time validation
  useEffect(() => {
    if (phoneNumber.length > 0) {
      const fullNumber = phoneNumber.startsWith('+') || phoneNumber.startsWith('0')
        ? phoneNumber
        : `${countryCode}${phoneNumber}`;

      if (!validateGhanaPhoneNumber(fullNumber)) {
        setError('Please enter a valid Ghana phone number');
      } else {
        setError('');
      }
    } else {
      setError('');
    }
  }, [phoneNumber, countryCode]);

  const handlePhoneNumberChange = (text: string) => {
    // Remove non-numeric characters except + at the start
    const cleaned = text.replace(/[^\d+]/g, '');
    setPhoneNumber(cleaned);
  };

  const handleSendCode = async () => {
    // Validate phone number
    const fullNumber = phoneNumber.startsWith('+') || phoneNumber.startsWith('0')
      ? phoneNumber
      : `${countryCode}${phoneNumber}`;

    if (!validateGhanaPhoneNumber(fullNumber)) {
      setError('Please enter a valid Ghana phone number');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Format phone number to international format
      const formattedNumber = formatGhanaPhoneNumber(fullNumber);

      // TODO: Call API to request OTP
      // await authService.requestOTP(formattedNumber);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Navigate to OTP verification screen
      navigation.navigate('OTPVerification', {
        phoneNumber: formattedNumber,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = phoneNumber.length > 0 && !error;

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
            Enter Your Phone Number
          </Text>
          <Text variant="body" color="textSecondary" style={styles.description}>
            We'll send you a verification code to confirm your number
          </Text>
        </View>

        {/* Phone Input Section */}
        <View style={styles.inputSection}>
          {/* Country Code Display */}
          <View style={styles.countryCodeContainer}>
            <View
              style={[
                styles.countryCodeBadge,
                { backgroundColor: theme.colors.primaryLight },
              ]}
            >
              <Text variant="h4">🇬🇭</Text>
            </View>
            <View style={styles.countryCodeInfo}>
              <Text variant="labelLarge" color="text">
                Ghana
              </Text>
              <Text variant="caption" color="textSecondary">
                {countryCode}
              </Text>
            </View>
          </View>

          {/* Phone Number Input */}
          <TextInput
            label="Phone Number"
            placeholder="24 123 4567"
            value={phoneNumber}
            onChangeText={handlePhoneNumberChange}
            keyboardType="phone-pad"
            autoComplete="tel"
            textContentType="telephoneNumber"
            error={error}
            helperText="Enter your 10-digit phone number"
            leftIcon={
              <Text variant="body" color="textSecondary">
                {countryCode}
              </Text>
            }
            accessibilityLabel="Phone number input"
            accessibilityHint="Enter your Ghana phone number to receive a verification code"
            maxLength={15}
            autoFocus
          />

          {/* Format Examples */}
          <View style={styles.examplesContainer}>
            <Text variant="caption" color="textTertiary" style={styles.examplesTitle}>
              Accepted formats:
            </Text>
            <Text variant="caption" color="textTertiary">
              • 024 123 4567
            </Text>
            <Text variant="caption" color="textTertiary">
              • +233 24 123 4567
            </Text>
            <Text variant="caption" color="textTertiary">
              • 233241234567
            </Text>
          </View>
        </View>

        {/* Send Code Button */}
        <View style={styles.buttonContainer}>
          <Button
            variant="primary"
            size="large"
            fullWidth
            onPress={handleSendCode}
            loading={isLoading}
            disabled={!isValid || isLoading}
            accessibilityLabel="Send verification code"
            accessibilityHint="Sends a verification code to your phone number"
          >
            Send Code
          </Button>
        </View>

        {/* Privacy Notice */}
        <View style={styles.privacyNotice}>
          <Text variant="caption" color="textTertiary" align="center">
            By continuing, you agree to our Terms of Service and Privacy Policy.
            Standard SMS rates may apply.
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
  },
  title: {
    marginBottom: spacing.sm,
  },
  description: {
    lineHeight: 24,
  },
  inputSection: {
    marginBottom: spacing.xl,
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  countryCodeBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  countryCodeInfo: {
    flex: 1,
  },
  examplesContainer: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  examplesTitle: {
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  buttonContainer: {
    marginBottom: spacing.lg,
  },
  privacyNotice: {
    marginTop: 'auto',
    paddingTop: spacing.lg,
  },
});

export default PhoneInputScreen;
