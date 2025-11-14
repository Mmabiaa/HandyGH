import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../../core/navigation/types';
import { Coordinates } from '../../../core/api/types';

type LocationSelectionScreenNavigationProp = NativeStackNavigationProp<
  CustomerStackParamList,
  'LocationSelection'
>;

type LocationSelectionScreenRouteProp = RouteProp<
  CustomerStackParamList,
  'LocationSelection'
>;

interface SavedLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  region: string;
  coordinates: Coordinates;
}

/**
 * LocationSelectionScreen
 *
 * Allows customers to enter or select a service location.
 * Supports address input, current location, saved locations, and map selection.
 *
 * Requirements:
 * - 4.6: Address input with autocomplete
 * - 4.7: Current location and saved locations access
 * - 17.6: Ghana address formats
 */
export const LocationSelectionScreen: React.FC = () => {
  const navigation = useNavigation<LocationSelectionScreenNavigationProp>();
  const route = useRoute<LocationSelectionScreenRouteProp>();
  const { providerId, serviceId, scheduledDate, scheduledTime } = route.params;

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [locationNotes, setLocationNotes] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Mock saved locations (in real app, fetch from storage/API)
  const savedLocations: SavedLocation[] = [
    {
      id: '1',
      name: 'Home',
      address: 'East Legon',
      city: 'Accra',
      region: 'Greater Accra',
      coordinates: { latitude: 5.6037, longitude: -0.1870 },
    },
    {
      id: '2',
      name: 'Work',
      address: 'Airport Residential Area',
      city: 'Accra',
      region: 'Greater Accra',
      coordinates: { latitude: 5.6108, longitude: -0.1719 },
    },
  ];

  // Request location permission
  const requestLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'HandyGH needs access to your location to provide accurate service.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  // Get current location
  const handleUseCurrentLocation = useCallback(async () => {
    const hasPermission = await requestLocationPermission();

    if (!hasPermission) {
      Alert.alert(
        'Permission Denied',
        'Location permission is required to use your current location.'
      );
      return;
    }

    setIsLoadingLocation(true);

    // In a real app, use Geolocation API
    // For now, simulate with mock data
    setTimeout(() => {
      setAddress('East Legon');
      setCity('Accra');
      setRegion('Greater Accra');
      setIsLoadingLocation(false);

      Alert.alert('Success', 'Current location detected');
    }, 1500);
  }, []);

  // Handle saved location selection
  const handleSelectSavedLocation = useCallback((location: SavedLocation) => {
    setAddress(location.address);
    setCity(location.city);
    setRegion(location.region);
  }, []);

  // Validate location input
  const validateLocation = (): boolean => {
    if (!address.trim()) {
      Alert.alert('Required Field', 'Please enter a service address');
      return false;
    }
    if (!city.trim()) {
      Alert.alert('Required Field', 'Please enter a city');
      return false;
    }
    if (!region.trim()) {
      Alert.alert('Required Field', 'Please enter a region');
      return false;
    }
    return true;
  };

  // Handle continue to booking summary
  const handleContinue = useCallback(() => {
    if (!validateLocation()) {
      return;
    }

    // Create location object
    // In a real app, we would store this location and pass its ID
    // For now, we'll navigate with a mock location ID
    // TODO: Store location and use actual location ID
    navigation.navigate('BookingSummary', {
      providerId,
      serviceId,
      scheduledDate,
      scheduledTime,
      locationId: 'temp-location-id',
    });
  }, [navigation, providerId, serviceId, scheduledDate, scheduledTime, address, city, region]);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Current Location Button */}
        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={handleUseCurrentLocation}
          disabled={isLoadingLocation}
          accessibilityLabel="Use current location"
          accessibilityRole="button"
        >
          <Text style={styles.currentLocationIcon}>📍</Text>
          <Text style={styles.currentLocationText}>
            {isLoadingLocation ? 'Getting location...' : 'Use Current Location'}
          </Text>
        </TouchableOpacity>

        {/* Saved Locations */}
        {savedLocations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Saved Locations</Text>
            {savedLocations.map((location) => (
              <TouchableOpacity
                key={location.id}
                style={styles.savedLocationCard}
                onPress={() => handleSelectSavedLocation(location)}
                accessibilityLabel={`Select ${location.name} location`}
                accessibilityRole="button"
              >
                <View style={styles.savedLocationIcon}>
                  <Text style={styles.savedLocationIconText}>
                    {location.name === 'Home' ? '🏠' : '💼'}
                  </Text>
                </View>
                <View style={styles.savedLocationInfo}>
                  <Text style={styles.savedLocationName}>{location.name}</Text>
                  <Text style={styles.savedLocationAddress}>
                    {location.address}, {location.city}
                  </Text>
                </View>
                <Text style={styles.savedLocationArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Manual Address Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Enter Address</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Street Address *</Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="e.g., East Legon, House No. 123"
              placeholderTextColor="#999999"
              accessibilityLabel="Street address input"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>City *</Text>
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder="e.g., Accra"
              placeholderTextColor="#999999"
              accessibilityLabel="City input"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Region *</Text>
            <TextInput
              style={styles.input}
              value={region}
              onChangeText={setRegion}
              placeholder="e.g., Greater Accra"
              placeholderTextColor="#999999"
              accessibilityLabel="Region input"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Additional Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={locationNotes}
              onChangeText={setLocationNotes}
              placeholder="e.g., Gate code, landmarks, special instructions"
              placeholderTextColor="#999999"
              accessibilityLabel="Location notes input"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Map Preview Placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location Preview</Text>
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapPlaceholderText}>🗺️</Text>
            <Text style={styles.mapPlaceholderSubtext}>
              Map view will show your selected location
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!address || !city || !region) && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!address || !city || !region}
          accessibilityLabel="Continue to booking summary"
          accessibilityRole="button"
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  currentLocationButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  currentLocationIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  currentLocationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  savedLocationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  savedLocationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  savedLocationIconText: {
    fontSize: 24,
  },
  savedLocationInfo: {
    flex: 1,
  },
  savedLocationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  savedLocationAddress: {
    fontSize: 14,
    color: '#666666',
  },
  savedLocationArrow: {
    fontSize: 24,
    color: '#CCCCCC',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
  },
  mapPlaceholder: {
    backgroundColor: '#E8F4F8',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    borderWidth: 2,
    borderColor: '#B3D9E8',
    borderStyle: 'dashed',
  },
  mapPlaceholderText: {
    fontSize: 48,
    marginBottom: 8,
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  continueButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  continueButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
