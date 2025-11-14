/**
 * Banking Screen
 *
 * Displays payout account information, payout schedule, and history.
 * Allows requesting payouts.
 *
 * Requirements: 10.9, 10.10
 */

import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  FlatList,
} from 'react-native';
import { Text } from '../../../shared/components/Text';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { spacing } from '../../../core/theme/spacing';
import { useTheme } from '../../../core/theme/ThemeProvider';
import {
  useBankingInfo,
  usePayoutSchedule,
  usePayouts,
  useAvailableBalance,
  useRequestPayout,
} from '../hooks/usePayouts';
import { formatCurrency, formatDate } from '../../../shared/utils/formatting';
import { Payout } from '../../../core/api/services/PayoutService';

interface BankingScreenProps {
  navigation: any;
}

const BankingScreen: React.FC<BankingScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();

  const { data: bankingInfo, isLoading: bankingLoading, refetch: refetchBanking } = useBankingInfo();
  const { data: schedule } = usePayoutSchedule();
  const { data: payouts, isLoading: payoutsLoading, refetch: refetchPayouts } = usePayouts(1);
  const { data: balance, refetch: refetchBalance } = useAvailableBalance();
  const requestPayoutMutation = useRequestPayout();

  const primaryAccount = bankingInfo?.find((acc) => acc.isPrimary);

  const handleRefresh = useCallback(() => {
    refetchBanking();
    refetchPayouts();
    refetchBalance();
  }, [refetchBanking, refetchPayouts, refetchBalance]);

  const handleRequestPayout = useCallback(() => {
    if (!primaryAccount) {
      Alert.alert('No Bank Account', 'Please add a bank account first.');
      return;
    }

    if (!balance || balance.availableBalance < (schedule?.minimumAmount || 0)) {
      Alert.alert(
        'Insufficient Balance',
        `Minimum payout amount is ${formatCurrency(schedule?.minimumAmount || 0)}`
      );
      return;
    }

    Alert.alert(
      'Request Payout',
      `Request payout of ${formatCurrency(balance.availableBalance)} to ${primaryAccount.bankName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            requestPayoutMutation.mutate(
              {
                amount: balance.availableBalance,
                bankingInfoId: primaryAccount.id,
              },
              {
                onSuccess: () => {
                  Alert.alert('Success', 'Payout request submitted successfully');
                },
                onError: (error: any) => {
                  Alert.alert('Error', error.message || 'Failed to request payout');
                },
              }
            );
          },
        },
      ]
    );
  }, [primaryAccount, balance, schedule, requestPayoutMutation]);

  const handleManageBankAccount = useCallback(() => {
    navigation.navigate('ManageBankAccount');
  }, [navigation]);

  const getPayoutStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return theme.colors.success || '#4CAF50';
      case 'processing':
        return theme.colors.warning || '#FF9800';
      case 'failed':
        return theme.colors.error || '#F44336';
      default:
        return '#757575';
    }
  };

  const renderPayoutItem = useCallback(
    ({ item }: { item: Payout }) => (
      <Card elevation="sm" padding="md" style={styles.payoutCard}>
        <View style={styles.payoutHeader}>
          <View style={styles.payoutInfo}>
            <Text variant="body" style={styles.payoutAmount}>
              {formatCurrency(item.amount)}
            </Text>
            <Text variant="caption" color="textSecondary">
              {formatDate(item.requestedAt, 'short')}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getPayoutStatusColor(item.status) },
            ]}
          >
            <Text variant="caption" style={styles.statusText}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>
        {item.transactionReference && (
          <Text variant="caption" color="textSecondary">
            Ref: {item.transactionReference}
          </Text>
        )}
        {item.failureReason && (
          <Text variant="caption" style={styles.errorText}>
            {item.failureReason}
          </Text>
        )}
      </Card>
    ),
    [theme, getPayoutStatusColor]
  );

  const renderEmpty = () => {
    if (payoutsLoading) {
      return null;
    }

    return (
      <View style={styles.emptyContainer}>
        <Text variant="body" color="textSecondary">
          No payout history yet
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={bankingLoading} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="h4" style={styles.title}>
            Banking & Payouts
          </Text>
          <Text variant="body" color="textSecondary">
            Manage your payout account and request withdrawals
          </Text>
        </View>

        {/* Available Balance */}
        <Card elevation="md" padding="lg" style={styles.balanceCard}>
          <Text variant="caption" color="textSecondary" style={styles.balanceLabel}>
            Available Balance
          </Text>
          <Text variant="h2" style={styles.balanceAmount}>
            {formatCurrency(balance?.availableBalance || 0)}
          </Text>

          <Button
            variant="primary"
            onPress={handleRequestPayout}
            disabled={
              !balance ||
              balance.availableBalance < (schedule?.minimumAmount || 0) ||
              requestPayoutMutation.isPending
            }
            loading={requestPayoutMutation.isPending}
            accessibilityLabel="Request payout"
            style={styles.payoutButton}
          >
            Request Payout
          </Button>

          {schedule && (
            <Text variant="caption" color="textSecondary" style={styles.scheduleInfo}>
              Next scheduled payout: {formatDate(schedule.nextPayoutDate, 'short')} •
              Minimum: {formatCurrency(schedule.minimumAmount)}
            </Text>
          )}
        </Card>

        {/* Bank Account */}
        <Card elevation="sm" padding="lg" style={styles.card}>
          <View style={styles.cardHeader}>
            <Text variant="h6">Bank Account</Text>
            <Button
              variant="outline"
              size="small"
              onPress={handleManageBankAccount}
              accessibilityLabel="Manage bank account"
            >
              {primaryAccount ? 'Manage' : 'Add Account'}
            </Button>
          </View>

          {primaryAccount ? (
            <View style={styles.accountInfo}>
              <View style={styles.accountRow}>
                <Text variant="body" color="textSecondary">
                  Bank
                </Text>
                <Text variant="body" style={styles.accountValue}>
                  {primaryAccount.bankName}
                </Text>
              </View>
              <View style={styles.accountRow}>
                <Text variant="body" color="textSecondary">
                  Account Holder
                </Text>
                <Text variant="body" style={styles.accountValue}>
                  {primaryAccount.accountHolderName}
                </Text>
              </View>
              <View style={styles.accountRow}>
                <Text variant="body" color="textSecondary">
                  Account Number
                </Text>
                <Text variant="body" style={styles.accountValue}>
                  ****{primaryAccount.accountNumber.slice(-4)}
                </Text>
              </View>
              {primaryAccount.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Text variant="caption" style={styles.verifiedText}>
                    ✓ Verified
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.noAccountContainer}>
              <Text variant="body" color="textSecondary">
                No bank account added yet
              </Text>
            </View>
          )}
        </Card>

        {/* Payout History */}
        <View style={styles.historySection}>
          <Text variant="h6" style={styles.sectionTitle}>
            Payout History
          </Text>

          {payouts && typeof payouts === 'object' && 'results' in payouts ? (
            <FlatList
              data={payouts.results as Payout[]}
              renderItem={renderPayoutItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ListEmptyComponent={renderEmpty}
            />
          ) : (
            renderEmpty()
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.xs,
  },
  balanceCard: {
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  balanceLabel: {
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceAmount: {
    fontWeight: 'bold',
    marginBottom: spacing.lg,
  },
  payoutButton: {
    width: '100%',
    marginBottom: spacing.sm,
  },
  scheduleInfo: {
    textAlign: 'center',
  },
  card: {
    marginBottom: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  accountInfo: {
    gap: spacing.sm,
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  accountValue: {
    fontWeight: '600',
  },
  verifiedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#4CAF50',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: spacing.sm,
  },
  verifiedText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  noAccountContainer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  historySection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  payoutCard: {
    marginBottom: spacing.md,
  },
  payoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  payoutInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  payoutAmount: {
    fontWeight: '600',
    fontSize: 16,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  errorText: {
    color: '#F44336',
    marginTop: spacing.xs,
  },
  emptyContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
});

export default BankingScreen;
