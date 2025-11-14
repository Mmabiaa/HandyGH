/**
 * Provider Dashboard Screen
 *
 * Main screen for providers showing business metrics and overview.
 *
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ProviderDashboardScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.description}>
        Your business overview
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

export default ProviderDashboardScreen;
