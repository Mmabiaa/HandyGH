/**
 * Script to generate booking flow modal screens
 */

const fs = require('fs');
const path = require('path');

const screenTemplate = (screenName, title, description) => `import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, typography } from '@/constants/theme';
import { Button } from '@/components/common/Button';

export const ${screenName} = ({ navigation, route }: any) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>${title}</Text>
        <Text style={styles.description}>${description}</Text>
        <Text style={styles.status}>🚧 Under Development</Text>

        <View style={styles.actions}>
          <Button
            title="Go Back"
            onPress={() => navigation.goBack()}
            variant="outline"
          />
        </View>
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
    marginBottom: 40,
  },
  actions: {
    marginTop: 20,
  },
});
`;

const bookingFlowScreens = [
  { name: 'BookingCreateScreen', title: 'Create Booking', desc: 'Start a new booking with this provider' },
  { name: 'DateTimeSelectionScreen', title: 'Select Date & Time', desc: 'Choose when you want the service' },
  { name: 'LocationSelectionScreen', title: 'Select Location', desc: 'Where should the service be provided?' },
  { name: 'ServiceCustomizationScreen', title: 'Customize Service', desc: 'Add special requests or customizations' },
  { name: 'BookingSummaryScreen', title: 'Booking Summary', desc: 'Review your booking details' },
  { name: 'PaymentMethodScreen', title: 'Payment Method', desc: 'Choose how you want to pay' },
  { name: 'MobileMoneyPaymentScreen', title: 'Mobile Money', desc: 'Pay with Mobile Money' },
  { name: 'ManualPaymentScreen', title: 'Manual Payment', desc: 'Pay manually and upload proof' },
  { name: 'BookingConfirmationScreen', title: 'Booking Confirmed', desc: 'Your booking has been confirmed!' },
  { name: 'ServiceExecutionScreen', title: 'Service in Progress', desc: 'Track your service execution' },
  { name: 'ServiceHistoryScreen', title: 'Service History', desc: 'View all your completed services' },
  { name: 'SupportScreen', title: 'Support', desc: 'Get help with your booking' },
];

const createScreens = () => {
  const baseDir = path.join(__dirname, '..', 'src', 'screens', 'booking');

  // Create directory if it doesn't exist
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  bookingFlowScreens.forEach(({ name, title, desc }) => {
    const filePath = path.join(baseDir, `${name}.tsx`);

    if (!fs.existsSync(filePath)) {
      const content = screenTemplate(name, title, desc);
      fs.writeFileSync(filePath, content);
      console.log(`✅ Created: booking/${name}.tsx`);
    } else {
      console.log(`⏭️  Skipped: booking/${name}.tsx (already exists)`);
    }
  });

  console.log('\n🎉 Booking flow screens generation complete!');
};

createScreens();
