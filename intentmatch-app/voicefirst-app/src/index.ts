/**
 * VoiceFirst App - Progressive Photo Blur/Reveal System
 *
 * Export all components, utilities, and screens for easy importing
 */

// Components
export { default as BlurredPhoto } from './components/BlurredPhoto';

// Screens
export { default as DiscoverScreen } from './screens/DiscoverScreen';
export { default as MatchesScreen } from './screens/MatchesScreen';
export { default as ChatScreen } from './screens/ChatScreen';
export { default as BlurDemoScreen } from './screens/BlurDemoScreen';
export { default as ProfileScreen } from './screens/ProfileScreen';
export { default as AuthScreen } from './screens/AuthScreen';

// Utilities
export {
  calculateBlurIntensity,
  getUnlockProgress,
  isPhotoUnlocked,
  getNextMilestone,
} from './utils/blurUtils';

// Context
export { AuthProvider, useAuth } from './contexts/AuthContext';

// Types
export type {
  BlurredPhotoProps,
  BlurLevel,
  UnlockMilestone,
  VoiceFirstUser,
  VoiceFirstMatch,
  VoiceFirstMessage,
  DiscoveryProfile,
  BlurAnimationConfig,
  UnlockProgress,
  UserProfile,
  UserStats,
  NotificationSettings,
  AgeRange,
  UserSettings,
} from './types';

// Auth Types
export type {
  AuthUser,
  AuthState,
  AuthContextType,
  LoginCredentials,
  SignUpData,
  SocialProvider,
  PasswordStrength,
  ValidationError,
} from './types/auth';

// Validation Utilities
export {
  validateEmail,
  validatePhone,
  validateEmailOrPhone,
  validatePassword,
  validateConfirmPassword,
  checkPasswordStrength,
  validateTerms,
  validateAge,
} from './utils/validation';
