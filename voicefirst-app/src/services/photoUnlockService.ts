import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';

/**
 * Photo Unlock Service for VoiceFirst
 * Handles progressive photo reveal based on message count
 */

export interface PhotoUnlockProgress {
  matchId: string;
  user1Id: string;
  user2Id: string;
  totalMessages: number;
  user1Messages: number;
  user2Messages: number;
  user1PhotoBlur: number;      // 0-100 (User1's photo blur for User2)
  user2PhotoBlur: number;      // 0-100 (User2's photo blur for User1)
  milestones: {
    messages1: boolean;        // 1 message: 80% blur
    messages3: boolean;        // 3 messages: 50% blur
    messages5: boolean;        // 5 messages: 20% blur
    messages8: boolean;        // 8 messages: 0% blur (unlocked!)
  };
  user1PhotoUnlockedAt?: Date;
  user2PhotoUnlockedAt?: Date;
  lastUpdated: Date;
}

/**
 * Calculate blur intensity based on message count
 */
export function calculateBlurIntensity(messageCount: number): number {
  if (messageCount === 0) return 100;
  if (messageCount <= 2) return 80;
  if (messageCount <= 4) return 50;
  if (messageCount <= 7) return 20;
  return 0;
}

/**
 * Get unlock progress percentage (0-100)
 */
export function getUnlockProgress(messageCount: number): number {
  if (messageCount >= 8) return 100;
  if (messageCount >= 5) return 75;
  if (messageCount >= 3) return 50;
  if (messageCount >= 1) return 25;
  return 0;
}

/**
 * Check if photo is fully unlocked
 */
export function isPhotoUnlocked(messageCount: number): boolean {
  return messageCount >= 8;
}

/**
 * Get next milestone info
 */
export function getNextMilestone(messageCount: number): {
  messagesNeeded: number;
  blurLevel: number;
} | null {
  if (messageCount < 1) return { messagesNeeded: 1, blurLevel: 80 };
  if (messageCount < 3) return { messagesNeeded: 3 - messageCount, blurLevel: 50 };
  if (messageCount < 5) return { messagesNeeded: 5 - messageCount, blurLevel: 20 };
  if (messageCount < 8) return { messagesNeeded: 8 - messageCount, blurLevel: 0 };
  return null;
}

/**
 * Initialize photo unlock progress for a new match
 */
export async function initializePhotoUnlock(
  matchId: string,
  user1Id: string,
  user2Id: string
): Promise<void> {
  try {
    const progressRef = doc(db, 'photoUnlockProgress', matchId);

    await setDoc(progressRef, {
      matchId,
      user1Id,
      user2Id,
      totalMessages: 0,
      user1Messages: 0,
      user2Messages: 0,
      user1PhotoBlur: 100,      // Start fully blurred
      user2PhotoBlur: 100,      // Start fully blurred
      milestones: {
        messages1: false,
        messages3: false,
        messages5: false,
        messages8: false,
      },
      lastUpdated: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error initializing photo unlock:', error);
    throw error;
  }
}

/**
 * Update photo unlock progress when a message is sent
 */
export async function updatePhotoUnlockProgress(
  matchId: string,
  senderId: string
): Promise<{
  triggeredMilestone: boolean;
  milestoneNumber?: number;
  newBlurLevel?: number;
}> {
  try {
    const progressRef = doc(db, 'photoUnlockProgress', matchId);
    const progressDoc = await getDoc(progressRef);

    if (!progressDoc.exists()) {
      // Initialize if doesn't exist
      const matchRef = doc(db, 'matches', matchId);
      const matchDoc = await getDoc(matchRef);
      const matchData = matchDoc.data();

      if (matchData) {
        await initializePhotoUnlock(matchId, matchData.user1Id, matchData.user2Id);
      }

      return { triggeredMilestone: false };
    }

    const data = progressDoc.data();
    const isUser1 = data.user1Id === senderId;

    // Increment message counts
    const newTotalMessages = (data.totalMessages || 0) + 1;
    const newUser1Messages = isUser1
      ? (data.user1Messages || 0) + 1
      : data.user1Messages || 0;
    const newUser2Messages = !isUser1
      ? (data.user2Messages || 0) + 1
      : data.user2Messages || 0;

    // Calculate new blur levels
    // User1's photo blur is reduced by User2's messages
    // User2's photo blur is reduced by User1's messages
    const newUser1PhotoBlur = calculateBlurIntensity(newUser2Messages);
    const newUser2PhotoBlur = calculateBlurIntensity(newUser1Messages);

    // Check milestones
    const milestones = {
      messages1: newTotalMessages >= 1,
      messages3: newTotalMessages >= 3,
      messages5: newTotalMessages >= 5,
      messages8: newTotalMessages >= 8,
    };

    // Determine if a milestone was triggered
    const previousMilestones = data.milestones || {
      messages1: false,
      messages3: false,
      messages5: false,
      messages8: false,
    };

    let triggeredMilestone = false;
    let milestoneNumber: number | undefined;
    let newBlurLevel: number | undefined;

    if (!previousMilestones.messages8 && milestones.messages8) {
      triggeredMilestone = true;
      milestoneNumber = 8;
      newBlurLevel = 0;
    } else if (!previousMilestones.messages5 && milestones.messages5) {
      triggeredMilestone = true;
      milestoneNumber = 5;
      newBlurLevel = 20;
    } else if (!previousMilestones.messages3 && milestones.messages3) {
      triggeredMilestone = true;
      milestoneNumber = 3;
      newBlurLevel = 50;
    } else if (!previousMilestones.messages1 && milestones.messages1) {
      triggeredMilestone = true;
      milestoneNumber = 1;
      newBlurLevel = 80;
    }

    // Update progress
    const updates: any = {
      totalMessages: newTotalMessages,
      user1Messages: newUser1Messages,
      user2Messages: newUser2Messages,
      user1PhotoBlur: newUser1PhotoBlur,
      user2PhotoBlur: newUser2PhotoBlur,
      milestones,
      lastUpdated: serverTimestamp(),
    };

    // Mark photo as unlocked if threshold reached
    if (newUser2Messages >= 8 && !data.user1PhotoUnlockedAt) {
      updates.user1PhotoUnlockedAt = serverTimestamp();
    }
    if (newUser1Messages >= 8 && !data.user2PhotoUnlockedAt) {
      updates.user2PhotoUnlockedAt = serverTimestamp();
    }

    await updateDoc(progressRef, updates);

    // Update match with photo unlock status
    if (newUser1Messages >= 8 && newUser2Messages >= 8) {
      const matchRef = doc(db, 'matches', matchId);
      await updateDoc(matchRef, {
        status: 'photo_unlocked',
        'photosUnlocked.user1': true,
        'photosUnlocked.user2': true,
      });
    }

    return {
      triggeredMilestone,
      milestoneNumber,
      newBlurLevel,
    };
  } catch (error) {
    console.error('Error updating photo unlock progress:', error);
    throw error;
  }
}

/**
 * Get photo unlock progress for a match
 */
export async function getPhotoUnlockProgress(
  matchId: string
): Promise<PhotoUnlockProgress | null> {
  try {
    const progressRef = doc(db, 'photoUnlockProgress', matchId);
    const progressDoc = await getDoc(progressRef);

    if (progressDoc.exists()) {
      const data = progressDoc.data();
      return {
        ...data,
        user1PhotoUnlockedAt: data.user1PhotoUnlockedAt?.toDate(),
        user2PhotoUnlockedAt: data.user2PhotoUnlockedAt?.toDate(),
        lastUpdated: data.lastUpdated?.toDate(),
      } as PhotoUnlockProgress;
    }

    return null;
  } catch (error) {
    console.error('Error fetching photo unlock progress:', error);
    throw error;
  }
}

/**
 * Subscribe to photo unlock progress in real-time
 */
export function subscribeToPhotoUnlock(
  matchId: string,
  callback: (progress: PhotoUnlockProgress | null) => void
): Unsubscribe {
  const progressRef = doc(db, 'photoUnlockProgress', matchId);

  return onSnapshot(progressRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      callback({
        ...data,
        user1PhotoUnlockedAt: data.user1PhotoUnlockedAt?.toDate(),
        user2PhotoUnlockedAt: data.user2PhotoUnlockedAt?.toDate(),
        lastUpdated: data.lastUpdated?.toDate(),
      } as PhotoUnlockProgress);
    } else {
      callback(null);
    }
  });
}

