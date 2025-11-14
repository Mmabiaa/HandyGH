import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Text } from '../../../shared/components/Text';
import { Button } from '../../../shared/components/Button';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { useBookingFlowContext } from '../context/BookingFlowContext';
import { useQuery } from '@tanstack/react-query';
import { PaymentService } from '../../../core/api/services/PaymentService';
import { PaymentMethod } from '../../../core/api/types';
import { Ionicons } from '@expo/vector-icons';

/**
 * PaymentMethodScreen Component
 *
 * Displays available payment methods and allows user to select one for booking payment.
 *
 * Requirements:
 * - 4.9: Display available payment methods (MoMo, Card, Cash)
 * - 17.5: Integrate with Mobile Money payment systems
 */
export const PaymentMethodScreen: React.FC = () => {
  const { theme } = useTheme();
  const { state, actions } = useBookingFlowContext();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  // Fetch saved payment methods
  const { data: paymentMethods, isLoading } = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: () => PaymentService.getPaymentMethods(),
  });

  const handleSelectMethod = (method: PaymentMethod) => {
    setSelectedMethod(method);
  };

  const handleContinue = () => {
    if (!selectedMethod) return;

    actions.setPaymentMethod(selectedMethod);

    // Navigate based on payment type
    if (selectedMethod.type === 'momo') {
      actions.goToNextStep(); // Goes to MobileMoneyPaymentScreen
    } else if (selectedMethod.type === 'cash') {
      // For cash, skip payment processing and create booking
      actions.goToNextStep();
    } else {
      // For card, would go to card payment screen (not implemented in this task)
      actions.goToNextStep();
    }
  };

  const getPaymentMethodIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'momo':
        return 'phone-portrait-outline';
      case 'card':
        return 'card-outline';
      case 'cash':
        return 'cash-outline';
      default:
        return 'wallet-outline';
    }
  };

  const getPaymentMethodLabel = (method: PaymentMethod): string => {
    if (method.type === 'momo' && method.provider) {
      const providerNames = {
        mtn: 'MTN Mobile Money',
        vodafone: 'Vodafone Cash',
        airteltigo: 'AirtelTigo Money',
      };
      return providerNames[method.provider];
    }

    const typeLabels = {
      momo: 'Mobile Money',
      card: 'Credit/Debit Card',
      cash: 'Cash on Delivery',
    };
    return typeLabels[method.type] || method.type;
  };

  const getPaymentMethodDescription = (method: PaymentMethod): string => {
    if (method.type === 'momo' && method.phoneNumber) {
      return method.phoneNumber;
    }
    if (method.type === 'cash') {
      return 'Pay when service is completed';
    }
    return '';
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading payment methods...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text variant="h2" style={styles.title}>
          Select Payment Method
        </Text>
        <Text variant="body" style={styles.subtitle}>
          Choose how you'd like to pay for this service
        </Text>

        {/* Saved Payment Methods */}
        {paymentMethods && paymentMethods.length > 0 && (
          <View style={styles.section}>
            <Text variant="h3" style={styles.sectionTitle}>
              Saved Methods
            </Text>
            {paymentMethods.map((method) => (
              <PaymentMethodCard
                key={method.id}
                method={method}
                isSelected={selectedMethod?.id === method.id}
                onSelect={() => handleSelectMethod(method)}
                getIcon={getPaymentMethodIcon}
                getLabel={getPaymentMethodLabel}
                getDescription={getPaymentMethodDescription}
                theme={theme}
              />
            ))}
          </View>
        )}

        {/* Quick Payment Options */}
        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitle}>
            Quick Payment Options
          </Text>

          {/* Mobile Money */}
          <PaymentMethodCard
            method={{
              id: 'new-momo',
              type: 'momo',
              isDefault: false,
            }}
            isSelected={selectedMethod?.id === 'new-momo'}
            onSelect={() => handleSelectMethod({
              id: 'new-momo',
              type: 'momo',
              isDefault: false,
            })}
            getIcon={getPaymentMethodIcon}
            getLabel={() => 'Mobile Money'}
            getDescription={() => 'Pay with MTN, Vodafone, or AirtelTigo'}
            theme={theme}
          />

          {/* Cash on Delivery */}
          <PaymentMethodCard
            method={{
              id: 'cash',
              type: 'cash',
              isDefault: false,
            }}
            isSelected={selectedMethod?.id === 'cash'}
            onSelect={() => handleSelectMethod({
              id: 'cash',
              type: 'cash',
              isDefault: false,
            })}
            getIcon={getPaymentMethodIcon}
            getLabel={() => 'Cash on Delivery'}
            getDescription={() => 'Pay when service is completed'}
            theme={theme}
          />
        </View>

        {/* Booking Summary */}
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.summaryRow}>
            <Text variant="body">Service Total</Text>
            <Text variant="h3">
              GHS {state.bookingData.totalAmount?.toFixed(2) || '0.00'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={[styles.footer, { backgroundColor: theme.colors.background }]}>
        <Button
          onPress={handleContinue}
          disabled={!selectedMethod}
          accessibilityLabel="Continue to payment"
        >
          Continue
        </Button>
      </View>
    </View>
  );
};

/**
 * PaymentMethodCard Component
 */
interface PaymentMethodCardProps {
  method: PaymentMethod;
  isSelected: boolean;
  onSelect: () => void;
  getIcon: (type: string) => keyof typeof Ionicons.glyphMap;
  getLabel: (method: PaymentMethod) => string;
  getDescription: (method: PaymentMethod) => string;
  theme: any;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  method,
  isSelected,
  onSelect,
  getIcon,
  getLabel,
  getDescription,
  theme,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.methodCard,
        {
          backgroundColor: theme.colors.surface,
          borderColor: isSelected ? theme.colors.primary : theme.colors.border,
          borderWidth: isSelected ? 2 : 1,
        },
      ]}
      onPress={onSelect}
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected }}
      accessibilityLabel={`${getLabel(method)} payment method`}
    >
      <View style={styles.methodIcon}>
        <Ionicons
          name={getIcon(method.type)}
          size={24}
          color={isSelected ? theme.colors.primary : theme.colors.text}
        />
      </View>

      <View style={styles.methodInfo}>
        <Text variant="h3" style={styles.methodLabel}>
          {getLabel(method)}
        </Text>
        {getDescription(method) && (
          <Text variant="caption" style={styles.methodDescription}>
            {getDescription(method)}
          </Text>
        )}
        {method.isDefault && (
          <View style={[styles.defaultBadge, { backgroundColor: theme.colors.primary }]}>
            <Text variant="caption" style={styles.defaultBadgeText}>
              Default
            </Text>
          </View>
        )}
      </View>

      <View style={styles.radioButton}>
        {isSelected ? (
          <Ionicons name="radio-button-on" size={24} color={theme.colors.primary} />
        ) : (
          <Ionicons name="radio-button-off" size={24} color={theme.colors.border} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 24,
    opacity: 0.7,
  },
  loadingText: {
    marginTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodInfo: {
    flex: 1,
  },
  methodLabel: {
    marginBottom: 4,
  },
  methodDescription: {
    opacity: 0.7,
  },
  defaultBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  defaultBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
  },
  radioButton: {
    marginLeft: 12,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
});
