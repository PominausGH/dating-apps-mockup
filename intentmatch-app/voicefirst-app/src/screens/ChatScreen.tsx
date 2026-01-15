import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import BlurredPhoto from '../components/BlurredPhoto';
import { getNextMilestone, isPhotoUnlocked } from '../utils/blurUtils';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them';
  timestamp: string;
}

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    text: "Hey! I saw we're both free Saturday evening. Excited to meet!",
    sender: 'them',
    timestamp: '2:30 PM',
  },
  {
    id: '2',
    text: "Hi Sarah! Yes, I'm looking forward to it too! Any preference for where to go?",
    sender: 'me',
    timestamp: '2:32 PM',
  },
  {
    id: '3',
    text: "I love coffee! There's this great spot called Blue Bottle in SoHo. Have you been?",
    sender: 'them',
    timestamp: '2:35 PM',
  },
];

export default function ChatScreen() {
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);

  // Animation for blur reduction
  const blurAnimationScale = useRef(new Animated.Value(1)).current;
  const blurAnimationOpacity = useRef(new Animated.Value(0)).current;

  // Get message count (only count user's messages in this example)
  const messageCount = messages.filter((m) => m.sender === 'me').length;
  const nextMilestone = getNextMilestone(messageCount);
  const photoUnlocked = isPhotoUnlocked(messageCount);

  useEffect(() => {
    if (showUnlockAnimation) {
      // Animate when blur reduces
      Animated.sequence([
        Animated.parallel([
          Animated.spring(blurAnimationScale, {
            toValue: 1.1,
            friction: 3,
            tension: 100,
            useNativeDriver: true,
          }),
          Animated.timing(blurAnimationOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.spring(blurAnimationScale, {
            toValue: 1,
            friction: 3,
            useNativeDriver: true,
          }),
          Animated.timing(blurAnimationOpacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        setShowUnlockAnimation(false);
      });
    }
  }, [showUnlockAnimation]);

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'me',
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages([...messages, newMessage]);
    setInputText('');

    // Trigger unlock animation when blur level changes
    const newMessageCount = messageCount + 1;
    const shouldAnimate =
      newMessageCount === 1 ||
      newMessageCount === 3 ||
      newMessageCount === 5 ||
      newMessageCount === 8;

    if (shouldAnimate) {
      setShowUnlockAnimation(true);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender === 'me';
    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.myMessage : styles.theirMessage,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMe ? styles.myBubble : styles.theirBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMe ? styles.myMessageText : styles.theirMessageText,
            ]}
          >
            {item.text}
          </Text>
        </View>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header with blurred photo */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#1D3557" />
        </TouchableOpacity>
        <View style={styles.headerPhotoContainer}>
          <BlurredPhoto
            photoUri="https://i.pravatar.cc/100?img=1"
            messageCount={messageCount}
            showProgress={false}
            showCelebration={false}
            style={styles.headerPhoto}
            imageStyle={styles.headerPhotoImage}
            borderRadius={20}
          />
          {/* Blur animation overlay */}
          {showUnlockAnimation && (
            <Animated.View
              style={[
                styles.unlockAnimationOverlay,
                {
                  opacity: blurAnimationOpacity,
                  transform: [{ scale: blurAnimationScale }],
                },
              ]}
            >
              <Ionicons name="lock-open" size={24} color="#10B981" />
            </Animated.View>
          )}
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>Sarah</Text>
          {!photoUnlocked && nextMilestone && (
            <Text style={styles.headerSubtext}>
              {messageCount}/{nextMilestone.count} to reveal more
            </Text>
          )}
          {photoUnlocked && (
            <Text style={[styles.headerSubtext, { color: '#10B981' }]}>
              Photo unlocked!
            </Text>
          )}
        </View>
        <TouchableOpacity style={styles.infoButton}>
          <Ionicons name="information-circle-outline" size={24} color="#1D3557" />
        </TouchableOpacity>
      </View>

      {/* Date Info Banner */}
      <View style={styles.dateBanner}>
        <View style={styles.dateBannerIcon}>
          <Ionicons name="calendar" size={20} color="#10B981" />
        </View>
        <View style={styles.dateBannerContent}>
          <Text style={styles.dateBannerTitle}>Date Scheduled!</Text>
          <Text style={styles.dateBannerText}>
            Saturday 7pm @ Blue Bottle Coffee, SoHo
          </Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Progress hint banner */}
      {!photoUnlocked && nextMilestone && (
        <View style={styles.progressBanner}>
          <Ionicons name="sparkles-outline" size={16} color="#E63946" />
          <Text style={styles.progressText}>
            {nextMilestone.label}
          </Text>
        </View>
      )}

      {/* Messages */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        inverted={false}
      />

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="add-circle-outline" size={28} color="#9CA3AF" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#9CA3AF"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              inputText.trim() && styles.sendButtonActive,
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() ? '#FFFFFF' : '#9CA3AF'}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1FAEE',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerPhotoContainer: {
    position: 'relative',
    marginLeft: 12,
  },
  headerPhoto: {
    width: 40,
    height: 40,
  },
  headerPhotoImage: {
    width: 40,
    height: 40,
  },
  unlockAnimationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(209, 250, 229, 0.9)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  headerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D3557',
  },
  headerSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  infoButton: {
    padding: 4,
  },
  dateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
  },
  dateBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateBannerContent: {
    flex: 1,
    marginLeft: 12,
  },
  dateBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
  },
  dateBannerText: {
    fontSize: 13,
    color: '#10B981',
    opacity: 0.8,
    marginTop: 2,
  },
  progressBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#FEE2E2',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  progressText: {
    fontSize: 13,
    color: '#E63946',
    fontWeight: '600',
    marginLeft: 6,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12,
  },
  myMessage: {
    alignItems: 'flex-end',
  },
  theirMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  myBubble: {
    backgroundColor: '#E63946',
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  theirMessageText: {
    color: '#1D3557',
  },
  timestamp: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
    marginHorizontal: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  attachButton: {
    padding: 4,
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 8,
    fontSize: 16,
    maxHeight: 100,
    color: '#1D3557',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#E63946',
  },
});
