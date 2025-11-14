/**
 * Notification Preferences Component
 *
 * Allows users to configure notification preferences
 *
 * Requirements: 15.9
 */

import React from 'react';
import { View, Text, StyleSheet, Switch, Platform } from 'react-native';
import { useAppSettingsStore } from '../../store/appSettingsStore';
import { useNotificationPermissions } from '../hooks/useNotifications';
import { spacing } from '../../theme/spacing';
import { useTheme } from '../../theme/ThemeProvider';

interface PreferenceItemProps {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

const PreferenceItem: React.FC<PreferenceItemProps> = ({
  label,
  description,
  value,
  onValueChange,
  disabled = false,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.preferenceItem}>
      <View style={styles.preferenceText}>
        <Text style={[styles.label, { color: theme.colors.neutral[900] }]}>
          {label}
        </Text>
        <Text style={[styles.description, { color: theme.colors.neutral[600] }]}>
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{
          false: theme.colors.neutral[300],
          true: theme.colors.primary[500],
        }}
        thumbColor={Platform.OS === 'ios' ? undefined : theme.colors.neutral[50]}
        ios_backgroundColor={theme.colors.neutral[300]}
      />
    </View>
  );
};

export const NotificationPreferences: React.FC = () => {
  const { theme } = useTheme();
  const { isEnabled: systemEnabled, requestPermissions } = useNotificationPermissions();

  const notificationsEnabled = useAppSettingsStore(
    (state) => state.preferences.notificationsEnabled
  );
  const notificationCategories = useAppSettingsStore(
    (state) => state.preferences.notificationCategories
  );
  const setNotificationsEnabled = useAppSettingsStore(
    (state) => state.setNotificationsEnabled
  );
  const setNotificationCategory = useAppSettingsStore(
    (state) => state.setNotificationCategory
  );

  const handleToggleNotifications = async (value: boolean) => {
    if (value && !systemEnabled) {
      // Request system permissions if not granted
      const granted = await requestPermissions();
      if (!granted) {
        // User denied permissions
        return;
      }
    }
    setNotificationsEnabled(value);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: theme.colors.neutral[900] }]}>
        Notifications
      </Text>

      <View style={[styles.section, { backgroundColor: theme.colors.neutral[0] }]}>
        <PreferenceItem
          label="Enable Notifications"
          description="Receive push notifications for important updates"
          value={notificationsEnabled}
          onValueChange={handleToggleNotifications}
        />
      </View>

      <Text style={[styles.sectionTitle, { color: theme.colors.neutral[900] }]}>
        Notification Categories
      </Text>

      <View style={[styles.section, { backgroundColor: theme.colors.neutral[0] }]}>
        <PreferenceItem
          label="Booking Updates"
          description="Get notified about booking confirmations and status changes"
          value={notificationCategories.bookings}
          onValueChange={(value) => setNotificationCategory('bookings', value)}
          disabled={!notificationsEnabled}
        />

        <View style={[styles.divider, { backgroundColor: theme.colors.neutral[200] }]} />

        <PreferenceItem
          label="Messages"
          description="Receive notifications for new messages from providers"
          value={notificationCategories.messages}
          onValueChange={(value) => setNotificationCategory('messages', value)}
          disabled={!notificationsEnabled}
        />

        <View style={[styles.divider, { backgroundColor: theme.colors.neutral[200] }]} />

        <PreferenceItem
          label="Promotions"
          description="Get notified about special offers and promotions"
          value={notificationCategories.promotions}
          onValueChange={(value) => setNotificationCategory('promotions', value)}
          disabled={!notificationsEnabled}
        />
      </View>

      {!systemEnabled && (
        <Text style={[styles.warningText, { color: theme.colors.accent[500] }]}>
          Notifications are disabled in system settings. Please enable them to receive
          notifications.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    marginHorizontal: spacing.md,
  },
  section: {
    borderRadius: 12,
    marginHorizontal: spacing.md,
    overflow: 'hidden',
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  preferenceText: {
    flex: 1,
    marginRight: spacing.md,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    marginLeft: spacing.md,
  },
  warningText: {
    fontSize: 14,
    marginTop: spacing.md,
    marginHorizontal: spacing.md,
    textAlign: 'center',
  },
});
