import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
  AuthError,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { UserProfile } from '../types';

/**
 * Authentication Service for VoiceFirst
 * Handles user authentication with voice intro requirements
 */

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  age: number;
  bio?: string;
  voiceIntroUri?: string;     // Required for VoiceFirst
  voiceIntroDuration?: number;
}

export interface SignInData {
  email: string;
  password: string;
}

/**
 * Create a new user account with email and password
 * Also creates initial user profile in Firestore
 */
export async function signUp(data: SignUpData): Promise<User> {
  try {
    // Validate age
    if (data.age < 18) {
      throw new Error('You must be at least 18 years old to sign up');
    }

    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );

    const user = userCredential.user;

    // Update auth profile
    await updateProfile(user, {
      displayName: data.name,
    });

    // Create user profile in Firestore
    const userProfile: Partial<UserProfile> = {
      id: user.uid,
      email: data.email,
      name: data.name,
      age: data.age,
      bio: data.bio || '',
      voiceIntroUri: data.voiceIntroUri || '',
      voiceIntroDuration: data.voiceIntroDuration || 0,
      photos: [],
      primaryPhotoUrl: '',
      profileCompleted: false,
      voiceVerified: false,
      photoVerified: false,
      voicePlayCount: 0,
      matchRate: 0,
      avgMessageCount: 0,
      isActive: true,
      isPremium: false,
      createdAt: new Date(),
      lastActiveAt: new Date(),
      searchPreferences: {
        ageMin: Math.max(18, data.age - 5),
        ageMax: data.age + 5,
        maxDistance: 25,
        gender: 'any',
      },
    };

    await setDoc(doc(db, 'users', user.uid), {
      ...userProfile,
      createdAt: serverTimestamp(),
      lastActiveAt: serverTimestamp(),
      ...(data.voiceIntroUri && { voiceIntroCreatedAt: serverTimestamp() }),
    });

    return user;
  } catch (error) {
    const authError = error as AuthError;
    throw new Error(getAuthErrorMessage(authError));
  }
}

/**
 * Sign in existing user with email and password
 */
export async function signIn(data: SignInData): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );

    // Update last active timestamp
    const user = userCredential.user;
    await setDoc(
      doc(db, 'users', user.uid),
      {
        lastActiveAt: serverTimestamp(),
      },
      { merge: true }
    );

    return user;
  } catch (error) {
    const authError = error as AuthError;
    throw new Error(getAuthErrorMessage(authError));
  }
}

/**
 * Sign out current user
 */
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    const authError = error as AuthError;
    throw new Error(getAuthErrorMessage(authError));
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    const authError = error as AuthError;
    throw new Error(getAuthErrorMessage(authError));
  }
}

/**
 * Get current user's profile from Firestore
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const user = auth.currentUser;
  if (!user) {
    return null;
  }

  try {
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate(),
        lastActiveAt: data.lastActiveAt?.toDate(),
        voiceIntroCreatedAt: data.voiceIntroCreatedAt?.toDate(),
        premiumExpiresAt: data.premiumExpiresAt?.toDate(),
      } as UserProfile;
    }

    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

/**
 * Update current user's profile
 */
export async function updateUserProfile(
  updates: Partial<UserProfile>
): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No authenticated user');
  }

  try {
    // Update auth profile if name changed
    if (updates.name) {
      await updateProfile(user, {
        displayName: updates.name,
      });
    }

    // Update Firestore profile
    await setDoc(
      doc(db, 'users', user.uid),
      {
        ...updates,
        lastActiveAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

/**
 * Check if user profile is complete (including voice intro)
 */
export async function isProfileComplete(): Promise<boolean> {
  const profile = await getCurrentUserProfile();
  if (!profile) {
    return false;
  }

  return (
    profile.profileCompleted &&
    profile.name.length > 0 &&
    profile.bio.length > 0 &&
    profile.voiceIntroUri.length > 0 &&    // Voice intro required
    profile.photos.length > 0 &&
    profile.age >= 18
  );
}

/**
 * Convert Firebase Auth errors to user-friendly messages
 */
function getAuthErrorMessage(error: AuthError): string {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists';
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 8 characters';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/invalid-credential':
      return 'Invalid email or password';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection';
    default:
      return error.message || 'An error occurred during authentication';
  }
}

/**
 * Get current authenticated user
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return auth.currentUser !== null;
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(
  callback: (user: User | null) => void
): () => void {
  return auth.onAuthStateChanged(callback);
}
