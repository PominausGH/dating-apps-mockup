import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface VoiceRecorderProps {
  onRecordingComplete?: (uri: string) => void;
  maxDuration?: number; // in seconds
  minDuration?: number; // in seconds
}

/**
 * Voice recorder component for onboarding and profile creation
 * Can be integrated with expo-av for actual audio recording
 */
export default function VoiceRecorder({
  onRecordingComplete,
  maxDuration = 60,
  minDuration = 5,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording) {
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Wave animation
      Animated.loop(
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      ).start();

      // Timer
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => {
          const newDuration = prev + 1;
          if (newDuration >= maxDuration) {
            stopRecording();
            return maxDuration;
          }
          return newDuration;
        });
      }, 1000);
    } else {
      pulseAnim.setValue(1);
      waveAnim.setValue(0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      // In production: use expo-av
      // const recording = new Audio.Recording();
      // await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      // await recording.startAsync();

      setIsRecording(true);
      setRecordingDuration(0);
      setHasRecorded(false);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = async () => {
    if (recordingDuration < minDuration) {
      // Don't allow stopping before minimum duration
      return;
    }

    try {
      setIsRecording(false);

      // In production: use expo-av
      // await recording.stopAndUnloadAsync();
      // const uri = recording.getURI();

      const mockUri = `file://voice_intro_${Date.now()}.m4a`;
      setHasRecorded(true);

      if (onRecordingComplete) {
        onRecordingComplete(mockUri);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const playRecording = () => {
    // In production: play the recorded audio
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), recordingDuration * 1000);
  };

  const deleteRecording = () => {
    setHasRecorded(false);
    setRecordingDuration(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Waveform visualization (simplified) */}
      {isRecording && (
        <View style={styles.waveformContainer}>
          {Array.from({ length: 20 }).map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.waveBar,
                {
                  height: waveAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, Math.random() * 60 + 20],
                  }),
                  opacity: waveAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.3, 1, 0.3],
                  }),
                },
              ]}
            />
          ))}
        </View>
      )}

      {/* Recording button */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[
            styles.recordButton,
            isRecording && styles.recordButtonActive,
            hasRecorded && styles.recordButtonComplete,
          ]}
          onPress={toggleRecording}
          disabled={hasRecorded}
        >
          <Animated.View
            style={[
              styles.recordButtonInner,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <LinearGradient
              colors={
                hasRecorded
                  ? ['#10B981', '#059669']
                  : isRecording
                  ? ['#F4A261', '#E76F51']
                  : ['#E63946', '#C1121F']
              }
              style={styles.gradientButton}
            >
              <Ionicons
                name={
                  hasRecorded
                    ? 'checkmark'
                    : isRecording
                    ? 'stop'
                    : 'mic'
                }
                size={48}
                color="#fff"
              />
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>

        {/* Duration display */}
        {(isRecording || hasRecorded) && (
          <View style={styles.durationContainer}>
            <Text style={styles.durationText}>
              {formatTime(recordingDuration)}
            </Text>
            {isRecording && recordingDuration < minDuration && (
              <Text style={styles.minDurationText}>
                Record at least {minDuration} seconds
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Playback controls */}
      {hasRecorded && (
        <View style={styles.playbackControls}>
          <TouchableOpacity
            style={styles.playbackButton}
            onPress={playRecording}
            disabled={isPlaying}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={24}
              color="#1D3557"
            />
            <Text style={styles.playbackButtonText}>
              {isPlaying ? 'Playing...' : 'Play'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.playbackButton}
            onPress={deleteRecording}
          >
            <Ionicons name="trash-outline" size={24} color="#EF4444" />
            <Text style={[styles.playbackButtonText, { color: '#EF4444' }]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Instructions */}
      {!isRecording && !hasRecorded && (
        <View style={styles.instructions}>
          <Ionicons name="information-circle-outline" size={20} color="#6B7280" />
          <Text style={styles.instructionsText}>
            Tap the microphone to start recording
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
    marginBottom: 20,
    gap: 4,
  },
  waveBar: {
    width: 4,
    backgroundColor: '#E63946',
    borderRadius: 2,
  },
  controlsContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  recordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  recordButtonActive: {
    shadowColor: '#F4A261',
  },
  recordButtonComplete: {
    shadowColor: '#10B981',
  },
  recordButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  gradientButton: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  durationText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1D3557',
  },
  minDurationText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  playbackControls: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  playbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  playbackButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D3557',
  },
  instructions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  instructionsText: {
    fontSize: 14,
    color: '#6B7280',
  },
});
