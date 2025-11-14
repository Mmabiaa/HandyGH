/**
 * Booking List Screen
 *
 * Displays list of bookings grouped by status.
 *
 * Requirements: 5.1, 5.2, 5.3
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Pressable,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useBookings } from '../../../core/query/hooks/useBookings';
import { Booking, BookingStatus } from '../../../core/api/types';
import BookingCard from '../components/BookingCard';

type NavigationProp = NativeStackNavigationProp<any>;

type StatusFilter = 'all' | 'active' | 'upcoming' | 'completed';

const BookingListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedFilter, setSelectedFilter] = useState<StatusFilter>('all');

  // Fetch bookings
  const { data: bookings = [], isLoading, refetch, isRefetching } = useBookings();

  // Group bookings by status
  const groupedBookings = useMemo(() => {
    const active: Booking[] = [];
    const upcoming: Booking[] = [];
    const completed: Booking[] = [];

    bookings.forEach((booking) => {
      if (
        booking.status === BookingStatus.ON_THE_WAY ||
        booking.status === BookingStatus.ARRIVED ||
        booking.status === BookingStatus.IN_PROGRESS
      ) {
        active.push(booking);
      } else if (
        booking.status === BookingStatus.PENDING ||
        booking.status === BookingStatus.CONFIRMED
      ) {
        upcoming.push(booking);
      } else if (booking.status === BookingStatus.COMPLETED) {
        completed.push(booking);
      }
    });

    return { active, upcoming, completed };
  }, [bookings]);

  // Filter bookings based on selected filter
  const filteredBookings = useMemo(() => {
    switch (selectedFilter) {
      case 'active':
        return groupedBookings.active;
      case 'upcoming':
        return groupedBookings.upcoming;
      case 'completed':
        return groupedBookings.completed;
      default:
        return bookings;
    }
  }, [selectedFilter, groupedBookings, bookings]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Handle booking card press
  const handleBookingPress = useCallback(
    (bookingId: string) => {
      navigation.navigate('BookingDetails', { bookingId });
    },
    [navigation]
  );

  // Get variant for booking card
  const getBookingVariant = (booking: Booking): 'active' | 'upcoming' | 'completed' => {
    if (
      booking.status === BookingStatus.ON_THE_WAY ||
      booking.status === BookingStatus.ARRIVED ||
      booking.status === BookingStatus.IN_PROGRESS
    ) {
      return 'active';
    } else if (booking.status === BookingStatus.COMPLETED) {
      return 'completed';
    }
    return 'upcoming';
  };

  // Render filter button
  const renderFilterButton = (
    filter: StatusFilter,
    label: string,
    count: number
  ) => {
    const isSelected = selectedFilter === filter;

    return (
      <Pressable
        key={filter}
        onPress={() => setSelectedFilter(filter)}
        style={({ pressed }) => [
          styles.filterButton,
          isSelected && styles.filterButtonActive,
          pressed && styles.filterButtonPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Filter by ${label}`}
        accessibilityState={{ selected: isSelected }}
      >
        <Text
          style={[
            styles.filterButtonText,
            isSelected && styles.filterButtonTextActive,
          ]}
        >
          {label}
        </Text>
        {count > 0 && (
          <View
            style={[
              styles.filterBadge,
              isSelected && styles.filterBadgeActive,
            ]}
          >
            <Text
              style={[
                styles.filterBadgeText,
                isSelected && styles.filterBadgeTextActive,
              ]}
            >
              {count}
            </Text>
          </View>
        )}
      </Pressable>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📅</Text>
      <Text style={styles.emptyStateTitle}>No bookings yet</Text>
      <Text style={styles.emptyStateDescription}>
        {selectedFilter === 'all'
          ? 'Your service appointments will appear here'
          : `No ${selectedFilter} bookings found`}
      </Text>
    </View>
  );

  // Render loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D32F2F" />
        <Text style={styles.loadingText}>Loading bookings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
        <Text style={styles.subtitle}>
          {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}
        </Text>
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {renderFilterButton('all', 'All', bookings.length)}
        {renderFilterButton('active', 'Active', groupedBookings.active.length)}
        {renderFilterButton('upcoming', 'Upcoming', groupedBookings.upcoming.length)}
        {renderFilterButton('completed', 'Completed', groupedBookings.completed.length)}
      </ScrollView>

      {/* Bookings List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor="#D32F2F"
            colors={['#D32F2F']}
          />
        }
      >
        {filteredBookings.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.bookingsList}>
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onPress={() => handleBookingPress(booking.id)}
                variant={getBookingVariant(booking)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#757575',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#D32F2F',
  },
  filterButtonPressed: {
    opacity: 0.7,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  filterBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#E0E0E0',
    minWidth: 20,
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#424242',
  },
  filterBadgeTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  bookingsList: {
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default BookingListScreen;
