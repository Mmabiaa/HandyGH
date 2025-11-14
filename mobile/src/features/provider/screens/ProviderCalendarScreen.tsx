/**
 * Provider Calendar Screen
 *
 * Displays booking schedule in calendar view
 * Requirements: 9.10
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '../../../shared/components/Text';
import { Button } from '../../../shared/components/Button';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { spacing } from '../../../core/theme/spacing';
import { useQuery } from '@tanstack/react-query';
import { BookingService } from '../../../core/api/services/BookingService';
import { queryKeys } from '../../../core/query/queryKeys';
import { CalendarView } from '../components/CalendarView';
import { BookingCalendarCard } from '../components/BookingCalendarCard';
import { formatDate } from '../../../shared/utils/formatting';
import type { ProviderStackParamList } from '../../../core/navigation/types';
import type { BookingStatus } from '../../../core/api/types';

type NavigationProp = NativeStackNavigationProp<
  ProviderStackParamList,
  'Calendar'
>;

// Status colors for calendar markers
const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: '#FFA726',
  confirmed: '#42A5F5',
  on_the_way: '#AB47BC',
  arrived: '#7E57C2',
  in_progress: '#26A69A',
  completed: '#66BB6A',
  cancelled: '#EF5350',
};

/**
 * Provider Calendar Screen
 * Requirement 9.10: Build calendar view with all bookings
 */
const ProviderCalendarScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Fetch all bookings
  // Requirement 9.10: Display all bookings in calendar view
  const { data: bookings, isLoading, error } = useQuery({
    queryKey: queryKeys.bookings.list(),
    queryFn: () => BookingService.getBookings(),
  });

  // Filter bookings for selected date
  const selectedDateBookings = useMemo(() => {
    if (!bookings) return [];

    const selectedDateStr = selectedDate.toISOString().split('T')[0];

    return bookings
      .filter((booking) => {
        const bookingDateStr = booking.scheduledDate;
        return bookingDateStr === selectedDateStr;
      })
      .sort((a, b) => {
        // Sort by time
        return a.scheduledTime.localeCompare(b.scheduledTime);
      });
  }, [bookings, selectedDate]);

  // Create marked dates for calendar
  // Requirement 9.10: Add color-coded status indicators
  const markedDates = useMemo(() => {
    if (!bookings) return {};

    const marked: Record<string, { count: number; color: string }> = {};

    bookings.forEach((booking) => {
      const dateKey = booking.scheduledDate;

      if (!marked[dateKey]) {
        marked[dateKey] = {
          count: 1,
          color: STATUS_COLORS[booking.status],
        };
      } else {
        marked[dateKey].count += 1;
        // Use the most important status color (pending > confirmed > others)
        if (booking.status === 'pending') {
          marked[dateKey].color = STATUS_COLORS.pending;
        } else if (
          booking.status === 'confirmed' &&
          marked[dateKey].color !== STATUS_COLORS.pending
        ) {
          marked[dateKey].color = STATUS_COLORS.confirmed;
        }
      }
    });

    return marked;
  }, [bookings]);

  // Handle date selection
  // Requirement 9.10: Implement date navigation
  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  // Navigate to booking details
  // Requirement 9.10: Display booking details on tap
  const handleBookingPress = useCallback(
    (bookingId: string) => {
      // @ts-ignore - Navigation types will be properly defined
      navigation.navigate('BookingDetails', { bookingId });
    },
    [navigation]
  );

  // Navigate to previous month
  const handlePreviousMonth = useCallback(() => {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  }, []);

  // Navigate to next month
  const handleNextMonth = useCallback(() => {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  }, []);

  // Navigate to today
  const handleToday = useCallback(() => {
    setSelectedDate(new Date());
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text variant="body" color="textSecondary" style={styles.loadingText}>
          Loading calendar...
        </Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text variant="h6" style={styles.errorTitle}>
          Unable to load calendar
        </Text>
        <Text variant="body" color="textSecondary" style={styles.errorMessage}>
          Please check your connection and try again
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Month Navigation */}
        <View style={styles.monthNavigation}>
          <Pressable
            onPress={handlePreviousMonth}
            style={styles.navButton}
            accessibilityRole="button"
            accessibilityLabel="Previous month"
          >
            <Text variant="h6" style={{ color: theme.colors.primary }}>
              ‹
            </Text>
          </Pressable>

          <Button variant="outline" size="small" onPress={handleToday}>
            Today
          </Button>

          <Pressable
            onPress={handleNextMonth}
            style={styles.navButton}
            accessibilityRole="button"
            accessibilityLabel="Next month"
          >
            <Text variant="h6" style={{ color: theme.colors.primary }}>
              ›
            </Text>
          </Pressable>
        </View>

        {/* Calendar */}
        <CalendarView
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          markedDates={markedDates}
        />

        {/* Legend */}
        <View style={styles.legend}>
          <Text variant="label" style={styles.legendTitle}>
            Status Legend:
          </Text>
          <View style={styles.legendItems}>
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <View key={status} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: color }]} />
                <Text variant="caption" color="textSecondary">
                  {status.replace('_', ' ')}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Selected Date Bookings */}
        <View style={styles.bookingsSection}>
          <Text variant="h6" style={styles.sectionTitle}>
            {formatDate(selectedDate.toISOString())}
          </Text>

          {selectedDateBookings.length === 0 ? (
            <View style={styles.emptyState}>
              <Text variant="body" color="textSecondary">
                No bookings for this date
              </Text>
            </View>
          ) : (
            <View style={styles.bookingsList}>
              {selectedDateBookings.map((booking) => (
                <BookingCalendarCard
                  key={booking.id}
                  booking={booking}
                  onPress={() => handleBookingPress(booking.id)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  content: {
    padding: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.md,
  },
  errorTitle: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorMessage: {
    textAlign: 'center',
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  navButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legend: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  legendTitle: {
    marginBottom: spacing.sm,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bookingsSection: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  bookingsList: {
    gap: spacing.sm,
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
});

export default ProviderCalendarScreen;
