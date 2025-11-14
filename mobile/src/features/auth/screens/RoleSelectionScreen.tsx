/**
 * Role Selection Screen
 *
 * Allows users to choose between Customer and Provider roles.
 * Displays descriptive content for each role with visual cards.
 *
 * Requirements: 1.9, 1.10
 * - Build role selection UI with Customer and Provider options
 * - Add descriptive content for each role
 * - Implement role selection navigation logic
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { Text } from '../../../shared/components/Text';
import { Button } from '../../../shared/components/Button';
import { spacing } from '../../../core/theme/spacing';
import { borderRadius } from '../../../core/theme/borderRadius';
import type { AuthStackParamList } from '../../../core/navigation/types';

type RoleSelectionScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'RoleSelection'
>;

type Role = 'customer' | 'provider';

interface RoleCardProps {
  role: Role;
  title: string;
  description: string;
  icon: string;
  features: string[];
  isSelected: boolean;
  onSelect: () => void;
}

const RoleCard: React.FC<RoleCardProps> = ({
  role,
  title,
  description,
  icon,
  features,
  isSelected,
  onSelect,
}) => {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onSelect}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={`Select ${title} role`}
        accessibilityHint={description}
        accessibilityState={{ selected: isSelected }}
      >
        <View
          style={[
            styles.roleCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: isSelected ? theme.colors.primary : theme.colors.border,
              borderWidth: isSelected ? 2 : 1,
            },
          ]}
        >
          {/* Selection Indicator */}
          {isSelected && (
            <View
              style={[
                styles.selectedBadge,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Text variant="caption" color="textOnPrimary">
                ✓
              </Text>
            </View>
          )}

          {/* Icon */}
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: isSelected
                  ? theme.colors.primaryLight
                  : theme.colors.backgroundSecondary,
              },
            ]}
          >
            <Text variant="h1" style={styles.icon}>
              {icon}
            </Text>
          </View>

          {/* Title and Description */}
          <Text variant="h4" color="text" style={styles.roleTitle}>
            {title}
          </Text>
          <Text variant="body" color="textSecondary" style={styles.roleDescription}>
            {description}
          </Text>

          {/* Features List */}
          <View style={styles.featuresList}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Text variant="body" color="primary" style={styles.featureBullet}>
                  •
                </Text>
                <Text variant="bodySmall" color="textSecondary" style={styles.featureText}>
                  {feature}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const RoleSelectionScreen: React.FC = () => {
  const navigation = useNavigation<RoleSelectionScreenNavigationProp>();
  const { theme } = useTheme();

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const handleContinue = () => {
    if (!selectedRole) return;

    if (selectedRole === 'customer') {
      navigation.navigate('ProfileSetup', { role: 'customer' });
    } else {
      navigation.navigate('ProviderOnboarding');
    }
  };

  const roles = [
    {
      role: 'customer' as Role,
      title: 'Customer',
      description: 'Find and book trusted service providers',
      icon: '👤',
      features: [
        'Browse verified service providers',
        'Book services instantly',
        'Track your bookings in real-time',
        'Rate and review providers',
        'Secure payment options',
      ],
    },
    {
      role: 'provider' as Role,
      title: 'Service Provider',
      description: 'Offer your services and grow your business',
      icon: '💼',
      features: [
        'Create your business profile',
        'Receive booking requests',
        'Manage your schedule',
        'Track your earnings',
        'Build your reputation',
      ],
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text variant="h2" color="text" style={styles.title}>
          Choose Your Role
        </Text>
        <Text variant="body" color="textSecondary" style={styles.subtitle}>
          Select how you want to use HandyGH
        </Text>
      </View>

      {/* Role Cards */}
      <View style={styles.rolesContainer}>
        {roles.map(role => (
          <RoleCard
            key={role.role}
            role={role.role}
            title={role.title}
            description={role.description}
            icon={role.icon}
            features={role.features}
            isSelected={selectedRole === role.role}
            onSelect={() => setSelectedRole(role.role)}
          />
        ))}
      </View>

      {/* Continue Button */}
      <View style={styles.buttonContainer}>
        <Button
          variant="primary"
          size="large"
          fullWidth
          onPress={handleContinue}
          disabled={!selectedRole}
          accessibilityLabel="Continue with selected role"
          accessibilityHint={`Continue as ${selectedRole || 'selected role'}`}
        >
          Continue
        </Button>
      </View>

      {/* Help Text */}
      <View style={styles.helpSection}>
        <Text variant="caption" color="textTertiary" align="center">
          You can switch roles later in your account settings
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  title: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  rolesContainer: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  roleCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    alignSelf: 'center',
  },
  icon: {
    fontSize: 40,
  },
  roleTitle: {
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  roleDescription: {
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  featuresList: {
    gap: spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  featureBullet: {
    marginTop: 2,
  },
  featureText: {
    flex: 1,
  },
  buttonContainer: {
    marginBottom: spacing.lg,
  },
  helpSection: {
    marginTop: 'auto',
    paddingTop: spacing.lg,
  },
});

export default RoleSelectionScreen;
