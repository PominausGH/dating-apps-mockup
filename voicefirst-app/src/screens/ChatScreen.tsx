import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { colors, shadows } from '../theme/colors';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../hooks/useChat';
import { VoiceMessage, RootStackParamList } from '../types';
import {
  startRecording as startAudioRecording,
  stopRecording as stopAudioRecording,
} from '../utils/audioRecording';

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;

export default function ChatScreen() {
  const route = useRoute<ChatScreenRouteProp>();
  const navigation = useNavigation();
  const { currentUser } = useAuth();
  const { matchId, matchName } = route.params;

  const {
    messages,
    match,
    loading,
    error,
    sending,
    sendMessage,
    messageCount,
    photoUnlockProgress,
    photosUnlocked,
  } = useChat(matchId);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingInstance, setRecordingInstance] = useState<Audio.Recording | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const messagesRemaining = Math.max(0, 8 - messageCount);

  const startRecording = async () => {
    try {
      const recording = await startAudioRecording();
      setRecordingInstance(recording);
      setIsRecording(true);

      // Animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording:', err);
      Alert.alert('Recording Error', 'Could not start recording. Please check permissions.');
    }
  };

  const cancelRecording = async () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    if (recordingInstance) {
      try {
        await recordingInstance.stopAndUnloadAsync();
      } catch (err) {
        console.error('Error stopping recording:', err);
      }
    }

    setIsRecording(false);
    setRecordingTime(0);
    setRecordingInstance(null);
    pulseAnim.setValue(1);
  };

  const finishRecording = async () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    if (!recordingInstance) {
      setIsRecording(false);
      setRecordingTime(0);
      return;
    }

    try {
      const result = await stopAudioRecording(recordingInstance);
      if (result && result.uri) {
        await sendMessage(result.uri, result.duration);
      }
    } catch (err) {
      console.error('Error finishing recording:', err);
      Alert.alert('Error', 'Failed to send voice message');
    }

    setIsRecording(false);
    setRecordingTime(0);
    setRecordingInstance(null);
    pulseAnim.setValue(1);
  };

  const renderVoiceMessage = ({ item }: { item: VoiceMessage }) => {
    const isMe = item.senderId === currentUser?.uid;
    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.myMessage : styles.theirMessage,
        ]}
      >
        <View
          style={[
            styles.voiceBubble,
            isMe ? styles.myBubble : styles.theirBubble,
          ]}
        >
          <TouchableOpacity
            style={[
              styles.playIconContainer,
              isMe ? styles.myPlayIcon : styles.theirPlayIcon,
            ]}
          >
            <Ionicons
              name={item.played ? 'play' : 'play'}
              size={16}
              color={isMe ? colors.primary : colors.white}
            />
          </TouchableOpacity>

          <View style={styles.waveformSmall}>
            {[...Array(20)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.waveBarSmall,
                  {
                    height: Math.random() * 16 + 6,
                    backgroundColor: isMe
                      ? colors.white
                      : 'rgba(255,255,255,0.6)',
                  },
                ]}
              />
            ))}
          </View>

          <Text
            style={[
              styles.messageDuration,
              isMe ? styles.myDuration : styles.theirDuration,
            ]}
          >
            0:{String(Math.round(item.duration)).padStart(2, '0')}
          </Text>
        </View>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Photo Unlock Progress */}
      <View style={styles.progressBanner}>
        {photosUnlocked ? (
          <View style={styles.unlockedBanner}>
            <Ionicons name="lock-open" size={18} color={colors.secondary} />
            <Text style={styles.unlockedText}>Photos unlocked!</Text>
            <TouchableOpacity style={styles.viewPhotosButton}>
              <Text style={styles.viewPhotosText}>View</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.progressInfo}>
              <Ionicons name="lock-closed" size={16} color={colors.primary} />
              <Text style={styles.progressText}>
                {messagesRemaining} more voice messages to unlock photos
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${photoUnlockProgress}%` }]}
              />
            </View>
          </>
        )}
      </View>

      {/* Messages */}
      {messages.length === 0 ? (
        <View style={styles.emptyMessages}>
          <Ionicons name="mic-outline" size={48} color={colors.gray[300]} />
          <Text style={styles.emptyTitle}>Start the conversation</Text>
          <Text style={styles.emptySubtitle}>
            Send a voice message to begin chatting
          </Text>
        </View>
      ) : (
        <FlatList
          data={messages}
          renderItem={renderVoiceMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          inverted={false}
        />
      )}

      {/* Voice Recording Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.inputContainer}>
          {isRecording ? (
            <View style={styles.recordingContainer}>
              <View style={styles.recordingInfo}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingTime}>
                  0:{String(recordingTime).padStart(2, '0')}
                </Text>
                <Text style={styles.recordingLabel}>Recording...</Text>
              </View>
              <TouchableOpacity style={styles.cancelButton} onPress={cancelRecording}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sendVoiceButton} onPress={finishRecording}>
                <LinearGradient
                  colors={colors.gradient.primary}
                  style={styles.sendVoiceGradient}
                >
                  <Ionicons name="send" size={20} color={colors.white} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.defaultInput}>
              <Text style={styles.inputHint}>
                {sending ? 'Sending...' : 'Hold to record voice message'}
              </Text>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity
                  style={styles.recordButton}
                  onPressIn={startRecording}
                  onPressOut={finishRecording}
                  disabled={sending}
                >
                  <LinearGradient
                    colors={colors.gradient.primary}
                    style={[
                      styles.recordButtonGradient,
                      sending && styles.recordButtonDisabled,
                    ]}
                  >
                    {sending ? (
                      <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                      <Ionicons name="mic" size={24} color={colors.white} />
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: colors.white,
    fontWeight: '600',
  },
  progressBanner: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 13,
    color: colors.primary,
    marginLeft: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.gray[200],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  unlockedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unlockedText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondary,
    marginLeft: 8,
  },
  viewPhotosButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  viewPhotosText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  emptyMessages: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.dark,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
    marginTop: 8,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  myMessage: {
    alignItems: 'flex-end',
  },
  theirMessage: {
    alignItems: 'flex-start',
  },
  voiceBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    maxWidth: '80%',
  },
  myBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: colors.gray[300],
    borderBottomLeftRadius: 4,
  },
  playIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  myPlayIcon: {
    backgroundColor: colors.white,
  },
  theirPlayIcon: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  waveformSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    gap: 2,
  },
  waveBarSmall: {
    width: 3,
    borderRadius: 2,
  },
  messageDuration: {
    fontSize: 12,
    fontWeight: '500',
  },
  myDuration: {
    color: 'rgba(255,255,255,0.8)',
  },
  theirDuration: {
    color: colors.gray[600],
  },
  timestamp: {
    fontSize: 11,
    color: colors.gray[400],
    marginTop: 4,
    marginHorizontal: 4,
  },
  inputContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  defaultInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputHint: {
    fontSize: 14,
    color: colors.gray[500],
    flex: 1,
  },
  recordButton: {
    ...shadows.md,
  },
  recordButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButtonDisabled: {
    opacity: 0.7,
  },
  recordingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.error,
  },
  recordingTime: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark,
    marginLeft: 10,
  },
  recordingLabel: {
    fontSize: 14,
    color: colors.gray[500],
    marginLeft: 10,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
  },
  sendVoiceButton: {},
  sendVoiceGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
