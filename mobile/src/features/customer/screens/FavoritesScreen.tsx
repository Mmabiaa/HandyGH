/**
 * Favorites Screen
 *
 * Displays saved/favorited providers.
 *
 * Requirements: 3.8
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const FavoritesScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favorites</Text>
      <Text style={styles.description}>
        Your saved providers
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#757575',
  },
});

export default FavoritesScreen;
