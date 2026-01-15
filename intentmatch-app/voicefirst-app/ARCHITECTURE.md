# VoiceFirst App - Architecture & Design

## System Architecture

### Component Hierarchy

```
VoiceFirst App
│
├── Screens
│   ├── DiscoverScreen
│   │   └── BlurredPhoto (messageCount: 0, 100% blur)
│   │
│   ├── MatchesScreen
│   │   ├── New Matches Section
│   │   │   └── BlurredPhoto (messageCount: 0)
│   │   └── Conversations Section
│   │       └── BlurredPhoto (messageCount: varies)
│   │
│   ├── ChatScreen
│   │   ├── Header Photo
│   │   │   └── BlurredPhoto (dynamic messageCount)
│   │   └── Message List
│   │       └── Triggers blur reduction on send
│   │
│   └── BlurDemoScreen
│       └── Interactive BlurredPhoto testing
│
└── Utilities
    └── blurUtils.ts
        ├── calculateBlurIntensity()
        ├── getUnlockProgress()
        ├── isPhotoUnlocked()
        └── getNextMilestone()
```

## Progressive Blur System

### Blur Intensity Levels

```
Message Count  │  Blur Intensity  │  Visual Effect
──────────────┼─────────────────┼──────────────────────────
      0       │      100%        │  █████████  Completely hidden
              │                  │  Lock icon overlay
──────────────┼─────────────────┼──────────────────────────
     1-2      │       80%        │  ████████░  Highly blurred
              │                  │  Outline barely visible
──────────────┼─────────────────┼──────────────────────────
     3-4      │       50%        │  █████░░░░  Partially visible
              │                  │  Features emerging
──────────────┼─────────────────┼──────────────────────────
     5-7      │       20%        │  ██░░░░░░░  Mostly clear
              │                  │  Details visible
──────────────┼─────────────────┼──────────────────────────
      8+      │       0%         │  ░░░░░░░░░  Fully revealed
              │                  │  + Celebration animation
```

### Progression Flow

```
User Flow:
┌─────────────┐
│   Discover  │  Photos: 100% blurred
│   Profile   │  Action: Swipe right
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  It's a     │  Photos: Still blurred
│   Match!    │  Action: Start chatting
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Send 1st    │  Photos: 80% blur
│  Message    │  Progress: 12%
└──────┬──────┘  Animation: Scale + unlock hint
       │
       ▼
┌─────────────┐
│ Send more   │  Photos: 50% blur (at 3 msgs)
│  Messages   │  Progress: 37%
└──────┬──────┘  Animation: Blur reduction
       │
       ▼
┌─────────────┐
│ Continue    │  Photos: 20% blur (at 5 msgs)
│ Chatting    │  Progress: 62%
└──────┬──────┘  Hint: "3 more to unlock!"
       │
       ▼
┌─────────────┐
│ Send 8th    │  Photos: 0% blur
│  Message    │  Progress: 100%
└──────┬──────┘  Celebration: "Photo Unlocked!"
       │
       ▼
┌─────────────┐
│  Unlocked   │  Photos: Fully visible
│   Forever   │  Continue conversation
└─────────────┘
```

## Data Flow

### State Management

```typescript
// Message count tracked per match
interface Match {
  id: string;
  user: User;
  messageCount: number;  // Core state
  messages: Message[];
}

// Derived states (calculated)
const blurIntensity = calculateBlurIntensity(messageCount);
const progress = getUnlockProgress(messageCount);
const unlocked = isPhotoUnlocked(messageCount);
const nextMilestone = getNextMilestone(messageCount);
```

### Animation Triggers

```
Message Sent Event
       │
       ▼
   Increment
 messageCount
       │
       ├──> Update blur intensity (calculateBlurIntensity)
       │
       ├──> Trigger animation if milestone reached
       │    (messageCount ∈ {1, 3, 5, 8})
       │
       ├──> Update progress bar (getUnlockProgress)
       │
       └──> Show celebration if unlocked
            (messageCount >= 8)
```

## Component Design

### BlurredPhoto Component