/**
 * Get blur level for a specific user's photo in a match
 */
export async function getBlurLevelForUser(
  matchId: string,
  viewingUserId: string,
  photoOwnerId: string
): Promise<number> {
  try {
    const progress = await getPhotoUnlockProgress(matchId);

    if (!progress) {
      return 100; // Fully blurred if no progress
    }

    // If viewing user is user1, return user2's photo blur (and vice versa)
    if (progress.user1Id === viewingUserId && progress.user2Id === photoOwnerId) {
      return progress.user2PhotoBlur;
    } else if (progress.user2Id === viewingUserId && progress.user1Id === photoOwnerId) {
      return progress.user1PhotoBlur;
    }

    return 100; // Default to fully blurred
  } catch (error) {
    console.error('Error getting blur level:', error);
    return 100;
  }
}

/**
 * Get unlock status for both users in a match
 */
export async function getUnlockStatus(
  matchId: string,
  currentUserId: string
): Promise<{
  myPhotoUnlocked: boolean;     // Has partner unlocked my photo?
  partnerPhotoUnlocked: boolean; // Have I unlocked partner's photo?
  myMessages: number;
  partnerMessages: number;
  myBlurLevel: number;
  partnerBlurLevel: number;
}> {
  try {
    const progress = await getPhotoUnlockProgress(matchId);

    if (!progress) {
      return {
        myPhotoUnlocked: false,
        partnerPhotoUnlocked: false,
        myMessages: 0,
        partnerMessages: 0,
        myBlurLevel: 100,
        partnerBlurLevel: 100,
      };
    }

    const isUser1 = progress.user1Id === currentUserId;

    if (isUser1) {
      return {
        myPhotoUnlocked: progress.user2Messages >= 8,
        partnerPhotoUnlocked: progress.user1Messages >= 8,
        myMessages: progress.user1Messages,
        partnerMessages: progress.user2Messages,
        myBlurLevel: progress.user1PhotoBlur,
        partnerBlurLevel: progress.user2PhotoBlur,
      };
    } else {
      return {
        myPhotoUnlocked: progress.user1Messages >= 8,
        partnerPhotoUnlocked: progress.user2Messages >= 8,
        myMessages: progress.user2Messages,
        partnerMessages: progress.user1Messages,
        myBlurLevel: progress.user2PhotoBlur,
        partnerBlurLevel: progress.user1PhotoBlur,
      };
    }
  } catch (error) {
    console.error('Error getting unlock status:', error);
    throw error;
  }
}
