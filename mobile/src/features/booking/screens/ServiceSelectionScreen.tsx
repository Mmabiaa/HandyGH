import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../../core/navigation/types';
import { useQuery } from '@tanstack/react-query';
import { ProviderService } from '../../../core/api/services';
import { Service, ServiceAddOn } from '../../../core/api/types';
import { formatCurrency } from '../../../shared/utils/formatting';

type ServiceSelectionScreenNavigationProp = NativeStackNavigationProp<
  CustomerStackParamList,
  'ServiceSelection'
>;

type ServiceSelectionScreenRouteProp = RouteProp<
  CustomerStackParamList,
  'ServiceSelection'
>;

/**
 * ServiceSelectionScreen
 *
 * Allows customers to select a service and optional add-ons from a provider.
 * Implements real-time price calculation and navigation to date/time selection.
 *
 * Requirements:
 * - 4.1: Display services with pricing and duration
 * - 4.2: Service add-ons selection with price calculation
 */
export const ServiceSelectionScreen: React.FC = () => {
  const navigation = useNavigation<ServiceSelectionScreenNavigationProp>();
  const route = useRoute<ServiceSelectionScreenRouteProp>();
  const { providerId } = route.params;

  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<Set<string>>(new Set());

  // Fetch provider services
  const {
    data: services,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['provider-services', providerId],
    queryFn: () => ProviderService.getProviderServices(providerId),
  });

  // Get selected service
  const selectedService = useMemo(() => {
    return services?.find((s) => s.id === selectedServiceId);
  }, [services, selectedServiceId]);

  // Calculate total price
  const totalPrice = useMemo(() => {
    if (!selectedService) return 0;

    let total = selectedService.price;

    if (selectedService.addOns) {
      selectedService.addOns.forEach((addOn) => {
        if (selectedAddOnIds.has(addOn.id)) {
          total += addOn.price;
        }
      });
    }

    return total;
  }, [selectedService, selectedAddOnIds]);

  // Calculate total duration
  const totalDuration = useMemo(() => {
    if (!selectedService) return 0;
    return selectedService.duration;
  }, [selectedService]);

  // Handle service selection
  const handleServiceSelect = useCallback((serviceId: string) => {
    setSelectedServiceId(serviceId);
    setSelectedAddOnIds(new Set()); // Reset add-ons when service changes
  }, []);

  // Handle add-on toggle
  const handleAddOnToggle = useCallback((addOnId: string) => {
    setSelectedAddOnIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(addOnId)) {
        newSet.delete(addOnId);
      } else {
        newSet.add(addOnId);
      }
      return newSet;
    });
  }, []);

  // Handle continue to date/time selection
  const handleContinue = useCallback(() => {
    if (!selectedServiceId) return;

    navigation.navigate('DateTimeSelection', {
      providerId,
      serviceId: selectedServiceId,
    });
  }, [navigation, providerId, selectedServiceId]);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading services...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load services</Text>
        <Text style={styles.errorSubtext}>Please try again later</Text>
      </View>
    );
  }

  if (!services || services.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No services available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Services List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select a Service</Text>
          {services.map((service) => (
            <ServiceItem
              key={service.id}
              service={service}
              isSelected={selectedServiceId === service.id}
              onSelect={handleServiceSelect}
            />
          ))}
        </View>

        {/* Add-ons Section */}
        {selectedService && selectedService.addOns && selectedService.addOns.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add-ons (Optional)</Text>
            {selectedService.addOns.map((addOn) => (
              <AddOnItem
                key={addOn.id}
                addOn={addOn}
                isSelected={selectedAddOnIds.has(addOn.id)}
                onToggle={handleAddOnToggle}
              />
            ))}
          </View>
        )}

        {/* Price Summary */}
        {selectedService && (
          <View style={styles.summarySection}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Service</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(selectedService.price, 'GHS')}
              </Text>
            </View>
            {selectedAddOnIds.size > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Add-ons</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(totalPrice - selectedService.price, 'GHS')}
                </Text>
              </View>
            )}
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(totalPrice, 'GHS')}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Duration</Text>
              <Text style={styles.summaryValue}>{totalDuration} min</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, !selectedServiceId && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!selectedServiceId}
          accessibilityLabel="Continue to date and time selection"
          accessibilityRole="button"
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

/**
 * ServiceItem Component
 * Displays individual service with selection state
 */
interface ServiceItemProps {
  service: Service;
  isSelected: boolean;
  onSelect: (serviceId: string) => void;
}

const ServiceItem: React.FC<ServiceItemProps> = ({ service, isSelected, onSelect }) => {
  return (
    <TouchableOpacity
      style={[styles.serviceItem, isSelected && styles.serviceItemSelected]}
      onPress={() => onSelect(service.id)}
      accessibilityLabel={`Select ${service.name} service`}
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected }}
    >
      <View style={styles.serviceHeader}>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{service.name}</Text>
          <Text style={styles.serviceDescription} numberOfLines={2}>
            {service.description}
          </Text>
        </View>
        <View style={styles.radioButton}>
          {isSelected && <View style={styles.radioButtonInner} />}
        </View>
      </View>
      <View style={styles.serviceFooter}>
        <Text style={styles.servicePrice}>{formatCurrency(service.price, 'GHS')}</Text>
        <Text style={styles.serviceDuration}>{service.duration} min</Text>
      </View>
    </TouchableOpacity>
  );
};

/**
 * AddOnItem Component
 * Displays service add-on with checkbox
 */
interface AddOnItemProps {
  addOn: ServiceAddOn;
  isSelected: boolean;
  onToggle: (addOnId: string) => void;
}

const AddOnItem: React.FC<AddOnItemProps> = ({ addOn, isSelected, onToggle }) => {
  return (
    <TouchableOpacity
      style={styles.addOnItem}
      onPress={() => onToggle(addOn.id)}
      accessibilityLabel={`${isSelected ? 'Remove' : 'Add'} ${addOn.name} add-on`}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isSelected }}
    >
      <View style={styles.checkbox}>
        {isSelected && <View style={styles.checkboxInner} />}
      </View>
      <View style={styles.addOnInfo}>
        <Text style={styles.addOnName}>{addOn.name}</Text>
        <Text style={styles.addOnDescription}>{addOn.description}</Text>
      </View>
      <Text style={styles.addOnPrice}>+{formatCurrency(addOn.price, 'GHS')}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
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
  serviceItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  serviceItemSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceInfo: {
    flex: 1,
    marginRight: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  serviceDuration: {
    fontSize: 14,
    color: '#666666',
  },
  addOnItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxInner: {
    width: 14,
    height: 14,
    borderRadius: 3,
    backgroundColor: '#007AFF',
  },
  addOnInfo: {
    flex: 1,
    marginRight: 12,
  },
  addOnName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  addOnDescription: {
    fontSize: 13,
    color: '#666666',
  },
  addOnPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  summarySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#666666',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007AFF',
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF3B30',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666666',
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
  },
});
