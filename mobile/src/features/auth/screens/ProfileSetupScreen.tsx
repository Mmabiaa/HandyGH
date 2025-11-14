/**
 * Profile Setup Screen
 *
 * Allows customers to complete their profile setup.
 * Includes form fields for personal information and profile photo upload.
 *
 * Requirements: 1.11, 1.12
 * - Create profile form with first name, last name, email fields
 * - Add profile photo upload functionality
 * - Implement form validation and submission
 * - Navigate to HomeScreen on completion
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
import { validateEmail, validateRequired } from '../../../shared/utils/validation';
import type { AuthStackParamList } from '../../../core/navigation/types';

type ProfileSetupScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'ProfileSetup'
>;

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  profilePhoto?: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
}

const ProfileSetupScreen: React.FC = () => {
  const navigation = useNavigation<ProfileSetupScreenNavigationProp>();
  const { theme } = useTheme();

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!validateRequired(formData.firstName)) {
      newErrors.firstName = 'First name is required';
    }

    if (!validateRequired(formData.lastName)) {
      newErrors.lastName = 'Last name is required';
    }

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
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

  // Handle photo upload
  const handlePhotoUpload = () => {
    // TODO: Implement image picker
    // For now, just set a placeholder
    setFormData(prev => ({
      ...prev,
      profilePhoto: 'https://via.placeholder.com/150',
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Call API to create user profile
      // await authService.createProfile(formData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Navigate to main app (Customer Home)
      // Reset navigation stack to prevent going back to auth flow
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'Main' as any,
            params: { screen: 'CustomerTabs', params: { screen: 'Home' } },
          },
        ],
      });
    } catch (err: any) {
      // Handle error
      console.error('Profile setup error:', err);
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
            Complete Your Profile
          </Text>
          <Text variant="body" color="textSecondary" style={styles.subtitle}>
            Tell us a bit about yourself
          </Text>
        </View>

        {/* Profile Photo */}
        <View style={styles.photoSection}>
          <TouchableOpacity
            onPress={handlePhotoUpload}
            style={[
              styles.photoContainer,
              { backgroundColor: theme.colors.backgroundSecondary },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Upload profile photo"
            accessibilityHint="Tap to select a photo from your device"
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
                <Text variant="caption" color="textSecondary">
                  Add Photo
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <Text variant="caption" color="textTertiary" style={styles.photoHint}>
            Optional - You can add this later
          </Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          <TextInput
            label="First Name"
            placeholder="Enter your first name"
            value={formData.firstName}
            onChangeText={text => handleInputChange('firstName', text)}
            error={errors.firstName}
            required
            autoComplete="name-given"
            textContentType="givenName"
            accessibilityLabel="First name input"
            autoCapitalize="words"
          />

          <TextInput
            label="Last Name"
            placeholder="Enter your last name"
            value={formData.lastName}
            onChangeText={text => handleInputChange('lastName', text)}
            error={errors.lastName}
            required
            autoComplete="name-family"
            textContentType="familyName"
            accessibilityLabel="Last name input"
            autoCapitalize="words"
            containerStyle={styles.inputSpacing}
          />

          <TextInput
            label="Email Address"
            placeholder="your.email@example.com"
            value={formData.email}
            onChangeText={text => handleInputChange('email', text)}
            error={errors.email}
            helperText="Optional - For booking confirmations"
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            accessibilityLabel="Email address input"
            autoCapitalize="none"
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
            accessibilityLabel="Complete profile setup"
            accessibilityHint="Saves your profile and continues to the app"
          >
            Complete Profile
          </Button>
        </View>

        {/* Skip Option */}
        <View style={styles.skipSection}>
          <Button
            variant="ghost"
            size="medium"
            fullWidth
            onPress={handleSubmit}
            disabled={isLoading}
            accessibilityLabel="Skip profile setup"
          >
            Skip for Now
          </Button>
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
    alignItems: 'center',
  },
  title: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: spacing.sm,
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
    fontSize: 40,
    marginBottom: spacing.xs,
  },
  photoHint: {
    textAlign: 'center',
  },
  formSection: {
    marginBottom: spacing.xl,
  },
  inputSpacing: {
    marginTop: spacing.md,
  },
  buttonContainer: {
    marginBottom: spacing.md,
  },
  skipSection: {
    alignItems: 'center',
  },
});

export default ProfileSetupScreen;
