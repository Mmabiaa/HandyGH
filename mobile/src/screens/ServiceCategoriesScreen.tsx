import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ServiceCategoriesScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Service Categories</Text>
      <Button title="Service 1" onPress={() => navigation.navigate('ProviderListScreen', { serviceId: 1 })} />
      <Button title="Service 2" onPress={() => navigation.navigate('ProviderListScreen', { serviceId: 2 })} />
      <Button title="Service 3" onPress={() => navigation.navigate('ProviderListScreen', { serviceId: 3 })} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default ServiceCategoriesScreen;
