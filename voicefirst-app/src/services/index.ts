/**
 * Services Index for VoiceFirst
 * Central export for all Firebase services
 */

// Authentication
export * from './authService';

// Voice Management
export * from './voiceService';

// Photo Unlock
export * from './photoUnlockService';

/**
 * Usage Examples:
 *
 * // Authentication
 * import { signUp, signIn, signOutUser } from '../services';
 *
 * // Voice Features
 * import {
 *   uploadVoiceIntro,
 *   getVoiceIntros,
 *   recordVoicePlayback,
 *   getVoicePrompts
 * } from '../services';
 *
 * // Photo Unlock
 * import {
 *   calculateBlurIntensity,
 *   updatePhotoUnlockProgress,
 *   subscribeToPhotoUnlock
 * } from '../services';
 */
