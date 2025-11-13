import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, typography } from '@/constants/theme';

export const BookingDetailsScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Booking Details</Text>
        <Text style={styles.description}>View booking details and customer info</Text>
        <Text style={styles.status}>🚧 Under Development</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: 12,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  status: {
    ...typography.h3,
    color: colors.warning,
    textAlign: 'center',
    marginTop: 40,
  },
});
