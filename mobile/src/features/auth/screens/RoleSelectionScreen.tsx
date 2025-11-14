/**
 * Role Selection Screen
 *
 * Allows users to choose between Customer and Provider roles.
 *
 * Requirements: 1.9, 1.10
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const RoleSelectionScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Role</Text>
      <Text style={styles.description}>
        Are you looking for services or providing them?
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
});

export default RoleSelectionScreen;
