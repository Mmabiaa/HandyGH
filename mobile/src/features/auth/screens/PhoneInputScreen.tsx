/**
 * Phone Input Screen
 *
 * Allows users to enter their phone number for OTP verification.
 *
 * Requirements: 1.3, 1.4
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PhoneInputScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Your Phone Number</Text>
      <Text style={styles.description}>
        We'll send you a verification code
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

export default PhoneInputScreen;
