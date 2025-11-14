/**
 * Settings Screen
 *
 * Displays app settings including account, notifications, privacy,
 * theme selection, language selection, and logout functionality.
 *
 * Requirements: 15.9, 17.4
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { useAuthStore } from '../../../core/store/authStore';
import { useAppSettingsStore } from '../../../core/store/appSettingsStore';
import { BiometricAuth } from '../../../core/security';
import { Text, Button, Card } from '../../../shared/components';
import { spacing } from '../../../core/theme/spacing';

const SettingsScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { logout } = useAuthStore();
  const {
    preferences,
    setTheme,
    setLanguage,
    setNotificationsEnabled,
    setNotificationCategory,
    setBiometricEnabled,
  } = useAppSettingsStore();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometryTypeName, setBiometryTypeName] = useState('Biometric Authentication');

  // Check biometric availability on mount
  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    const { available } = await BiometricAuth.isAvailable();
    setBiometricAvailable(available);

    if (available) {
      const typeName = await BiometricAuth.getBiometryTypeName();
      setBiometryTypeName(typeName);
    }
  };

  // Handle biometric toggle
  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      // Enabling biometric authentication
      const { available } = await BiometricAuth.isAvailable();

      if (!available) {
        Alert.alert(
          'Not Available',
          'Biometric authentication is not available on this device.'
        );
        return;
      }

      // Test authentication before enabling
      const result = await BiometricAuth.authenticate(
        `Enable ${biometryTypeName} for HandyGH`
      );

      if (result.success) {
        // Create biometric keys
        await BiometricAuth.createKeys();
        setBiometricEnabled(true);
        Alert.alert(
          'Success',
          `${biometryTypeName} has been enabled for app lock.`
        );
      } else if (result.error && !result.error.includes('cancelled')) {
        Alert.alert('Authentication Failed', result.error);
      }
    } else {
      // Disabling biometric authentication
      Alert.alert(
        'Disable Biometric Authentication',
        `Are you sure you want to disable ${biometryTypeName}?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: async () => {
              await BiometricAuth.deleteKeys();
              setBiometricEnabled(false);
            },
          },
        ]
      );
    }
  };

  // Handle theme change
  const handleThemeChange = (selectedTheme: 'light' | 'dark' | 'system') => {
    setTheme(selectedTheme);
  };

  // Handle language change
  const handleLanguageChange = (language: 'en') => {
    setLanguage(language);
  };

  // Handle logout
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoggingOut(true);
              await logout();
              // Navigation will be handled by auth guard
            } catch (error) {
              console.error('Error logging out:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Account Section */}
      <View style={styles.section}>
        <Text variant="h3" style={styles.sectionTitle}>
          Account
        </Text>

        <Card style={styles.card}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('Profile' as never)}
            accessibilityLabel="Edit profile"
            accessibilityRole="button"
          >
            <Text variant="body">Edit Profile</Text>
            <Text variant="body" color="textSecondary">
              →
            </Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => {
              Alert.alert('Coming Soon', 'Password change feature coming soon');
            }}
            accessibilityLabel="Change password"
            accessibilityRole="button"
          >
            <Text variant="body">Change Password</Text>
            <Text variant="body" color="textSecondary">
              →
            </Text>
          </TouchableOpacity>
        </Card>
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text variant="h3" style={styles.sectionTitle}>
          Notifications
        </Text>

        <Card style={styles.card}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text variant="body">Enable Notifications</Text>
              <Text variant="caption" color="textSecondary">
                Receive push notifications
              </Text>
            </View>
            <Switch
              value={preferences.notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{
                false: theme.colors.neutral[300],
                true: theme.colors.primary,
              }}
              thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
              accessibilityLabel="Toggle notifications"
            />
          </View>

          {preferences.notificationsEnabled && (
            <>
              <View style={styles.divider} />

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text variant="body">Booking Updates</Text>
                  <Text variant="caption" color="textSecondary">
                    Status changes and reminders
                  </Text>
                </View>
                <Switch
                  value={preferences.notificationCategories.bookings}
                  onValueChange={(value) =>
                    setNotificationCategory('bookings', value)
                  }
                  trackColor={{
                    false: theme.colors.neutral[300],
                    true: theme.colors.primary,
                  }}
                  thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
                  accessibilityLabel="Toggle booking notifications"
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text variant="body">Messages</Text>
                  <Text variant="caption" color="textSecondary">
                    New message notifications
                  </Text>
                </View>
                <Switch
                  value={preferences.notificationCategories.messages}
                  onValueChange={(value) =>
                    setNotificationCategory('messages', value)
                  }
                  trackColor={{
                    false: theme.colors.neutral[300],
                    true: theme.colors.primary,
                  }}
                  thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
                  accessibilityLabel="Toggle message notifications"
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text variant="body">Promotions</Text>
                  <Text variant="caption" color="textSecondary">
                    Offers and updates
                  </Text>
                </View>
                <Switch
                  value={preferences.notificationCategories.promotions}
                  onValueChange={(value) =>
                    setNotificationCategory('promotions', value)
                  }
                  trackColor={{
                    false: theme.colors.neutral[300],
                    true: theme.colors.primary,
                  }}
                  thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
                  accessibilityLabel="Toggle promotion notifications"
                />
              </View>
            </>
          )}
        </Card>
      </View>

      {/* Appearance Section */}
      <View style={styles.section}>
        <Text variant="h3" style={styles.sectionTitle}>
          Appearance
        </Text>

        <Card style={styles.card}>
          <View style={styles.settingItem}>
            <Text variant="body">Theme</Text>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleThemeChange('light')}
            accessibilityLabel="Select light theme"
            accessibilityRole="radio"
            accessibilityState={{ checked: preferences.theme === 'light' }}
          >
            <Text variant="body">Light</Text>
            {preferences.theme === 'light' && (
              <Text variant="body" color="primary">
                ✓
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleThemeChange('dark')}
            accessibilityLabel="Select dark theme"
            accessibilityRole="radio"
            accessibilityState={{ checked: preferences.theme === 'dark' }}
          >
            <Text variant="body">Dark</Text>
            {preferences.theme === 'dark' && (
              <Text variant="body" color="primary">
                ✓
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleThemeChange('system')}
            accessibilityLabel="Select system theme"
            accessibilityRole="radio"
            accessibilityState={{ checked: preferences.theme === 'system' }}
          >
            <Text variant="body">System Default</Text>
            {preferences.theme === 'system' && (
              <Text variant="body" color="primary">
                ✓
              </Text>
            )}
          </TouchableOpacity>
        </Card>
      </View>

      {/* Language Section */}
      <View style={styles.section}>
        <Text variant="h3" style={styles.sectionTitle}>
          Language
        </Text>

        <Card style={styles.card}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleLanguageChange('en')}
            accessibilityLabel="Select English language"
            accessibilityRole="radio"
            accessibilityState={{ checked: preferences.language === 'en' }}
          >
            <Text variant="body">English</Text>
            {preferences.language === 'en' && (
              <Text variant="body" color="primary">
                ✓
              </Text>
            )}
          </TouchableOpacity>
        </Card>
      </View>

      {/* Privacy Section */}
      <View style={styles.section}>
        <Text variant="h3" style={styles.sectionTitle}>
          Privacy & Security
        </Text>

        <Card style={styles.card}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text variant="body">{biometryTypeName}</Text>
              <Text variant="caption" color="textSecondary">
                {biometricAvailable
                  ? `Lock app with ${biometryTypeName}`
                  : 'Not available on this device'}
              </Text>
            </View>
            <Switch
              value={preferences.biometricEnabled}
              onValueChange={handleBiometricToggle}
              disabled={!biometricAvailable}
              trackColor={{
                false: theme.colors.neutral[300],
                true: theme.colors.primary,
              }}
              thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
              accessibilityLabel={`Toggle ${biometryTypeName}`}
            />
          </View>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => {
              Alert.alert(
                'Privacy Policy',
                'View our privacy policy at handygh.com/privacy'
              );
            }}
            accessibilityLabel="View privacy policy"
            accessibilityRole="button"
          >
            <Text variant="body">Privacy Policy</Text>
            <Text variant="body" color="textSecondary">
              →
            </Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => {
              Alert.alert(
                'Terms of Service',
                'View our terms of service at handygh.com/terms'
              );
            }}
            accessibilityLabel="View terms of service"
            accessibilityRole="button"
          >
            <Text variant="body">Terms of Service</Text>
            <Text variant="body" color="textSecondary">
              →
            </Text>
          </TouchableOpacity>
        </Card>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text variant="h3" style={styles.sectionTitle}>
          About
        </Text>

        <Card style={styles.card}>
          <View style={styles.settingItem}>
            <Text variant="body">Version</Text>
            <Text variant="body" color="textSecondary">
              1.0.0
            </Text>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => {
              Alert.alert('Support', 'Contact us at support@handygh.com');
            }}
            accessibilityLabel="Contact support"
            accessibilityRole="button"
          >
            <Text variant="body">Support</Text>
            <Text variant="body" color="textSecondary">
              →
            </Text>
          </TouchableOpacity>
        </Card>
      </View>

      {/* Logout Button */}
      <Button
        variant="outline"
        onPress={handleLogout}
        loading={isLoggingOut}
        style={styles.logoutButton}
        accessibilityLabel="Logout from account"
      >
        Logout
      </Button>

      <View style={styles.bottomSpacing} />
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
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  card: {
    padding: 0,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    minHeight: 56,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginLeft: spacing.md,
  },
  logoutButton: {
    marginTop: spacing.lg,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});

export default SettingsScreen;
