# VoiceFirst - Firebase Database Schema

## Overview
This document defines the complete Firestore database structure for the VoiceFirst app. The schema is optimized for voice-first dating with progressive photo reveals.

## Collections

### `users`
Stores user profile information with voice intro.

```typescript
{
  id: string;                    // Auto-generated user ID (matches auth.uid)
  email: string;                 // User's email
  name: string;                  // Display name
  age: number;                   // Age (must be >= 18)
  bio: string;                   // Profile bio (max 500 chars)
  occupation: string;            // Job title

  // Voice intro (primary feature)
  voiceIntroUri: string;         // Firebase Storage URL
  voiceIntroDuration: number;    // Duration in seconds (5-30)
  voiceIntroCreatedAt: Date;

  // Photos (initially blurred)
  photos: string[];              // Array of Storage URLs (max 6)
  primaryPhotoUrl: string;       // Main profile photo URL

  // Profile completeness
  profileCompleted: boolean;     // Whether profile setup is done
  voiceVerified: boolean;        // Voice authenticity verification
  photoVerified: boolean;        // Photo verification status

  // Stats
  voicePlayCount: number;        // How many times voice intro played
  matchRate: number;             // Percentage of likes that matched
  avgMessageCount: number;       // Avg messages before photo unlock

  // Account status
  isActive: boolean;             // Account active/deactivated
  isPremium: boolean;            // Premium subscription status
  premiumExpiresAt?: Date;       // Premium expiration

  // Timestamps
  createdAt: Date;
  lastActiveAt: Date;

  // Location (optional)
  location?: {
    latitude: number;
    longitude: number;
    city: string;
    state: string;
  };

  // Preferences (denormalized for quick access)
  searchPreferences: {
    ageMin: number;
    ageMax: number;
    maxDistance: number;         // In miles
    gender: 'male' | 'female' | 'non-binary' | 'any';
    voicePreference?: 'any' | 'deep' | 'soft' | 'energetic';
  };
}
```

**Indexes:**
- `email` (for auth lookup)
- `isActive` + `createdAt` (for discovery)
- `location.city` (for local search)
- `voiceVerified` (for verified profiles)

**Subcollections:**

#### `users/{userId}/voiceIntros`
Historical voice intros (allows changing intro).

```typescript
{
  id: string;                    // Auto-generated
  uri: string;                   // Storage URL
  duration: number;              // Seconds
  prompt: string;                // Which prompt was used
  isCurrent: boolean;            // Currently active intro
  createdAt: Date;
  playCount: number;             // Analytics
}
```

#### `users/{userId}/preferences`
Detailed user preferences (privacy-protected).

```typescript
{
  id: 'main';                    // Single document
  ageRange: { min: number; max: number };
  maxDistance: number;
  interestedIn: string[];        // Array of interests
  voiceCharacteristics: string[]; // Preferred voice types
  dealBreakers: string[];
  dontShowAgain: string[];       // Array of user IDs to exclude
  updatedAt: Date;
}
```

---

### `matches`
Stores mutual likes between users.

```typescript
{
  id: string;                    // Auto-generated
  user1Id: string;               // First user
  user2Id: string;               // Second user
  user1Name: string;             // Denormalized for quick access
  user2Name: string;
  user1VoiceUri: string;         // Denormalized
  user2VoiceUri: string;         // Denormalized
  user1PhotoUrl: string;         // Initially blurred
  user2PhotoUrl: string;         // Initially blurred

  // Match metadata
  matchedAt: Date;
  initiatedBy: string;           // User ID who liked first

  // Status
  status: 'active' | 'photo_unlocked' | 'unmatched';

  // Photo unlock tracking
  messageCount: {
    total: number;
    byUser1: number;
    byUser2: number;
  };
  photoUnlockProgress: {
    user1: number;               // 0-100%
    user2: number;               // 0-100%
  };
  photosUnlocked: {
    user1: boolean;              // User1's photo unlocked for User2
    user2: boolean;              // User2's photo unlocked for User1
  };

  // Chat tracking
  lastMessageAt?: Date;
  lastMessageText?: string;
  lastMessageBy?: string;
  unreadCount: {
    [userId: string]: number;
  };
}
```

