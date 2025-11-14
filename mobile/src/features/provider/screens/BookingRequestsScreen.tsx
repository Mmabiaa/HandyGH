/**
 * Booking Requests Screen
 *
 * Displays pending booking requests for providers
 * Requirements: 8.5, 8.6, 8.11
 */

import React, { useCallback, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '../../../shared/components/Text';
import { Button } from '../../../shared/components/Button';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { spacing } from '../../../core/theme/spacing';
import { usePendingRequests } from '../../../core/query/hooks/useBookingRequests';
import { BookingRequestCard } from '../components/BookingRequestCard';
import { useSocketEvent } from '../../../core/realtime/hooks/useSocket';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../core/query/queryKeys';
import type { ProviderStackParamList } from '../../../core/navigation/types';
import type { Booking } from '../../../core/api/types';

type NavigationProp = NativeStackNavigationProp<
  ProviderStackParamList,
  'BookingRequests'
>;

/**
 * Booking Requests Screen
 * Requirements: 8.5, 8.6, 8.11
 */
const BookingRequestsScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch pending booking requests
  // Requirement 8.6: Retrieve pending booking requests
  const { data: requests, isLoading, error, refetch } = usePendingRequests();

  // Handle real-time new booking request notifications
  // Requirement 8.11: Implement real-time new request notifications
  const handleNewBookingRequest = useCallback(
    () => {
      // Invalidate pending requests to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.pendingRequests(),
      });

      // Optionally show a toast notification
      // Toast.show({ type: 'info', text1: 'New Booking Request', text2: 'You have a new booking request' });
    },
    [queryClient]
  );

  useSocketEvent('booking:request', handleNewBookingRequest, [queryClient]);

  // Handle pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  // Navigate to booking request detail
  const handleRequestPress = useCallback(
    (bookingId: string) => {
      navigation.navigate('BookingRequestDetail', { bookingId });
    },
    [navigation]
  );

  // Render booking request item
  const renderItem = useCallback(
    ({ item }: { item: Booking }) => (
      <BookingRequestCard
        booking={item}
        onPress={() => handleRequestPress(item.id)}
      />
    ),
    [handleRequestPress]
  );

  // Key extractor
  const keyExtractor = useCallback((item: Booking) => item.id, []);

  // Item separator
  const ItemSeparator = useCallback(
    () => <View style={{ height: spacing.md }} />,
    []
  );

  // Loading state
  if (isLoading && !requests) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text variant="body" color="textSecondary" style={styles.loadingText}>
          Loading booking requests...
        </Text>
      </View>
    );
  }

  // Error state
  if (error && !requests) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text variant="h6" style={styles.errorTitle}>
          Unable to load requests
        </Text>
        <Text variant="body" color="textSecondary" style={styles.errorMessage}>
          Please check your connection and try again
        </Text>
        <Button onPress={() => refetch()} style={styles.retryButton}>
          Retry
        </Button>
      </View>
    );
  }

  // Empty state
  if (!requests || requests.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text variant="h6" style={styles.emptyTitle}>
          No Pending Requests
        </Text>
        <Text variant="body" color="textSecondary" style={styles.emptyMessage}>
          New booking requests will appear here
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="h5">Booking Requests</Text>
        <Text variant="body" color="textSecondary">
          {requests.length} {requests.length === 1 ? 'request' : 'requests'} pending
        </Text>
      </View>

      {/* Requests List */}
      <FlatList
        data={requests}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={ItemSeparator}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      />
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
  header: {
    padding: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  listContent: {
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
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  retryButton: {
    minWidth: 120,
  },
  emptyTitle: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyMessage: {
    textAlign: 'center',
  },
});

export default BookingRequestsScreen;
