/**
 * Profile Screen (Customer)
 *
 * Displays customer profile information with editing functionality,
 * profile photo upload, and account statistics.
 *
 * Requirements: 1.11
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { useAuthStore } from '../../../core/store/authStore';
import { useUserProfileStore } from '../../../core/store/userProfileStore';
import { Text, Button, TextInput, Card } from '../../../shared/components';
import { spacing } from '../../../core/theme/spacing';

const ProfileScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { user, updateUser } = useAuthStore();
  const { customerProfile } = useUserProfileStore();

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSaving, setIsSaving] = useState(false);

  // Handle profile photo upload
  const handlePhotoUpload = async () => {
    // TODO: Implement photo upload with react-native-image-picker
    Alert.alert('Coming Soon', 'Photo upload feature will be available soon');
  };

  // Handle save profile
  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Validate inputs
      if (!firstName.trim() || !lastName.trim()) {
        Alert.alert('Error', 'First name and last name are required');
        return;
      }

      // TODO: Call API to update profile
      // For now, just update local state
      updateUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || undefined,
      });

      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel editing
  const handleCancel = () => {
    setFirstName(user?.firstName || '');
    setLastName(user?.lastName || '');
    setEmail(user?.email || '');
    setIsEditing(false);
  };

  // Navigate to settings
  const handleNavigateToSettings = () => {
    navigation.navigate('Settings' as never);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Profile Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handlePhotoUpload}
          style={styles.photoContainer}
          accessibilityLabel="Change profile photo"
          accessibilityRole="button"
        >
          {user?.profilePhoto ? (
            <Image
              source={{ uri: user.profilePhoto }}
              style={styles.profilePhoto}
            />
          ) : (
            <View
              style={[
                styles.profilePhotoPlaceholder,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Text variant="h2" color="textOnPrimary">
                {user?.firstName?.[0]?.toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          <View
            style={[
              styles.editPhotoButton,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <Text variant="caption" color="textOnPrimary">
              📷
            </Text>
          </View>
        </TouchableOpacity>

        {!isEditing && (
          <Text variant="h2" style={styles.name}>
            {user?.firstName} {user?.lastName}
          </Text>
        )}

        {user?.email && !isEditing && (
          <Text variant="body" color="textSecondary" style={styles.email}>
            {user.email}
          </Text>
        )}

        <Text variant="caption" color="textSecondary" style={styles.phone}>
          {user?.phoneNumber}
        </Text>
      </View>

      {/* Account Statistics */}
      {!isEditing && (
        <Card style={styles.statsCard}>
          <Text variant="h3" style={styles.sectionTitle}>
            Account Statistics
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text variant="h2" color="primary">
                {customerProfile?.favoriteProviders?.length || 0}
              </Text>
              <Text variant="caption" color="textSecondary">
                Favorites
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="h2" color="primary">
                0
              </Text>
              <Text variant="caption" color="textSecondary">
                Bookings
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="h2" color="primary">
                0
              </Text>
              <Text variant="caption" color="textSecondary">
                Reviews
              </Text>
            </View>
          </View>
        </Card>
      )}

      {/* Profile Information */}
      <Card style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <Text variant="h3" style={styles.sectionTitle}>
            Profile Information
          </Text>
          {!isEditing && (
            <TouchableOpacity
              onPress={() => setIsEditing(true)}
              accessibilityLabel="Edit profile"
              accessibilityRole="button"
            >
              <Text variant="body" color="primary">
                Edit
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {isEditing ? (
          <View style={styles.form}>
            <TextInput
              label="First Name"
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter your first name"
              required
              accessibilityLabel="First name input"
            />

            <TextInput
              label="Last Name"
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter your last name"
              required
              containerStyle={styles.inputSpacing}
              accessibilityLabel="Last name input"
            />

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              containerStyle={styles.inputSpacing}
              accessibilityLabel="Email input"
            />

            <View style={styles.buttonRow}>
              <Button
                variant="outline"
                onPress={handleCancel}
                style={styles.cancelButton}
                accessibilityLabel="Cancel editing"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onPress={handleSave}
                loading={isSaving}
                style={styles.saveButton}
                accessibilityLabel="Save profile changes"
              >
                Save
              </Button>
            </View>
          </View>
        ) : (
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Text variant="label" color="textSecondary">
                First Name
              </Text>
              <Text variant="body">{user?.firstName || 'Not set'}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text variant="label" color="textSecondary">
                Last Name
              </Text>
              <Text variant="body">{user?.lastName || 'Not set'}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text variant="label" color="textSecondary">
                Email
              </Text>
              <Text variant="body">{user?.email || 'Not set'}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text variant="label" color="textSecondary">
                Phone Number
              </Text>
              <Text variant="body">{user?.phoneNumber}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text variant="label" color="textSecondary">
                Member Since
              </Text>
              <Text variant="body">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : 'Unknown'}
              </Text>
            </View>
          </View>
        )}
      </Card>

      {/* Settings Button */}
      {!isEditing && (
        <Button
          variant="outline"
          onPress={handleNavigateToSettings}
          style={styles.settingsButton}
          accessibilityLabel="Open settings"
        >
          Settings
        </Button>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profilePhotoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  name: {
    marginBottom: spacing.xs,
  },
  email: {
    marginBottom: spacing.xs,
  },
  phone: {
    marginBottom: 0,
  },
  statsCard: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  infoCard: {
    marginBottom: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  form: {
    gap: spacing.md,
  },
  inputSpacing: {
    marginTop: spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  infoList: {
    gap: spacing.md,
  },
  infoItem: {
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  settingsButton: {
    marginBottom: spacing.xl,
  },
});

export default ProfileScreen;
