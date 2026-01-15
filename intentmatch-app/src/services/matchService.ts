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
  limit,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Match, ScheduledDate } from '../types';

/**
 * Match Service
 * Handles swipes, matches, and scheduled dates
 */

/**
 * Record a swipe (like or pass)
 */
export async function recordSwipe(
  userId: string,
  targetUserId: string,
  action: 'like' | 'pass'
): Promise<{ isMatch: boolean; matchId?: string }> {
  try {
    // Record swipe
    const swipeRef = doc(collection(db, 'swipes'));
    await setDoc(swipeRef, {
      userId,
      targetUserId,
      action,
      timestamp: serverTimestamp(),
    });

    // Check if it's a match (mutual like)
    if (action === 'like') {
      const reciprocalSwipesRef = collection(db, 'swipes');
      const q = query(
        reciprocalSwipesRef,
        where('userId', '==', targetUserId),
        where('targetUserId', '==', userId),
        where('action', '==', 'like')
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // It's a match! Create match document
        const matchRef = doc(collection(db, 'matches'));

        // Get user profiles for denormalization
        const [user1Doc, user2Doc] = await Promise.all([
          getDoc(doc(db, 'users', userId)),
          getDoc(doc(db, 'users', targetUserId)),
        ]);

        const user1Data = user1Doc.data();
        const user2Data = user2Doc.data();

        await setDoc(matchRef, {
          user1Id: userId,
          user2Id: targetUserId,
          user1Name: user1Data?.name || '',
          user2Name: user2Data?.name || '',
          user1PhotoUrl: user1Data?.primaryPhotoUrl || '',
          user2PhotoUrl: user2Data?.primaryPhotoUrl || '',
          matchedAt: serverTimestamp(),
          initiatedBy: targetUserId, // They liked first
          status: 'active',
          unreadCount: {
            [userId]: 0,
            [targetUserId]: 0,
          },
        });

        return { isMatch: true, matchId: matchRef.id };
      }
    }

    return { isMatch: false };
  } catch (error) {
    console.error('Error recording swipe:', error);
    throw error;
  }
}

/**
 * Get user's matches
 */
export async function getMatches(userId: string): Promise<Match[]> {
  try {
    const matchesRef = collection(db, 'matches');

    // Query for matches where user is user1 or user2
    const q1 = query(
      matchesRef,
      where('user1Id', '==', userId),
      where('status', 'in', ['active', 'date_scheduled']),
      orderBy('matchedAt', 'desc')
    );

    const q2 = query(
      matchesRef,
      where('user2Id', '==', userId),
      where('status', 'in', ['active', 'date_scheduled']),
      orderBy('matchedAt', 'desc')
    );

    const [snapshot1, snapshot2] = await Promise.all([
      getDocs(q1),
      getDocs(q2),
    ]);

    const matches: Match[] = [];

    [...snapshot1.docs, ...snapshot2.docs].forEach((doc) => {
      const data = doc.data();
      matches.push({
        ...data,
        id: doc.id,
        matchedAt: data.matchedAt?.toDate(),
        lastMessageAt: data.lastMessageAt?.toDate(),
      } as unknown as Match);
    });

    // Sort by most recent activity
    matches.sort((a, b) => {
      const dateA: any = a.lastMessageAt || a.matchedAt;
      const dateB: any = b.lastMessageAt || b.matchedAt;
      const timeA = dateA instanceof Date ? dateA.getTime() : new Date(dateA).getTime();
      const timeB = dateB instanceof Date ? dateB.getTime() : new Date(dateB).getTime();
      return timeB - timeA;
    });

    return matches;
  } catch (error) {
    console.error('Error fetching matches:', error);
    throw error;
  }
}

/**
 * Get a specific match by ID
 */
export async function getMatch(matchId: string): Promise<Match | null> {
  try {
    const matchRef = doc(db, 'matches', matchId);
    const matchDoc = await getDoc(matchRef);

    if (matchDoc.exists()) {
      const data = matchDoc.data();
      return {
        ...data,
        id: matchDoc.id,
        matchedAt: data.matchedAt?.toDate(),
        lastMessageAt: data.lastMessageAt?.toDate(),
      } as unknown as Match;
    }

    return null;
  } catch (error) {
    console.error('Error fetching match:', error);
    throw error;
  }
}

