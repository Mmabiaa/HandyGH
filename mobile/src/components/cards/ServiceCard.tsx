import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, typography } from '@/constants/theme';

interface ServiceCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  duration?: string;
  image?: string;
  rating?: number;
  reviewCount?: number;
  onPress: () => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  name,
  description,
  price,
  duration,
  image,
  rating,
  reviewCount,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      {image && (
        <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
      )}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <Text style={styles.description} numberOfLines={2}>{description}</Text>

        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>GH₵{price.toFixed(2)}</Text>
            {duration && <Text style={styles.duration}> • {duration}</Text>}
          </View>

          {rating && (
            <View style={styles.ratingContainer}>
              <Icon name="star" size={14} color={colors.warning} />
              <Text style={styles.rating}>{rating.toFixed(1)}</Text>
              {reviewCount && (
                <Text style={styles.reviewCount}>({reviewCount})</Text>
              )}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 120,
    backgroundColor: colors.border,
  },
  content: {
    padding: 12,
  },
  name: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 4,
  },
  description: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    ...typography.h3,
    color: colors.primary,
  },
  duration: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  ratingContainer: {
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
});
