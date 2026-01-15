import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToVoiceMessages, sendVoiceMessage, markAllMessagesRead } from '../services/messageService';
import { getMatch } from '../services/matchService';
import { VoiceMessage, VoiceMatch } from '../types';

export function useChat(matchId: string) {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [match, setMatch] = useState<VoiceMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!currentUser || !matchId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Fetch match info
    getMatch(matchId)
      .then((matchData) => {
        if (matchData) {
          setMatch(matchData);
        }
      })
      .catch((err) => {
        console.error('Error fetching match:', err);
      });

    // Subscribe to messages
    const unsubscribe = subscribeToVoiceMessages(matchId, (fetchedMessages: VoiceMessage[]) => {
      setMessages(fetchedMessages);
      setLoading(false);
      setError(null);

      // Mark messages as read
      if (fetchedMessages.length > 0) {
        markAllMessagesRead(matchId, currentUser.uid).catch(console.error);
      }
    });

    return () => unsubscribe();
  }, [currentUser, matchId]);

  const sendMessage = useCallback(
    async (voiceUri: string, duration: number) => {
      if (!currentUser || !matchId || !match) return;

      setSending(true);
      try {
        // Get the other user's ID from the match
        const receiverId = match.userId;
        await sendVoiceMessage(matchId, currentUser.uid, receiverId, voiceUri, duration);
      } catch (err: any) {
        console.error('Error sending message:', err);
        setError(err.message);
      } finally {
        setSending(false);
      }
    },
    [currentUser, matchId, match]
  );

  // Calculate photo unlock progress
  const messageCount = messages.length;
  const photoUnlockProgress = Math.min((messageCount / 8) * 100, 100);
  const photosUnlocked = photoUnlockProgress >= 100;

  return {
    messages,
    match,
    loading,
    error,
    sending,
    sendMessage,
    messageCount,
    photoUnlockProgress,
    photosUnlocked,
  };
}
