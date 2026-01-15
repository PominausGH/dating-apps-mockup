import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { VoiceMatch } from '../types';

/**
 * Match Service for VoiceFirst
 * Handles matching, swipes, and photo unlock tracking
 */

/**
 * Record a swipe action
 */
export async function recordSwipe(
  userId: string,
  targetUserId: string,
  action: 'like' | 'pass'
): Promise<{ isMatch: boolean; matchId?: string }> {
  try {
    // Record the swipe
    const swipeRef = doc(db, 'swipes', `${userId}_${targetUserId}`);
    await setDoc(swipeRef, {
      swiperId: userId,
      targetId: targetUserId,
      action,
      timestamp: serverTimestamp(),
    });

    // If it's a pass, no match possible
    if (action === 'pass') {
      return { isMatch: false };
    }

    // Check if target has already liked us
    const reverseSwipeRef = doc(db, 'swipes', `${targetUserId}_${userId}`);
    const reverseSwipeDoc = await getDoc(reverseSwipeRef);

    if (reverseSwipeDoc.exists() && reverseSwipeDoc.data()?.action === 'like') {
      // It's a match!
      const matchId = [userId, targetUserId].sort().join('_');
      const matchRef = doc(db, 'matches', matchId);

      await setDoc(matchRef, {
        user1Id: userId < targetUserId ? userId : targetUserId,
        user2Id: userId < targetUserId ? targetUserId : userId,
        userIds: [userId, targetUserId],
        matchedAt: serverTimestamp(),
        messageCount: 0,
        photoUnlockProgress: {
          [userId]: 0,
          [targetUserId]: 0,
        },
        unreadCount: {
          [userId]: 0,
          [targetUserId]: 0,
        },
      });

      return { isMatch: true, matchId };
    }

    return { isMatch: false };
  } catch (error) {
    console.error('Error recording swipe:', error);
    throw error;
  }
}

/**
 * Get all matches for a user
 */
export async function getMatches(userId: string): Promise<VoiceMatch[]> {
  try {
    const matchesRef = collection(db, 'matches');
    const q = query(
      matchesRef,
      where('userIds', 'array-contains', userId),
      orderBy('matchedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const matches: VoiceMatch[] = [];

    for (const matchDoc of querySnapshot.docs) {
      const matchData = matchDoc.data();
      const otherUserId = matchData.user1Id === userId
        ? matchData.user2Id
        : matchData.user1Id;

      // Get other user's profile
      const userRef = doc(db, 'users', otherUserId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();

      // Calculate photo reveal level based on message count
      const messageCount = matchData.messageCount || 0;
      const photoRevealLevel = calculatePhotoRevealLevel(messageCount);

      matches.push({
        id: matchDoc.id,
        name: userData?.name || 'Unknown',
        age: userData?.age || 0,
        photo: userData?.primaryPhotoUrl || userData?.photos?.[0],
        photoRevealLevel,
        voiceMessageCount: messageCount,
        unread: (matchData.unreadCount?.[userId] || 0) > 0,
        timestamp: matchData.matchedAt?.toDate()?.toLocaleDateString() || '',
        matchedAt: matchData.matchedAt?.toDate() || new Date(),
        userId: otherUserId,
      });
    }

    return matches;
  } catch (error) {
    console.error('Error fetching matches:', error);
    throw error;
  }
}

/**
 * Subscribe to matches in real-time
 */
export function subscribeToMatches(
  userId: string,
  callback: (matches: VoiceMatch[]) => void
): Unsubscribe {
  const matchesRef = collection(db, 'matches');
  const q = query(
    matchesRef,
    where('userIds', 'array-contains', userId),
    orderBy('matchedAt', 'desc')
  );

  return onSnapshot(q, async (snapshot) => {
    const matches: VoiceMatch[] = [];

    for (const matchDoc of snapshot.docs) {
      const matchData = matchDoc.data();
      const otherUserId = matchData.user1Id === userId
        ? matchData.user2Id
        : matchData.user1Id;

      // Get other user's profile
      const userRef = doc(db, 'users', otherUserId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();

      const messageCount = matchData.messageCount || 0;
      const photoRevealLevel = calculatePhotoRevealLevel(messageCount);

      matches.push({
        id: matchDoc.id,
        name: userData?.name || 'Unknown',
        age: userData?.age || 0,
        photo: userData?.primaryPhotoUrl || userData?.photos?.[0],
        photoRevealLevel,
        voiceMessageCount: messageCount,
        unread: (matchData.unreadCount?.[userId] || 0) > 0,
        timestamp: matchData.matchedAt?.toDate()?.toLocaleDateString() || '',
        matchedAt: matchData.matchedAt?.toDate() || new Date(),
        userId: otherUserId,
      });
    }

    callback(matches);
  });
}

/**
 * Calculate photo reveal level based on message count
 * Photo unlock milestones: 1, 3, 5, 8 messages
 */
function calculatePhotoRevealLevel(messageCount: number): number {
  if (messageCount >= 8) return 100; // Fully revealed
  if (messageCount >= 5) return 80;
  if (messageCount >= 3) return 50;
  if (messageCount >= 1) return 20;
  return 0; // Fully blurred
}

/**
 * Get a single match by ID
 */
export async function getMatch(matchId: string): Promise<VoiceMatch | null> {
  try {
    const matchRef = doc(db, 'matches', matchId);
    const matchDoc = await getDoc(matchRef);

    if (!matchDoc.exists()) {
      return null;
    }

    const matchData = matchDoc.data();
    return matchData as unknown as VoiceMatch;
  } catch (error) {
    console.error('Error fetching match:', error);
    throw error;
  }
}
