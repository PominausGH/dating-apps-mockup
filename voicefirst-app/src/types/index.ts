// User and Profile Types

export interface SearchPreferences {
  ageMin: number;
  ageMax: number;
  maxDistance: number;
  gender: 'male' | 'female' | 'any';
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  age: number;
  bio: string;
  photos: string[];
  primaryPhotoUrl: string;
  voiceIntroUri: string;
  voiceIntroDuration: number;
  profileCompleted: boolean;
  voiceVerified: boolean;
  photoVerified: boolean;
  voicePlayCount: number;
  matchRate: number;
  avgMessageCount: number;
  isActive: boolean;
  isPremium: boolean;
  createdAt: Date;
  lastActiveAt: Date;
  voiceIntroCreatedAt?: Date;
  premiumExpiresAt?: Date;
  searchPreferences: SearchPreferences;
}

// Voice Types

export interface VoiceIntro {
  id: string;
  uri: string;
  duration: number;
  prompt: string;
  isCurrent: boolean;
  createdAt: Date;
  playCount: number;
}

export interface VoicePlaybackStat {
  id: string;
  listenerId: string;
  voiceOwnerId: string;
  voiceUri: string;
  duration: number;
  completionRate: number;
  replayed: boolean;
  replayCount: number;
  resultedInLike: boolean;
  timestamp: Date;
  profilePosition: number;
}

export interface VoicePrompt {
  id: string;
  text: string;
  category: string;
  difficulty: string;
  isActive: boolean;
  popularityScore: number;
}

// Discovery Types

export interface VoiceProfile {
  id: string;
  name: string;
  age: number;
  distance: string;
  tagline: string;
  voiceDuration: number;
  voiceUri?: string;
  photoBlurred: boolean;
  photoRevealLevel: number;
  photos: string[];
}

// Match Types

export interface VoiceMatch {
  id: string;
  name: string;
  age: number;
  photo?: string;
  photoRevealLevel: number;
  lastVoiceMessage?: string;
  voiceMessageCount: number;
  unread: boolean;
  timestamp: string;
  matchedAt: Date;
  userId: string;
  photosUnlocked?: {
    user1: boolean;
    user2: boolean;
  };
}

// Message Types

export interface VoiceMessage {
  id: string;
  senderId: string;
  recipientId: string;
  voiceUri: string;
  duration: number;
  played: boolean;
  createdAt: Date;
  timestamp: string;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
  voiceUri?: string;
  duration?: number;
}

// Photo Unlock Types

export interface PhotoUnlockProgress {
  matchId: string;
  user1Id: string;
  user2Id: string;
  totalMessages: number;
  user1Messages: number;
  user2Messages: number;
  user1PhotoBlur: number;
  user2PhotoBlur: number;
  milestones: {
    messages1: boolean;
    messages3: boolean;
    messages5: boolean;
    messages8: boolean;
  };
  user1PhotoUnlockedAt?: Date;
  user2PhotoUnlockedAt?: Date;
  lastUpdated: Date;
}

// Navigation Types

export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  Main: undefined;
  Chat: { matchId: string; matchName?: string };
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  AccountSettings: undefined;
};

export type MainTabParamList = {
  Listen: undefined;
  Matches: undefined;
  Record: undefined;
  Profile: undefined;
};

// Utility Types

export type SwipeDirection = 'like' | 'pass';

export interface SwipeAction {
  targetUserId: string;
  direction: SwipeDirection;
  voiceListened: boolean;
  listenDuration: number;
  timestamp: Date;
}
