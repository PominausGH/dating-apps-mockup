import {
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
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
import { db } from '../../firebaseConfig';
import { Message } from '../types';

/**
 * Message Service
 * Handles real-time messaging with 24-hour chat windows
 */

/**
 * Send a message
 */
export async function sendMessage(
  matchId: string,
  senderId: string,
  receiverId: string,
  text: string
): Promise<string> {
  try {
    // Validate message
    if (!text || text.trim().length === 0) {
      throw new Error('Message cannot be empty');
    }

    if (text.length > 1000) {
      throw new Error('Message is too long (max 1000 characters)');
    }

    // Get sender info for denormalization
    const senderDoc = await getDoc(doc(db, 'users', senderId));
    const senderData = senderDoc.data();

    // Create message
    const messagesRef = collection(db, 'messages');
    const messageDoc = await addDoc(messagesRef, {
      matchId,
      senderId,
      receiverId,
      senderName: senderData?.name || '',
      senderPhotoUrl: senderData?.primaryPhotoUrl || '',
      text: text.trim(),
      type: 'text',
      isRead: false,
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp(),
    });

    // Update match with last message info
    const matchRef = doc(db, 'matches', matchId);
    const matchDoc = await getDoc(matchRef);
    const matchData = matchDoc.data();

    await updateDoc(matchRef, {
      lastMessageAt: serverTimestamp(),
      lastMessageText: text.trim(),
      lastMessageBy: senderId,
      [`unreadCount.${receiverId}`]: (matchData?.unreadCount?.[receiverId] || 0) + 1,
    });

    // Check if chat window needs to be created (first message)
    const chatWindowRef = doc(db, 'chatWindows', matchId);
    const chatWindowDoc = await getDoc(chatWindowRef);

    if (!chatWindowDoc.exists()) {
      // Create chat window with 24-hour expiration
      const openedAt = new Date();
      const expiresAt = new Date(openedAt.getTime() + 24 * 60 * 60 * 1000);

      const matchInfo = await getDoc(matchRef);
      const matchDataForWindow = matchInfo.data();

      await setDoc(doc(db, 'chatWindows', matchId), {
        matchId,
        user1Id: matchDataForWindow?.user1Id || '',
        user2Id: matchDataForWindow?.user2Id || '',
        openedAt: serverTimestamp(),
        expiresAt,
        isExpired: false,
        messageCount: 1,
        lastMessageAt: serverTimestamp(),
      });
    } else {
      // Update chat window message count
      const currentCount = chatWindowDoc.data()?.messageCount || 0;
      await updateDoc(chatWindowRef, {
        messageCount: currentCount + 1,
        lastMessageAt: serverTimestamp(),
      });
    }

    return messageDoc.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

/**
 * Get messages for a match
 */
export async function getMessages(
  matchId: string,
  limitCount: number = 50
): Promise<Message[]> {
  try {
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('matchId', '==', matchId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const messages: Message[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        ...data,
        id: doc.id,
        timestamp: data.timestamp?.toDate(),
        createdAt: data.createdAt?.toDate(),
        readAt: data.readAt?.toDate(),
      } as unknown as Message);
    });

    // Reverse to get chronological order
    return messages.reverse();
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
}

/**
 * Subscribe to messages in real-time
 */
export function subscribeToMessages(
  matchId: string,
  callback: (messages: Message[]) => void
): Unsubscribe {
  const messagesRef = collection(db, 'messages');
  const q = query(
    messagesRef,
    where('matchId', '==', matchId),
    orderBy('timestamp', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages: Message[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        ...data,
        id: doc.id,
        timestamp: data.timestamp?.toDate(),
        createdAt: data.createdAt?.toDate(),
        readAt: data.readAt?.toDate(),
      } as unknown as Message);
    });

    callback(messages);
  });
}

/**
 * Mark message as read
 */
