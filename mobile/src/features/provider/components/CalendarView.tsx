/**
 * Calendar View Component
 *
 * Custom calendar component for displaying bookings
 * Requirement 9.10
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from '../../../shared/components/Text';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { spacing } from '../../../core/theme/spacing';

interface CalendarViewProps {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
    markedDates?: Record<string, { count: number; color: string }>;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

/**
 * Calendar View Component
 * Requirement 9.10: Build calendar view with all bookings
 */
export const CalendarView: React.FC<CalendarViewProps> = ({
    selectedDate,
    onDateSelect,
    markedDates = {},
}) => {
    const { theme } = useTheme();

    const { year, month } = useMemo(() => {
        return {
            year: selectedDate.getFullYear(),
            month: selectedDate.getMonth(),
        };
    }, [selectedDate]);

    const calendarDays = useMemo(() => {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days: (Date | null)[] = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // Add all days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }

        return days;
    }, [year, month]);

    const formatDateKey = (date: Date): string => {
        return date.toISOString().split('T')[0];
    };

    const isToday = (date: Date): boolean => {
        const today = new Date();
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    };

    const isSelected = (date: Date): boolean => {
        return (
            date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear()
        );
    };

    return (
        <View style={styles.container}>
            {/* Month/Year Header */}
            <View style={styles.header}>
                <Text variant="h6">
                    {MONTHS[month]} {year}
                </Text>
            </View>

            {/* Day Names */}
            <View style={styles.dayNames}>
                {DAYS.map((day) => (
                    <View key={day} style={styles.dayNameCell}>
                        <Text variant="caption" color="textSecondary">
                            {day}
                        </Text>
                    </View>
                ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.grid}>
                {calendarDays.map((date, index) => {
                    if (!date) {
                        return <View key={`empty-${index}`} style={styles.dayCell} />;
                    }

                    const dateKey = formatDateKey(date);
                    const marked = markedDates[dateKey];
                    const today = isToday(date);
                    const selected = isSelected(date);

                    return (
                        <Pressable
                            key={dateKey}
                            style={[
                                styles.dayCell,
                                today && styles.todayCell,
                                selected && [
                                    styles.selectedCell,
                                    { backgroundColor: theme.colors.primary },
                                ],
                            ]}
                            onPress={() => onDateSelect(date)}
                            accessibilityRole="button"
                            accessibilityLabel={`Select ${date.toLocaleDateString()}`}
                        >
                            <Text
                                variant="bodySmall"
                                style={[
                                    styles.dayText,
                                    today && !selected && { color: theme.colors.primary },
                                    selected && styles.selectedText,
                                ]}
                            >
                                {date.getDate()}
                            </Text>
                            {marked && (
                                <View
                                    style={[
                                        styles.marker,
                                        { backgroundColor: marked.color },
                                    ]}
                                >
                                    {marked.count > 1 && (
                                        <Text variant="caption" style={styles.markerText}>
                                            {marked.count}
                                        </Text>
                                    )}
                                </View>
                            )}
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: spacing.md,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    dayNames: {
        flexDirection: 'row',
        marginBottom: spacing.sm,
    },
    dayNameCell: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: spacing.xs,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: '14.28%', // 100% / 7 days
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    todayCell: {
        borderWidth: 1,
        borderColor: '#BDBDBD',
        borderRadius: 8,
    },
    selectedCell: {
        borderRadius: 8,
    },
    dayText: {
        textAlign: 'center',
    },
    selectedText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    marker: {
        position: 'absolute',
        bottom: 4,
        width: 6,
        height: 6,
        borderRadius: 3,
        minWidth: 16,
        minHeight: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    markerText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '600',
    },
});
