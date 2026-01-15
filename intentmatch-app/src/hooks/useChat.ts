import { useState, useEffect } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { Message, Match, ScheduledDate } from '../types';
import {
  subscribeToMessages,
  sendMessage as sendMessageService,
  markAllMessagesAsRead,
} from '../services/messageService';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'me' | 'them';
  timestamp: string;
  senderId: string;
}

interface ChatData {
  matchId: string;
  matchName: string;
  matchPhoto: string;
  chatExpiresAt: string | null;
  scheduledDate: ScheduledDate | null;
}

export function useChat(matchId: string) {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // Fetch match data and subscribe to messages
  useEffect(() => {
    if (!matchId || !currentUser) {
      setLoading(false);
      return;
    }

    let unsubscribeMessages: (() => void) | null = null;
    let unsubscribeMatch: (() => void) | null = null;

    const setup = async () => {
      try {
        // Subscribe to match data for real-time updates
        const matchRef = doc(db, 'matches', matchId);
        unsubscribeMatch = onSnapshot(matchRef, async (matchDoc) => {
          if (!matchDoc.exists()) {
            setError('Match not found');
            setLoading(false);
            return;
          }

          const matchData = matchDoc.data();
          const otherUserId = matchData.user1Id === currentUser.uid
            ? matchData.user2Id
            : matchData.user1Id;

          // Get other user's profile
          const userRef = doc(db, 'users', otherUserId);
          const userDoc = await getDoc(userRef);
          const userData = userDoc.data();

          // Get chat window for expiration
          const chatWindowRef = doc(db, 'chatWindows', matchId);
          const chatWindowDoc = await getDoc(chatWindowRef);
          const chatWindowData = chatWindowDoc.data();

          setChatData({
            matchId,
            matchName: userData?.name || 'Unknown',
            matchPhoto: userData?.primaryPhotoUrl || userData?.photos?.[0] || '',
            chatExpiresAt: chatWindowData?.expiresAt?.toDate?.()?.toISOString() ||
              matchData.chatExpiresAt || null,
            scheduledDate: matchData.scheduledDate || null,
          });
        });

        // Subscribe to messages
        unsubscribeMessages = subscribeToMessages(matchId, (rawMessages) => {
          const formattedMessages: ChatMessage[] = rawMessages.map((msg: any) => ({
            id: msg.id,
            text: msg.text || msg.content || '',
            sender: msg.senderId === currentUser.uid ? 'me' : 'them',
            timestamp: msg.timestamp instanceof Date
              ? msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : msg.timestamp || '',
            senderId: msg.senderId,
          }));
          setMessages(formattedMessages);
          setLoading(false);
        });

        // Mark messages as read
        await markAllMessagesAsRead(matchId, currentUser.uid);
      } catch (err: any) {
        console.error('Error setting up chat:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    setup();

    return () => {
      if (unsubscribeMessages) unsubscribeMessages();
      if (unsubscribeMatch) unsubscribeMatch();
    };
  }, [matchId, currentUser]);

  // Send message function
  const sendMessage = async (text: string): Promise<boolean> => {
    if (!currentUser || !matchId || !chatData || sending) {
      return false;
    }

    const trimmedText = text.trim();
    if (!trimmedText) return false;

    setSending(true);
    try {
      // Get other user's ID
      const matchRef = doc(db, 'matches', matchId);
      const matchDoc = await getDoc(matchRef);
      const matchData = matchDoc.data();

      if (!matchData) {
        throw new Error('Match not found');
      }

      const receiverId = matchData.user1Id === currentUser.uid
        ? matchData.user2Id
        : matchData.user1Id;

      await sendMessageService(matchId, currentUser.uid, receiverId, trimmedText);
      return true;
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message);
      return false;
    } finally {
      setSending(false);
    }
  };

  return {
    messages,
    chatData,
    loading,
    error,
    sending,
    sendMessage,
  };
}
