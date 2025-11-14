/**
 * Payment History Screen
 *
 * Displays transaction list with pagination, search, and filter functionality.
 *
 * Requirements: 10.6
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Text } from '../../../shared/components/Text';
import { TextInput } from '../../../shared/components/TextInput';
import { Button } from '../../../shared/components/Button';
import { spacing } from '../../../core/theme/spacing';
import { useTransactions } from '../hooks/useEarnings';
import { TransactionCard } from '../components/TransactionCard';
import { Transaction } from '../../../core/api/services/EarningsService';

type TransactionStatus = 'all' | 'completed' | 'pending' | 'failed';

const STATUS_OPTIONS: { value: TransactionStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
];

interface PaymentHistoryScreenProps {
  navigation: any;
}

const PaymentHistoryScreen: React.FC<PaymentHistoryScreenProps> = ({ navigation }) => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<TransactionStatus>('all');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const statusFilter = selectedStatus === 'all' ? undefined : selectedStatus;

  const { data, isLoading, refetch, isRefetching } = useTransactions(
    page,
    20,
    debouncedSearch,
    statusFilter
  );

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page on search
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleRefresh = useCallback(() => {
    setPage(1);
    refetch();
  }, [refetch]);

  const handleLoadMore = useCallback(() => {
    if (data && typeof data === 'object' && 'next' in data && data.next) {
      setPage((prev) => prev + 1);
    }
  }, [data]);

  const handleTransactionPress = useCallback(
    (transaction: Transaction) => {
      navigation.navigate('TransactionDetails', { transactionId: transaction.id });
    },
    [navigation]
  );

  const handleStatusFilter = useCallback((status: TransactionStatus) => {
    setSelectedStatus(status);
    setPage(1);
  }, []);

  const renderTransaction = useCallback(
    ({ item }: { item: Transaction }) => (
      <TransactionCard
        transaction={item}
        onPress={() => handleTransactionPress(item)}
      />
    ),
    [handleTransactionPress]
  );

  const renderEmpty = () => {
    if (isLoading) {
      return null;
    }

    return (
      <View style={styles.emptyContainer}>
        <Text variant="body" color="textSecondary">
          {searchQuery || selectedStatus !== 'all'
            ? 'No transactions found'
            : 'No payment history yet'}
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!data || typeof data !== 'object' || !('next' in data) || !data.next) {
      return null;
    }

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="h4" style={styles.title}>
          Payment History
        </Text>
        <Text variant="body" color="textSecondary">
          View all your transactions
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          label=""
          placeholder="Search by customer or service..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessibilityLabel="Search transactions"
        />
      </View>

      {/* Status Filter */}
      <View style={styles.filterContainer}>
        <View style={styles.filterButtons}>
          {STATUS_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={selectedStatus === option.value ? 'primary' : 'outline'}
              size="small"
              onPress={() => handleStatusFilter(option.value)}
              accessibilityLabel={`Filter by ${option.label}`}
            >
              {option.label}
            </Button>
          ))}
        </View>
      </View>

      {/* Transaction List */}
      <FlatList
        data={data && typeof data === 'object' && 'results' in data ? (data.results as Transaction[]) : []}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    marginBottom: spacing.xs,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  filterContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  emptyContainer: {
    paddingVertical: spacing.xl * 2,
    alignItems: 'center',
  },
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});

export default PaymentHistoryScreen;
