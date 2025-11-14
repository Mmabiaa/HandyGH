/**
 * Profile Setup Screen
 *
 * Allows customers to complete their profile setup.
 *
 * Requirements: 1.11, 1.12
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ProfileSetupScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complete Your Profile</Text>
      <Text style={styles.description}>
        Tell us a bit about yourself
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

export default ProfileSetupScreen;
