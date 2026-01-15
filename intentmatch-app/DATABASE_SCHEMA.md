# IntentMatch - Firebase Database Schema

## Overview
This document defines the complete Firestore database structure for the IntentMatch app. All collections and their fields are documented with data types, constraints, and relationships.

## Collections

### `users`
Stores user profile information and account details.

```typescript
{
  id: string;                    // Auto-generated user ID (matches auth.uid)
  email: string;                 // User's email
  name: string;                  // Display name
  age: number;                   // Age (must be >= 18)
  bio: string;                   // Profile bio (max 500 chars)
  occupation: string;            // Job title
  photos: string[];              // Array of Storage URLs (max 6)
  primaryPhotoUrl: string;       // Main profile photo URL

  // Profile completeness
  profileCompleted: boolean;     // Whether profile setup is done
  verificationStatus: 'none' | 'pending' | 'verified' | 'rejected';

  // Stats
  matchRate: number;             // Percentage of likes that matched
  totalDates: number;            // Number of dates completed
  avgRating: number;             // Average date rating (1-5)

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
  };
}
```

**Indexes:**
- `email` (for auth lookup)
- `isActive` + `createdAt` (for discovery)
- `location.city` (for local search)

**Subcollections:**

#### `users/{userId}/availability`
Stores user's date availability windows.

