import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, Auth } from 'firebase/auth';
// @ts-ignore - getReactNativePersistence exists at runtime but types are incomplete
import { getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase project configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'voicefirst.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'voicefirst',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'voicefirst.appspot.com',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_SENDER_ID',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || 'YOUR_APP_ID',
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || 'YOUR_MEASUREMENT_ID',
};

// Initialize Firebase - check if already initialized to avoid duplicate app error
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth with React Native persistence
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error: any) {
  // If auth is already initialized, just get the existing instance
  if (error.code === 'auth/already-initialized') {
    auth = getAuth(app);
  } else {
    // For any other error, fall back to getAuth
    console.warn('Firebase Auth initialization warning:', error.message);
    auth = getAuth(app);
  }
}

export { auth };
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

/**
 * SETUP INSTRUCTIONS:
 *
 * 1. Create a Firebase project:
 *    - Go to https://console.firebase.google.com/
 *    - Click "Add project"
 *    - Name it "VoiceFirst" or your preferred name
 *    - Enable Google Analytics (optional)
 *
 * 2. Register your app:
 *    - In Firebase Console, click the web icon (</>)
 *    - Register app with nickname "VoiceFirst Web"
 *    - Copy the configuration object
 *
 * 3. Create a .env file in the root directory:
 *    - Copy .env.example to .env
 *    - Fill in your Firebase credentials
 *
 * 4. Enable Authentication:
 *    - Go to Authentication > Sign-in method
 *    - Enable Email/Password
 *    - Enable Google (optional)
 *    - Enable Apple (optional)
 *    - Enable Facebook (optional)
 *
 * 5. Create Firestore Database:
 *    - Go to Firestore Database
 *    - Click "Create database"
 *    - Start in production mode
 *    - Choose a location (us-central1 recommended)
 *
 * 6. Set up Storage:
 *    - Go to Storage
 *    - Click "Get started"
 *    - Start in production mode
 *    - Use the default bucket
 *    - This will store voice recordings
 *
 * 7. Install Firebase dependencies:
 *    npm install firebase
 *
 * 8. Deploy security rules:
 *    - See firestore.rules and storage.rules files
 *    - Deploy using Firebase CLI or paste in console
 */
