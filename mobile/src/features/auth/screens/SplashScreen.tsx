/**
 * Splash Screen
 *
 * Initial loading screen displayed when the app launches.
 * Shows HandyGH branding and performs initialization tasks.
 *
 * Requirements: 1.1
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SplashScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>HandyGH</Text>
      <Text style={styles.subtitle}>Connecting You to Quality Services</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
});

export default SplashScreen;
