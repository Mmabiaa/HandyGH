import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, typography } from '@/constants/theme';
import { format } from 'date-fns';

type BookingStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

interface BookingCardProps {
  id: string;
  providerName: string;
  providerAvatar?: string;
  serviceName: string;
  date: Date;
  time: string;
  status: BookingStatus;
  price: number;
  location: string;
  onPress: () => void;
}

const statusConfig: Record<BookingStatus, { label: string; color: string; icon: string }> = {
  PENDING: { label: 'Pending', color: colors.warning, icon: 'clock-outline' },
  CONFIRMED: { label: 'Confirmed', color: colors.success, icon: 'check-circle' },
  IN_PROGRESS: { label: 'In Progress', color: colors.info, icon: 'progress-clock' },
  COMPLETED: { label: 'Completed', color: colors.success, icon: 'check-all' },
  CANCELLED: { label: 'Cancelled', color: colors.error, icon: 'close-circle' },
};

export const BookingCard: React.FC<BookingCardProps> = ({
  providerName,
  providerAvatar,
  serviceName,
  date,
  time,
  status,
  price,
  location,
  onPress,
}) => {
  const statusInfo = statusConfig[status];

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.providerInfo}>
          {providerAvatar ? (
            <Image source={{ uri: providerAvatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Icon name="account" size={24} color={colors.textSecondary} />
            </View>
          )}
          <View style={styles.providerDetails}>
            <Text style={styles.providerName} numberOfLines={1}>{providerName}</Text>
            <Text style={styles.serviceName} numberOfLines={1}>{serviceName}</Text>
          </View>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}20` }]}>
          <Icon name={statusInfo.icon} size={14} color={statusInfo.color} />
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.label}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Icon name="calendar" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>
            {format(date, 'MMM dd, yyyy')} at {time}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="map-marker" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText} numberOfLines={1}>{location}</Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="cash" size={16} color={colors.textSecondary} />
          <Text style={styles.priceText}>GH₵{price.toFixed(2)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  providerInfo: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  providerName: {
    ...typography.h4,
    color: colors.text,
    marginBottom: 2,
  },
  serviceName: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 12,
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    ...typography.body1,
    color: colors.textSecondary,
    flex: 1,
  },
  priceText: {
    ...typography.body1,
    color: colors.primary,
    fontWeight: '600',
  },
});
