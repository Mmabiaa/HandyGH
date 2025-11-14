/**
 * Welcome Screen
 *
 * First screen in the authentication flow.
 * Displays value proposition and call-to-action buttons.
 *
 * Requirements: 1.2
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const WelcomeScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to HandyGH</Text>
      <Text style={styles.description}>
        Find trusted service providers in Ghana
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
});

export default WelcomeScreen;
