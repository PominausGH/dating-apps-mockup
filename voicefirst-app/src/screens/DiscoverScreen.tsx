import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { colors, shadows } from '../theme/colors';
import {
  createSound,
  playSound,
  pauseSound,
  stopSound,
  unloadSound,
  getSoundStatus,
} from '../utils/audioRecording';
import { useDiscoverProfiles } from '../hooks/useDiscoverProfiles';
import { useAuth } from '../contexts/AuthContext';
import { recordSwipe } from '../services/matchService';
import { VoiceProfile } from '../types';

const { width } = Dimensions.get('window');

export default function DiscoverScreen() {
  const { currentUser } = useAuth();
  const { profiles, loading: profilesLoading, error: profilesError } = useDiscoverProfiles();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPositionSec, setCurrentPositionSec] = useState(0);

  const sound = useRef<Audio.Sound | null>(null);
  const playbackInterval = useRef<NodeJS.Timeout | null>(null);
  const waveformAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const currentProfile = profiles[currentIndex];

  // Waveform animation effect
  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveformAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(waveformAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      waveformAnim.setValue(0);
    }
  }, [isPlaying]);

  // Monitor playback progress
  useEffect(() => {
    if (isPlaying && sound.current) {
      playbackInterval.current = setInterval(async () => {
        const status = await getSoundStatus(sound.current!);
        if (status.isPlaying) {
          const progressPercent =
            (status.positionMillis / status.durationMillis) * 100;
          setProgress(progressPercent);
          setCurrentPositionSec(status.positionMillis / 1000);
        }

        if (status.didJustFinish) {
          setIsPlaying(false);
          setProgress(0);
          setCurrentPositionSec(0);
        }
      }, 100);

      return () => {
        if (playbackInterval.current) {
          clearInterval(playbackInterval.current);
        }
      };
    }
  }, [isPlaying]);

  // Cleanup on unmount or profile change
  useEffect(() => {
    return () => {
      if (sound.current) {
        stopAndUnloadCurrentSound();
      }
    };
  }, [currentIndex]);

  const stopAndUnloadCurrentSound = async () => {
    if (sound.current) {
      try {
        await stopSound(sound.current);
        await unloadSound(sound.current);
      } catch (error) {
        console.error('Error stopping sound:', error);
      }
      sound.current = null;
    }
    if (playbackInterval.current) {
      clearInterval(playbackInterval.current);
      playbackInterval.current = null;
    }
    setIsPlaying(false);
    setProgress(0);
    setCurrentPositionSec(0);
  };

  const handleLike = async () => {
    if (!currentUser || !currentProfile) return;

    await stopAndUnloadCurrentSound();

    try {
      const result = await recordSwipe(currentUser.uid, currentProfile.id, 'like');
      if (result.isMatch) {
        Alert.alert(
          'It\'s a Match!',
          `You and ${currentProfile.name} liked each other! Start a voice conversation.`,
          [{ text: 'Start Chatting', onPress: () => {} }]
        );
      }
    } catch (error) {
      console.error('Error recording like:', error);
    }

    setCurrentIndex((prev) => prev + 1);
  };

  const handleSkip = async () => {
    if (!currentUser || !currentProfile) return;

    await stopAndUnloadCurrentSound();

    try {
      await recordSwipe(currentUser.uid, currentProfile.id, 'pass');
    } catch (error) {
      console.error('Error recording skip:', error);
    }

    setCurrentIndex((prev) => prev + 1);
  };

  const togglePlay = async () => {
    if (!currentProfile) return;

    try {
      if (isPlaying && sound.current) {
        // Pause current playback
        await pauseSound(sound.current);
        setIsPlaying(false);
      } else {
        // Start or resume playback
        if (!sound.current) {
          // For demo purposes, use a placeholder or actual file
          // In real app, currentProfile.voiceUri would point to actual audio file
          if (!currentProfile.voiceUri) {
            Alert.alert(
              'No Audio',
              'This profile doesn\'t have a voice recording yet.',
              [{ text: 'OK' }]
            );
            return;
          }

          const newSound = await createSound(currentProfile.voiceUri);
          sound.current = newSound;

          // Set up playback listener
          newSound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
              setIsPlaying(false);
              setProgress(0);
              setCurrentPositionSec(0);
            }
          });
        }

        await playSound(sound.current);
        setIsPlaying(true);
      }
    } catch (error) {
      Alert.alert('Playback Error', 'Failed to play audio');
      console.error('Playback error:', error);
    }
  };

  const renderWaveform = () => {
    const bars = [];
    for (let i = 0; i < 40; i++) {
      const height = Math.random() * 30 + 10;
      const animatedHeight = waveformAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [height * 0.5, height],
      });

      bars.push(
        <Animated.View
          key={i}
          style={[
            styles.waveBar,
            {
              height: isPlaying ? animatedHeight : height * 0.5,
              opacity: progress / 100 > i / 40 ? 1 : 0.4,
            },
          ]}
        />
      );
    }
    return bars;
  };

  if (profilesLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Finding voices for you...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (profilesError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color={colors.error} />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>{profilesError}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (currentIndex >= profiles.length || profiles.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="headset-outline" size={60} color={colors.gray[300]} />
          </View>
          <Text style={styles.emptyTitle}>No more voices</Text>
          <Text style={styles.emptySubtitle}>Check back later for new people to listen to!</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>VoiceFirst</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options-outline" size={24} color={colors.dark} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContainer}>
        <View style={styles.card}>
          {/* Blurred Photo Area */}
          <LinearGradient
            colors={['#818CF8', '#C084FC', '#F472B6']}
            style={styles.photoArea}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.blurredAvatar}>
              <Ionicons name="person" size={50} color="rgba(255,255,255,0.5)" />
            </View>
            <View style={styles.lockBadge}>
              <Ionicons name="lock-closed" size={12} color={colors.white} />
              <Text style={styles.lockText}>Photo unlocks after voice match</Text>
            </View>
          </LinearGradient>

          {/* Profile Info */}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{currentProfile.name}</Text>
            <Text style={styles.profileDetails}>
              {currentProfile.age} • {currentProfile.distance}
            </Text>
            <Text style={styles.profileTagline}>"{currentProfile.tagline}"</Text>

            {/* Voice Player */}
            <View style={styles.voicePlayer}>
              <TouchableOpacity style={styles.playButton} onPress={togglePlay}>
                <LinearGradient
                  colors={colors.gradient.primary}
                  style={styles.playButtonGradient}
                >
                  <Ionicons
                    name={isPlaying ? 'pause' : 'play'}
                    size={28}
                    color={colors.white}
                  />
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.waveformContainer}>
                <View style={styles.waveform}>{renderWaveform()}</View>
                <Text style={styles.duration}>
                  {Math.floor(currentPositionSec)}s / {currentProfile.voiceDuration}s
                </Text>
              </View>
            </View>

            {/* Prompt */}
            <View style={styles.promptContainer}>
              <Ionicons name="mic" size={16} color={colors.primary} />
              <Text style={styles.promptText}>Tap play to hear their voice intro</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
              <LinearGradient
                colors={colors.gradient.primary}
                style={styles.likeButtonGradient}
              >
                <Ionicons name="heart" size={20} color={colors.white} />
                <Text style={styles.likeButtonText}>Like Voice</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Queue indicator */}
      <View style={styles.queueIndicator}>
        <Text style={styles.queueText}>
          {profiles.length - currentIndex} voices waiting
        </Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logo: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  cardContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    overflow: 'hidden',
    ...shadows.xl,
  },
  photoArea: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  blurredAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockBadge: {
    position: 'absolute',
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  lockText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
  profileInfo: {
    padding: 20,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.dark,
  },
  profileDetails: {
    fontSize: 16,
    color: colors.gray[500],
    marginTop: 4,
  },
  profileTagline: {
    fontSize: 16,
    color: colors.dark,
    fontStyle: 'italic',
    marginTop: 12,
  },
  voicePlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light,
    borderRadius: 16,
    padding: 12,
    marginTop: 20,
  },
  playButton: {
    marginRight: 12,
  },
  playButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveformContainer: {
    flex: 1,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    gap: 2,
  },
  waveBar: {
    width: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  duration: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 4,
  },
  promptContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  promptText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 6,
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  skipButton: {
    flex: 1,
    backgroundColor: colors.errorLight,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
  likeButton: {
    flex: 2,
  },
  likeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 16,
    gap: 8,
  },
  likeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  queueIndicator: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  queueText: {
    fontSize: 14,
    color: colors.gray[500],
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.dark,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.gray[500],
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.gray[500],
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.dark,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
  },
});
