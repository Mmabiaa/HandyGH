import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const BookingScreen = () => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const navigation = useNavigation();
  const route = useRoute();
  const { providerId } = route.params;

  const handleBooking = () => {
    // Here you would typically send the booking data to your backend
    alert(`Booking for Provider ID: ${providerId} on ${date} at ${time} created!`);
    // Navigate to Booking Status Screen or another appropriate screen
    navigation.navigate('BookingStatusScreen');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Book Your Service</Text>
      <TextInput
        style={styles.input}
        placeholder="Date (YYYY-MM-DD)"
        value={date}
        onChangeText={setDate}
      />
      <TextInput
        style={styles.input}
        placeholder="Time (HH:MM)"
        value={time}
        onChangeText={setTime}
      />
      <Button title="Confirm Booking" onPress={handleBooking} />
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
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
});

export default BookingScreen;
