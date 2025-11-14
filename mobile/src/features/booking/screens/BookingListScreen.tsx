/**
 * Booking List Screen
 *
 * Displays list of bookings grouped by status.
 *
 * Requirements: 5.1, 5.2, 5.3
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const BookingListScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bookings</Text>
      <Text style={styles.description}>
        Your service appointments
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

export default BookingListScreen;
