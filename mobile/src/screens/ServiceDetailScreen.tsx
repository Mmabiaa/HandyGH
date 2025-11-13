import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';

const ServiceDetailScreen = () => {
  const [provider, setProvider] = useState(null);
  const navigation = useNavigation();
  const route = useRoute();
  const { providerId } = route.params;

  useEffect(() => {
    const fetchProviderDetails = async () => {
      try {
        const response = await axios.get(`https://yourapi.com/api/v1/providers/${providerId}`);
        setProvider(response.data);
      } catch (error) {
        console.error('Error fetching provider details:', error);
      }
    };
    fetchProviderDetails();
  }, [providerId]);

  if (!provider) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{provider.name}</Text>
      <Text style={styles.description}>{provider.description}</Text>
      <Button title="Book Now" onPress={() => navigation.navigate('BookingScreen', { providerId })} />
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
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
  },
});

export default ServiceDetailScreen;
