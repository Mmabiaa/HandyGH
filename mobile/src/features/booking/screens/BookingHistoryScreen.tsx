/**
 * Booking History Screen
 *
 * Displays past bookings with pagination, filtering, and search
 *
 * Requirements: 5.12
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Pressable,
  Platform,
  TextInput as RNTextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useBookings } from '../../../core/query/hooks/useBookings';
import { Booking, BookingStatus } from '../../../core/api/types';
import { BookingCard } from '../components/BookingCard';

type NavigationProp = NativeStackNavigationProp<any>;

type DateFilter = 'all' | 'last_week' | 'last_month' | 'last_3_months' | 'last_year';

const BookingHistoryScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [page, setPage] = useState(1);

  // Fetch bookings
  const { data: allBookings = [], isLoading, refetch, isRefetching } = useBookings();

  // Filter completed and cancelled bookings
  const historyBookings = useMemo(() => {
    return allBookings.filter(
      (booking) =>
        booking.status === BookingStatus.COMPLETED ||
        booking.status === BookingStatus.CANCELLED
    );
  }, [allBookings]);

  // Apply date filter
  const dateFilteredBookings = useMemo(() => {
    if (dateFilter === 'all') {
      return historyBookings;
    }

    const now = new Date();
    const filterDate = new Date();

    switch (dateFilter) {
      case 'last_week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'last_month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'last_3_months':
        filterDate.setMonth(now.getMonth() - 3);
        break;
      case 'last_year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return historyBookings.filter((booking) => {
      const bookingDate = new Date(booking.scheduledDate);
      return bookingDate >= filterDate;
    });
  }, [historyBookings, dateFilter]);

  // Apply search filter
  const filteredBookings = useMemo(() => {
    if (!searchQuery.trim()) {
      return dateFilteredBookings;
    }

    const query = searchQuery.toLowerCase();
    return dateFilteredBookings.filter(
      (booking) =>
        booking.service?.name.toLowerCase().includes(query) ||
        booking.provider?.businessName.toLowerCase().includes(query) ||
        booking.location.address.toLowerCase().includes(query)
    );
  }, [dateFilteredBookings, searchQuery]);

  // Sort by date (most recent first)
  const sortedBookings = useMemo(() => {
    return [...filteredBookings].sort((a, b) => {
      const dateA = new Date(a.scheduledDate).getTime();
      const dateB = new Date(b.scheduledDate).getTime();
      return dateB - dateA;
    });
  }, [filteredBookings]);

  // Pagination
  const itemsPerPage = 10;
  const paginatedBookings = useMemo(() => {
    return sortedBookings.slice(0, page * itemsPerPage);
  }, [sortedBookings, page]);

  const hasMore = paginatedBookings.length < sortedBookings.length;

  // Handle booking press
  const handleBookingPress = useCallback(
    (bookingId: string) => {
      navigation.navigate('BookingDetails', { bookingId });
    },
    [navigation]
  );

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (hasMore && !isRefetching) {
      setPage((prev) => prev + 1);
    }
  }, [hasMore, isRefetching]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setPage(1);
    refetch();
  }, [refetch]);

  // Get variant for booking card
  const getBookingVariant = (booking: Booking): 'active' | 'upcoming' | 'completed' => {
    return booking.status === BookingStatus.COMPLETED ? 'completed' : 'upcoming';
  };

  // Render date filter button
  const renderDateFilterButton = (filter: DateFilter, label: string) => {
    const isSelected = dateFilter === filter;

    return (
      <Pressable
        key={filter}
        onPress={() => {
          setDateFilter(filter);
          setPage(1);
        }}
        style={({ pressed }) => [
          styles.filterChip,
          isSelected && styles.filterChipSelected,
          pressed && styles.filterChipPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Filter by ${label}`}
        accessibilityState={{ selected: isSelected }}
      >
        <Text
          style={[
            styles.filterChipText,
            isSelected && styles.filterChipTextSelected,
          ]}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📜</Text>
      <Text style={styles.emptyStateTitle}>No booking history</Text>
      <Text style={styles.emptyStateDescription}>
        {searchQuery
          ? 'No bookings match your search'
          : 'Your completed and cancelled bookings will appear here'}
      </Text>
    </View>
  );

  // Render footer
  const renderFooter = () => {
    if (!hasMore) {
      return paginatedBookings.length > 0 ? (
        <View style={styles.footer}>
          <Text style={styles.footerText}>No more bookings</Text>
        </View>
      ) : null;
    }

    return (
      <View style={styles.footer}>
        <Pressable
          onPress={handleLoadMore}
          style={({ pressed }) => [
            styles.loadMoreButton,
            pressed && styles.loadMoreButtonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Load more bookings"
        >
          <Text style={styles.loadMoreText}>Load More</Text>
        </Pressable>
      </View>
    );
  };

  // Render loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D32F2F" />
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Booking History</Text>
        <Text style={styles.subtitle}>
          {historyBookings.length} {historyBookings.length === 1 ? 'booking' : 'bookings'}
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <RNTextInput
            style={styles.searchInput}
            placeholder="Search by service, provider, or location..."
            placeholderTextColor="#9E9E9E"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            accessibilityLabel="Search bookings"
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <Text style={styles.clearIcon}>✕</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Date Filter Chips */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[
            { filter: 'all' as DateFilter, label: 'All Time' },
            { filter: 'last_week' as DateFilter, label: 'Last Week' },
            { filter: 'last_month' as DateFilter, label: 'Last Month' },
            { filter: 'last_3_months' as DateFilter, label: 'Last 3 Months' },
            { filter: 'last_year' as DateFilter, label: 'Last Year' },
          ]}
          renderItem={({ item }) => renderDateFilterButton(item.filter, item.label)}
          keyExtractor={(item) => item.filter}
          contentContainerStyle={styles.filterContent}
        />
      </View>

      {/* Results Count */}
      {(searchQuery || dateFilter !== 'all') && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsText}>
            {filteredBookings.length} {filteredBookings.length === 1 ? 'result' : 'results'} found
          </Text>
        </View>
      )}

      {/* Bookings List */}
      <FlatList
        data={paginatedBookings}
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            onPress={() => handleBookingPress(item.id)}
            variant={getBookingVariant(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        onRefresh={handleRefresh}
        refreshing={isRefetching}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />
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
  searchContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#212121',
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  clearIcon: {
    fontSize: 16,
    color: '#9E9E9E',
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
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  filterChipSelected: {
    backgroundColor: '#D32F2F',
  },
  filterChipPressed: {
    opacity: 0.7,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
  },
  resultsContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  resultsText: {
    fontSize: 13,
    color: '#757575',
  },
  listContent: {
    padding: 20,
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
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#9E9E9E',
  },
  loadMoreButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
  },
  loadMoreButtonPressed: {
    opacity: 0.7,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D32F2F',
  },
});

export default BookingHistoryScreen;
