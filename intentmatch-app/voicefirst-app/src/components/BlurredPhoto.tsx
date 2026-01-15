import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, Text, ViewStyle, ImageStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { calculateBlurIntensity, getUnlockProgress, isPhotoUnlocked } from '../utils/blurUtils';

interface BlurredPhotoProps {
  photoUri: string;
  messageCount: number;
  showProgress?: boolean;
  showCelebration?: boolean;
  style?: ViewStyle;
  imageStyle?: ImageStyle;
  borderRadius?: number;
}

export default function BlurredPhoto({
  photoUri,
  messageCount,
  showProgress = false,
  showCelebration = true,
  style,
  imageStyle,
  borderRadius = 0,
}: BlurredPhotoProps) {
  const blurIntensity = calculateBlurIntensity(messageCount);
  const progress = getUnlockProgress(messageCount);
  const unlocked = isPhotoUnlocked(messageCount);

  // Animation values
  const celebrationScale = useRef(new Animated.Value(0)).current;
  const celebrationOpacity = useRef(new Animated.Value(0)).current;
  const progressBarWidth = useRef(new Animated.Value(0)).current;

  // Animate celebration when photo is unlocked
  useEffect(() => {
    if (unlocked && showCelebration) {
      Animated.sequence([
        Animated.parallel([
          Animated.spring(celebrationScale, {
            toValue: 1,
            friction: 5,
            tension: 100,
            useNativeDriver: true,
          }),
          Animated.timing(celebrationOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(2000),
        Animated.timing(celebrationOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [unlocked, showCelebration]);

  // Animate progress bar
  useEffect(() => {
    Animated.spring(progressBarWidth, {
      toValue: progress,
      friction: 8,
      tension: 40,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return (
    <View style={[styles.container, style]}>
      {/* Photo */}
      <Image
        source={{ uri: photoUri }}
        style={[styles.photo, imageStyle, { borderRadius }]}
      />

      {/* Blur overlay */}
      {blurIntensity > 0 && (
        <View style={[styles.blurContainer, { borderRadius }]}>
          <BlurView
            intensity={blurIntensity}
            style={StyleSheet.absoluteFill}
            tint="light"
          />
        </View>
      )}

      {/* Lock icon for fully locked photos */}
      {messageCount === 0 && (
        <View style={styles.lockIconContainer}>
          <View style={styles.lockIconBackground}>
            <Ionicons name="lock-closed" size={40} color="#fff" />
          </View>
          <Text style={styles.lockText}>Send a message to reveal</Text>
        </View>
      )}

      {/* Progress indicator */}
      {showProgress && !unlocked && messageCount > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressBarWidth.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{progress}% unlocked</Text>
        </View>
      )}

      {/* Celebration overlay */}
      {unlocked && showCelebration && (
        <Animated.View
          style={[
            styles.celebrationContainer,
            {
              opacity: celebrationOpacity,
              transform: [{ scale: celebrationScale }],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(230, 57, 70, 0.95)', 'rgba(244, 162, 97, 0.95)']}
            style={styles.celebrationBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="sparkles" size={60} color="#fff" />
            <Text style={styles.celebrationTitle}>Photo Unlocked!</Text>
            <Text style={styles.celebrationSubtitle}>
              You've built a great connection
            </Text>
          </LinearGradient>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  blurContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  lockIconContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIconBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 50,
    padding: 20,
    marginBottom: 12,
  },
  lockText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  progressText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  celebrationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  celebrationBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  celebrationTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 16,
    textAlign: 'center',
  },
  celebrationSubtitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.9,
  },
});