```tsx
Props:
  - photoUri: string          // Photo URL
  - messageCount: number      // 0 to 8+
  - showProgress?: boolean    // Progress bar
  - showCelebration?: boolean // Unlock celebration
  - style?: ViewStyle         // Container style
  - imageStyle?: ImageStyle   // Image style
  - borderRadius?: number     // Border radius

State:
  - celebrationScale: Animated.Value
  - celebrationOpacity: Animated.Value
  - progressBarWidth: Animated.Value

Computed:
  - blurIntensity = calculateBlurIntensity(messageCount)
  - progress = getUnlockProgress(messageCount)
  - unlocked = isPhotoUnlocked(messageCount)

Layers (bottom to top):
  1. Image (base photo)
  2. BlurView (conditional, based on intensity)
  3. Lock Icon (if messageCount === 0)
  4. Progress Bar (if showProgress && !unlocked)
  5. Celebration (if unlocked && showCelebration)
```

### Visual Layers

```
┌────────────────────────────────────┐
│   Celebration Overlay (optional)   │  ← Layer 5
│        "Photo Unlocked!"            │
├────────────────────────────────────┤
│   Progress Bar (optional)          │  ← Layer 4
│   ▓▓▓▓▓▓▓░░░  62% unlocked        │
├────────────────────────────────────┤
│   Lock Icon (if locked)            │  ← Layer 3
│          🔒                         │
├────────────────────────────────────┤
│   BlurView (dynamic intensity)     │  ← Layer 2
│   ████████░░░░░░░░░░░░░░░░        │
├────────────────────────────────────┤
│   Base Image                       │  ← Layer 1
│   [Profile Photo]                  │
└────────────────────────────────────┘
```

## Performance Optimizations

### 1. Animation Performance

```typescript
// Use native driver for transforms
Animated.spring(scale, {
  toValue: 1.1,
  useNativeDriver: true,  // ← Runs on UI thread
});

// Avoid in lists
<BlurredPhoto
  showCelebration={false}  // Skip heavy animation
/>
```

### 2. Render Optimization

```typescript
// Conditional rendering of layers
{blurIntensity > 0 && <BlurView intensity={blurIntensity} />}
{messageCount === 0 && <LockIcon />}
{showProgress && !unlocked && <ProgressBar />}
```

### 3. Calculation Caching

```typescript
// Pure functions, easy to memoize
const blurIntensity = useMemo(
  () => calculateBlurIntensity(messageCount),
  [messageCount]
);
```

## Integration Points

### 1. Message System Integration

```typescript
// When message is sent
const handleSendMessage = async (text: string) => {
  // 1. Send message to backend
  await api.sendMessage(matchId, text);

  // 2. Increment local message count
  setMessageCount(prev => prev + 1);

  // 3. Blur automatically updates via re-render
};
```

### 2. Match System Integration

```typescript
// When match occurs
const handleMatch = (profile: Profile) => {
  // Create match with messageCount: 0
  const match = {
    id: generateId(),
    user: profile,
    messageCount: 0,  // Start with full blur
    messages: [],
  };

  // Navigate to chat
  navigation.navigate('Chat', { matchId: match.id });
};
```

### 3. State Persistence

```typescript
// Save message count to database
interface MatchRecord {
  id: string;
  userId1: string;
  userId2: string;
  messageCount: number;  // Persist this
  createdAt: Date;
}

// On app restart, restore message count
const messageCount = await db.getMessageCount(matchId);
```

## Algorithm Design

### Blur Calculation Algorithm

```
Input: messageCount (integer >= 0)
Output: blurIntensity (0-100)

Algorithm:
  IF messageCount = 0 THEN
    RETURN 100
  ELSE IF messageCount <= 2 THEN
    RETURN 80
  ELSE IF messageCount <= 4 THEN
    RETURN 50
  ELSE IF messageCount <= 7 THEN
    RETURN 20
  ELSE
    RETURN 0
  END IF

Time Complexity: O(1)
Space Complexity: O(1)
```

### Progress Calculation Algorithm

```
Input: messageCount (integer >= 0)
Output: progress (0-100)

Algorithm:
  maxMessages = 8
  normalizedCount = MIN(messageCount, maxMessages)
  progress = (normalizedCount / maxMessages) * 100
  RETURN ROUND(progress)

Time Complexity: O(1)
Space Complexity: O(1)
```

