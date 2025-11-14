/**
 * Provider Detail Screen
 *
 * Displays detailed provider information with parallax header, services, reviews, and action buttons.
 * Implements smooth scrolling with parallax effect on cover photo.
 *
 * Requirements: 3.1, 3.2, 3.9, 11.7
 */

import React, { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { triggerHaptic } from '../../../shared/utils/haptics';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text, Button, AnimatedHeart } from '../../../shared/components';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { spacing } from '../../../core/theme/spacing';
import { borderRadius } from '../../../core/theme/borderRadius';
import { shadows } from '../../../core/theme/shadows';
import { ServiceListItem, ReviewCard, RatingBreakdown } from '../components';
import { useFavoriteToggle } from '../../../core/query/hooks/useFavorites';
import type { Provider, Service, Review } from '../../../core/api/types';

const HEADER_HEIGHT = 300;
const HEADER_MIN_HEIGHT = 100;

type CustomerStackParamList = {
  ProviderDetail: { providerId: string };
  BookingCreate: { providerId: string; serviceId?: string };
  BookingChat: { bookingId: string };
  ProviderReviews: { providerId: string };
};

type ProviderDetailScreenRouteProp = RouteProp<CustomerStackParamList, 'ProviderDetail'>;
type ProviderDetailScreenNavigationProp = NativeStackNavigationProp<CustomerStackParamList>;

// Haptic feedback is now handled by triggerHaptic utility (Expo-compatible)

/**
 * Provider Detail Screen Component
 */
