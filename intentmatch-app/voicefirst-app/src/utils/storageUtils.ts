/**
 * Storage utilities for VoiceFirst app
 * Manages app state persistence including onboarding status
 */

// In-memory storage for demo purposes
// In production, use @react-native-async-storage/async-storage
const storage: Record<string, string> = {};

export const StorageKeys = {
  ONBOARDING_COMPLETED: 'onboarding_completed',
  USER_PROFILE: 'user_profile',
  USER_PREFERENCES: 'user_preferences',
  VOICE_INTRO_URI: 'voice_intro_uri',
} as const;

/**
 * Save onboarding completion status
 */
export const saveOnboardingComplete = async (): Promise<void> => {
  try {
    storage[StorageKeys.ONBOARDING_COMPLETED] = 'true';
    // In production: await AsyncStorage.setItem(StorageKeys.ONBOARDING_COMPLETED, 'true');
  } catch (error) {
    console.error('Error saving onboarding status:', error);
  }
};

/**
 * Check if user has completed onboarding
 */
export const hasCompletedOnboarding = async (): Promise<boolean> => {
  try {
    const value = storage[StorageKeys.ONBOARDING_COMPLETED];
    // In production: const value = await AsyncStorage.getItem(StorageKeys.ONBOARDING_COMPLETED);
    return value === 'true';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
};

/**
 * Save user profile data
 */
export const saveUserProfile = async (profile: {
  name: string;
  age: number;
  bio: string;
}): Promise<void> => {
  try {
    storage[StorageKeys.USER_PROFILE] = JSON.stringify(profile);
    // In production: await AsyncStorage.setItem(StorageKeys.USER_PROFILE, JSON.stringify(profile));
  } catch (error) {
    console.error('Error saving user profile:', error);
  }
};

/**
 * Get user profile data
 */
export const getUserProfile = async (): Promise<{
  name: string;
  age: number;
  bio: string;
} | null> => {
  try {
    const value = storage[StorageKeys.USER_PROFILE];
    // In production: const value = await AsyncStorage.getItem(StorageKeys.USER_PROFILE);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

/**
 * Save user preferences
 */
export const saveUserPreferences = async (preferences: {
  ageRange: [number, number];
  maxDistance: number;
}): Promise<void> => {
  try {
    storage[StorageKeys.USER_PREFERENCES] = JSON.stringify(preferences);
    // In production: await AsyncStorage.setItem(StorageKeys.USER_PREFERENCES, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving user preferences:', error);
  }
};

/**
 * Get user preferences
 */
export const getUserPreferences = async (): Promise<{
  ageRange: [number, number];
  maxDistance: number;
} | null> => {
  try {
    const value = storage[StorageKeys.USER_PREFERENCES];
    // In production: const value = await AsyncStorage.getItem(StorageKeys.USER_PREFERENCES);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Error getting user preferences:', error);
    return null;
  }
};

/**
 * Save voice intro URI
 */
export const saveVoiceIntroUri = async (uri: string): Promise<void> => {
  try {
    storage[StorageKeys.VOICE_INTRO_URI] = uri;
    // In production: await AsyncStorage.setItem(StorageKeys.VOICE_INTRO_URI, uri);
  } catch (error) {
    console.error('Error saving voice intro URI:', error);
  }
};

/**
 * Get voice intro URI
 */
export const getVoiceIntroUri = async (): Promise<string | null> => {
  try {
    return storage[StorageKeys.VOICE_INTRO_URI] || null;
    // In production: return await AsyncStorage.getItem(StorageKeys.VOICE_INTRO_URI);
  } catch (error) {
    console.error('Error getting voice intro URI:', error);
    return null;
  }
};

/**
 * Clear all app data (for testing/logout)
 */
export const clearAllData = async (): Promise<void> => {
  try {
    Object.keys(storage).forEach((key) => delete storage[key]);
    // In production: await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};

/**
 * Reset onboarding (for testing)
 */
export const resetOnboarding = async (): Promise<void> => {
  try {
    delete storage[StorageKeys.ONBOARDING_COMPLETED];
    // In production: await AsyncStorage.removeItem(StorageKeys.ONBOARDING_COMPLETED);
  } catch (error) {
    console.error('Error resetting onboarding:', error);
  }
};
