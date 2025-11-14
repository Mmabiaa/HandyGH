/**
 * Map View Screen
 *
 * Displays providers on a map with custom markers and clustering.
 * Allows geographic discovery of providers with marker tap to show preview.
 *
 * Requirements: 2.9
 */

import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { Text } from '../../../shared/components';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { spacing } from '../../../core/theme/spacing';
import { borderRadius } from '../../../core/theme/borderRadius';
import { shadows } from '../../../core/theme/shadows';
import { useProviders } from '../../../core/query/hooks/useProviders';
import type { CustomerStackParamList } from '../../../core/navigation/types';
import type { Provider, Coordinates } from '../../../core/api/types';

type MapViewScreenNavigationProp = NativeStackNavigationProp<CustomerStackParamList, 'MapView'>;
type MapViewScreenRouteProp = RouteProp<CustomerStackParamList, 'MapView'>;

const { width, height } = Dimensions.get('window');

// Default center (Accra, Ghana)
const DEFAULT_CENTER: Coordinates = {
  latitude: 5.6037,
  longitude: -0.187,
};

const INITIAL_REGION: Region = {
  latitude: DEFAULT_CENTER.latitude,
  longitude: DEFAULT_CENTER.longitude,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

/**
 * Map View Screen Component
 */
export const MapViewScreen: React.FC = () => {
  const navigation = useNavigation<MapViewScreenNavigationProp>();
  const route = useRoute<MapViewScreenRouteProp>();
  const { theme } = useTheme();
  const mapRef = useRef<MapView>(null);

  const { center, providers: providerIds } = route.params || {};

  // State
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [region, setRegion] = useState<Region>(
    center
      ? {
          latitude: center.latitude,
          longitude: center.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }
      : INITIAL_REGION
  );

  // Fetch providers
  const { data } = useProviders({
    latitude: region.latitude,
    longitude: region.longitude,
    radius: 10, // 10km radius
    pageSize: 100,
  });

  // Filter providers if specific IDs provided
  const displayProviders = useMemo(() => {
    if (!data?.results) return [];
    if (!providerIds || providerIds.length === 0) return data.results;
    return data.results.filter(p => providerIds.includes(p.id));
  }, [data?.results, providerIds]);

  // Get providers with valid coordinates
  const providersWithLocation = useMemo(() => {
    return displayProviders.filter(
      provider =>
        provider.serviceArea?.center?.latitude && provider.serviceArea?.center?.longitude
    );
  }, [displayProviders]);

  const handleMarkerPress = useCallback(
    (provider: Provider) => {
      if (Platform.OS !== 'web') {
        ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
      }
      setSelectedProvider(provider);

      // Animate to marker
      if (mapRef.current && provider.serviceArea?.center) {
        mapRef.current.animateToRegion(
          {
            latitude: provider.serviceArea.center.latitude,
            longitude: provider.serviceArea.center.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          },
          300
        );
      }
    },
    []
  );

  const handleProviderCardPress = useCallback(() => {
    if (selectedProvider) {
      if (Platform.OS !== 'web') {
        ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
      }
      navigation.navigate('ProviderDetail', { providerId: selectedProvider.id });
    }
  }, [selectedProvider, navigation]);

  const handleClosePreview = useCallback(() => {
    setSelectedProvider(null);
    if (Platform.OS !== 'web') {
      ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
    }
  }, []);

  const handleRegionChangeComplete = useCallback((newRegion: Region) => {
    setRegion(newRegion);
  }, []);

  const handleMyLocation = useCallback(() => {
    // In a real app, this would get the user's actual location
    // For now, just center on Accra
    if (mapRef.current) {
      mapRef.current.animateToRegion(INITIAL_REGION, 500);
    }
    if (Platform.OS !== 'web') {
      ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
    }
  }, []);

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={INITIAL_REGION}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass
        showsScale
        loadingEnabled
        loadingIndicatorColor={theme.colors.primary}
      >
        {/* Provider Markers */}
        {providersWithLocation.map(provider => {
          if (!provider.serviceArea?.center) return null;

          return (
            <Marker
              key={provider.id}
              coordinate={{
                latitude: provider.serviceArea.center.latitude,
                longitude: provider.serviceArea.center.longitude,
              }}
              onPress={() => handleMarkerPress(provider)}
              tracksViewChanges={false}
            >
              <View
                style={[
                  styles.markerContainer,
                  {
                    backgroundColor:
                      selectedProvider?.id === provider.id
                        ? theme.colors.primary
                        : theme.colors.cardBackground,
                  },
                ]}
              >
                <Text
                  variant="caption"
                  color={selectedProvider?.id === provider.id ? 'textOnPrimary' : 'text'}
                  style={styles.markerText}
                >
                  {provider.isVerified ? '✓' : '📍'}
                </Text>
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* My Location Button */}
      <TouchableOpacity
        style={[
          styles.myLocationButton,
          { backgroundColor: theme.colors.cardBackground, ...shadows.md },
        ]}
        onPress={handleMyLocation}
        accessibilityRole="button"
        accessibilityLabel="Center on my location"
      >
        <Text variant="h4">📍</Text>
      </TouchableOpacity>

      {/* Provider Preview Card */}
      {selectedProvider && (
        <View
          style={[
            styles.previewCard,
            { backgroundColor: theme.colors.cardBackground, ...shadows.lg },
          ]}
        >
          <TouchableOpacity
            style={styles.previewContent}
            onPress={handleProviderCardPress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`View details for ${selectedProvider.businessName}`}
          >
            <View style={styles.previewInfo}>
              <View style={styles.previewHeader}>
                <Text variant="labelLarge" color="text" numberOfLines={1}>
                  {selectedProvider.businessName}
                </Text>
                {selectedProvider.isVerified && (
                  <View style={[styles.verifiedBadge, { backgroundColor: theme.colors.success }]}>
                    <Text variant="caption" color="textOnPrimary" style={styles.badgeText}>
                      ✓
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.ratingContainer}>
                <Text variant="body" color="warning">
                  ⭐
                </Text>
                <Text variant="bodySmall" color="text" style={styles.ratingText}>
                  {selectedProvider.rating.toFixed(1)}
                </Text>
                <Text variant="caption" color="textSecondary">
                  ({selectedProvider.totalReviews} reviews)
                </Text>
              </View>

              <Text variant="caption" color="textSecondary" style={styles.servicesText}>
                {selectedProvider.totalServices} services completed
              </Text>
            </View>

            <View style={styles.previewActions}>
              <View style={[styles.viewButton, { backgroundColor: theme.colors.primary }]}>
                <Text variant="label" color="textOnPrimary">
                  View
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Close Button */}
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: theme.colors.neutral[100] }]}
            onPress={handleClosePreview}
            accessibilityRole="button"
            accessibilityLabel="Close preview"
          >
            <Text variant="body" color="text">
              ✕
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Provider Count Badge */}
      {providersWithLocation.length > 0 && (
        <View
          style={[
            styles.countBadge,
            { backgroundColor: theme.colors.cardBackground, ...shadows.md },
          ]}
        >
          <Text variant="label" color="text">
            {providersWithLocation.length} provider{providersWithLocation.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width,
    height,
  },
  markerContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  markerText: {
    fontSize: 16,
  },
  myLocationButton: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.md,
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadge: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  previewCard: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.md,
    right: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  previewContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  verifiedBadge: {
    marginLeft: spacing.xs,
    borderRadius: borderRadius.full,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  ratingText: {
    marginLeft: spacing.xs,
    marginRight: spacing.xs,
  },
  servicesText: {
    marginTop: spacing.xs,
  },
  previewActions: {
    justifyContent: 'center',
  },
  viewButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