/**
 * Listen to matches in real-time
 */
export function subscribeToMatches(
  userId: string,
  callback: (matches: Match[]) => void
): Unsubscribe {
  const matchesRef = collection(db, 'matches');

  const q1 = query(
    matchesRef,
    where('user1Id', '==', userId),
    where('status', 'in', ['active', 'date_scheduled']),
    orderBy('matchedAt', 'desc')
  );

  const q2 = query(
    matchesRef,
    where('user2Id', '==', userId),
    where('status', 'in', ['active', 'date_scheduled']),
    orderBy('matchedAt', 'desc')
  );

  const matches = new Map<string, Match>();

  const unsubscribe1 = onSnapshot(q1, (snapshot) => {
    snapshot.forEach((doc) => {
      const data = doc.data();
      matches.set(doc.id, {
        ...data,
        id: doc.id,
        matchedAt: data.matchedAt?.toDate(),
        lastMessageAt: data.lastMessageAt?.toDate(),
      } as unknown as Match);
    });

    callback(Array.from(matches.values()));
  });

  const unsubscribe2 = onSnapshot(q2, (snapshot) => {
    snapshot.forEach((doc) => {
      const data = doc.data();
      matches.set(doc.id, {
        ...data,
        id: doc.id,
        matchedAt: data.matchedAt?.toDate(),
        lastMessageAt: data.lastMessageAt?.toDate(),
      } as unknown as Match);
    });

    callback(Array.from(matches.values()));
  });

  // Return combined unsubscribe function
  return () => {
    unsubscribe1();
    unsubscribe2();
  };
}

/**
 * Unmatch with a user
 */
