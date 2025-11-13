import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, typography } from '@/constants/theme';

interface ProviderCardProps {
  id: string;
  name: string;
  businessName?: string;
  avatar?: string;
  rating: number;
  reviewCount: number;
  services: string[];
  distance?: string;
  isVerified?: boolean;
  isAvailable?: boolean;
  onPress: () => void;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({
  name,
  businessName,
  avatar,
  rating,
  reviewCount,
  services,
  distance,
  isVerified,
  isAvailable,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Icon name="account" size={32} color={colors.textSecondary} />
            </View>
          )}
          {isAvailable && <View style={styles.availableBadge} />}
        </View>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{name}</Text>
            {isVerified && (
              <Icon name="check-decagram" size={16} color={colors.success} />
            )}
          </View>
          {businessName && (
            <Text style={styles.businessName} numberOfLines={1}>{businessName}</Text>
          )}

          <View style={styles.ratingRow}>
            <Icon name="star" size={14} color={colors.warning} />
            <Text style={styles.rating}>{rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({reviewCount})</Text>
            {distance && (
              <>
                <Text style={styles.separator}>•</Text>
                <Icon name="map-marker" size={14} color={colors.textSecondary} />
                <Text style={styles.distance}>{distance}</Text>
              </>
            )}
          </View>
        </View>
      </View>

      <View style={styles.servicesContainer}>
        {services.slice(0, 3).map((service, index) => (
          <View key={index} style={styles.serviceTag}>
            <Text style={styles.serviceText}>{service}</Text>
          </View>
        ))}
        {services.length > 3 && (
          <View style={styles.serviceTag}>
            <Text style={styles.serviceText}>+{services.length - 3}</Text>
          </View>
        )}
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
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  availableBadge: {
    position: 'absolute',
    bottom: 2,
    right: 14,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  name: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
  },
  businessName: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
  },
  reviewCount: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  separator: {
    ...typography.caption,
    color: colors.textSecondary,
    marginHorizontal: 4,
  },
  distance: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceTag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  serviceText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '500',
  },
});
