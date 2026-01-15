import {
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebaseConfig';
import { VoiceMessage } from '../types';

/**
 * Voice Message Service
 * Handles voice message chat with progressive photo unlock
 */

/**
 * Send a voice message
 */
export async function sendVoiceMessage(
  matchId: string,
  senderId: string,
  receiverId: string,
  voiceUri: string,
  duration: number
): Promise<string> {
  try {
    // Upload voice file to storage
    const voiceRef = ref(storage, `voice-messages/${matchId}/${Date.now()}.m4a`);
    const response = await fetch(voiceUri);
    const blob = await response.blob();
    await uploadBytes(voiceRef, blob);
    const voiceUrl = await getDownloadURL(voiceRef);

    // Get sender info
    const senderDoc = await getDoc(doc(db, 'users', senderId));
    const senderData = senderDoc.data();

    // Create message
    const messagesRef = collection(db, 'voiceMessages');
    const messageDoc = await addDoc(messagesRef, {
      matchId,
      senderId,
      receiverId,
      senderName: senderData?.name || '',
      voiceUri: voiceUrl,
      duration,
      played: false,
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp(),
    });

    // Update match with message count for photo unlock
    const matchRef = doc(db, 'matches', matchId);
    const matchDoc = await getDoc(matchRef);
    const matchData = matchDoc.data();

    const currentCount = matchData?.messageCount || 0;
    await updateDoc(matchRef, {
      lastMessageAt: serverTimestamp(),
      messageCount: currentCount + 1,
      [`unreadCount.${receiverId}`]: (matchData?.unreadCount?.[receiverId] || 0) + 1,
    });

    return messageDoc.id;
  } catch (error) {
    console.error('Error sending voice message:', error);
    throw error;
  }
}

/**
 * Get voice messages for a match
 */
export async function getVoiceMessages(
  matchId: string,
  limitCount: number = 50
): Promise<VoiceMessage[]> {
  try {
    const messagesRef = collection(db, 'voiceMessages');
    const q = query(
      messagesRef,
      where('matchId', '==', matchId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const messages: VoiceMessage[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        senderId: data.senderId,
        recipientId: data.receiverId,
        voiceUri: data.voiceUri,
        duration: data.duration,
        played: data.played,
        createdAt: data.createdAt?.toDate() || new Date(),
        timestamp: data.timestamp?.toDate()?.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }) || '',
      });
    });

    return messages.reverse();
  } catch (error) {
    console.error('Error fetching voice messages:', error);
    throw error;
  }
}

/**
 * Subscribe to voice messages in real-time
 */
export function subscribeToVoiceMessages(
  matchId: string,
  callback: (messages: VoiceMessage[]) => void
): Unsubscribe {
  const messagesRef = collection(db, 'voiceMessages');
  const q = query(
    messagesRef,
    where('matchId', '==', matchId),
    orderBy('timestamp', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages: VoiceMessage[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        senderId: data.senderId,
        recipientId: data.receiverId,
        voiceUri: data.voiceUri,
        duration: data.duration,
        played: data.played,
        createdAt: data.createdAt?.toDate() || new Date(),
        timestamp: data.timestamp?.toDate()?.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }) || '',
      });
    });

    callback(messages);
  });
}

/**
 * Mark voice message as played
 */
export async function markMessagePlayed(messageId: string): Promise<void> {
  try {
    const messageRef = doc(db, 'voiceMessages', messageId);
    await updateDoc(messageRef, {
      played: true,
      playedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error marking message as played:', error);
    throw error;
  }
}

/**
 * Mark all messages as read for a user
 */
export async function markAllMessagesRead(
  matchId: string,
  userId: string
): Promise<void> {
  try {
    const messagesRef = collection(db, 'voiceMessages');
    const q = query(
      messagesRef,
      where('matchId', '==', matchId),
      where('receiverId', '==', userId),
      where('played', '==', false)
    );

    const querySnapshot = await getDocs(q);
    const updatePromises = querySnapshot.docs.map((doc) =>
      updateDoc(doc.ref, {
        played: true,
        playedAt: serverTimestamp(),
      })
    );

    await Promise.all(updatePromises);

    // Reset unread count
    const matchRef = doc(db, 'matches', matchId);
    await updateDoc(matchRef, {
      [`unreadCount.${userId}`]: 0,
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
}
