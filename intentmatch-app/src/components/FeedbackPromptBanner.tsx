import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../theme/colors';
import { ScheduledDate, User } from '../types';
import { formatTimeSlot } from '../utils/schedulingAlgorithm';

interface FeedbackPromptBannerProps {
  scheduledDate: ScheduledDate;
  matchedUser: User;
  onPress: () => void;
}

export default function FeedbackPromptBanner({
  scheduledDate,
  matchedUser,
  onPress,
}: FeedbackPromptBannerProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="chatbox-ellipses" size={24} color={colors.primary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>How was your date?</Text>
        <Text style={styles.subtitle}>
          Share feedback about your date with {matchedUser.name}
        </Text>
        <Text style={styles.dateInfo}>
          {formatTimeSlot(scheduledDate.selectedSlot)}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={colors.gray[400]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    ...shadows.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.errorLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.secondary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: 4,
  },
  dateInfo: {
    fontSize: 12,
    color: colors.gray[500],
  },
});
