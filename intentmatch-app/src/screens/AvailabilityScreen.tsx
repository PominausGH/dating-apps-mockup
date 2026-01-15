import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../theme/colors';

interface TimeSlot {
  id: string;
  label: string;
  icon: string;
  time: string;
}

interface DaySchedule {
  date: string;
  dayName: string;
  dayNumber: number;
  slots: TimeSlot[];
}

const TIME_SLOTS: TimeSlot[] = [
  { id: 'morning', label: 'Morning', icon: 'sunny-outline', time: '9am - 12pm' },
  { id: 'afternoon', label: 'Afternoon', icon: 'partly-sunny-outline', time: '12pm - 5pm' },
  { id: 'evening', label: 'Evening', icon: 'moon-outline', time: '5pm - 9pm' },
];

const generateWeek = (): DaySchedule[] => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const week: DaySchedule[] = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    week.push({
      date: date.toISOString().split('T')[0],
      dayName: days[date.getDay()],
      dayNumber: date.getDate(),
      slots: TIME_SLOTS,
    });
  }
  return week;
};

export default function AvailabilityScreen() {
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedSlots, setSelectedSlots] = useState<{ [key: string]: string[] }>({});
  const week = generateWeek();

  const toggleSlot = (dayIndex: number, slotId: string) => {
    const dayKey = week[dayIndex].date;
    const currentSlots = selectedSlots[dayKey] || [];

    if (currentSlots.includes(slotId)) {
      setSelectedSlots({
        ...selectedSlots,
        [dayKey]: currentSlots.filter((s) => s !== slotId),
      });
    } else {
      setSelectedSlots({
        ...selectedSlots,
        [dayKey]: [...currentSlots, slotId],
      });
    }
  };

  const isSlotSelected = (dayIndex: number, slotId: string) => {
    const dayKey = week[dayIndex].date;
    return (selectedSlots[dayKey] || []).includes(slotId);
  };

  const totalSlots = Object.values(selectedSlots).flat().length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Availability</Text>
        <Text style={styles.subtitle}>Set when you're free to meet</Text>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{totalSlots}</Text>
          <Text style={styles.statLabel}>Time slots set</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statNumber}>87%</Text>
          <Text style={styles.statLabel}>Match rate</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.daysContainer}
        contentContainerStyle={styles.daysContent}
      >
        {week.map((day, index) => {
          const hasSlots = (selectedSlots[day.date] || []).length > 0;
          return (
            <TouchableOpacity
              key={day.date}
              style={[
                styles.dayCard,
                selectedDay === index && styles.dayCardActive,
              ]}
              onPress={() => setSelectedDay(index)}
            >
              <Text
                style={[
                  styles.dayName,
                  selectedDay === index && styles.dayNameActive,
                ]}
              >
                {day.dayName}
              </Text>
              <Text
                style={[
                  styles.dayNumber,
                  selectedDay === index && styles.dayNumberActive,
                ]}
              >
                {day.dayNumber}
              </Text>
              {hasSlots && (
                <View
                  style={[
                    styles.dayIndicator,
                    selectedDay === index && styles.dayIndicatorActive,
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.slotsContainer}>
        <Text style={styles.slotsTitle}>
          {week[selectedDay].dayName}, {week[selectedDay].dayNumber}
        </Text>
        <Text style={styles.slotsSubtitle}>
          Tap the times you're available for a date
        </Text>

        {TIME_SLOTS.map((slot) => {
          const isSelected = isSlotSelected(selectedDay, slot.id);
          return (
            <TouchableOpacity
              key={slot.id}
              style={[styles.slotCard, isSelected && styles.slotCardActive]}
              onPress={() => toggleSlot(selectedDay, slot.id)}
            >
              <View
                style={[
                  styles.slotIconContainer,
                  isSelected && styles.slotIconContainerActive,
                ]}
              >
                <Ionicons
                  name={slot.icon as any}
                  size={24}
                  color={isSelected ? colors.white : colors.primary}
                />
              </View>
              <View style={styles.slotContent}>
                <Text
                  style={[styles.slotLabel, isSelected && styles.slotLabelActive]}
                >
                  {slot.label}
                </Text>
                <Text style={styles.slotTime}>{slot.time}</Text>
              </View>
              <View
                style={[
                  styles.slotCheckbox,
                  isSelected && styles.slotCheckboxActive,
                ]}
              >
                {isSelected && (
                  <Ionicons name="checkmark" size={20} color={colors.white} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save Availability</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.secondary,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray[500],
    marginTop: 4,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    ...shadows.md,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: colors.gray[500],
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.gray[200],
    marginHorizontal: 20,
  },
  daysContainer: {
    marginTop: 24,
    maxHeight: 100,
  },
  daysContent: {
    paddingHorizontal: 16,
  },
  dayCard: {
    width: 60,
    height: 80,
    backgroundColor: colors.white,
    borderRadius: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  dayCardActive: {
    backgroundColor: colors.primary,
  },
  dayName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray[500],
  },
  dayNameActive: {
    color: colors.white,
    opacity: 0.8,
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.secondary,
    marginTop: 4,
  },
  dayNumberActive: {
    color: colors.white,
  },
  dayIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
  dayIndicatorActive: {
    backgroundColor: colors.white,
  },
  slotsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  slotsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.secondary,
  },
  slotsSubtitle: {
    fontSize: 14,
    color: colors.gray[500],
    marginTop: 4,
    marginBottom: 16,
  },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...shadows.sm,
  },
  slotCardActive: {
    backgroundColor: colors.primary,
  },
  slotIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotIconContainerActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  slotContent: {
    flex: 1,
    marginLeft: 16,
  },
  slotLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
  },
  slotLabelActive: {
    color: colors.white,
  },
  slotTime: {
    fontSize: 14,
    color: colors.gray[500],
    marginTop: 2,
  },
  slotCheckbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotCheckboxActive: {
    backgroundColor: colors.white,
    borderColor: colors.white,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    ...shadows.md,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
});
