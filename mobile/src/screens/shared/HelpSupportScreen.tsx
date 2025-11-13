import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, typography } from '@/constants/theme';

export const HelpSupportScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Help & Support</Text>
        <Text style={styles.description}>Get help and contact support</Text>
        <Text style={styles.status}>🚧 Under Development</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: 12,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  status: {
    ...typography.h3,
    color: colors.warning,
    textAlign: 'center',
    marginTop: 40,
  },
});
