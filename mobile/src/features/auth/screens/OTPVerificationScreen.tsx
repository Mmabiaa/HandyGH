/**
 * OTP Verification Screen
 *
 * Allows users to enter the OTP code sent to their phone.
 *
 * Requirements: 1.6, 1.7
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const OTPVerificationScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Verification Code</Text>
      <Text style={styles.description}>
        Enter the 6-digit code sent to your phone
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#757575',
  },
});

export default OTPVerificationScreen;
