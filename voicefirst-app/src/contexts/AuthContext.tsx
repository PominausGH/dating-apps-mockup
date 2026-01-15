import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string, age?: number) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password: string, name?: string, age?: number) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Create initial Firestore user document for VoiceFirst
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      id: userCredential.user.uid,
      email: email,
      name: name || '',
      age: age || 0,
      bio: '',
      photos: [],
      primaryPhotoUrl: '',
      voiceIntroUri: '',
      voiceIntroDuration: 0,
      profileCompleted: false,
      voiceVerified: false,
      photoVerified: false,
      voicePlayCount: 0,
      matchRate: 0,
      avgMessageCount: 0,
      isActive: true,
      isPremium: false,
      searchPreferences: {
        ageMin: 18,
        ageMax: 35,
        maxDistance: 25,
        gender: 'any',
      },
      createdAt: serverTimestamp(),
      lastActiveAt: serverTimestamp(),
    });
  };

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
