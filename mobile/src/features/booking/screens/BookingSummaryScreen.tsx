import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../../core/navigation/types';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ProviderService, BookingService } from '../../../core/api/services';
import { formatCurrency, formatDate, formatTime } from '../../../shared/utils/formatting';
import { CreateBookingRequest, Service } from '../../../core/api/types';

type BookingSummaryScreenNavigationProp = NativeStackNavigationProp<
  CustomerStackParamList,
  'BookingSummary'
>;

type BookingSummaryScreenRouteProp = RouteProp<
  CustomerStackParamList,
  'BookingSummary'
>;

/**
 * BookingSummaryScreen
 *
 * Displays complete booking details recap before confirmation.
 * Shows total cost breakdown, provider information, and terms acceptance.
 *
 * Requirements:
 * - 4.8: Display booking details recap with cost breakdown
 */
export const BookingSummaryScreen: React.FC = () => {
  const navigation = useNavigation<BookingSummaryScreenNavigationProp>();
  const route = useRoute<BookingSummaryScreenRouteProp>();
  const { providerId, serviceId, scheduledDate, scheduledTime } = route.params;

  const [termsAccepted, setTermsAccepted] = useState(false);

  // Fetch provider details
  const {
    data: provider,
    isLoading: isLoadingProvider,
  } = useQuery({
    queryKey: ['provider', providerId],
    queryFn: () => ProviderService.getProviderById(providerId),
  });

  // Fetch service details
  const {
    data: services,
    isLoading: isLoadingServices,
  } = useQuery({
    queryKey: ['provider-services', providerId],
    queryFn: () => ProviderService.getProviderServices(providerId),
  });

  // Get selected service
  const selectedService = useMemo(() => {
    return services?.find((s: Service) => s.id === serviceId);
  }, [services, serviceId]);

  // Mock location data (in real app, fetch from storage/API)
  const location = useMemo(() => ({
    address: 'East Legon',
    city: 'Accra',
    region: 'Greater Accra',
    coordinates: {
      latitude: 5.6037,
      longitude: -0.1870,
    },
  }), []);

  // Calculate pricing
  const pricing = useMemo(() => {
    if (!selectedService) {
      return {
        servicePrice: 0,
        addOnsPrice: 0,
        subtotal: 0,
        tax: 0,
        total: 0,
      };
    }

    const servicePrice = selectedService.price;
    const addOnsPrice = 0; // TODO: Calculate from selected add-ons
    const subtotal = servicePrice + addOnsPrice;
    const tax = 0; // Ghana VAT if applicable
    const total = subtotal + tax;

    return {
      servicePrice,
      addOnsPrice,
      subtotal,
      tax,
      total,
    };
  }, [selectedService]);

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: (data: CreateBookingRequest) => BookingService.createBooking(data),
    onSuccess: (booking) => {
      // Navigate to payment method selection
      navigation.navigate('PaymentMethod', {
        bookingId: booking.id,
      });
    },
    onError: (error: any) => {
      Alert.alert(
        'Booking Failed',
        error.message || 'Failed to create booking. Please try again.',
        [{ text: 'OK' }]
      );
    },
  });

  // Handle booking confirmation
  const handleConfirmBooking = useCallback(() => {
    if (!termsAccepted) {
      Alert.alert(
        'Terms Required',
        'Please accept the terms and conditions to continue',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!selectedService) {
      Alert.alert('Error', 'Service information not available');
      return;
    }

    const bookingData: CreateBookingRequest = {
      providerId,
      serviceId,
      scheduledDate,
      scheduledTime,
      location,
      locationNotes: undefined,
      addOns: [], // TODO: Include selected add-ons
      notes: undefined,
    };

    createBookingMutation.mutate(bookingData);
  }, [
    termsAccepted,
    selectedService,
    providerId,
    serviceId,
    scheduledDate,
    scheduledTime,
    location,
    createBookingMutation,
  ]);

  // Loading state
  if (isLoadingProvider || isLoadingServices) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading booking details...</Text>
      </View>
    );
  }

  // Error state
  if (!provider || !selectedService) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load booking details</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Review Your Booking</Text>
          <Text style={styles.headerSubtitle}>
            Please review the details before confirming
          </Text>
        </View>

        {/* Provider Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Provider</Text>
          <View style={styles.providerCard}>
            <View style={styles.providerInfo}>
              <Text style={styles.providerName}>{provider.businessName}</Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingText}>⭐ {provider.rating.toFixed(1)}</Text>
                <Text style={styles.reviewsText}>({provider.totalReviews} reviews)</Text>
              </View>
            </View>
            {provider.isVerified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ Verified</Text>
              </View>
            )}
          </View>
        </View>

        {/* Service Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service</Text>
          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Service</Text>
              <Text style={styles.detailValue}>{selectedService.name}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>{selectedService.duration} min</Text>
            </View>
            {selectedService.description && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionText}>{selectedService.description}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Date & Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date & Time</Text>
          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{formatDate(scheduledDate)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>{formatTime(scheduledTime)}</Text>
            </View>
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Location</Text>
          <View style={styles.detailCard}>
            <Text style={styles.locationAddress}>{location.address}</Text>
            <Text style={styles.locationCity}>
              {location.city}, {location.region}
            </Text>
          </View>
        </View>

        {/* Price Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Breakdown</Text>
          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Service Fee</Text>
              <Text style={styles.priceValue}>
                {formatCurrency(pricing.servicePrice, 'GHS')}
              </Text>
            </View>
            {pricing.addOnsPrice > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Add-ons</Text>
                <Text style={styles.priceValue}>
                  {formatCurrency(pricing.addOnsPrice, 'GHS')}
                </Text>
              </View>
            )}
            {pricing.tax > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Tax</Text>
                <Text style={styles.priceValue}>
                  {formatCurrency(pricing.tax, 'GHS')}
                </Text>
              </View>
            )}
            <View style={styles.divider} />
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(pricing.total, 'GHS')}
              </Text>
            </View>
          </View>
        </View>

        {/* Terms and Conditions */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.termsContainer}
            onPress={() => setTermsAccepted(!termsAccepted)}
            accessibilityLabel="Accept terms and conditions"
            accessibilityRole="checkbox"
            accessibilityState={{ checked: termsAccepted }}
          >
            <View style={styles.checkbox}>
              {termsAccepted && <View style={styles.checkboxInner} />}
            </View>
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text style={styles.termsLink}>Terms and Conditions</Text> and{' '}
              <Text style={styles.termsLink}>Cancellation Policy</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Important Notes */}
        <View style={styles.notesSection}>
          <Text style={styles.notesTitle}>Important Notes</Text>
          <Text style={styles.notesText}>
            • Payment will be processed after service completion
          </Text>
          <Text style={styles.notesText}>
            • You can cancel up to 24 hours before the scheduled time
          </Text>
          <Text style={styles.notesText}>
            • The provider will contact you to confirm the booking
          </Text>
        </View>
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            (!termsAccepted || createBookingMutation.isPending) && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirmBooking}
          disabled={!termsAccepted || createBookingMutation.isPending}
          accessibilityLabel="Confirm booking"
          accessibilityRole="button"
        >
          {createBookingMutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm Booking</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#666666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  providerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginRight: 4,
  },
  reviewsText: {
    fontSize: 14,
    color: '#666666',
  },
  verifiedBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 15,
    color: '#666666',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  descriptionContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  descriptionText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  locationAddress: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  locationCity: {
    fontSize: 14,
    color: '#666666',
  },
  priceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  priceLabel: {
    fontSize: 15,
    color: '#666666',
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007AFF',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxInner: {
    width: 14,
    height: 14,
    borderRadius: 3,
    backgroundColor: '#007AFF',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  termsLink: {
    color: '#007AFF',
    fontWeight: '600',
  },
  notesSection: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  notesTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 22,
    marginBottom: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  confirmButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  confirmButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF3B30',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