export const ProviderDetailScreen: React.FC = () => {
  const navigation = useNavigation<ProviderDetailScreenNavigationProp>();
  const route = useRoute<ProviderDetailScreenRouteProp>();
  const { theme } = useTheme();
  const { providerId } = route.params;

  // Scroll animation value
  const scrollY = useSharedValue(0);

  // Favorites hook
  const { toggleFavorite, isFavorite: checkIsFavorite } = useFavoriteToggle();
  const isFavorite = checkIsFavorite(providerId);

  // State
  const [showAllServices, setShowAllServices] = useState(false);

  // Mock services data
  const mockServices: Service[] = [
    {
      id: 'service-1',
      providerId,
      name: 'Basic Plumbing Repair',
      description: 'Fix leaks, unclog drains, repair faucets and toilets. Includes basic diagnostics and minor repairs.',
      categoryId: 'plumbing',
      price: 150,
      currency: 'GHS',
      duration: 60,
      images: [],
      isActive: true,
      addOns: [
        { id: 'addon-1', name: 'Emergency Service', price: 50, description: 'Same-day service' },
        { id: 'addon-2', name: 'Parts Replacement', price: 100, description: 'Additional parts if needed' },
      ],
    },
    {
      id: 'service-2',
      providerId,
      name: 'Pipe Installation',
      description: 'Install new pipes for water supply or drainage. Includes material consultation and professional installation.',
      categoryId: 'plumbing',
      price: 300,
      currency: 'GHS',
      duration: 120,
      images: [],
      isActive: true,
    },
    {
      id: 'service-3',
      providerId,
      name: 'Water Heater Service',
      description: 'Installation, repair, and maintenance of water heaters. All brands supported.',
      categoryId: 'plumbing',
      price: 250,
      currency: 'GHS',
      duration: 90,
      images: [],
      isActive: true,
    },
    {
      id: 'service-4',
      providerId,
      name: 'Bathroom Renovation',
      description: 'Complete bathroom plumbing renovation including fixtures, pipes, and drainage systems.',
      categoryId: 'plumbing',
      price: 1500,
      currency: 'GHS',
      duration: 480,
      images: [],
      isActive: true,
    },
  ];

  const displayedServices = showAllServices ? mockServices : mockServices.slice(0, 3);

  // Mock reviews data
  const mockReviews: Review[] = [
    {
      id: 'review-1',
      bookingId: 'booking-1',
      customerId: 'customer-1',
      providerId,
      rating: 5,
      comment: 'Excellent service! Very professional and fixed my plumbing issue quickly. Highly recommend!',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      customer: {
        firstName: 'John',
        lastName: 'Mensah',
        profilePhoto: 'https://via.placeholder.com/100',
      },
      response: 'Thank you for your kind words! We are always happy to help.',
    },
    {
      id: 'review-2',
      bookingId: 'booking-2',
      customerId: 'customer-2',
      providerId,
      rating: 4,
      comment: 'Good work and fair pricing. Arrived on time and completed the job efficiently.',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      customer: {
        firstName: 'Ama',
        lastName: 'Osei',
      },
    },
    {
      id: 'review-3',
      bookingId: 'booking-3',
      customerId: 'customer-3',
      providerId,
      rating: 5,
      comment: 'Best plumber in Accra! Fixed a complex issue that others couldn\'t solve. Very knowledgeable.',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      customer: {
        firstName: 'Kwame',
        lastName: 'Asante',
        profilePhoto: 'https://via.placeholder.com/100',
      },
    },
  ];

  const ratingBreakdown = {
    average: 4.8,
    total: 156,
    distribution: {
      5: 120,
      4: 25,
      3: 8,
      2: 2,
      1: 1,
    },
  };

  // Fetch provider data (mock for now - will be replaced with actual API call)
  const mockProvider: Provider = {
    id: providerId,
    businessName: 'Expert Plumbing Services',
    businessDescription: 'Professional plumbing services with 10+ years of experience. We handle all types of plumbing issues from leaks to installations.',
    profilePhoto: 'https://via.placeholder.com/150',
    coverPhoto: 'https://via.placeholder.com/800x400',
    categories: ['plumbing', 'repairs'],
    rating: 4.8,
    totalReviews: 156,
    totalServices: 342,
    responseRate: 95,
    responseTime: 15,
    isVerified: true,
    serviceArea: {
      type: 'radius',
      center: { latitude: 5.6037, longitude: -0.1870 },
      radius: 10,
    },
    availability: {
      schedule: {
        monday: { isAvailable: true, slots: [] },
        tuesday: { isAvailable: true, slots: [] },
        wednesday: { isAvailable: true, slots: [] },
        thursday: { isAvailable: true, slots: [] },
        friday: { isAvailable: true, slots: [] },
        saturday: { isAvailable: true, slots: [] },
        sunday: { isAvailable: false, slots: [] },
      },
      exceptions: [],
      timezone: 'GMT',
    },
  };

  // Parallax header animation
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT],
      [0, -HEADER_HEIGHT / 2],
      Extrapolate.CLAMP
    );

    const scale = interpolate(
      scrollY.value,
      [-HEADER_HEIGHT, 0],
      [2, 1],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateY }, { scale }],
    };
  });

  // Header opacity animation
  const headerOpacityStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT - HEADER_MIN_HEIGHT],
      [0, 1],
      Extrapolate.CLAMP
    );

    return {
      opacity,
    };
  });

  // Handlers
  const handleScroll = (event: any) => {
    scrollY.value = event.nativeEvent.contentOffset.y;
  };

  const handleBookNow = useCallback(() => {
    triggerHaptic('medium');
    navigation.navigate('BookingCreate', { providerId });
  }, [navigation, providerId]);

  const handleMessage = useCallback(() => {
    triggerHaptic('light');
    // TODO: Navigate to chat screen
    console.log('Message provider');
  }, []);

  const handleFavorite = useCallback(() => {
    triggerHaptic('medium');
    toggleFavorite(providerId);
  }, [toggleFavorite, providerId]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleViewAllServices = useCallback(() => {
    triggerHaptic('light');
    setShowAllServices(!showAllServices);
  }, [showAllServices]);

  const handleServiceSelect = useCallback((serviceId: string) => {
    triggerHaptic('medium');
    navigation.navigate('BookingCreate', { providerId, serviceId });
  }, [navigation, providerId]);

  const handleSeeAllReviews = useCallback(() => {
    triggerHaptic('light');
    navigation.navigate('ProviderReviews', { providerId });
  }, [navigation, providerId]);

  return (
    <View style={styles.container}>
      {/* Parallax Header */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        {mockProvider.coverPhoto ? (
          <Image
            source={{ uri: mockProvider.coverPhoto }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.coverPlaceholder, { backgroundColor: theme.colors.neutral[300] }]} />
        )}

        {/* Gradient Overlay */}
        <View style={styles.gradientOverlay} />
      </Animated.View>

      {/* Fixed Header Bar */}
      <Animated.View
        style={[
          styles.fixedHeader,
          { backgroundColor: theme.colors.background },
          headerOpacityStyle,
        ]}
      >
        <View style={styles.fixedHeaderContent}>
          <TouchableOpacity
            onPress={handleBack}
            style={[styles.headerButton, { backgroundColor: 'rgba(255, 255, 255, 0.9)' }]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text variant="h6">←</Text>
          </TouchableOpacity>

          <Text variant="h6" numberOfLines={1} style={styles.fixedHeaderTitle}>
            {mockProvider.businessName}
          </Text>

          <TouchableOpacity
            onPress={handleFavorite}
            style={[styles.headerButton, { backgroundColor: 'rgba(255, 255, 255, 0.9)' }]}
            accessibilityRole="button"
            accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <AnimatedHeart isFavorite={isFavorite} size={20} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Floating Action Buttons */}
      <View style={styles.floatingButtons}>
        <TouchableOpacity
          onPress={handleBack}
          style={[styles.floatingButton, { backgroundColor: 'rgba(255, 255, 255, 0.9)' }]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text variant="h6">←</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleFavorite}
          style={[styles.floatingButton, { backgroundColor: 'rgba(255, 255, 255, 0.9)' }]}
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <AnimatedHeart isFavorite={isFavorite} size={20} />
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Spacer for header */}
        <View style={{ height: HEADER_HEIGHT - 80 }} />

        {/* Provider Info Card */}
        <View style={[styles.infoCard, { backgroundColor: theme.colors.cardBackground, ...shadows.lg }]}>
          {/* Profile Photo */}
          <View style={styles.profilePhotoContainer}>
            {mockProvider.profilePhoto ? (
              <Image
                source={{ uri: mockProvider.profilePhoto }}
                style={styles.profilePhoto}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.profilePhotoPlaceholder, { backgroundColor: theme.colors.neutral[300] }]}>
                <Text variant="h3" color="textSecondary">
                  {mockProvider.businessName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}

            {/* Verification Badge */}
            {mockProvider.isVerified && (
              <View style={[styles.verificationBadge, { backgroundColor: theme.colors.success }]}>
                <Text variant="caption" color="textOnPrimary" style={styles.badgeText}>
                  ✓
                </Text>
              </View>
            )}
          </View>

          {/* Provider Name and Rating */}
          <Text variant="h4" style={styles.providerName}>
            {mockProvider.businessName}
          </Text>

          <View style={styles.ratingContainer}>
            <Text variant="h6" color="warning">
              ⭐
            </Text>
            <Text variant="h6" style={styles.ratingText}>
              {mockProvider.rating.toFixed(1)}
            </Text>
            <Text variant="body" color="textSecondary">
              ({mockProvider.totalReviews} reviews)
            </Text>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text variant="h6" color="primary">
                {mockProvider.totalServices}
              </Text>
              <Text variant="caption" color="textSecondary">
                Services Completed
              </Text>
            </View>

            <View style={[styles.statDivider, { backgroundColor: theme.colors.neutral[300] }]} />

            <View style={styles.statItem}>
              <Text variant="h6" color="primary">
                {mockProvider.responseRate}%
              </Text>
              <Text variant="caption" color="textSecondary">
                Response Rate
              </Text>
            </View>

            <View style={[styles.statDivider, { backgroundColor: theme.colors.neutral[300] }]} />

            <View style={styles.statItem}>
              <Text variant="h6" color="primary">
                {mockProvider.responseTime}m
              </Text>
              <Text variant="caption" color="textSecondary">
                Response Time
              </Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text variant="labelLarge" style={styles.sectionTitle}>
              About
            </Text>
            <Text variant="body" color="textSecondary">
              {mockProvider.businessDescription}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            variant="primary"
            size="large"
            onPress={handleBookNow}
            style={styles.bookButton}
            accessibilityLabel="Book this provider"
          >
            Book Now
          </Button>

          <Button
            variant="outline"
            size="large"
            onPress={handleMessage}
            style={styles.messageButton}
            accessibilityLabel="Message provider"
          >
            Message
          </Button>
        </View>

        {/* Services Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <Text variant="h6" style={styles.sectionTitle}>
              Services ({mockServices.length})
            </Text>
          </View>

          {displayedServices.map((service) => (
            <ServiceListItem
              key={service.id}
              service={service}
              onSelect={() => handleServiceSelect(service.id)}
              expandable={true}
            />
          ))}

          {mockServices.length > 3 && (
            <TouchableOpacity
              onPress={handleViewAllServices}
              style={styles.viewAllButton}
              accessibilityRole="button"
              accessibilityLabel={showAllServices ? 'Show less services' : 'View all services'}
            >
              <Text variant="labelLarge" color="primary">
                {showAllServices ? 'Show Less' : `View All Services (${mockServices.length})`}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Reviews Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <Text variant="h6" style={styles.sectionTitle}>
              Reviews & Ratings
            </Text>
          </View>

          {/* Rating Breakdown */}
          <RatingBreakdown
            average={ratingBreakdown.average}
            total={ratingBreakdown.total}
            distribution={ratingBreakdown.distribution}
          />

          {/* Recent Reviews */}
          <View style={styles.reviewsContainer}>
            <Text variant="labelLarge" style={styles.reviewsSubtitle}>
              Recent Reviews
            </Text>

            {mockReviews.map((review) => (
              <ReviewCard key={review.id} review={review} showProviderResponse={true} />
            ))}

            {/* See All Reviews Button */}
            <TouchableOpacity
              onPress={handleSeeAllReviews}
              style={styles.viewAllButton}
              accessibilityRole="button"
              accessibilityLabel="See all reviews"
            >
              <Text variant="labelLarge" color="primary">
                See All Reviews ({ratingBreakdown.total})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: spacing.xl }} />
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    zIndex: 1,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_MIN_HEIGHT,
    zIndex: 10,
    ...shadows.md,
  },
  fixedHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: Platform.OS === 'ios' ? 50 : spacing.md,
    paddingBottom: spacing.sm,
  },
  fixedHeaderTitle: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  floatingButtons: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    zIndex: 5,
  },
  floatingButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  infoCard: {
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginTop: -40,
  },
  profilePhotoContainer: {
    alignSelf: 'center',
    marginTop: -60,
    marginBottom: spacing.md,
    position: 'relative',
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    borderWidth: 4,
    borderColor: 'white',
  },
  profilePhotoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    borderWidth: 4,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verificationBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  providerName: {
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  ratingText: {
    marginLeft: spacing.xs,
    marginRight: spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: '100%',
  },
  descriptionContainer: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  bookButton: {
    flex: 2,
  },
  messageButton: {
    flex: 1,
  },
  section: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  reviewsContainer: {
    marginTop: spacing.md,
  },
  reviewsSubtitle: {
    marginBottom: spacing.md,
  },
});
