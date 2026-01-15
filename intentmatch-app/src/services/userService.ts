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
  GeoPoint,
  writeBatch,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, auth } from '../../firebaseConfig';
import { UserProfile, DateWindow } from '../types';

/**
 * User Service
 * Handles user profiles, availability, and preferences
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
        id: docSnap.id,
        createdAt: data.createdAt?.toDate(),
        lastActiveAt: data.lastActiveAt?.toDate(),
        premiumExpiresAt: data.premiumExpiresAt?.toDate(),
      } as unknown as UserProfile;
    }

    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

/**
 * Get multiple user profiles by IDs
 */
export async function getUserProfiles(userIds: string[]): Promise<UserProfile[]> {
  try {
    const profiles: UserProfile[] = [];

    for (const userId of userIds) {
      const profile = await getUserProfile(userId);
      if (profile) {
        profiles.push(profile);
      }
    }

    return profiles;
  } catch (error) {
    console.error('Error fetching user profiles:', error);
    throw error;
  }
}

/**
 * Get discovery profiles (potential matches)
 * Excludes: self, already swiped, blocked users
 */
export async function getDiscoveryProfiles(
  currentUserId: string,
  preferences: {
    ageMin: number;
    ageMax: number;
    maxDistance: number;
    gender: string;
  },
  excludeIds: string[] = []
): Promise<UserProfile[]> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('isActive', '==', true),
      where('age', '>=', preferences.ageMin),
      where('age', '<=', preferences.ageMax),
      orderBy('age'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const querySnapshot = await getDocs(q);
    const profiles: UserProfile[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const profile = {
        ...data,
        id: docSnap.id,
        createdAt: data.createdAt?.toDate(),
        lastActiveAt: data.lastActiveAt?.toDate(),
        premiumExpiresAt: data.premiumExpiresAt?.toDate(),
      } as unknown as UserProfile;

      // Exclude current user and excluded IDs
      if (
        profile.id !== currentUserId &&
        !excludeIds.includes(profile.id)
      ) {
        profiles.push(profile);
      }
    });

    return profiles;
  } catch (error) {
    console.error('Error fetching discovery profiles:', error);
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
    // Convert URI to blob
    const response = await fetch(photoUri);
    const blob = await response.blob();

    // Generate unique filename
    const filename = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
    const storageRef = ref(storage, `users/${userId}/photos/${filename}`);

    // Upload
    await uploadBytes(storageRef, blob);

    // Get download URL
    const downloadUrl = await getDownloadURL(storageRef);

    // Update user profile
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
 * Delete profile photo from Firebase Storage
 */
export async function deleteProfilePhoto(
  userId: string,
  photoUrl: string
): Promise<void> {
  try {
    // Remove from user's photos array
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const currentPhotos = userDoc.data()?.photos || [];
    const updatedPhotos = currentPhotos.filter((url: string) => url !== photoUrl);

    await updateDoc(userRef, {
      photos: updatedPhotos,
      lastActiveAt: serverTimestamp(),
    });

    // Delete from storage
    // Extract storage path from URL
    const photoRef = ref(storage, photoUrl);
    await deleteObject(photoRef);
  } catch (error) {
    console.error('Error deleting photo:', error);
    throw error;
  }
}

/**
 * Set primary profile photo
 */
export async function setPrimaryPhoto(
  userId: string,
  photoUrl: string
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      primaryPhotoUrl: photoUrl,
      lastActiveAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error setting primary photo:', error);
    throw error;
  }
}

/**
 * Update user's availability slots
 */
export async function updateAvailability(
  userId: string,
  slots: DateWindow[]
): Promise<void> {
  try {
    // Clear existing availability
    const availabilityRef = collection(db, 'users', userId, 'availability');
    const existingSlots = await getDocs(availabilityRef);
    const deletePromises = existingSlots.docs.map((docSnap) =>
      deleteDoc(docSnap.ref)
    );
    await Promise.all(deletePromises);

    // Add new slots
    const addPromises = slots.map((slot) => {
      const slotRef = doc(availabilityRef);
      return setDoc(slotRef, {
        ...slot,
        createdAt: serverTimestamp(),
      });
    });

    await Promise.all(addPromises);
  } catch (error) {
    console.error('Error updating availability:', error);
    throw error;
  }
}

/**
 * Get user's availability slots
 */
export async function getAvailability(userId: string): Promise<DateWindow[]> {
  try {
    const availabilityRef = collection(db, 'users', userId, 'availability');
    const q = query(availabilityRef, orderBy('date'));
    const querySnapshot = await getDocs(q);

    const slots: DateWindow[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      slots.push({
        ...data,
        id: docSnap.id,
        createdAt: data.createdAt?.toDate(),
      } as unknown as DateWindow);
    });

    return slots;
  } catch (error) {
    console.error('Error fetching availability:', error);
    throw error;
  }
}

