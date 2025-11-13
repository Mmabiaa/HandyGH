import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import axios from 'axios';

const BookingStatusScreen = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get('https://yourapi.com/api/v1/bookings');
        setBookings(response.data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };
    fetchBookings();
  }, []);

  const renderBooking = ({ item }) => (
    <View style={styles.bookingContainer}>
      <Text style={styles.bookingText}>Booking ID: {item.id}</Text>
      <Text style={styles.bookingText}>Date: {item.date}</Text>
      <Text style={styles.bookingText}>Time: {item.time}</Text>
      <Text style={styles.bookingText}>Status: {item.status}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Bookings</Text>
      <FlatList
        data={bookings}
        renderItem={renderBooking}
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
  bookingContainer: {
    marginBottom: 15,
    padding: 10,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
  },
  bookingText: {
    fontSize: 16,
  },
});

export default BookingStatusScreen;
