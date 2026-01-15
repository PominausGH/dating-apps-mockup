import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { db, storage, auth } from '../../firebaseConfig';
import { UserProfile } from '../types';

/**
 * User Service for VoiceFirst
 * Handles user profiles, voice recordings, and account management
 */

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        id: userId,
        createdAt: data.createdAt?.toDate(),
        lastActiveAt: data.lastActiveAt?.toDate(),
        voiceIntroCreatedAt: data.voiceIntroCreatedAt?.toDate(),
      } as UserProfile;
    }

    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      lastActiveAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

/**
 * Upload voice intro to Firebase Storage
 */
export async function uploadVoiceIntro(
  userId: string,
  voiceUri: string,
  duration: number
): Promise<string> {
  try {
    // Convert URI to blob
    const response = await fetch(voiceUri);
    const blob = await response.blob();

    // Generate unique filename
    const filename = `voice_intro_${Date.now()}.m4a`;
    const storageRef = ref(storage, `users/${userId}/voice/${filename}`);

    // Upload
    await uploadBytes(storageRef, blob);

    // Get download URL
    const downloadUrl = await getDownloadURL(storageRef);

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
 * Upload profile photo to Firebase Storage
 */
export async function uploadProfilePhoto(
  userId: string,
  photoUri: string,
  isPrimary: boolean = false
): Promise<string> {
  try {
    const response = await fetch(photoUri);
    const blob = await response.blob();

    const filename = `photo_${Date.now()}.jpg`;
    const storageRef = ref(storage, `users/${userId}/photos/${filename}`);

    await uploadBytes(storageRef, blob);
    const downloadUrl = await getDownloadURL(storageRef);

    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const currentPhotos = userDoc.data()?.photos || [];

    await updateDoc(userRef, {
      photos: [...currentPhotos, downloadUrl],
      ...(isPrimary && { primaryPhotoUrl: downloadUrl }),
      lastActiveAt: serverTimestamp(),
    });

    return downloadUrl;
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }
}

/**
 * Deactivate user account
 */
export async function deactivateAccount(userId: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      isActive: false,
      lastActiveAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error deactivating account:', error);
    throw error;
  }
}

/**
 * Reactivate user account
 */
export async function reactivateAccount(userId: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      isActive: true,
      lastActiveAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error reactivating account:', error);
    throw error;
  }
}

/**
 * Report a user
 */
export async function reportUser(
  reporterId: string,
  reportedUserId: string,
  reason: string,
  description: string
): Promise<void> {
  try {
    const reportRef = doc(collection(db, 'reports'));
    await setDoc(reportRef, {
      reporterId,
      reportedUserId,
      reason,
      description,
      status: 'pending',
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error reporting user:', error);
    throw error;
  }
}

/**
 * Block a user
 */
export async function blockUser(
  blockerId: string,
  blockedUserId: string,
  reason?: string
): Promise<void> {
  try {
    const blockRef = doc(collection(db, 'blocks'));
    await setDoc(blockRef, {
      blockerId,
      blockedUserId,
      reason,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error blocking user:', error);
    throw error;
  }
}

/**
 * Unblock a user
 */
export async function unblockUser(
  blockerId: string,
  blockedUserId: string
): Promise<void> {
  try {
    const blocksRef = collection(db, 'blocks');
    const q = query(
      blocksRef,
      where('blockerId', '==', blockerId),
      where('blockedUserId', '==', blockedUserId)
    );
    const querySnapshot = await getDocs(q);

    const deletePromises = querySnapshot.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error unblocking user:', error);
    throw error;
  }
}

/**
 * Get blocked user IDs
 */
export async function getBlockedUsers(blockerId: string): Promise<string[]> {
  try {
    const blocksRef = collection(db, 'blocks');
    const q = query(blocksRef, where('blockerId', '==', blockerId));
    const querySnapshot = await getDocs(q);

    const blockedIds: string[] = [];
    querySnapshot.forEach((d) => {
      blockedIds.push(d.data().blockedUserId);
    });

    return blockedIds;
  } catch (error) {
    console.error('Error fetching blocked users:', error);
    throw error;
  }
}

/**
 * Permanently delete user account and all associated data
 * Required for App Store compliance
 */
export async function deleteAccount(userId: string): Promise<void> {
  try {
    const batch = writeBatch(db);

    // 1. Delete user's voice recordings and photos from Storage
    try {
      const voiceRef = ref(storage, `users/${userId}/voice`);
      const voiceFiles = await listAll(voiceRef);
      for (const file of voiceFiles.items) {
        await deleteObject(file);
      }
    } catch (e) {
      console.log('No voice files to delete:', e);
    }

    try {
      const photosRef = ref(storage, `users/${userId}/photos`);
      const photoFiles = await listAll(photosRef);
      for (const file of photoFiles.items) {
        await deleteObject(file);
      }
    } catch (e) {
      console.log('No photo files to delete:', e);
    }

    // 2. Delete user's swipes
    const swipesRef = collection(db, 'swipes');
    const swipesQuery = query(swipesRef, where('swiperId', '==', userId));
    const swipesSnapshot = await getDocs(swipesQuery);
    swipesSnapshot.forEach((d) => batch.delete(d.ref));

    const targetSwipesQuery = query(swipesRef, where('targetId', '==', userId));
    const targetSwipesSnapshot = await getDocs(targetSwipesQuery);
    targetSwipesSnapshot.forEach((d) => batch.delete(d.ref));

    // 3. Delete user's matches
    const matchesRef = collection(db, 'matches');
    const matchesQuery = query(matchesRef, where('userIds', 'array-contains', userId));
    const matchesSnapshot = await getDocs(matchesQuery);
    matchesSnapshot.forEach((d) => batch.delete(d.ref));

    // 4. Delete voice messages from matches
    // Note: Voice messages are stored in match subcollections
    for (const matchDoc of matchesSnapshot.docs) {
      const messagesRef = collection(db, 'matches', matchDoc.id, 'messages');
      const messagesSnapshot = await getDocs(messagesRef);
      messagesSnapshot.forEach((d) => batch.delete(d.ref));
    }

    // 5. Delete user's blocks
    const blocksRef = collection(db, 'blocks');
    const blockerQuery = query(blocksRef, where('blockerId', '==', userId));
    const blockerSnapshot = await getDocs(blockerQuery);
    blockerSnapshot.forEach((d) => batch.delete(d.ref));

    const blockedQuery = query(blocksRef, where('blockedUserId', '==', userId));
    const blockedSnapshot = await getDocs(blockedQuery);
    blockedSnapshot.forEach((d) => batch.delete(d.ref));

    // 6. Delete user's reports
    const reportsRef = collection(db, 'reports');
    const reporterQuery = query(reportsRef, where('reporterId', '==', userId));
    const reporterSnapshot = await getDocs(reporterQuery);
    reporterSnapshot.forEach((d) => batch.delete(d.ref));

    // 7. Delete user document
    batch.delete(doc(db, 'users', userId));

    // Commit all deletions
    await batch.commit();

    // 8. Delete Firebase Auth account
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.uid === userId) {
      await currentUser.delete();
    }
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
}