## Error Handling

### Invalid Message Count

```typescript
// Defensive programming
function calculateBlurIntensity(messageCount: number): number {
  // Handle negative values
  if (messageCount < 0) {
    console.warn('Negative message count, treating as 0');
    messageCount = 0;
  }

  // Handle NaN or undefined
  if (!Number.isFinite(messageCount)) {
    console.error('Invalid message count, defaulting to 0');
    messageCount = 0;
  }

  // Continue with logic...
}
```

### Image Loading Failures

```typescript
<Image
  source={{ uri: photoUri }}
  onError={() => {
    console.error('Failed to load photo');
    // Show placeholder or retry
  }}
/>
```

## Testing Strategy

### Unit Tests
- ✓ Blur calculation for all ranges
- ✓ Progress calculation accuracy
- ✓ Unlock detection
- ✓ Milestone transitions
- ✓ Edge cases (negative, large numbers)

### Integration Tests
- ✓ Component rendering at different levels
- ✓ Animation triggers
- ✓ Progress bar updates
- ✓ Celebration display

### E2E Tests
- ✓ Full user flow from discover to unlock
- ✓ Message send triggers blur reduction
- ✓ Multiple matches with different blur levels

## Security Considerations

### Photo Privacy

```typescript
// Never expose original photo URL before unlock
// Backend should check messageCount before serving photo

// API endpoint
GET /api/users/:userId/photo
Authorization: Bearer <token>

Response (if messageCount < 8):
{
  url: "blurred-placeholder.jpg",  // Low-res blurred version
  unlocked: false
}

Response (if messageCount >= 8):
{
  url: "full-quality-photo.jpg",   // Original photo
  unlocked: true
}
```

## Scalability

### Database Schema

```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY,
  user1_id UUID NOT NULL,
  user2_id UUID NOT NULL,
  message_count INTEGER DEFAULT 0,  -- Indexed for queries
  created_at TIMESTAMP,
  INDEX idx_message_count (message_count)
);

-- Query matches by blur level
SELECT * FROM matches
WHERE user1_id = ? AND message_count < 8;
```

### Caching Strategy

```typescript
// Cache blur intensity calculations
const blurCache = new Map<number, number>();

function calculateBlurIntensityCached(messageCount: number): number {
  if (blurCache.has(messageCount)) {
    return blurCache.get(messageCount)!;
  }
  const result = calculateBlurIntensity(messageCount);
  blurCache.set(messageCount, result);
  return result;
}
```

## Accessibility

### VoiceOver Support

```tsx
<BlurredPhoto
  photoUri={photo}
  messageCount={messageCount}
  accessible={true}
  accessibilityLabel={
    messageCount >= 8
      ? `${name}'s profile photo, fully revealed`
      : `${name}'s profile photo, ${getUnlockProgress(messageCount)}% revealed. Send more messages to unlock.`
  }
/>
```

## Future Enhancements

### 1. Dynamic Blur Levels

```typescript
// Allow customization
interface BlurConfig {
  levels: Array<{
    messageCount: number;
    intensity: number;
  }>;
}

// Custom progression
const customConfig: BlurConfig = {
  levels: [
    { messageCount: 0, intensity: 100 },
    { messageCount: 5, intensity: 50 },
    { messageCount: 10, intensity: 0 },
  ],
};
```

### 2. Photo Teasers

```typescript
// Show color palette before unlock
interface PhotoTeaser {
  dominantColors: string[];
  brightness: number;
  isOutdoor: boolean;
}

// Display hints without revealing photo
<ColorPalette colors={teaser.dominantColors} />
```

### 3. Premium Features

```typescript
// Instant unlock (premium)
const unlockPhoto = async (matchId: string) => {
  await api.purchasePhotoUnlock(matchId);
  setMessageCount(8); // Instantly unlock
};
```

## Conclusion

The VoiceFirst progressive blur system is designed to:
- Encourage meaningful conversation over superficial judgments
- Provide clear visual feedback on unlock progress
- Create gamification through milestone achievements
- Maintain user engagement through progressive rewards
- Ensure privacy until genuine connection is established

All while maintaining excellent performance, accessibility, and scalability.
