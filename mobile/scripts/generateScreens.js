/**
 * Script to generate placeholder screens for HandyGH mobile app
 * Run with: node mobile/scripts/generateScreens.js
 */

const fs = require('fs');
const path = require('path');

// Screen template
const screenTemplate = (screenName, title, description) => `import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, typography } from '@/constants/theme';

export const ${screenName} = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>${title}</Text>
        <Text style={styles.description}>${description}</Text>
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
`;

// Screen definitions
const screens = {
  customer: [
    { name: 'ServiceCategoriesScreen', title: 'Service Categories', desc: 'Browse all available service categories' },
    { name: 'ProviderListScreen', title: 'Service Providers', desc: 'List of providers matching your search' },
    { name: 'ProviderDetailScreen', title: 'Provider Details', desc: 'Detailed provider profile and services' },
    { name: 'SearchScreen', title: 'Search', desc: 'Search for services and providers' },
    { name: 'MapViewScreen', title: 'Map View', desc: 'Find providers near you on the map' },
    { name: 'FilterScreen', title: 'Filters', desc: 'Filter and sort search results' },
    { name: 'ServiceSelectionScreen', title: 'Select Service', desc: 'Choose specific services from provider' },
    { name: 'ProviderReviewsScreen', title: 'Reviews', desc: 'All reviews for this provider' },
    { name: 'ProviderGalleryScreen', title: 'Gallery', desc: 'Provider portfolio and previous work' },
    { name: 'BookingDetailsScreen', title: 'Booking Details', desc: 'View complete booking information' },
    { name: 'BookingStatusScreen', title: 'Booking Status', desc: 'Track your booking status in real-time' },
    { name: 'BookingChatScreen', title: 'Chat', desc: 'Chat with your service provider' },
    { name: 'RescheduleScreen', title: 'Reschedule', desc: 'Change your booking date and time' },
    { name: 'CancelBookingScreen', title: 'Cancel Booking', desc: 'Cancel your booking' },
    { name: 'ReviewSubmissionScreen', title: 'Write Review', desc: 'Rate and review your service experience' },
    { name: 'PaymentReceiptScreen', title: 'Payment Receipt', desc: 'View and download payment receipt' },
    { name: 'InvoiceScreen', title: 'Invoice', desc: 'View detailed invoice' },
    { name: 'BookingHistoryScreen', title: 'Booking History', desc: 'All your past bookings' },
    { name: 'FavoritesScreen', title: 'Favorites', desc: 'Your saved providers and services' },
    { name: 'PaymentMethodsScreen', title: 'Payment Methods', desc: 'Manage your payment methods' },
    { name: 'AddressBookScreen', title: 'Address Book', desc: 'Manage your saved addresses' },
  ],
  provider: [
    { name: 'BookingRequestsScreen', title: 'Booking Requests', desc: 'New booking requests from customers' },
    { name: 'BookingDetailsScreen', title: 'Booking Details', desc: 'View booking details and customer info' },
    { name: 'EarningsScreen', title: 'Earnings', desc: 'Track your revenue and payouts' },
    { name: 'PerformanceAnalyticsScreen', title: 'Performance', desc: 'View your performance metrics' },
    { name: 'StatusUpdateScreen', title: 'Update Status', desc: 'Update booking status' },
    { name: 'PaymentRequestScreen', title: 'Request Payment', desc: 'Request payment from customer' },
    { name: 'ProviderCalendarScreen', title: 'Calendar', desc: 'View and manage your bookings' },
    { name: 'AvailabilityManagementScreen', title: 'Manage Availability', desc: 'Set your working hours' },
    { name: 'AvailabilitySetupScreen', title: 'Setup Availability', desc: 'Configure your availability' },
    { name: 'ServiceListScreen', title: 'My Services', desc: 'Manage your service offerings' },
    { name: 'ServiceManagementScreen', title: 'Manage Service', desc: 'Edit service details and pricing' },
    { name: 'ServiceCatalogSetupScreen', title: 'Service Catalog', desc: 'Setup your service catalog' },
    { name: 'PricingManagementScreen', title: 'Pricing', desc: 'Manage service pricing' },
    { name: 'PortfolioScreen', title: 'Portfolio', desc: 'Manage your work gallery' },
    { name: 'ProviderProfileSetupScreen', title: 'Business Profile', desc: 'Setup your business profile' },
    { name: 'ReviewsManagementScreen', title: 'Reviews', desc: 'View and respond to reviews' },
    { name: 'DocumentsScreen', title: 'Documents', desc: 'Manage certificates and licenses' },
    { name: 'BankingScreen', title: 'Banking', desc: 'Manage payout methods' },
    { name: 'TeamManagementScreen', title: 'Team', desc: 'Manage your team members' },
    { name: 'ExpenseTrackingScreen', title: 'Expenses', desc: 'Track business expenses' },
    { name: 'TaxScreen', title: 'Tax Reports', desc: 'View tax reports and documents' },
    { name: 'ProviderSupportScreen', title: 'Support', desc: 'Get help and support' },
    { name: 'VerificationScreen', title: 'Verification', desc: 'Account verification status' },
  ],
  shared: [
    { name: 'ChatListScreen', title: 'Messages', desc: 'All your conversations' },
    { name: 'ChatScreen', title: 'Chat', desc: 'Chat with users' },
    { name: 'ProfileEditScreen', title: 'Edit Profile', desc: 'Update your profile information' },
    { name: 'SettingsScreen', title: 'Settings', desc: 'App settings and preferences' },
    { name: 'NotificationsScreen', title: 'Notifications', desc: 'Manage notification preferences' },
    { name: 'SecurityScreen', title: 'Security', desc: 'Security and privacy settings' },
    { name: 'LanguageScreen', title: 'Language', desc: 'Choose your preferred language' },
    { name: 'HelpSupportScreen', title: 'Help & Support', desc: 'Get help and contact support' },
    { name: 'AboutScreen', title: 'About', desc: 'About HandyGH' },
  ],
};

// Create directories and files
const createScreens = () => {
  const baseDir = path.join(__dirname, '..', 'src', 'screens');

  Object.entries(screens).forEach(([category, screenList]) => {
    const categoryDir = path.join(baseDir, category);

    // Create category directory if it doesn't exist
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }

    screenList.forEach(({ name, title, desc }) => {
      const filePath = path.join(categoryDir, `${name}.tsx`);

      // Only create if file doesn't exist
      if (!fs.existsSync(filePath)) {
        const content = screenTemplate(name, title, desc);
        fs.writeFileSync(filePath, content);
        console.log(`✅ Created: ${category}/${name}.tsx`);
      } else {
        console.log(`⏭️  Skipped: ${category}/${name}.tsx (already exists)`);
      }
    });
  });

  console.log('\n🎉 Screen generation complete!');
};

// Run the script
createScreens();
