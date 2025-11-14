/**
 * Provider Onboarding Screen
 *
 * Allows providers to set up their business profile.
 * Includes business information, photos, categories, and service area.
 *
 * Requirements: 1.11, 1.12
 * - Create business profile form with name, description, categories
 * - Add cover photo and profile photo upload
 * - Implement service area selection
 * - Navigate to ProviderDashboardScreen on completion
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { Text } from '../../../shared/components/Text';
import { TextInput } from '../../../shared/components/TextInput';
import { Button } from '../../../shared/components/Button';
import { spacing } from '../../../core/theme/spacing';
import { borderRadius } from '../../../core/theme/borderRadius';
import { validateRequired, validateMinLength } from '../../../shared/utils/validation';
import type { AuthStackParamList } from '../../../core/navigation/types';

type ProviderOnboardingScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'ProviderOnboarding'
>;

interface FormData {
  businessName: string;
  description: string;
  categories: string[];
  serviceArea: string;
  coverPhoto?: string;
  profilePhoto?: string;
}

interface FormErrors {
  businessName?: string;
  description?: string;
  categories?: string;
  serviceArea?: string;
}

const AVAILABLE_CATEGORIES = [
  { id: '1', name: 'Plumbing', icon: '🔧' },
  { id: '2', name: 'Electrical', icon: '⚡' },
  { id: '3', name: 'Cleaning', icon: '🧹' },
  { id: '4', name: 'Painting', icon: '🎨' },
  { id: '5', name: 'Gardening', icon: '🪴' },
  { id: '6', name: 'Carpentry', icon: '🔨' },
  { id: '7', name: 'AC Repair', icon: '❄️' },
  { id: '8', name: 'Auto Care', icon: '🚗' },
];

const ProviderOnboardingScreen: React.FC = () => {
  const navigation = useNavigation<ProviderOnboardingScreenNavigationProp>();
  const { theme } = useTheme();

  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    description: '',
    categories: [],
    serviceArea: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!validateRequired(formData.businessName)) {
      newErrors.businessName = 'Business name is required';
    }

    if (!validateRequired(formData.description)) {
      newErrors.description = 'Business description is required';
    } else if (!validateMinLength(formData.description, 20)) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    if (formData.categories.length === 0) {
      newErrors.categories = 'Please select at least one service category';
    }

    if (!validateRequired(formData.serviceArea)) {
      newErrors.serviceArea = 'Service area is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error for this field
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle category selection
  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => {
      const categories = prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId];

      return { ...prev, categories };
    });

    // Clear category error
    if (errors.categories) {
      setErrors(prev => ({ ...prev, categories: undefined }));
    }
  };

  // Handle photo upload
  const handlePhotoUpload = (type: 'cover' | 'profile') => {
    // TODO: Implement image picker
    // For now, just set a placeholder
    const photoUrl = 'https://via.placeholder.com/400x200';
    setFormData(prev => ({
      ...prev,
      [type === 'cover' ? 'coverPhoto' : 'profilePhoto']: photoUrl,
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Call API to create provider profile
      // await authService.createProviderProfile(formData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Navigate to main app (Provider Dashboard)
      // Reset navigation stack to prevent going back to auth flow
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'Main' as any,
            params: { screen: 'ProviderTabs', params: { screen: 'Dashboard' } },
          },
        ],
      });
    } catch (err: any) {
      // Handle error
      console.error('Provider onboarding error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="h2" color="text" style={styles.title}>
            Set Up Your Business
          </Text>
          <Text variant="body" color="textSecondary" style={styles.subtitle}>
            Create your professional profile to start receiving bookings
          </Text>
        </View>

        {/* Cover Photo */}
        <View style={styles.photoSection}>
          <Text variant="labelLarge" color="text" style={styles.sectionLabel}>
            Cover Photo
          </Text>
          <TouchableOpacity
            onPress={() => handlePhotoUpload('cover')}
            style={[
              styles.coverPhotoContainer,
              { backgroundColor: theme.colors.backgroundSecondary },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Upload cover photo"
          >
            {formData.coverPhoto ? (
              <Image
                source={{ uri: formData.coverPhoto }}
                style={styles.coverPhoto}
              />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text variant="h2" style={styles.photoIcon}>
                  🖼️
                </Text>
                <Text variant="body" color="textSecondary">
                  Add Cover Photo
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Profile Photo */}
        <View style={styles.profilePhotoSection}>
          <Text variant="labelLarge" color="text" style={styles.sectionLabel}>
            Profile Photo
          </Text>
          <TouchableOpacity
            onPress={() => handlePhotoUpload('profile')}
            style={[
              styles.profilePhotoContainer,
              { backgroundColor: theme.colors.backgroundSecondary },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Upload profile photo"
          >
            {formData.profilePhoto ? (
              <Image
                source={{ uri: formData.profilePhoto }}
                style={styles.profilePhoto}
              />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text variant="h1" style={styles.photoIcon}>
                  📷
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          <TextInput
            label="Business Name"
            placeholder="e.g., John's Plumbing Services"
            value={formData.businessName}
            onChangeText={text => handleInputChange('businessName', text)}
            error={errors.businessName}
            required
            accessibilityLabel="Business name input"
            autoCapitalize="words"
          />

          <TextInput
            label="Business Description"
            placeholder="Tell customers about your services and experience"
            value={formData.description}
            onChangeText={text => handleInputChange('description', text)}
            error={errors.description}
            helperText={`${formData.description.length}/200 characters (min 20)`}
            required
            multiline
            numberOfLines={4}
            maxLength={200}
            accessibilityLabel="Business description input"
            containerStyle={styles.inputSpacing}
            style={styles.textArea}
          />

          {/* Service Categories */}
          <View style={styles.categoriesSection}>
            <Text variant="labelLarge" color="text" style={styles.sectionLabel}>
              Service Categories *
            </Text>
            <Text variant="caption" color="textSecondary" style={styles.sectionHint}>
              Select all services you provide
            </Text>

            <View style={styles.categoriesGrid}>
              {AVAILABLE_CATEGORIES.map(category => {
                const isSelected = formData.categories.includes(category.id);
                return (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => handleCategoryToggle(category.id)}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: isSelected
                          ? theme.colors.primaryLight
                          : theme.colors.backgroundSecondary,
                        borderColor: isSelected
                          ? theme.colors.primary
                          : theme.colors.border,
                      },
                    ]}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected }}
                    accessibilityLabel={`${category.name} category`}
                  >
                    <Text variant="body" style={styles.categoryIcon}>
                      {category.icon}
                    </Text>
                    <Text
                      variant="bodySmall"
                      color={isSelected ? 'primary' : 'text'}
                      style={styles.categoryName}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {errors.categories && (
              <Text variant="caption" color="error" style={styles.errorText}>
                {errors.categories}
              </Text>
            )}
          </View>

          <TextInput
            label="Service Area"
            placeholder="e.g., Accra, East Legon, Tema"
            value={formData.serviceArea}
            onChangeText={text => handleInputChange('serviceArea', text)}
            error={errors.serviceArea}
            helperText="Enter the areas where you provide services"
            required
            accessibilityLabel="Service area input"
            containerStyle={styles.inputSpacing}
          />
        </View>

        {/* Submit Button */}
        <View style={styles.buttonContainer}>
          <Button
            variant="primary"
            size="large"
            fullWidth
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
            accessibilityLabel="Complete business setup"
            accessibilityHint="Saves your business profile and continues to the dashboard"
          >
            Complete Setup
          </Button>
        </View>

        {/* Info Text */}
        <View style={styles.infoSection}>
          <Text variant="caption" color="textTertiary" align="center">
            You can update your profile and add more details later from your dashboard
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  },
  title: {
    marginBottom: spacing.sm,
  },
  subtitle: {
    lineHeight: 24,
  },
  photoSection: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    marginBottom: spacing.sm,
  },
  sectionHint: {
    marginBottom: spacing.sm,
  },
  coverPhotoContainer: {
    width: '100%',
    height: 160,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  coverPhoto: {
    width: '100%',
    height: '100%',
  },
  profilePhotoSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  profilePhotoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
  },
  profilePhoto: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoIcon: {
    marginBottom: spacing.xs,
  },
  formSection: {
    marginBottom: spacing.xl,
  },
  inputSpacing: {
    marginTop: spacing.md,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
  },
  categoriesSection: {
    marginTop: spacing.lg,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    gap: spacing.xs,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryName: {
    fontSize: 14,
  },
  errorText: {
    marginTop: spacing.xs,
  },
  buttonContainer: {
    marginBottom: spacing.lg,
  },
  infoSection: {
    paddingTop: spacing.md,
  },
});

export default ProviderOnboardingScreen;
