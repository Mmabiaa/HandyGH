/**
 * Service List Item Component
 *
 * Displays a service with pricing, duration, and expandable description.
 * Used in provider detail screen.
 *
 * Requirements: 3.3
 */

import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { Text } from '../../../shared/components';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { spacing } from '../../../core/theme/spacing';
import { borderRadius } from '../../../core/theme/borderRadius';
import type { Service } from '../../../core/api/types';

interface ServiceListItemProps {
  service: Service;
  onSelect?: () => void;
  selected?: boolean;
  expandable?: boolean;
}

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

/**
 * Service List Item Component
 */
export const ServiceListItem: React.FC<ServiceListItemProps> = ({
  service,
  onSelect,
  selected = false,
  expandable = true,
}) => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
    }

    if (expandable) {
      setIsExpanded(!isExpanded);
    }

    if (onSelect) {
      onSelect();
    }
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: selected
            ? theme.colors.primary + '10'
            : theme.colors.cardBackground,
          borderColor: selected ? theme.colors.primary : theme.colors.neutral[200],
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${service.name}, ${service.price} GHS, ${formatDuration(service.duration)}`}
      accessibilityHint={expandable ? 'Tap to expand description' : undefined}
      accessibilityState={{ selected, expanded: isExpanded }}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text variant="labelLarge" numberOfLines={1}>
            {service.name}
          </Text>
          <View style={styles.metadata}>
            <Text variant="caption" color="textSecondary">
              ⏱️ {formatDuration(service.duration)}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <Text variant="h6" color="primary">
            GHS {service.price.toFixed(2)}
          </Text>
          {expandable && (
            <Text variant="caption" color="textSecondary">
              {isExpanded ? '▲' : '▼'}
            </Text>
          )}
        </View>
      </View>

      {/* Expanded Description */}
      {isExpanded && expandable && (
        <View style={styles.expandedContent}>
          <Text variant="body" color="textSecondary">
            {service.description}
          </Text>

          {/* Add-ons */}
          {service.addOns && service.addOns.length > 0 && (
            <View style={styles.addOnsContainer}>
              <Text variant="caption" style={styles.addOnsTitle}>
                Available Add-ons:
              </Text>
              {service.addOns.map((addOn) => (
                <View key={addOn.id} style={styles.addOnItem}>
                  <Text variant="caption" color="textSecondary">
                    • {addOn.name}
                  </Text>
                  <Text variant="caption" color="primary">
                    +GHS {addOn.price.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Selected Indicator */}
      {selected && (
        <View style={[styles.selectedIndicator, { backgroundColor: theme.colors.primary }]}>
          <Text variant="caption" color="textOnPrimary">
            ✓
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    marginRight: spacing.md,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  expandedContent: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  addOnsContainer: {
    marginTop: spacing.md,
  },
  addOnsTitle: {
    marginBottom: spacing.xs,
  },
  addOnItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  selectedIndicator: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
