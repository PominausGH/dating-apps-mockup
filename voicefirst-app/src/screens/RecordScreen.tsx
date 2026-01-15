import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { colors, shadows } from '../theme/colors';
import {
  startRecording,
  stopRecording,
  getRecordingStatus,
  createSound,
  playSound,
  pauseSound,
  unloadSound,
  saveRecording,
  deleteRecording,
  formatDuration,
} from '../utils/audioRecording';

const PROMPTS = [
  "Tell us about yourself in 30 seconds",
  "What's your idea of a perfect date?",
  "What makes you laugh?",
  "What are you passionate about?",
  "Describe your perfect weekend",
];

export default function RecordScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [meteringValues, setMeteringValues] = useState<number[]>([]);

  const recording = useRef<Audio.Recording | null>(null);
  const sound = useRef<Audio.Sound | null>(null);
  const meteringInterval = useRef<NodeJS.Timeout | null>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isRecording) {
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Wave animation
      Animated.loop(
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();

      // Monitor recording status
      meteringInterval.current = setInterval(async () => {
        if (recording.current) {
          const status = await getRecordingStatus(recording.current);
          const timeInSeconds = status.durationMillis / 1000;
          setRecordingTime(timeInSeconds);

          // Collect metering values for waveform
          if (status.metering !== undefined) {
            setMeteringValues((prev) => [...prev, status.metering!]);
          }

          // Auto-stop at 30 seconds
          if (timeInSeconds >= 30) {
            handleStopRecording();
          }
        }
      }, 100);

      return () => {
        if (meteringInterval.current) {
          clearInterval(meteringInterval.current);
        }
      };
    } else {
      pulseAnim.setValue(1);
      waveAnim.setValue(0);
    }
  }, [isRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sound.current) {
        unloadSound(sound.current);
      }
      if (meteringInterval.current) {
        clearInterval(meteringInterval.current);
      }
    };
  }, []);

  const handleStartRecording = async () => {
    try {
      const newRecording = await startRecording();
      recording.current = newRecording;
      setIsRecording(true);
      setRecordingTime(0);
      setMeteringValues([]);
      setHasRecording(false);
    } catch (error) {
      Alert.alert(
        'Recording Error',
        'Failed to start recording. Please check microphone permissions.',
        [{ text: 'OK' }]
      );
      console.error('Start recording error:', error);
    }
  };

  const handleStopRecording = async () => {
    if (!recording.current) return;

    try {
      const { uri, duration } = await stopRecording(recording.current);
      setIsRecording(false);

      if (meteringInterval.current) {
        clearInterval(meteringInterval.current);
        meteringInterval.current = null;
      }

      if (duration >= 5) {
        setRecordingUri(uri);
        setHasRecording(true);
        setRecordingTime(duration);
      } else {
        Alert.alert(
          'Recording Too Short',
          'Please record at least 5 seconds.',
          [{ text: 'OK' }]
        );
        await deleteRecording(uri);
        setRecordingTime(0);
        setMeteringValues([]);
      }

      recording.current = null;
    } catch (error) {
      Alert.alert('Error', 'Failed to stop recording');
      console.error('Stop recording error:', error);
      setIsRecording(false);
    }
  };

  const handlePlayPreview = async () => {
    if (!recordingUri) return;

    try {
      if (isPlaying && sound.current) {
        await pauseSound(sound.current);
        setIsPlaying(false);
      } else {
        if (!sound.current) {
          const newSound = await createSound(recordingUri);
          sound.current = newSound;

          // Set up playback status listener
          newSound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
              setIsPlaying(false);
            }
          });
        }

        await playSound(sound.current);
        setIsPlaying(true);
      }
    } catch (error) {
      Alert.alert('Playback Error', 'Failed to play recording');
      console.error('Playback error:', error);
    }
  };

  const handleReRecord = async () => {
    if (sound.current) {
      await unloadSound(sound.current);
      sound.current = null;
    }

    if (recordingUri) {
      await deleteRecording(recordingUri);
    }

    setHasRecording(false);
    setRecordingUri(null);
    setRecordingTime(0);
    setMeteringValues([]);
    setIsPlaying(false);
  };

  const handleSave = async () => {
    if (!recordingUri) return;

    try {
      // Save to permanent location
      const savedUri = await saveRecording(recordingUri, 'current_user');

      Alert.alert(
        'Success',
        'Voice intro saved successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset state
              setHasRecording(false);
              setRecordingUri(null);
              setRecordingTime(0);
              setMeteringValues([]);
              if (sound.current) {
                unloadSound(sound.current);
                sound.current = null;
              }
            },
          },
        ]
      );

      console.log('Saved recording to:', savedUri);
    } catch (error) {
      Alert.alert('Error', 'Failed to save recording');
      console.error('Save error:', error);
    }
  };

  const nextPrompt = () => {
    setCurrentPrompt((prev) => (prev + 1) % PROMPTS.length);
  };

  const renderWaveformBars = () => {
    const bars = [];
    const barCount = 20;

    for (let i = 0; i < barCount; i++) {
      let height = 20;

      if (isRecording && meteringValues.length > 0) {
        // Use real metering data
        const index = Math.floor((i / barCount) * meteringValues.length);
        const metering = meteringValues[index] || -160;
        // Convert dB to height (metering ranges from -160 to 0)
        const normalized = Math.max(0, (metering + 160) / 160);
        height = 20 + normalized * 40;
      } else if (hasRecording && meteringValues.length > 0) {
        // Show recorded waveform
        const index = Math.floor((i / barCount) * meteringValues.length);
        const metering = meteringValues[index] || -160;
        const normalized = Math.max(0, (metering + 160) / 160);
        height = 20 + normalized * 40;
      } else if (isRecording) {
        // Fallback to random animation while waiting for metering data
        height = Math.random() * 60 + 20;
      }

      bars.push(
        <Animated.View
          key={i}
          style={[
            styles.waveBar,
            {
              height,
              opacity: isRecording || hasRecording ? 1 : 0.3,
            },
          ]}
        />
      );
    }
    return bars;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Voice Intro</Text>
        <Text style={styles.subtitle}>Let your personality shine through</Text>
      </View>

      {/* Prompt Card */}
      <View style={styles.promptCard}>
        <View style={styles.promptHeader}>
          <Ionicons name="chatbubble-ellipses" size={20} color={colors.primary} />
          <Text style={styles.promptLabel}>Prompt</Text>
          <TouchableOpacity onPress={nextPrompt} style={styles.shuffleButton}>
            <Ionicons name="shuffle" size={18} color={colors.gray[500]} />
          </TouchableOpacity>
        </View>
        <Text style={styles.promptText}>{PROMPTS[currentPrompt]}</Text>
      </View>

      {/* Recording Area */}
      <View style={styles.recordingArea}>
        {/* Waveform */}
        <View style={styles.waveformContainer}>
          {renderWaveformBars()}
        </View>

        {/* Timer */}
        <View style={styles.timerContainer}>
          <Text style={styles.timer}>
            {String(Math.floor(recordingTime / 60)).padStart(2, '0')}:
            {String(Math.floor(recordingTime % 60)).padStart(2, '0')}
          </Text>
          <Text style={styles.timerLimit}>/ 0:30</Text>
        </View>

        {/* Record Button */}
        <View style={styles.recordButtonContainer}>
          {isRecording && (
            <>
              <Animated.View
                style={[
                  styles.pulseRing,
                  {
                    transform: [{ scale: pulseAnim }],
                    opacity: pulseAnim.interpolate({
                      inputRange: [1, 1.2],
                      outputRange: [0.5, 0],
                    }),
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.pulseRing,
                  styles.pulseRing2,
                  {
                    transform: [
                      {
                        scale: pulseAnim.interpolate({
                          inputRange: [1, 1.2],
                          outputRange: [1.1, 1.3],
                        }),
                      },
                    ],
                    opacity: pulseAnim.interpolate({
                      inputRange: [1, 1.2],
                      outputRange: [0.3, 0],
                    }),
                  },
                ]}
              />
            </>
          )}

          <TouchableOpacity
            style={styles.recordButton}
            onPress={isRecording ? handleStopRecording : handleStartRecording}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isRecording ? ['#EF4444', '#DC2626'] : colors.gradient.primary}
              style={styles.recordButtonGradient}
            >
              <Ionicons
                name={isRecording ? 'stop' : 'mic'}
                size={40}
                color={colors.white}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Text style={styles.recordHint}>
          {isRecording
            ? 'Tap to stop recording'
            : hasRecording
            ? `Recorded ${Math.floor(recordingTime)}s - Tap to re-record`
            : 'Tap to start recording'}
        </Text>
      </View>

      {/* Actions */}
      {hasRecording && !isRecording && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.reRecordButton}
            onPress={handleReRecord}
          >
            <Ionicons name="refresh" size={20} color={colors.error} />
            <Text style={styles.reRecordButtonText}>Re-record</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.previewButton}
            onPress={handlePlayPreview}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={20}
              color={colors.primary}
            />
            <Text style={styles.previewButtonText}>
              {isPlaying ? 'Pause' : 'Preview'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <LinearGradient
              colors={colors.gradient.primary}
              style={styles.saveButtonGradient}
            >
              <Ionicons name="checkmark" size={20} color={colors.white} />
              <Text style={styles.saveButtonText}>Save</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Tips */}
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>Tips for a great intro:</Text>
        <View style={styles.tip}>
          <Ionicons name="checkmark-circle" size={16} color={colors.secondary} />
          <Text style={styles.tipText}>Speak naturally and be yourself</Text>
        </View>
        <View style={styles.tip}>
          <Ionicons name="checkmark-circle" size={16} color={colors.secondary} />
          <Text style={styles.tipText}>Find a quiet place to record</Text>
        </View>
        <View style={styles.tip}>
          <Ionicons name="checkmark-circle" size={16} color={colors.secondary} />
          <Text style={styles.tipText}>Share what makes you unique</Text>
        </View>
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
    color: colors.dark,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray[500],
    marginTop: 4,
  },
  promptCard: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    ...shadows.md,
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  promptLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 8,
    flex: 1,
  },
  shuffleButton: {
    padding: 8,
  },
  promptText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.dark,
    lineHeight: 26,
  },
  recordingArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    gap: 4,
    marginBottom: 20,
  },
  waveBar: {
    width: 6,
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 30,
  },
  timer: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.dark,
  },
  timerLimit: {
    fontSize: 20,
    color: colors.gray[400],
    marginLeft: 4,
  },
  recordButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
  },
  pulseRing2: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  recordButton: {
    ...shadows.xl,
  },
  recordButtonGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordHint: {
    fontSize: 14,
    color: colors.gray[500],
    marginTop: 20,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
  },
  reRecordButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: colors.error,
    gap: 6,
  },
  reRecordButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
  },
  previewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: colors.primary,
    gap: 6,
  },
  previewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  saveButton: {
    flex: 1,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 16,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  tipsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[600],
    marginBottom: 12,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: colors.gray[500],
    marginLeft: 8,
  },
});
