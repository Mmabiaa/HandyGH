import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Button } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';

const ProviderListScreen = () => {
  const [providers, setProviders] = useState([]);
  const navigation = useNavigation();
  const route = useRoute();
  const { serviceId } = route.params;

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await axios.get(`https://yourapi.com/api/v1/providers?serviceId=${serviceId}`);
        setProviders(response.data);
      } catch (error) {
        console.error('Error fetching providers:', error);
      }
    };
    fetchProviders();
  }, [serviceId]);

  const renderProvider = ({ item }) => (
    <View style={styles.providerContainer}>
      <Text style={styles.providerName}>{item.name}</Text>
      <Button title="View Details" onPress={() => navigation.navigate('ServiceDetailScreen', { providerId: item.id })} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Providers for Service ID: {serviceId}</Text>
      <FlatList
        data={providers}
        renderItem={renderProvider}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  providerContainer: {
    marginBottom: 15,
    padding: 10,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
  },
  providerName: {
    fontSize: 18,
  },
});

export default ProviderListScreen;