export async function markMessageAsRead(messageId: string): Promise<void> {
  try {
    const messageRef = doc(db, 'messages', messageId);
    await updateDoc(messageRef, {
      isRead: true,
      readAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
}

/**
 * Mark all messages in a match as read
 */
export async function markAllMessagesAsRead(
  matchId: string,
  userId: string
): Promise<void> {
  try {
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('matchId', '==', matchId),
      where('receiverId', '==', userId),
      where('isRead', '==', false)
    );

    const querySnapshot = await getDocs(q);
    const updatePromises = querySnapshot.docs.map((doc) =>
      updateDoc(doc.ref, {
        isRead: true,
        readAt: serverTimestamp(),
      })
    );

    await Promise.all(updatePromises);

    // Reset unread count in match
    const matchRef = doc(db, 'matches', matchId);
    await updateDoc(matchRef, {
      [`unreadCount.${userId}`]: 0,
    });
  } catch (error) {
    console.error('Error marking all messages as read:', error);
    throw error;
  }
}

/**
 * Get unread message count for a match
 */
export async function getUnreadCount(
  matchId: string,
  userId: string
): Promise<number> {
  try {
    const matchRef = doc(db, 'matches', matchId);
    const matchDoc = await getDoc(matchRef);

    if (matchDoc.exists()) {
      const unreadCount = matchDoc.data()?.unreadCount?.[userId] || 0;
      return unreadCount;
    }

    return 0;
  } catch (error) {
    console.error('Error getting unread count:', error);
    throw error;
  }
}

/**
 * Get chat window info (24-hour expiration)
 */
export async function getChatWindow(matchId: string): Promise<{
  isExpired: boolean;
  openedAt: Date | null;
  expiresAt: Date | null;
  messageCount: number;
} | null> {
  try {
    const chatWindowRef = doc(db, 'chatWindows', matchId);
    const chatWindowDoc = await getDoc(chatWindowRef);

    if (chatWindowDoc.exists()) {
      const data = chatWindowDoc.data();
      const expiresAt = data.expiresAt?.toDate() || null;
      const isExpired = expiresAt ? expiresAt < new Date() : false;

      return {
        isExpired,
        openedAt: data.openedAt?.toDate() || null,
        expiresAt,
        messageCount: data.messageCount || 0,
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting chat window:', error);
    throw error;
  }
}

/**
 * Subscribe to chat window status
 */
export function subscribeToChatWindow(
  matchId: string,
  callback: (chatWindow: {
    isExpired: boolean;
    openedAt: Date | null;
    expiresAt: Date | null;
    messageCount: number;
  } | null) => void
): Unsubscribe {
  const chatWindowRef = doc(db, 'chatWindows', matchId);

  return onSnapshot(chatWindowRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      const expiresAt = data.expiresAt?.toDate() || null;
      const isExpired = expiresAt ? expiresAt < new Date() : false;

      callback({
        isExpired,
        openedAt: data.openedAt?.toDate() || null,
        expiresAt,
        messageCount: data.messageCount || 0,
      });
    } else {
      callback(null);
    }
  });
}

/**
 * Delete a message (only allowed before other user reads it)
 */
export async function deleteMessage(messageId: string): Promise<void> {
  try {
    const messageRef = doc(db, 'messages', messageId);
    const messageDoc = await getDoc(messageRef);

    if (!messageDoc.exists()) {
      throw new Error('Message not found');
    }

    const messageData = messageDoc.data();

    if (messageData.isRead) {
      throw new Error('Cannot delete a message that has been read');
    }

    await updateDoc(messageRef, {
      text: '[Message deleted]',
      isDeleted: true,
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
}

/**
 * Get total unread messages across all matches
 */
export async function getTotalUnreadCount(userId: string): Promise<number> {
  try {
    const matchesRef = collection(db, 'matches');

    const q1 = query(
      matchesRef,
      where('user1Id', '==', userId),
      where('status', 'in', ['active', 'date_scheduled'])
    );

    const q2 = query(
      matchesRef,
      where('user2Id', '==', userId),
      where('status', 'in', ['active', 'date_scheduled'])
    );

    const [snapshot1, snapshot2] = await Promise.all([
      getDocs(q1),
      getDocs(q2),
    ]);

    let totalUnread = 0;

    [...snapshot1.docs, ...snapshot2.docs].forEach((doc) => {
      const data = doc.data();
      totalUnread += data.unreadCount?.[userId] || 0;
    });

    return totalUnread;
  } catch (error) {
    console.error('Error getting total unread count:', error);
    throw error;
  }
}
