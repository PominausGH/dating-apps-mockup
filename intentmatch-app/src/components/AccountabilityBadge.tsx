import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { getAccountabilityBadge } from '../utils/feedbackUtils';

interface AccountabilityBadgeProps {
  score: number;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default function AccountabilityBadge({
  score,
  showLabel = true,
  size = 'medium',
}: AccountabilityBadgeProps) {
  const badge = getAccountabilityBadge(score);

  const sizeStyles = {
    small: {
      container: styles.containerSmall,
      emoji: styles.emojiSmall,
      score: styles.scoreSmall,
      label: styles.labelSmall,
    },
    medium: {
      container: styles.containerMedium,
      emoji: styles.emojiMedium,
      score: styles.scoreMedium,
      label: styles.labelMedium,
    },
    large: {
      container: styles.containerLarge,
      emoji: styles.emojiLarge,
      score: styles.scoreLarge,
      label: styles.labelLarge,
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <View style={[styles.container, currentSize.container]}>
      <View style={[styles.scoreContainer, { backgroundColor: badge.color }]}>
        <Text style={[styles.emoji, currentSize.emoji]}>{badge.emoji}</Text>
        <Text style={[styles.score, currentSize.score]}>{score}</Text>
      </View>
      {showLabel && (
        <Text style={[styles.label, currentSize.label, { color: badge.color }]}>
          {badge.label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  emoji: {
    fontSize: 14,
  },
  score: {
    fontWeight: '700',
    color: colors.white,
  },
  label: {
    fontWeight: '600',
    marginTop: 4,
  },
  // Small size
  containerSmall: {},
  emojiSmall: {
    fontSize: 10,
  },
  scoreSmall: {
    fontSize: 12,
  },
  labelSmall: {
    fontSize: 10,
  },
  // Medium size
  containerMedium: {},
  emojiMedium: {
    fontSize: 14,
  },
  scoreMedium: {
    fontSize: 14,
  },
  labelMedium: {
    fontSize: 12,
  },
  // Large size
  containerLarge: {},
  emojiLarge: {
    fontSize: 18,
  },
  scoreLarge: {
    fontSize: 18,
  },
  labelLarge: {
    fontSize: 14,
  },
});
