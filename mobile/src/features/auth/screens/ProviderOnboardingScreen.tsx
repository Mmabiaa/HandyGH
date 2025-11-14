/**
 * Provider Onboarding Screen
 *
 * Allows providers to set up their business profile.
 *
 * Requirements: 1.11, 1.12
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ProviderOnboardingScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set Up Your Business</Text>
      <Text style={styles.description}>
        Create your professional profile
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

export default ProviderOnboardingScreen;