export async function unmatch(matchId: string): Promise<void> {
  try {
    const matchRef = doc(db, 'matches', matchId);
    await updateDoc(matchRef, {
      status: 'unmatched',
      unmatchedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error unmatching:', error);
    throw error;
  }
}

/**
 * Get scheduled date for a match
 */
export async function getScheduledDate(
  matchId: string
): Promise<ScheduledDate | null> {
  try {
    const datesRef = collection(db, 'scheduledDates');
    const q = query(
      datesRef,
      where('matchId', '==', matchId),
      where('status', 'in', ['pending_confirmation', 'confirmed']),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate(),
        scheduledFor: data.scheduledFor?.toDate(),
        confirmationDeadline: data.confirmationDeadline?.toDate(),
        autoConfirmedAt: data.autoConfirmedAt?.toDate(),
        completedAt: data.completedAt?.toDate(),
      } as unknown as ScheduledDate;
    }

    return null;
  } catch (error) {
    console.error('Error fetching scheduled date:', error);
    throw error;
  }
}

/**
 * Confirm scheduled date
 */
export async function confirmScheduledDate(
  dateId: string,
  userId: string
): Promise<void> {
  try {
    const dateRef = doc(db, 'scheduledDates', dateId);
    const dateDoc = await getDoc(dateRef);

    if (!dateDoc.exists()) {
      throw new Error('Scheduled date not found');
    }

    const data = dateDoc.data();
    const isUser1 = data.user1Id === userId;
    const confirmField = isUser1 ? 'confirmedByUser1' : 'confirmedByUser2';

    const updates: any = {
      [confirmField]: true,
    };

    // Check if both confirmed
    const otherConfirmField = isUser1 ? 'confirmedByUser2' : 'confirmedByUser1';
    if (data[otherConfirmField] === true) {
      updates.status = 'confirmed';
    }

    await updateDoc(dateRef, updates);

    // Update match status
    await updateDoc(doc(db, 'matches', data.matchId), {
      status: 'date_scheduled',
    });
  } catch (error) {
    console.error('Error confirming date:', error);
    throw error;
  }
}

/**
 * Select venue for scheduled date
 */
export async function selectVenue(
  dateId: string,
  venue: {
    id: string;
    name: string;
    address: string;
    type: string;
    placeId?: string;
  } | null,
  decideInPerson: boolean = false
): Promise<void> {
  try {
    const dateRef = doc(db, 'scheduledDates', dateId);
    await updateDoc(dateRef, {
      selectedVenue: venue,
      decideVenueInPerson: decideInPerson,
    });
  } catch (error) {
    console.error('Error selecting venue:', error);
    throw error;
  }
}

/**
 * Request reschedule for a date
 */
export async function requestReschedule(
  dateId: string,
  newSlotId: string
): Promise<void> {
  try {
    const dateRef = doc(db, 'scheduledDates', dateId);
    const dateDoc = await getDoc(dateRef);

    if (!dateDoc.exists()) {
      throw new Error('Scheduled date not found');
    }

    const data = dateDoc.data();

    // Find the alternative slot
    const newSlot = data.alternativeSlots?.find((slot: any) => slot.id === newSlotId);

    if (!newSlot) {
      throw new Error('Alternative slot not found');
    }

    await updateDoc(dateRef, {
      selectedSlot: newSlot,
      status: 'rescheduled',
      confirmedByUser1: false,
      confirmedByUser2: false,
    });
  } catch (error) {
    console.error('Error requesting reschedule:', error);
    throw error;
  }
}

/**
 * Cancel scheduled date
 */
export async function cancelScheduledDate(
  dateId: string,
  reason?: string
): Promise<void> {
  try {
    const dateRef = doc(db, 'scheduledDates', dateId);
    await updateDoc(dateRef, {
      status: 'cancelled',
      cancellationReason: reason,
      cancelledAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error cancelling date:', error);
    throw error;
  }
}

/**
 * Mark date as completed
 */
export async function markDateCompleted(dateId: string): Promise<void> {
  try {
    const dateRef = doc(db, 'scheduledDates', dateId);
    await updateDoc(dateRef, {
      status: 'completed',
      completedAt: serverTimestamp(),
    });

    // Update match status
    const dateDoc = await getDoc(dateRef);
    if (dateDoc.exists()) {
      const matchRef = doc(db, 'matches', dateDoc.data().matchId);
      await updateDoc(matchRef, {
        status: 'date_completed',
      });
    }
  } catch (error) {
    console.error('Error marking date completed:', error);
    throw error;
  }
}

/**
 * Get user's upcoming dates
 */
export async function getUpcomingDates(userId: string): Promise<ScheduledDate[]> {
  try {
    const datesRef = collection(db, 'scheduledDates');
    const now = new Date();

    const q1 = query(
      datesRef,
      where('user1Id', '==', userId),
      where('scheduledFor', '>=', now),
      where('status', 'in', ['pending_confirmation', 'confirmed']),
      orderBy('scheduledFor')
    );

    const q2 = query(
      datesRef,
      where('user2Id', '==', userId),
      where('scheduledFor', '>=', now),
      where('status', 'in', ['pending_confirmation', 'confirmed']),
      orderBy('scheduledFor')
    );

    const [snapshot1, snapshot2] = await Promise.all([
      getDocs(q1),
      getDocs(q2),
    ]);

    const dates: ScheduledDate[] = [];

    [...snapshot1.docs, ...snapshot2.docs].forEach((doc) => {
      const data = doc.data();
      dates.push({
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate(),
        scheduledFor: data.scheduledFor?.toDate(),
        confirmationDeadline: data.confirmationDeadline?.toDate(),
        autoConfirmedAt: data.autoConfirmedAt?.toDate(),
        completedAt: data.completedAt?.toDate(),
      } as unknown as ScheduledDate);
    });

    // Sort by scheduled date
    dates.sort((a, b) => (a.scheduledFor?.getTime() || 0) - (b.scheduledFor?.getTime() || 0));

    return dates;
  } catch (error) {
    console.error('Error fetching upcoming dates:', error);
    throw error;
  }
}
