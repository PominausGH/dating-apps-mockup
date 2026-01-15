import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  getMetadata,
} from 'firebase/storage';
import { db, storage } from '../../firebaseConfig';

/**
 * Voice Service for VoiceFirst
 * Handles voice recording uploads, downloads, and playback tracking
 */

export interface VoiceIntro {
  id: string;
  uri: string;
  duration: number;
  prompt: string;
  isCurrent: boolean;
  createdAt: Date;
  playCount: number;
}

export interface VoicePlaybackStat {
  id: string;
  listenerId: string;
  voiceOwnerId: string;
  voiceUri: string;
  duration: number;
  completionRate: number;
  replayed: boolean;
  replayCount: number;
  resultedInLike: boolean;
  timestamp: Date;
  profilePosition: number;
}

/**
 * Upload voice intro to Firebase Storage
 */
export async function uploadVoiceIntro(
  userId: string,
  localUri: string,
  duration: number,
  prompt: string = 'default'
): Promise<string> {
  try {
    // Validate duration (5-30 seconds)
    if (duration < 5 || duration > 30) {
      throw new Error('Voice intro must be between 5 and 30 seconds');
    }

    // Convert URI to blob
    const response = await fetch(localUri);
    const blob = await response.blob();

    // Validate file size (max 5MB)
    if (blob.size > 5 * 1024 * 1024) {
      throw new Error('Voice file is too large (max 5MB)');
    }

    // Generate unique filename
    const filename = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.m4a`;
    const storageRef = ref(storage, `users/${userId}/voiceIntros/${filename}`);

    // Upload with custom metadata
    const metadata = {
      contentType: 'audio/mp4',
      customMetadata: {
        duration: duration.toString(),
        prompt,
        userId,
      },
    };

    await uploadBytes(storageRef, blob, metadata);

    // Get download URL
    const downloadUrl = await getDownloadURL(storageRef);

    // Mark previous voice intros as not current
    const introsRef = collection(db, 'users', userId, 'voiceIntros');
    const currentIntros = await getDocs(query(introsRef, where('isCurrent', '==', true)));
    const updatePromises = currentIntros.docs.map((doc) =>
      updateDoc(doc.ref, { isCurrent: false })
    );
    await Promise.all(updatePromises);

    // Save to Firestore voiceIntros subcollection
    await addDoc(introsRef, {
      uri: downloadUrl,
      duration,
      prompt,
      isCurrent: true,
      playCount: 0,
      createdAt: serverTimestamp(),
    });

    // Update user profile
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      voiceIntroUri: downloadUrl,
      voiceIntroDuration: duration,
      voiceIntroCreatedAt: serverTimestamp(),
      lastActiveAt: serverTimestamp(),
    });

    return downloadUrl;
  } catch (error) {
    console.error('Error uploading voice intro:', error);
    throw error;
  }
}

/**
 * Get user's voice intro history
 */
export async function getVoiceIntros(userId: string): Promise<VoiceIntro[]> {
  try {
    const introsRef = collection(db, 'users', userId, 'voiceIntros');
    const q = query(introsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const intros: VoiceIntro[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      intros.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
      } as VoiceIntro);
    });

    return intros;
  } catch (error) {
    console.error('Error fetching voice intros:', error);
    throw error;
  }
}

/**
 * Get current voice intro for a user
 */
export async function getCurrentVoiceIntro(userId: string): Promise<VoiceIntro | null> {
  try {
    const introsRef = collection(db, 'users', userId, 'voiceIntros');
    const q = query(introsRef, where('isCurrent', '==', true), limit(1));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
      } as VoiceIntro;
    }

    return null;
  } catch (error) {
    console.error('Error fetching current voice intro:', error);
    throw error;
  }
}

/**
 * Switch to a different voice intro from history
 */
export async function switchVoiceIntro(
  userId: string,
  introId: string
): Promise<void> {
  try {
    const introsRef = collection(db, 'users', userId, 'voiceIntros');

    // Mark all as not current
    const allIntros = await getDocs(introsRef);
    const updatePromises = allIntros.docs.map((doc) =>
      updateDoc(doc.ref, { isCurrent: false })
    );
    await Promise.all(updatePromises);

    // Mark selected as current
    const selectedRef = doc(db, 'users', userId, 'voiceIntros', introId);
    await updateDoc(selectedRef, { isCurrent: true });

    // Update user profile
    const introDoc = await getDoc(selectedRef);
    const introData = introDoc.data();

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      voiceIntroUri: introData?.uri || '',
      voiceIntroDuration: introData?.duration || 0,
      lastActiveAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error switching voice intro:', error);
    throw error;
  }
}

/**
 * Delete a voice intro
 */
export async function deleteVoiceIntro(
  userId: string,
  introId: string
): Promise<void> {
  try {
    const introRef = doc(db, 'users', userId, 'voiceIntros', introId);
    const introDoc = await getDoc(introRef);

    if (!introDoc.exists()) {
      throw new Error('Voice intro not found');
    }

    const introData = introDoc.data();

    // Can't delete if it's the current intro and it's the only one
    if (introData.isCurrent) {
      const allIntros = await getVoiceIntros(userId);
      if (allIntros.length <= 1) {
        throw new Error('Cannot delete your only voice intro');
      }
    }

    // Delete from Storage
    const storageRef = ref(storage, introData.uri);
    await deleteObject(storageRef);

    // Delete from Firestore
    await deleteDoc(introRef);

    // If was current, set another as current
    if (introData.isCurrent) {
      const remainingIntros = await getVoiceIntros(userId);
      if (remainingIntros.length > 0) {
        await switchVoiceIntro(userId, remainingIntros[0].id);
      }
    }
  } catch (error) {
    console.error('Error deleting voice intro:', error);
    throw error;
  }
}

/**
 * Record voice playback stats
 */
export async function recordVoicePlayback(
  listenerId: string,
  voiceOwnerId: string,
  voiceUri: string,
  duration: number,
  completionRate: number,
  profilePosition: number = 0
): Promise<void> {
  try {
    const statsRef = collection(db, 'voicePlaybackStats');
    await addDoc(statsRef, {
      listenerId,
      voiceOwnerId,
      voiceUri,
      duration,
      completionRate,
      replayed: false,
      replayCount: 0,
      resultedInLike: false,
      profilePosition,
      timestamp: serverTimestamp(),
    });

    // Increment play count in user's voice intro
    const userRef = doc(db, 'users', voiceOwnerId);
    const userDoc = await getDoc(userRef);
    const currentPlayCount = userDoc.data()?.voicePlayCount || 0;

    await updateDoc(userRef, {
      voicePlayCount: currentPlayCount + 1,
    });
  } catch (error) {
    console.error('Error recording voice playback:', error);
    throw error;
  }
}

/**
 * Update playback stat to mark as resulted in like
 */
export async function markPlaybackResultedInLike(
  listenerId: string,
  voiceOwnerId: string,
  voiceUri: string
): Promise<void> {
  try {
    const statsRef = collection(db, 'voicePlaybackStats');
    const q = query(
      statsRef,
      where('listenerId', '==', listenerId),
      where('voiceOwnerId', '==', voiceOwnerId),
      where('voiceUri', '==', voiceUri),
      orderBy('timestamp', 'desc'),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const statDoc = querySnapshot.docs[0];
      await updateDoc(statDoc.ref, {
        resultedInLike: true,
      });
    }
  } catch (error) {
    console.error('Error marking playback resulted in like:', error);
    throw error;
  }
}

/**
 * Get voice prompts for recording
 */
export async function getVoicePrompts(
  category?: string,
  limitCount: number = 20
): Promise<Array<{
  id: string;
  text: string;
  category: string;
  difficulty: string;
}>> {
  try {
    const promptsRef = collection(db, 'voicePrompts');
    let q;

    if (category) {
      q = query(
        promptsRef,
        where('isActive', '==', true),
        where('category', '==', category),
        orderBy('popularityScore', 'desc'),
        limit(limitCount)
      );
    } else {
      q = query(
        promptsRef,
        where('isActive', '==', true),
        orderBy('popularityScore', 'desc'),
        limit(limitCount)
      );
    }

    const querySnapshot = await getDocs(q);
    const prompts: any[] = [];

    querySnapshot.forEach((doc) => {
      prompts.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return prompts;
  } catch (error) {
    console.error('Error fetching voice prompts:', error);
    throw error;
  }
}

/**
 * Increment prompt popularity when used
 */
export async function incrementPromptPopularity(promptId: string): Promise<void> {
  try {
    const promptRef = doc(db, 'voicePrompts', promptId);
    const promptDoc = await getDoc(promptRef);

    if (promptDoc.exists()) {
      const currentScore = promptDoc.data()?.popularityScore || 0;
      await updateDoc(promptRef, {
        popularityScore: currentScore + 1,
      });
    }
  } catch (error) {
    console.error('Error incrementing prompt popularity:', error);
    throw error;
  }
}

/**
 * Get voice playback analytics for a user
 */
export async function getVoiceAnalytics(userId: string): Promise<{
  totalPlays: number;
  avgCompletionRate: number;
  likeConversionRate: number;
}> {
  try {
    const statsRef = collection(db, 'voicePlaybackStats');
    const q = query(
      statsRef,
      where('voiceOwnerId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(100)
    );

    const querySnapshot = await getDocs(q);

    let totalPlays = 0;
    let totalCompletionRate = 0;
    let likesAfterPlay = 0;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      totalPlays++;
      totalCompletionRate += data.completionRate || 0;
      if (data.resultedInLike) {
        likesAfterPlay++;
      }
    });

    return {
      totalPlays,
      avgCompletionRate: totalPlays > 0 ? totalCompletionRate / totalPlays : 0,
      likeConversionRate: totalPlays > 0 ? (likesAfterPlay / totalPlays) * 100 : 0,
    };
  } catch (error) {
    console.error('Error fetching voice analytics:', error);
    throw error;
  }
}
