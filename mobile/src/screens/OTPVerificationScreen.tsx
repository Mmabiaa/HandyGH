import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const OTPVerificationScreen = () => {
  const [otp, setOtp] = useState('');
  const navigation = useNavigation();
  const route = useRoute();
  const { phoneNumber } = route.params;

  const handleVerify = () => {
    // Here you would typically send the OTP to your backend for verification
    // For now, we'll just alert the user
    if (otp.length !== 6) {
      alert('Please enter a valid OTP.');
      return;
    }
    alert(`OTP for ${phoneNumber} verified!`);
    // Navigate to the Profile Setup Screen
    navigation.navigate('ProfileSetupScreen');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter OTP</Text>
      <TextInput
        style={styles.input}
        placeholder="OTP"
        keyboardType="number-pad"
        value={otp}
        onChangeText={setOtp}
      />
      <Button title="Verify" onPress={handleVerify} />
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

export default OTPVerificationScreen;