```typescript
{
  id: string;                    // Auto-generated
  date: string;                  // ISO date: "2026-01-15"
  dayName: string;               // "Monday", "Tuesday", etc.
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  startTime: string;             // "18:00" (24-hour format)
  endTime: string;               // "21:00"
  isRecurring: boolean;          // If this repeats weekly
  createdAt: Date;
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
  dealBreakers: string[];
  idealFirstDate: string;
  preferredVenues: string[];     // Types: "coffee", "restaurant", "bar", etc.
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
  user1PhotoUrl: string;
  user2PhotoUrl: string;

  // Match metadata
  matchedAt: Date;
  initiatedBy: string;           // User ID who liked first

  // Status
  status: 'active' | 'date_scheduled' | 'date_completed' | 'expired' | 'unmatched';

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

### `scheduledDates`
Auto-scheduled dates from matches.

```typescript
{
  id: string;                    // Auto-generated
  matchId: string;               // Reference to match
  user1Id: string;
  user2Id: string;
  user1Name: string;             // Denormalized
  user2Name: string;
  user1PhotoUrl: string;
  user2PhotoUrl: string;

  // Selected time slot
  selectedSlot: {
    id: string;
    date: string;                // "2026-01-15"
    dayName: string;             // "Saturday"
    timeOfDay: 'morning' | 'afternoon' | 'evening';
    startTime: string;           // "18:00"
    endTime: string;             // "21:00"
  };

  // Alternative slots (2 backups)
  alternativeSlots: Array<{
    id: string;
    date: string;
    dayName: string;
    timeOfDay: 'morning' | 'afternoon' | 'evening';
    startTime: string;
    endTime: string;
  }>;

  // Venue
  selectedVenue?: {
    id: string;
    name: string;
    address: string;
    type: string;
    placeId?: string;            // Google Places ID
  };
  decideVenueInPerson: boolean;
  venuesSuggested: string[];     // Array of venue IDs

  // Confirmation
  status: 'pending_confirmation' | 'confirmed' | 'rescheduled' | 'cancelled' | 'completed';
  confirmedByUser1: boolean;
  confirmedByUser2: boolean;
  confirmationDeadline: Date;    // 1 hour from match
  autoConfirmedAt?: Date;

  // Timestamps
  createdAt: Date;
  scheduledFor: Date;            // Actual date/time
  completedAt?: Date;

  // Reminders
  reminderSent24h: boolean;
  reminderSent1h: boolean;
}
```

**Indexes:**
- `user1Id` + `scheduledFor` (for user's upcoming dates)
- `user2Id` + `scheduledFor` (for user's upcoming dates)
- `status` + `scheduledFor` (for date management)

---

### `messages`
Chat messages between matched users.

```typescript
{
  id: string;                    // Auto-generated
  matchId: string;               // Reference to match
  senderId: string;              // User ID who sent
  receiverId: string;            // User ID who receives
  senderName: string;            // Denormalized
  senderPhotoUrl: string;        // Denormalized

  // Message content
  text: string;                  // Message text (max 1000 chars)
  type: 'text' | 'system';       // System messages for auto-confirmations

  // Status
  isRead: boolean;
  readAt?: Date;

  // Timestamps
  timestamp: Date;               // When sent
  createdAt: Date;
}
```

**Indexes:**
- `matchId` + `timestamp` (for chat history)
- `receiverId` + `isRead` (for unread messages)

---

### `chatWindows`
Tracks 24-hour chat expiration.

```typescript
{
  id: string;                    // Same as matchId
  matchId: string;
  user1Id: string;
  user2Id: string;

  // Timing
  openedAt: Date;                // When chat window opened
  expiresAt: Date;               // 24 hours after opened
  isExpired: boolean;

  // Stats
  messageCount: number;
  lastMessageAt: Date;
}
```

**Indexes:**
- `expiresAt` + `isExpired` (for cleanup job)
- `matchId` (for lookup)

---

### `dateFeedback`
Post-date ratings and feedback.

```typescript
{
  id: string;                    // Auto-generated
  dateId: string;                // Reference to scheduledDate
  matchId: string;
  userId: string;                // Who's giving feedback
  partnerId: string;             // Who they dated

  // Ratings
  rating: number;                // 1-5 stars
  didMeet: 'yes' | 'no' | 'rescheduled';
  howWasDate: 'great' | 'good' | 'okay' | 'not_good';
  wouldSeeAgain: 'yes' | 'maybe' | 'no';

  // Optional text feedback
  feedbackText?: string;

  // System tracking
  submittedAt: Date;
  bothSubmitted: boolean;        // Updated when partner submits
  partnerRating?: number;        // Revealed after both submit
  partnerFeedback?: {
    rating: number;
    didMeet: string;
    howWasDate: string;
    wouldSeeAgain: string;
  };
}
```

**Indexes:**
- `dateId` (for date lookup)
- `userId` + `submittedAt` (for user's feedback history)

---

### `venues`
Reference data for venue suggestions.

```typescript
{
  id: string;                    // Auto-generated or Google Place ID
  name: string;
  type: 'coffee_shop' | 'restaurant' | 'bar' | 'cafe' | 'activity';
  address: string;
  city: string;
  location: {
    latitude: number;
    longitude: number;
  };

  // Details
  priceLevel: number;            // 1-4 ($-$$$$)
  rating: number;                // 0-5
  reviewCount: number;
  photoUrl?: string;

  // Metadata
  googlePlaceId?: string;
  isVerified: boolean;
  timesSelected: number;         // Popularity tracking

  // Availability
  openingHours?: {
    [day: string]: string;       // "Monday": "8:00 AM - 10:00 PM"
  };
}
```

**Indexes:**
- `city` + `type` (for local venue search)
- `type` + `rating` (for recommendations)

---

### `swipes`
Tracks user swipes for matching algorithm.

```typescript
{
  id: string;                    // Auto-generated
  userId: string;                // Who swiped
  targetUserId: string;          // Who was swiped on
  action: 'like' | 'pass';
  timestamp: Date;

  // Context
  profilePhotoUrl: string;       // Which photo they saw
  swipePosition: number;         // Which profile in queue (for analytics)
}
```

**Indexes:**
- `userId` + `timestamp` (for user's swipe history)
- `targetUserId` + `action` (for checking mutual likes)

---

### `reports`
User reports for safety.

```typescript
{
  id: string;
  reporterId: string;            // Who reported
  reportedUserId: string;        // Who was reported
  reason: 'inappropriate_photos' | 'harassment' | 'fake_profile' | 'no_show' | 'other';
  description: string;

  // Evidence
  attachments?: string[];        // Storage URLs for screenshots

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
  totalDates: number;
  avgRating: number;

  // Engagement
  avgSwipesPerUser: number;
  avgMessagesPerMatch: number;
  chatExpirationRate: number;    // % of chats that expire
  noShowRate: number;            // % of dates with no-show

  updatedAt: Date;
}
```

---

## Cloud Functions

### Match Creation
**Trigger:** onCreate `swipes/{swipeId}`
**Purpose:** Check for mutual likes and create match

### Date Auto-Scheduling
**Trigger:** onCreate `matches/{matchId}`
**Purpose:** Run scheduling algorithm and create scheduledDate

### Chat Window Management
**Trigger:** onCreate `messages/{messageId}`
**Purpose:** Open chat window on first message, track expiration

### Feedback Aggregation
**Trigger:** onCreate `dateFeedback/{feedbackId}`
**Purpose:** Update user stats, reveal feedback when both submitted

### Notification Triggers
**Trigger:** Various
**Purpose:** Send push notifications for matches, messages, dates

---

## Data Migrations

### Initial Setup
1. Create indexes (see above)
2. Seed venues collection with local data
3. Set up Cloud Functions
4. Configure security rules

### Future Additions
- Payment/subscription tracking (Stripe integration)
- Advanced matching algorithm data
- Video call session management
- Location-based real-time updates

---

## Backup Strategy
- Automatic daily backups enabled
- Retention: 30 days
- Export to Cloud Storage bucket weekly

---

## Privacy & GDPR Compliance
- User data deletion: Remove all personal data within 30 days
- Data export: Provide JSON export of all user data
- Anonymize: Replace user IDs in analytics after deletion

---

**Last Updated:** January 11, 2026