**Indexes:**
- `user1Id` + `status` (for user's matches)
- `user2Id` + `status` (for user's matches)
- `matchedAt` (for sorting)

---

### `messages`
Chat messages with photo unlock tracking.

```typescript
{
  id: string;                    // Auto-generated
  matchId: string;               // Reference to match
  senderId: string;              // User ID who sent
  receiverId: string;            // User ID who receives
  senderName: string;            // Denormalized
  senderVoiceUri?: string;       // For voice messages

  // Message content
  text: string;                  // Message text (max 1000 chars)
  type: 'text' | 'voice' | 'system';
  voiceUri?: string;             // For voice messages
  voiceDuration?: number;        // For voice messages

  // Photo unlock milestone
  messageNumber: number;         // Sequential number in conversation
  triggeredUnlock: boolean;      // Did this message unlock photo?
  unlockMilestone?: number;      // Which milestone (8, 16, etc.)

  // Status
  isRead: boolean;
  readAt?: Date;
  isPlayed?: boolean;            // For voice messages
  playedAt?: Date;

  // Timestamps
  timestamp: Date;
  createdAt: Date;
}
```

**Indexes:**
- `matchId` + `timestamp` (for chat history)
- `receiverId` + `isRead` (for unread messages)
- `matchId` + `messageNumber` (for unlock tracking)

---

### `photoUnlockProgress`
Tracks progressive photo reveal.

```typescript
{
  id: string;                    // Same as matchId
  matchId: string;
  user1Id: string;
  user2Id: string;

  // Message counts (denormalized for quick access)
  totalMessages: number;
  user1Messages: number;
  user2Messages: number;

  // Blur intensity (0-100)
  user1PhotoBlur: number;        // User1's photo blur for User2
  user2PhotoBlur: number;        // User2's photo blur for User1

  // Milestones reached
  milestones: {
    messages1: boolean;          // 1 message: 80% blur
    messages3: boolean;          // 3 messages: 50% blur
    messages5: boolean;          // 5 messages: 20% blur
    messages8: boolean;          // 8 messages: 0% blur (unlocked!)
  };

  // Unlock timestamps
  user1PhotoUnlockedAt?: Date;
  user2PhotoUnlockedAt?: Date;

  lastUpdated: Date;
}
```

**Indexes:**
- `matchId` (for lookup)
- `totalMessages` (for analytics)

---

### `voicePlaybackStats`
Tracks voice intro playback for recommendations.

```typescript
{
  id: string;                    // Auto-generated
  listenerId: string;            // Who listened
  voiceOwnerId: string;          // Whose voice was played
  voiceUri: string;              // Which recording

  // Playback details
  duration: number;              // How long they listened (seconds)
  completionRate: number;        // % of intro listened to
  replayed: boolean;             // Did they listen again?
  replayCount: number;

  // Context
  resultedInLike: boolean;       // Did they like after listening?
  timestamp: Date;
  profilePosition: number;       // Which profile in queue
}
```

**Indexes:**
- `voiceOwnerId` + `timestamp` (for analytics)
- `listenerId` + `resultedInLike` (for recommendations)

---

### `swipes`
Tracks user swipes with voice context.

```typescript
{
  id: string;                    // Auto-generated
  userId: string;                // Who swiped
  targetUserId: string;          // Who was swiped on
  action: 'like' | 'pass';
  timestamp: Date;

  // Voice context
  voiceUri: string;              // Which voice intro they heard
  listenedFully: boolean;        // Did they listen to full intro?
  listenDuration: number;        // How long they listened
  replayed: boolean;             // Did they replay voice?

  // Photo context (blurred)
  sawPhoto: boolean;             // Did they view photo? (always false initially)
  swipePosition: number;         // Which profile in queue
}
```

**Indexes:**
- `userId` + `timestamp` (for user's swipe history)
- `targetUserId` + `action` (for checking mutual likes)
- `userId` + `listenedFully` (for engagement analytics)

---

### `voicePrompts`
Reference data for recording prompts.

```typescript
{
  id: string;                    // Auto-generated
  text: string;                  // Prompt text
  category: 'fun' | 'deep' | 'creative' | 'personal';
  difficulty: 'easy' | 'medium' | 'hard';
  popularityScore: number;       // How often chosen
  isActive: boolean;             // Can be shown to users

  examples?: string[];           // Example responses
  tips?: string[];               // Recording tips

  createdAt: Date;
}
```

**Indexes:**
- `category` + `isActive` (for prompt selection)
- `popularityScore` (for recommendations)

---

### `reports`
User reports for safety.

```typescript
{
  id: string;
  reporterId: string;            // Who reported
  reportedUserId: string;        // Who was reported
  reason: 'inappropriate_voice' | 'inappropriate_photos' | 'harassment' | 'fake_profile' | 'other';
  description: string;

  // Evidence
  attachments?: string[];        // Storage URLs for screenshots
  voiceUri?: string;             // Reported voice intro

  // Status
  status: 'pending' | 'reviewed' | 'action_taken' | 'dismissed';
  reviewedBy?: string;           // Admin ID
  reviewedAt?: Date;
  actionTaken?: string;

  timestamp: Date;
}
```

---

### `blocks`
User blocks for privacy.

```typescript
{
  id: string;
  blockerId: string;             // Who blocked
  blockedUserId: string;         // Who was blocked
  timestamp: Date;
  reason?: string;
}
```

**Indexes:**
- `blockerId` (for checking blocks)
- `blockedUserId` (for reverse lookup)

---

### `subscriptions`
Premium subscription tracking (Stripe integration).

```typescript
{
  id: string;                    // User ID
  userId: string;
  tier: 'free' | 'premium' | 'premium_plus';

  // Stripe
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;

  // Status
  status: 'active' | 'cancelled' | 'past_due' | 'expired';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;

  // Features
  features: {
    unlimitedLikes: boolean;
    seeWhoLiked: boolean;
    voiceFilters: boolean;
    advancedFilters: boolean;
    photoRevealBoost: boolean;   // Unlock photos faster
  };

  createdAt: Date;
  updatedAt: Date;
}
```

---

### `voiceCache`
Client-side cache management for audio files.

```typescript
{
  id: string;                    // Cache key (hash of URL)
  userId: string;                // Who cached
  voiceUri: string;              // Original Firebase Storage URL
  localUri: string;              // Local file system path

  // Cache metadata
  fileSize: number;              // Bytes
  duration: number;              // Seconds
  createdAt: Date;
  lastAccessedAt: Date;
  expiresAt: Date;               // 7 days from creation

  // Stats
  accessCount: number;
}
```

**Indexes:**
- `userId` + `expiresAt` (for cleanup)
- `userId` + `lastAccessedAt` (for LRU eviction)

---

### `analytics`
System analytics (admin only).

```typescript
{
  id: string;                    // Date: "2026-01-15"
  date: Date;

  // Daily stats
  activeUsers: number;
  newSignups: number;
  totalMatches: number;
  voiceIntrosRecorded: number;
  voiceIntrosPlayed: number;

  // Engagement
  avgSwipesPerUser: number;
  avgMessagesPerMatch: number;
  avgVoiceCompletionRate: number; // % of voice intros listened fully
  photoUnlockRate: number;       // % of matches that unlock photos

  // Voice analytics
  avgVoiceDuration: number;
  popularPrompts: Array<{
    promptId: string;
    count: number;
  }>;

  // Conversion
  likeAfterVoiceRate: number;    // % who like after hearing voice
  matchAfterPhotoUnlockRate: number;

  updatedAt: Date;
}
```

---

## Cloud Functions

### Match Creation
**Trigger:** onCreate `swipes/{swipeId}`
**Purpose:** Check for mutual likes and create match

### Photo Unlock Tracking
**Trigger:** onCreate `messages/{messageId}`
**Purpose:** Update photoUnlockProgress, check milestones, trigger celebrations

### Voice Playback Tracking
**Trigger:** Client-side event via callable function
**Purpose:** Record voice playback stats for recommendations

### Cache Cleanup
**Trigger:** Scheduled (daily)
**Purpose:** Remove expired cache entries (7 days old)

### Subscription Management
**Trigger:** Stripe webhooks
**Purpose:** Update subscription status from Stripe events

### Notification Triggers
**Trigger:** Various
**Purpose:** Send push notifications for matches, messages, photo unlocks

---

## Data Migrations

### Initial Setup
1. Create indexes (see above)
2. Seed voicePrompts collection
3. Set up Cloud Functions
4. Configure security rules
5. Set up Stripe webhooks

### Future Additions
- Voice matching algorithm data
- Video call session management
- Advanced voice analysis (tone, pitch, etc.)
- Group voice chat features

---

## Storage Structure

### Voice Recordings
```
/users/{userId}/voiceIntros/{introId}.m4a
/users/{userId}/voiceMessages/{messageId}.m4a
/users/{userId}/voiceSamples/{sampleId}.m4a (for verification)
```

### Photos
```
/users/{userId}/photos/{photoId}.jpg
/users/{userId}/gallery/{photoIndex}.jpg
/users/{userId}/verification/{verificationId}.jpg
```

### Cache
```
/cache/{userId}/{cacheId}.m4a (auto-cleanup after 7 days)
```

### Temp Files
```
/temp/{userId}/{fileName} (auto-cleanup after 1 hour)
```

---

## Progressive Photo Blur Logic

### Blur Intensity by Message Count
- 0 messages: 100% blur (completely hidden)
- 1-2 messages: 80% blur (vague outline)
- 3-4 messages: 50% blur (general features visible)
- 5-7 messages: 20% blur (mostly clear)
- 8+ messages: 0% blur (fully unlocked)

### Implementation
```typescript
function calculateBlurIntensity(messageCount: number): number {
  if (messageCount === 0) return 100;
  if (messageCount <= 2) return 80;
  if (messageCount <= 4) return 50;
  if (messageCount <= 7) return 20;
  return 0;
}
```

---

## Backup Strategy
- Automatic daily backups enabled
- Retention: 30 days
- Export to Cloud Storage bucket weekly
- Voice recordings: separate backup schedule

---

## Privacy & GDPR Compliance
- User data deletion: Remove all personal data + voice recordings within 30 days
- Data export: Provide JSON export + download links for voice recordings
- Anonymize: Replace user IDs in analytics after deletion
- Voice data: Special handling for biometric data under GDPR

---

## Performance Optimizations

### Voice Streaming
- Use signed URLs with 1-hour expiration
- Implement progressive loading for playback
- Cache frequently accessed intros locally

### Photo Loading
- Progressive JPEG for smooth blur transitions
- Lazy load gallery photos
- Preload next profile's voice + blurred photo

### Message Delivery
- Real-time listeners only for active chats
- Batch message reads for history
- Optimize indexes for common queries

---

**Last Updated:** January 11, 2026
