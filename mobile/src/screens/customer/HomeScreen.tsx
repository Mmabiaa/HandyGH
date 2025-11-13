import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CustomerTabScreenProps } from '@/navigation/types';
import { colors, spacing, typography } from '@/constants/theme';

type Props = CustomerTabScreenProps<'Home'>;

export const HomeScreen: React.FC<Props> = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Customer Home</Text>
      <Text style={styles.subtitle}>Coming soon...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body1,
    color: colors.textSecondary,
  },
});
