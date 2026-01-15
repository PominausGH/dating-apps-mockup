import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { colors, shadows } from '../theme/colors';
import { useChat } from '../hooks/useChat';
import { RootStackParamList } from '../navigation/types';

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them';
  timestamp: string;
}

export default function ChatScreen() {
  const route = useRoute<ChatScreenRouteProp>();
  const navigation = useNavigation();
  const { matchId, matchName: routeMatchName } = route.params || { matchId: '' };

  const { messages, chatData, loading, error, sending, sendMessage } = useChat(matchId);
  const [inputText, setInputText] = useState('');
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);
  const [isWarning, setIsWarning] = useState(false);

  // Set header title
  useEffect(() => {
    const name = routeMatchName || chatData?.matchName || 'Chat';
    navigation.setOptions({ title: name });
  }, [chatData?.matchName, routeMatchName, navigation]);

  // Calculate time remaining and check expiration
  useEffect(() => {
    if (!chatData?.chatExpiresAt) return;

    const updateTimer = () => {
      const expiresAt = new Date(chatData.chatExpiresAt!).getTime();
      const now = Date.now();
      const diff = expiresAt - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeRemaining('Expired');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setIsWarning(hours < 1);

      if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else {
        setTimeRemaining(`${minutes}m`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);

    return () => clearInterval(interval);
  }, [chatData?.chatExpiresAt]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isExpired || sending) return;

    const success = await sendMessage(inputText);
    if (success) {
      setInputText('');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender === 'me';
    return (
      <View
        style={[
          styles.messageBubble,
          isMe ? styles.myMessage : styles.theirMessage,
        ]}
      >
        <Text style={[styles.messageText, isMe && styles.myMessageText]}>
          {item.text}
        </Text>
        <Text style={[styles.timestamp, isMe && styles.myTimestamp]}>
          {item.timestamp}
        </Text>
      </View>
    );
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color={colors.error} />
          <Text style={styles.errorText}>Failed to load chat</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Expired chat state
  if (isExpired) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.expiredContainer}>
          <View style={styles.expiredHeader}>
            <Ionicons name="lock-closed" size={40} color={colors.gray[400]} />
            <Text style={styles.expiredTitle}>Chat Expired</Text>
            <Text style={styles.expiredSubtitle}>
              This chat window has closed. We hope you had a great date!
            </Text>
          </View>
          <View style={styles.expiredMessages}>
            <FlatList
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messageList}
            />
          </View>
          <View style={styles.expiredFooter}>
            <TouchableOpacity
              style={styles.feedbackButton}
              onPress={() => {/* Navigate to feedback */}}
            >
              <Ionicons name="star" size={20} color={colors.white} />
              <Text style={styles.feedbackButtonText}>Leave Feedback</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={90}
      >
        {/* Date Info Banner */}
        {chatData?.scheduledDate && (
          <View style={styles.dateBanner}>
            <Ionicons name="calendar" size={16} color={colors.primary} />
            <Text style={styles.dateBannerText}>
              Date: {chatData.scheduledDate.selectedSlot?.dayName} at{' '}
              {chatData.scheduledDate.selectedSlot?.startTime}
            </Text>
          </View>
        )}

        {/* Timer Banner */}
        <View style={[styles.timerBanner, isWarning && styles.timerBannerWarning]}>
          <Ionicons
            name="time-outline"
            size={16}
            color={isWarning ? colors.error : colors.warning}
          />
          <Text style={[styles.timerText, isWarning && styles.timerTextWarning]}>
            {isWarning ? 'Hurry! ' : ''}Chat closes in {timeRemaining}
          </Text>
        </View>

        {/* Messages */}
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          inverted={false}
        />

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={colors.gray[400]}
            multiline
            maxLength={1000}
            editable={!sending}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Ionicons name="send" size={20} color={colors.white} />
            )}
          </TouchableOpacity>
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
  keyboardView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.gray[500],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.dark,
  },
  errorSubtext: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
  },
  dateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
  },
  dateBannerText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  timerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 6,
  },
  timerBannerWarning: {
    backgroundColor: '#FEE2E2',
  },
  timerText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.warning,
  },
  timerTextWarning: {
    color: colors.error,
  },
  messageList: {
    padding: 16,
    gap: 12,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
    ...shadows.sm,
  },
  messageText: {
    fontSize: 15,
    color: colors.dark,
    lineHeight: 20,
  },
  myMessageText: {
    color: colors.white,
  },
  timestamp: {
    fontSize: 11,
    color: colors.gray[400],
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myTimestamp: {
    color: 'rgba(255,255,255,0.7)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: colors.light,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    color: colors.dark,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  expiredContainer: {
    flex: 1,
  },
  expiredHeader: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.gray[100],
    gap: 8,
  },
  expiredTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.dark,
  },
  expiredSubtitle: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
  },
  expiredMessages: {
    flex: 1,
    opacity: 0.6,
  },
  expiredFooter: {
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  feedbackButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});
