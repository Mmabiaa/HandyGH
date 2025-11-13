import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, typography } from '@/constants/theme';
import { Button } from '@/components/common/Button';

export const ServiceCustomizationScreen = ({ navigation, route }: any) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Customize Service</Text>
        <Text style={styles.description}>Add special requests or customizations</Text>
        <Text style={styles.status}>🚧 Under Development</Text>

        <View style={styles.actions}>
          <Button
            title="Go Back"
            onPress={() => navigation.goBack()}
            variant="outline"
          />
        </View>
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
    marginBottom: 40,
  },
  actions: {
    marginTop: 20,
  },
});