/**
 * Update user preferences
 */
export async function updatePreferences(
  userId: string,
  preferences: any
): Promise<void> {
  try {
    const preferencesRef = doc(db, 'users', userId, 'preferences', 'main');
    await setDoc(
      preferencesRef,
      {
        ...preferences,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error updating preferences:', error);
    throw error;
  }
}

/**
 * Get user preferences
 */
export async function getPreferences(userId: string): Promise<any> {
  try {
    const preferencesRef = doc(db, 'users', userId, 'preferences', 'main');
    const docSnap = await getDoc(preferencesRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        updatedAt: data.updatedAt?.toDate(),
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching preferences:', error);
    throw error;
  }
}

/**
 * Update user location
 */
export async function updateLocation(
  userId: string,
  location: {
    latitude: number;
    longitude: number;
    city: string;
    state: string;
  }
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      location: {
        ...location,
        geoPoint: new GeoPoint(location.latitude, location.longitude),
      },
      lastActiveAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating location:', error);
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

    const deletePromises = querySnapshot.docs.map((docSnap) =>
      deleteDoc(docSnap.ref)
    );
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
    querySnapshot.forEach((doc) => {
      blockedIds.push(doc.data().blockedUserId);
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

    // 1. Delete user's photos from Storage
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const photos = userDoc.data()?.photos || [];
      for (const photoUrl of photos) {
        try {
          const photoRef = ref(storage, photoUrl);
          await deleteObject(photoRef);
        } catch (e) {
          console.log('Photo already deleted or not found:', e);
        }
      }
    }

    // 2. Delete user's swipes
    const swipesRef = collection(db, 'swipes');
    const swipesQuery = query(swipesRef, where('swiperId', '==', userId));
    const swipesSnapshot = await getDocs(swipesQuery);
    swipesSnapshot.forEach((doc) => batch.delete(doc.ref));

    // Also delete swipes where user was the target
    const targetSwipesQuery = query(swipesRef, where('targetId', '==', userId));
    const targetSwipesSnapshot = await getDocs(targetSwipesQuery);
    targetSwipesSnapshot.forEach((doc) => batch.delete(doc.ref));

    // 3. Delete user's matches
    const matchesRef = collection(db, 'matches');
    const matchesQuery = query(matchesRef, where('userIds', 'array-contains', userId));
    const matchesSnapshot = await getDocs(matchesQuery);
    matchesSnapshot.forEach((doc) => batch.delete(doc.ref));

    // 4. Delete user's messages
    const messagesRef = collection(db, 'messages');
    const sentMessagesQuery = query(messagesRef, where('senderId', '==', userId));
    const sentMessagesSnapshot = await getDocs(sentMessagesQuery);
    sentMessagesSnapshot.forEach((doc) => batch.delete(doc.ref));

    // 5. Delete user's blocks
    const blocksRef = collection(db, 'blocks');
    const blockerQuery = query(blocksRef, where('blockerId', '==', userId));
    const blockerSnapshot = await getDocs(blockerQuery);
    blockerSnapshot.forEach((doc) => batch.delete(doc.ref));

    const blockedQuery = query(blocksRef, where('blockedUserId', '==', userId));
    const blockedSnapshot = await getDocs(blockedQuery);
    blockedSnapshot.forEach((doc) => batch.delete(doc.ref));

    // 6. Delete user's reports
    const reportsRef = collection(db, 'reports');
    const reporterQuery = query(reportsRef, where('reporterId', '==', userId));
    const reporterSnapshot = await getDocs(reporterQuery);
    reporterSnapshot.forEach((doc) => batch.delete(doc.ref));

    // 7. Delete subcollections (availability, preferences)
    const availabilityRef = collection(db, 'users', userId, 'availability');
    const availabilitySnapshot = await getDocs(availabilityRef);
    availabilitySnapshot.forEach((doc) => batch.delete(doc.ref));

    const preferencesRef = collection(db, 'users', userId, 'preferences');
    const preferencesSnapshot = await getDocs(preferencesRef);
    preferencesSnapshot.forEach((doc) => batch.delete(doc.ref));

    // 8. Delete user document
    batch.delete(doc(db, 'users', userId));

    // Commit all deletions
    await batch.commit();

    // 9. Delete Firebase Auth account
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.uid === userId) {
      await currentUser.delete();
    }
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
}
