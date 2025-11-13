import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { AuthStackScreenProps } from '@/navigation/types';
import { colors, spacing, typography } from '@/constants/theme';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/features/auth/hooks/useAuth';

type Props = AuthStackScreenProps<'RoleSelection'>;

type RoleType = 'CUSTOMER' | 'PROVIDER';

interface RoleOption {
  type: RoleType;
  title: string;
  description: string;
  icon: string;
  benefits: string[];
}

const roleOptions: RoleOption[] = [
  {
    type: 'CUSTOMER',
    title: 'I need services',
    description: 'Find and book trusted local service providers',
    icon: '🔍',
    benefits: [
      'Search for service providers',
      'Book services instantly',
      'Track your bookings',
      'Rate and review providers',
      'Secure payments',
    ],
  },
  {
    type: 'PROVIDER',
    title: 'I offer services',
    description: 'Grow your business by connecting with customers',
    icon: '💼',
    benefits: [
      'Create your business profile',
      'Manage your services',
      'Accept booking requests',
      'Build your reputation',
      'Earn money',
    ],
  },
];

export const RoleSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const { updateRole, isUpdatingRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);

  const handleRoleSelect = (role: RoleType) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (!selectedRole) {
      Alert.alert('Select a Role', 'Please select how you want to use HandyGH');
      return;
    }

    // Update role using React Query mutation
    updateRole(selectedRole, {
      onSuccess: () => {
        // Navigation will be handled by AppNavigator based on the updated role
        // The AppNavigator will detect the role change and navigate appropriately
      },
      onError: (error: any) => {
        Alert.alert(
          'Error',
          error?.message || 'Failed to update your role. Please try again.',
          [{ text: 'OK' }]
        );
      },
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Role</Text>
          <Text style={styles.subtitle}>
            How would you like to use HandyGH?
          </Text>
        </View>

        {/* Role Options */}
        <View style={styles.rolesContainer}>
          {roleOptions.map((option) => (
            <TouchableOpacity
              key={option.type}
              style={[
                styles.roleCard,
                selectedRole === option.type && styles.roleCardSelected,
              ]}
              onPress={() => handleRoleSelect(option.type)}
              disabled={isUpdatingRole}
              activeOpacity={0.7}
            >
              {/* Icon */}
              <View style={styles.roleIcon}>
                <Text style={styles.roleIconText}>{option.icon}</Text>
              </View>

              {/* Title and Description */}
              <View style={styles.roleInfo}>
                <Text style={styles.roleTitle}>{option.title}</Text>
                <Text style={styles.roleDescription}>{option.description}</Text>
              </View>

              {/* Benefits */}
              <View style={styles.benefitsContainer}>
                {option.benefits.map((benefit, index) => (
                  <View key={index} style={styles.benefitItem}>
                    <Text style={styles.benefitBullet}>✓</Text>
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>

              {/* Selection Indicator */}
              {selectedRole === option.type && (
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedBadgeText}>Selected</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Continue Button */}
        <Button
          title={isUpdatingRole ? 'Setting up...' : 'Continue'}
          onPress={handleContinue}
          loading={isUpdatingRole}
          disabled={!selectedRole || isUpdatingRole}
          fullWidth
          style={styles.button}
        />

        {/* Info Text */}
        <Text style={styles.infoText}>
          You can switch roles later in your profile settings
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  rolesContainer: {
    marginBottom: spacing.xl,
    gap: spacing.lg,
  },
  roleCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  roleCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '10',
  },
  roleIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  roleIconText: {
    fontSize: 32,
  },
  roleInfo: {
    marginBottom: spacing.md,
  },
  roleTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  roleDescription: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  benefitsContainer: {
    gap: spacing.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  benefitBullet: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
  },
  benefitText: {
    ...typography.body2,
    color: colors.text,
    flex: 1,
  },
  selectedBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  selectedBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  button: {
    marginBottom: spacing.md,
  },
  infoText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
