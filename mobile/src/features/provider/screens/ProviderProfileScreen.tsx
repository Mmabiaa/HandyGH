/**
 * Provider Profile Screen
 *
 * Displays business profile information with editing functionality,
 * photo upload, and verification status.
 *
 * Requirements: 8.1
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Alert,
} from 'react-native';
import { Text } from '../../../shared/components/Text';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { TextInput } from '../../../shared/components/TextInput';
import { spacing } from '../../../core/theme/spacing';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { formatRating, formatPhoneNumber } from '../../../shared/utils/formatting';

// Mock provider profile data - in real app, this would come from API/state
interface ProviderProfile {
  id: string;
  businessName: string;
  businessDescription: string;
  phoneNumber: string;
  email?: string;
  profilePhoto?: string;
  coverPhoto?: string;
  categories: string[];
  rating: number;
  totalReviews: number;
  totalServices: number;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationDocuments: string[];
}

const ProviderProfileScreen: React.FC = () => {
  const { theme } = useTheme();

  // Mock data - replace with actual API call
  const [profile, setProfile] = useState<ProviderProfile>({
    id: 'provider-1',
    businessName: 'Professional Plumbing Services',
    businessDescription: 'Expert plumbing services with 10+ years of experience',
    phoneNumber: '+233241234567',
    email: 'contact@plumbing.com',
    profilePhoto: undefined,
    coverPhoto: undefined,
    categories: ['Plumbing', 'Repairs'],
    rating: 4.8,
    totalReviews: 156,
    totalServices: 342,
    verificationStatus: 'verified',
    verificationDocuments: [],
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
    setEditedProfile(profile);
  }, [profile]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setEditedProfile(profile);
  }, [profile]);

  const handleSave = useCallback(() => {
    // In real app, save to API
    setProfile(editedProfile);
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully');
  }, [editedProfile]);

  const handleUploadProfilePhoto = useCallback(() => {
    // In real app, open image picker
    Alert.alert('Upload Photo', 'Image picker would open here');
  }, []);

  const handleUploadCoverPhoto = useCallback(() => {
    // In real app, open image picker
    Alert.alert('Upload Cover Photo', 'Image picker would open here');
  }, []);

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return theme.colors.success || '#4CAF50';
      case 'pending':
        return theme.colors.warning || '#FF9800';
      case 'rejected':
        return theme.colors.error || '#F44336';
      default:
        return '#757575';
    }
  };

  const getVerificationStatusLabel = (status: string) => {
    switch (status) {
      case 'verified':
        return '✓ Verified';
      case 'pending':
        return '⏳ Pending Verification';
      case 'rejected':
        return '✗ Verification Rejected';
      default:
        return status;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Cover Photo */}
        <Pressable
          onPress={isEditing ? handleUploadCoverPhoto : undefined}
          style={styles.coverPhotoContainer}
          accessibilityRole="button"
          accessibilityLabel="Upload cover photo"
        >
          {profile.coverPhoto ? (
            <Image source={{ uri: profile.coverPhoto }} style={styles.coverPhoto} />
          ) : (
            <View style={[styles.coverPhotoPlaceholder, { backgroundColor: theme.colors.primary }]}>
              <Text variant="body" style={styles.placeholderText}>
                {isEditing ? 'Tap to upload cover photo' : 'No cover photo'}
              </Text>
            </View>
          )}
        </Pressable>

        {/* Profile Photo */}
        <View style={styles.profilePhotoSection}>
          <Pressable
            onPress={isEditing ? handleUploadProfilePhoto : undefined}
            style={styles.profilePhotoContainer}
            accessibilityRole="button"
            accessibilityLabel="Upload profile photo"
          >
            {profile.profilePhoto ? (
              <Image source={{ uri: profile.profilePhoto }} style={styles.profilePhoto} />
            ) : (
              <View style={styles.profilePhotoPlaceholder}>
                <Text variant="h4" style={styles.profileInitial}>
                  {profile.businessName.charAt(0)}
                </Text>
              </View>
            )}
            {isEditing && (
              <View style={styles.editPhotoOverlay}>
                <Text variant="caption" style={styles.editPhotoText}>
                  Edit
                </Text>
              </View>
            )}
          </Pressable>

          {/* Verification Badge */}
          <View
            style={[
              styles.verificationBadge,
              { backgroundColor: getVerificationStatusColor(profile.verificationStatus) },
            ]}
          >
            <Text variant="caption" style={styles.verificationText}>
              {getVerificationStatusLabel(profile.verificationStatus)}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text variant="h5" style={styles.statValue}>
              {formatRating(profile.rating)}
            </Text>
            <Text variant="caption" color="textSecondary">
              Rating
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text variant="h5" style={styles.statValue}>
              {profile.totalReviews}
            </Text>
            <Text variant="caption" color="textSecondary">
              Reviews
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text variant="h5" style={styles.statValue}>
              {profile.totalServices}
            </Text>
            <Text variant="caption" color="textSecondary">
              Services
            </Text>
          </View>
        </View>

        {/* Edit/Save Buttons */}
        <View style={styles.actionButtons}>
          {!isEditing ? (
            <Button
              variant="primary"
              onPress={handleEdit}
              accessibilityLabel="Edit profile"
            >
              Edit Profile
            </Button>
          ) : (
            <View style={styles.editActions}>
              <Button
                variant="outline"
                onPress={handleCancel}
                accessibilityLabel="Cancel editing"
                style={styles.actionButton}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onPress={handleSave}
                accessibilityLabel="Save changes"
                style={styles.actionButton}
              >
                Save Changes
              </Button>
            </View>
          )}
        </View>

        {/* Business Information */}
        <Card elevation="sm" padding="lg" style={styles.card}>
          <Text variant="h6" style={styles.sectionTitle}>
            Business Information
          </Text>

          <View style={styles.formField}>
            <TextInput
              label="Business Name"
              value={isEditing ? editedProfile.businessName : profile.businessName}
              onChangeText={(text) =>
                setEditedProfile({ ...editedProfile, businessName: text })
              }
              editable={isEditing}
              accessibilityLabel="Business name"
            />
          </View>

          <View style={styles.formField}>
            <TextInput
              label="Description"
              value={
                isEditing ? editedProfile.businessDescription : profile.businessDescription
              }
              onChangeText={(text) =>
                setEditedProfile({ ...editedProfile, businessDescription: text })
              }
              editable={isEditing}
              multiline
              numberOfLines={4}
              accessibilityLabel="Business description"
            />
          </View>

          <View style={styles.formField}>
            <Text variant="body" color="textSecondary" style={styles.fieldLabel}>
              Categories
            </Text>
            <View style={styles.categoriesContainer}>
              {profile.categories.map((category, index) => (
                <View key={index} style={styles.categoryChip}>
                  <Text variant="caption" style={styles.categoryText}>
                    {category}
                  </Text>
                </View>
              ))}
            </View>
            {isEditing && (
              <Button
                variant="outline"
                size="small"
                onPress={() => Alert.alert('Edit Categories', 'Category editor would open here')}
                accessibilityLabel="Edit categories"
                style={styles.editCategoriesButton}
              >
                Edit Categories
              </Button>
            )}
          </View>
        </Card>

        {/* Contact Information */}
        <Card elevation="sm" padding="lg" style={styles.card}>
          <Text variant="h6" style={styles.sectionTitle}>
            Contact Information
          </Text>

          <View style={styles.formField}>
            <TextInput
              label="Phone Number"
              value={formatPhoneNumber(profile.phoneNumber)}
              editable={false}
              accessibilityLabel="Phone number"
            />
          </View>

          <View style={styles.formField}>
            <TextInput
              label="Email"
              value={isEditing ? editedProfile.email : profile.email}
              onChangeText={(text) => setEditedProfile({ ...editedProfile, email: text })}
              editable={isEditing}
              keyboardType="email-address"
              autoCapitalize="none"
              accessibilityLabel="Email address"
            />
          </View>
        </Card>

        {/* Verification Status */}
        {profile.verificationStatus !== 'verified' && (
          <Card elevation="sm" padding="lg" style={styles.card}>
            <Text variant="h6" style={styles.sectionTitle}>
              Verification Status
            </Text>

            <Text variant="body" color="textSecondary" style={styles.verificationInfo}>
              {profile.verificationStatus === 'pending'
                ? 'Your verification is being reviewed. This usually takes 1-2 business days.'
                : 'Your verification was rejected. Please contact support for more information.'}
            </Text>

            {profile.verificationStatus === 'rejected' && (
              <Button
                variant="primary"
                onPress={() => Alert.alert('Resubmit', 'Verification resubmission would start here')}
                accessibilityLabel="Resubmit verification"
                style={styles.resubmitButton}
              >
                Resubmit Verification
              </Button>
            )}
          </Card>
        )}
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
    paddingBottom: spacing.xl,
  },
  coverPhotoContainer: {
    height: 200,
  },
  coverPhoto: {
    width: '100%',
    height: '100%',
  },
  coverPhotoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#FFFFFF',
  },
  profilePhotoSection: {
    alignItems: 'center',
    marginTop: -60,
    marginBottom: spacing.lg,
  },
  profilePhotoContainer: {
    position: 'relative',
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  profilePhotoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#9E9E9E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  profileInitial: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  editPhotoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: spacing.xs,
    alignItems: 'center',
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
  },
  editPhotoText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  verificationBadge: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  verificationText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: '#FFFFFF',
    marginBottom: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    fontWeight: 'bold',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  actionButtons: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  editActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.lg,
  },
  formField: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    marginBottom: spacing.sm,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryChip: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  categoryText: {
    color: '#1976D2',
    fontWeight: '600',
  },
  editCategoriesButton: {
    marginTop: spacing.sm,
  },
  verificationInfo: {
    marginBottom: spacing.md,
  },
  resubmitButton: {
    marginTop: spacing.sm,
  },
});

export default ProviderProfileScreen;
