/**
 * TypeScript type definitions for VoiceFirst app
 */

import { ViewStyle, ImageStyle } from 'react-native';

// Blur system types
export interface BlurLevel {
  messageCount: number;
  intensity: number;
  label: string;
}

export interface UnlockMilestone {
  count: number;
  label: string;
}

// Component prop types
export interface BlurredPhotoProps {
  photoUri: string;
  messageCount: number;
  showProgress?: boolean;
  showCelebration?: boolean;
  style?: ViewStyle;
  imageStyle?: ImageStyle;
  borderRadius?: number;
}

// User and Match types
export interface VoiceFirstUser {
  id: string;
  name: string;
  age: number;
  bio: string;
  photos: string[];
  occupation: string;
  distance: number;
  verified: boolean;
}

export interface VoiceFirstMatch {
  id: string;
  user: VoiceFirstUser;
  messageCount: number;
  lastMessage?: string;
  scheduledDate?: string;
  expiresIn?: string;
  unread: boolean;
  matchedAt: Date;
}

// Message types
export interface VoiceFirstMessage {
  id: string;
  text: string;
  sender: 'me' | 'them';
  timestamp: string;
  read: boolean;
}

// Profile types for discovery
export interface DiscoveryProfile {
  id: string;
  name: string;
  age: number;
  occupation: string;
  distance: string;
  bio: string;
  availability: string;
  photos: string[];
  verified: boolean;
  alreadyLikedYou?: boolean;
}

// User Profile types
export interface UserProfile {
  id: string;
  name: string;
  age: number;
  occupation: string;
  bio: string;
  photos: string[];
  verified: boolean;
}

export interface UserStats {
  totalMatches: number;
  datesScheduled: number;
  datesCompleted: number;
  accountabilityScore: number;
}

export interface NotificationSettings {
  matches: boolean;
  messages: boolean;
  dateReminders: boolean;
}

export interface AgeRange {
  min: number;
  max: number;
}

export interface UserSettings {
  notifications: NotificationSettings;
  distanceRange: number;
  ageRange: AgeRange;
}

// Animation types
export interface BlurAnimationConfig {
  duration: number;
  useNativeDriver: boolean;
}

// Progress types
export interface UnlockProgress {
  currentCount: number;
  targetCount: number;
  percentage: number;
  isUnlocked: boolean;
  nextMilestone?: UnlockMilestone;
}

// Constants
export const BLUR_LEVELS: BlurLevel[] = [
  { messageCount: 0, intensity: 100, label: 'Completely hidden' },
  { messageCount: 1, intensity: 80, label: 'Highly blurred' },
  { messageCount: 3, intensity: 50, label: 'Partially revealed' },
  { messageCount: 5, intensity: 20, label: 'Mostly visible' },
  { messageCount: 8, intensity: 0, label: 'Fully unlocked' },
];

export const UNLOCK_THRESHOLD = 8;

export const MILESTONE_COUNTS = [1, 3, 5, 8];
