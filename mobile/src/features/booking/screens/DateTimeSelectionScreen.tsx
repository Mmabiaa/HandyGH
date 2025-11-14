import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../../core/navigation/types';
import { useQuery } from '@tanstack/react-query';
import { BookingService } from '../../../core/api/services';
import { TimeSlot } from '../../../core/api/types';
import { formatTime } from '../../../shared/utils/formatting';

type DateTimeSelectionScreenNavigationProp = NativeStackNavigationProp<
  CustomerStackParamList,
  'DateTimeSelection'
>;

type DateTimeSelectionScreenRouteProp = RouteProp<
  CustomerStackParamList,
  'DateTimeSelection'
>;

/**
 * DateTimeSelectionScreen
 *
 * Allows customers to select a date and time slot for their booking.
 * Fetches provider availability and highlights available dates.
 *
 * Requirements:
 * - 4.3: Fetch provider availability from API
 * - 4.4: Display available dates in calendar
 * - 4.5: Show available time slots with conflict detection
 */
export const DateTimeSelectionScreen: React.FC = () => {
  const navigation = useNavigation<DateTimeSelectionScreenNavigationProp>();
  const route = useRoute<DateTimeSelectionScreenRouteProp>();
  const { providerId, serviceId } = route.params;

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [datesWithAvailability, setDatesWithAvailability] = useState<Set<string>>(new Set());

  // Generate dates for the next 30 days
  const availableDates = useMemo(() => {
    const dates: Date[] = [];
    const today = new Date();

    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }

    return dates;
  }, []);

  // Fetch availability for the first 7 days to show which dates have slots
  // This provides visual feedback to users about which dates are available
  const { data: initialAvailability } = useQuery({
    queryKey: ['initial-availability', providerId, serviceId],
    queryFn: async () => {
      const availabilityPromises = availableDates.slice(0, 7).map(date => {
        const dateString = date.toISOString().split('T')[0];
        return BookingService.checkAvailability({
          providerId,
          date: dateString,
          serviceId,
        }).then(slots => ({
          date: dateString,
          hasAvailability: slots.length > 0 && slots.some(slot => !slot.isBooked),
        })).catch(() => ({
          date: dateString,
          hasAvailability: false,
        }));
      });

      return Promise.all(availabilityPromises);
    },
  });

  // Update dates with availability when data changes
  useEffect(() => {
    if (initialAvailability) {
      const datesSet = new Set<string>();
      initialAvailability.forEach((item: { date: string; hasAvailability: boolean }) => {
        if (item.hasAvailability) {
          datesSet.add(item.date);
        }
      });
      setDatesWithAvailability(datesSet);
    }
  }, [initialAvailability]);

  // Fetch availability for selected date
  const {
    data: timeSlots,
    isLoading: isLoadingSlots,
    error: slotsError,
  } = useQuery({
    queryKey: ['availability', providerId, selectedDate, serviceId],
    queryFn: () =>
      BookingService.checkAvailability({
        providerId,
        date: selectedDate!,
        serviceId,
      }),
    enabled: !!selectedDate,
  });

  // Handle date selection
  const handleDateSelect = useCallback((date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    setSelectedDate(dateString);
    setSelectedTime(null); // Reset time when date changes
  }, []);

  // Handle time slot selection
  const handleTimeSelect = useCallback((time: string) => {
    setSelectedTime(time);
  }, []);

  // Handle continue to location selection
  const handleContinue = useCallback(() => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Selection Required', 'Please select both date and time');
      return;
    }

    navigation.navigate('LocationSelection', {
      providerId,
      serviceId,
      scheduledDate: selectedDate,
      scheduledTime: selectedTime,
    });
  }, [navigation, providerId, serviceId, selectedDate, selectedTime]);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <Text style={styles.sectionHint}>
            Dates with a green dot have available time slots
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateScrollContent}
          >
            {availableDates.map((date, index) => (
              <DateCard
                key={index}
                date={date}
                isSelected={selectedDate === date.toISOString().split('T')[0]}
                hasAvailability={datesWithAvailability.has(date.toISOString().split('T')[0])}
                onSelect={handleDateSelect}
              />
            ))}
          </ScrollView>
        </View>

        {/* Time Slot Selection */}
        {selectedDate && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Time</Text>
            {isLoadingSlots ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading available times...</Text>
              </View>
            ) : slotsError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Failed to load time slots</Text>
              </View>
            ) : !timeSlots || timeSlots.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No available time slots for this date</Text>
                <Text style={styles.emptySubtext}>Please select another date</Text>
              </View>
            ) : (
              <View style={styles.timeSlotsGrid}>
                {timeSlots.map((slot, index) => (
                  <TimeSlotCard
                    key={index}
                    slot={slot}
                    isSelected={selectedTime === slot.startTime}
                    onSelect={handleTimeSelect}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Selection Summary */}
        {selectedDate && selectedTime && (
          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>Your Selection</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Date:</Text>
              <Text style={styles.summaryValue}>
                {new Date(selectedDate).toLocaleDateString('en-GH', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Time:</Text>
              <Text style={styles.summaryValue}>{formatTime(selectedTime)}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!selectedDate || !selectedTime) && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedDate || !selectedTime}
          accessibilityLabel="Continue to location selection"
          accessibilityRole="button"
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

/**
 * DateCard Component
 * Displays individual date in calendar with availability indicator
 */
interface DateCardProps {
  date: Date;
  isSelected: boolean;
  hasAvailability?: boolean;
  onSelect: (date: Date) => void;
}

const DateCard: React.FC<DateCardProps> = ({ date, isSelected, hasAvailability, onSelect }) => {
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
  const dayNumber = date.getDate();
  const monthName = date.toLocaleDateString('en-US', { month: 'short' });

  return (
    <TouchableOpacity
      style={[
        styles.dateCard,
        isSelected && styles.dateCardSelected,
        hasAvailability && !isSelected && styles.dateCardAvailable,
      ]}
      onPress={() => onSelect(date)}
      accessibilityLabel={`Select date ${date.toLocaleDateString()}${hasAvailability ? ', has availability' : ''}`}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
    >
      <Text style={[styles.dayName, isSelected && styles.dayNameSelected]}>{dayName}</Text>
      <Text style={[styles.dayNumber, isSelected && styles.dayNumberSelected]}>
        {dayNumber}
      </Text>
      <Text style={[styles.monthName, isSelected && styles.monthNameSelected]}>
        {monthName}
      </Text>
      {hasAvailability && !isSelected && (
        <View style={styles.availabilityDot} />
      )}
    </TouchableOpacity>
  );
};

/**
 * TimeSlotCard Component
 * Displays individual time slot
 */
interface TimeSlotCardProps {
  slot: TimeSlot;
  isSelected: boolean;
  onSelect: (time: string) => void;
}

const TimeSlotCard: React.FC<TimeSlotCardProps> = ({ slot, isSelected, onSelect }) => {
  const isBooked = slot.isBooked;

  return (
    <TouchableOpacity
      style={[
        styles.timeSlotCard,
        isSelected && styles.timeSlotCardSelected,
        isBooked && styles.timeSlotCardBooked,
      ]}
      onPress={() => !isBooked && onSelect(slot.startTime)}
      disabled={isBooked}
      accessibilityLabel={`${formatTime(slot.startTime)} ${isBooked ? 'unavailable' : 'available'}`}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected, disabled: isBooked }}
    >
      <Text
        style={[
          styles.timeSlotText,
          isSelected && styles.timeSlotTextSelected,
          isBooked && styles.timeSlotTextBooked,
        ]}
      >
        {formatTime(slot.startTime)}
      </Text>
      {isBooked && <Text style={styles.bookedLabel}>Booked</Text>}
    </TouchableOpacity>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  sectionHint: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 12,
  },
  dateScrollContent: {
    paddingRight: 16,
  },
  dateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    minWidth: 70,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  dateCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  dateCardAvailable: {
    borderColor: '#34C759',
  },
  availabilityDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34C759',
  },
  dayName: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  dayNameSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  dayNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  dayNumberSelected: {
    color: '#007AFF',
  },
  monthName: {
    fontSize: 12,
    color: '#666666',
  },
  monthNameSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  timeSlotCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 6,
    minWidth: '30%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  timeSlotCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  timeSlotCardBooked: {
    backgroundColor: '#F5F5F5',
    borderColor: '#CCCCCC',
  },
  timeSlotText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  timeSlotTextSelected: {
    color: '#007AFF',
  },
  timeSlotTextBooked: {
    color: '#999999',
  },
  bookedLabel: {
    fontSize: 11,
    color: '#999999',
    marginTop: 4,
  },
  summarySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#666666',
    flex: 1,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 2,
    textAlign: 'right',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
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
