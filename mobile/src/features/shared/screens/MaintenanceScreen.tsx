import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
// react-native-restart requires native modules not available in Expo Go
// Using Alert as fallback for Expo Go compatibility

type MaintenanceScreenRouteProp = RouteProp<
  {
    Maintenance: {
      message?: string;
      estimatedTime?: string;
    };
  },
  'Maintenance'
>;

interface MaintenanceScreenProps {
  route: MaintenanceScreenRouteProp;
}

/**
 * Maintenance mode screen
 * Requirement 16.6: Maintenance mode display
 */
export const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({ route }) => {
  const { message, estimatedTime } = route.params || {};

  const handleCheckAgain = () => {
    Alert.alert(
      'Restart Required',
      'Please close and reopen the app to check if maintenance is complete.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🔧</Text>
        <Text style={styles.title}>We'll be right back</Text>
        <Text style={styles.message}>
          {message || "HandyGH is currently undergoing maintenance. We'll be back shortly."}
        </Text>
        {estimatedTime && (
          <Text style={styles.estimatedTime}>
            Estimated time: {estimatedTime}
          </Text>
        )}
        <TouchableOpacity
          style={styles.button}
          onPress={handleCheckAgain}
          accessibilityLabel="Check again"
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Check Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  estimatedTime: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    minWidth: 160,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
