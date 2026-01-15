/**
 * Services Index
 * Central export for all Firebase services
 */

// Authentication
export * from './authService';

// User Management
export * from './userService';

// Matching
export * from './matchService';

// Messaging
export * from './messageService';

/**
 * Usage Examples:
 *
 * import { signUp, signIn, signOutUser } from '../services';
 * import { getUserProfile, updatePreferences } from '../services';
 * import { recordSwipe, getMatches } from '../services';
 * import { sendMessage, subscribeToMessages } from '../services';
 */
