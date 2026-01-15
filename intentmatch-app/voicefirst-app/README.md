# VoiceFirst App - Progressive Photo Blur/Reveal System

A React Native dating app implementation featuring a progressive photo blur/reveal system that encourages meaningful conversation before visual attraction.

## Overview

The VoiceFirst app uses a unique approach to online dating by progressively revealing profile photos as users exchange messages. This encourages users to build connections through conversation rather than judging matches solely on appearance.

## Features

### Progressive Blur System

Photos are progressively revealed based on message count:

- **0 messages**: 100% blur (completely hidden)
- **1-2 messages**: 80% blur
- **3-4 messages**: 50% blur
- **5-7 messages**: 20% blur
- **8+ messages**: 0% blur (fully revealed)

### Visual Feedback

- **Animated Blur Reduction**: Smooth animations when blur level changes
- **Progress Indicator**: Visual progress bar showing unlock percentage
- **Lock Icon**: Lock icon overlay for completely hidden photos
- **Unlock Celebration**: Celebratory animation when photo is fully revealed
- **Milestone Hints**: Text hints showing next unlock milestone

## Implementation

### Core Utilities

#### `blurUtils.ts`

Helper functions for blur calculations:

```typescript
// Calculate blur intensity (0-100)
calculateBlurIntensity(messageCount: number): number

// Get unlock progress as percentage
getUnlockProgress(messageCount: number): number

// Check if photo is fully unlocked
isPhotoUnlocked(messageCount: number): boolean

// Get next unlock milestone
getNextMilestone(messageCount: number): { count: number; label: string } | null
```

### Components

#### `BlurredPhoto.tsx`

Reusable component for displaying photos with progressive blur:

```tsx
<BlurredPhoto
  photoUri="https://example.com/photo.jpg"
  messageCount={5}
  showProgress={true}
  showCelebration={true}
  style={{ width: 200, height: 200 }}
  borderRadius={20}
/>
```

**Props:**
- `photoUri` (string): URL of the photo to display
- `messageCount` (number): Number of messages exchanged
- `showProgress` (boolean): Show progress bar indicator
- `showCelebration` (boolean): Show celebration when unlocked
- `style` (ViewStyle): Container styling
- `imageStyle` (ImageStyle): Image styling
- `borderRadius` (number): Border radius for blur overlay

### Screens

#### `DiscoverScreen.tsx`

Swipeable card interface with completely hidden photos until match.

**Features:**
- Photos are 100% blurred (messageCount: 0)
- Shows profile info, bio, and availability
- Badge indicating photos will reveal after matching

#### `MatchesScreen.tsx`

List of matches with progressive blur on profile photos.

**Features:**
- Different blur levels based on message count
- Progress indicators on each match
- Info banner about photo unlocking system
- New matches section with blurred thumbnails

#### `ChatScreen.tsx`

Conversation screen with animated blur reduction.

**Features:**
- Header shows blurred photo of match
- Real-time blur reduction as messages are sent
- Animated unlock feedback on milestone achievements
- Progress hints showing next unlock level
- Celebration when photo fully unlocks

#### `BlurDemoScreen.tsx`

Interactive demo showcasing the blur system.

**Features:**
- Live preview of blur levels
- Controls to test different message counts
- Quick presets for all blur levels
- Stats display (blur intensity, progress)
- Feature documentation

## File Structure

```
voicefirst-app/
├── src/
│   ├── components/
│   │   └── BlurredPhoto.tsx          # Reusable blur component
│   ├── screens/
│   │   ├── DiscoverScreen.tsx        # Discovery/swiping screen
│   │   ├── MatchesScreen.tsx         # Matches list screen
│   │   ├── ChatScreen.tsx            # Chat conversation screen
│   │   └── BlurDemoScreen.tsx        # Interactive demo
│   └── utils/
│       └── blurUtils.ts              # Blur calculation helpers
└── README.md
```

## Dependencies

- `expo-blur`: BlurView component for iOS/Android blur effect
- `expo-linear-gradient`: Gradient overlays
- `react-native-reanimated`: Smooth animations
- `@expo/vector-icons`: Icons (Ionicons)

## Installation

```bash
npm install expo-blur expo-linear-gradient react-native-reanimated
```

## Usage Examples

### Basic Implementation

```tsx
import BlurredPhoto from './components/BlurredPhoto';
import { calculateBlurIntensity } from './utils/blurUtils';

function MyComponent() {
  const [messageCount, setMessageCount] = useState(0);

  return (
    <BlurredPhoto
      photoUri="https://i.pravatar.cc/400?img=1"
      messageCount={messageCount}
      showProgress={true}
      showCelebration={true}
    />
  );
}
```

### Custom Styling

```tsx
<BlurredPhoto
  photoUri={photo}
  messageCount={messages.length}
  style={{ width: 150, height: 150 }}
  imageStyle={{ width: 150, height: 150 }}
  borderRadius={75} // Circular
  showProgress={false}
/>
```

### Get Blur Info

```tsx
import { calculateBlurIntensity, getNextMilestone, isPhotoUnlocked } from './utils/blurUtils';

const messageCount = 5;
const blurIntensity = calculateBlurIntensity(messageCount); // 20
const nextMilestone = getNextMilestone(messageCount); // { count: 8, label: "..." }
const isUnlocked = isPhotoUnlocked(messageCount); // false
```

## Demo

Run the `BlurDemoScreen` to see an interactive demonstration of all blur levels and features. Use the controls to increment/decrement messages and see the blur effect in real-time.

## Design Decisions

1. **Blur Levels**: Carefully calibrated to maintain privacy while showing gradual progress
2. **8 Message Threshold**: Encourages meaningful conversation before full reveal
3. **Animated Feedback**: Visual rewards for engagement to maintain user motivation
4. **Progress Indicators**: Clear communication of unlock status
5. **Celebration Animation**: Positive reinforcement when photos unlock

## Future Enhancements

- Voice message integration for faster unlocking
- Premium feature: instant photo reveal
- Mutual unlock bonus when both users are active
- Photo teasers (color palette, blur preview)
- Achievement system for unlock milestones

---

# Cloud Storage Infrastructure

Complete cloud storage implementation for voice recordings with Firebase Storage integration, caching, retry logic, and comprehensive error handling.

## Cloud Storage Features

### Core Functionality

✅ **Upload Voice Recordings**
- Progress tracking with real-time callbacks
- Automatic retry with exponential backoff
- File validation (size, type)
- Custom metadata support
- Signed URL generation

✅ **Download Voice Intros**
- Intelligent caching system
- Batch downloading for multiple users
- Priority-based preloading
- Force refresh option
- Streaming support

✅ **Cache Management**
- 7-day retention policy
- Automatic cleanup of old files
- Size-based cleanup (100MB limit)
- Cache statistics
- Manual cache clearing

✅ **Error Handling**
- Comprehensive error types
- Retry logic with exponential backoff
- Circuit breaker for service protection
- Detailed error messages

### Storage Structure

```
voice-intros/{userId}/intro.m4a
```

Each user has a single voice intro file stored at this predictable path.

## Cloud Storage File Structure

```
src/utils/
├── types.ts              # TypeScript types and interfaces
├── firebaseMock.ts       # Mock Firebase implementation (demo)
├── retryLogic.ts         # Retry and circuit breaker logic
├── cacheManager.ts       # Cache management system
├── uploadUtils.ts        # Upload functions
├── downloadUtils.ts      # Download functions
├── index.ts              # Main exports
└── examples.ts           # Usage examples
```

## Cloud Storage Setup

### Firebase Configuration (Production)

To use real Firebase Storage, follow these steps:

#### 1. Install Dependencies

```bash
# Firebase
npm install firebase @react-native-firebase/app @react-native-firebase/storage

# Expo FileSystem
npx expo install expo-file-system

# Optional: Persistent storage
npm install @react-native-async-storage/async-storage
```

#### 2. Configure Firebase

Create a `firebaseConfig.ts` file:

```typescript
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
```

#### 3. Set Up Security Rules

In Firebase Console, configure these storage rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /voice-intros/{userId}/{fileName} {
      // Allow read for authenticated users
      allow read: if request.auth != null;

      // Allow write only for user's own files
      allow write: if request.auth != null && request.auth.uid == userId;

      // Validate file size (max 10MB)
      allow write: if request.resource.size < 10 * 1024 * 1024;

      // Validate content type
      allow write: if request.resource.contentType.matches('audio/.*');
    }
  }
}
```

## Cloud Storage Usage

### Initialization

```typescript
import { initializeStorageUtils } from './src/utils';

// In App.tsx
React.useEffect(() => {
  initializeStorageUtils();
}, []);
```

### Upload Voice Recording

```typescript
import { uploadVoiceRecording } from './src/utils';

const result = await uploadVoiceRecording({
  userId: 'user123',
  fileUri: 'file:///recording.m4a',
  contentType: 'audio/m4a',
  onProgress: (progress) => {
    console.log(`Upload: ${progress}%`);
  },
  maxRetries: 3,
});

console.log('Upload URL:', result.url);
```

### Download Voice Intro

```typescript
import { downloadVoiceIntro } from './src/utils';

const result = await downloadVoiceIntro({
  userId: 'user456',
  forceRefresh: false, // Use cache if available
  onProgress: (progress) => {
    console.log(`Download: ${progress}%`);
  },
});

console.log('Local file:', result.localUri);
// Play audio: await Audio.Sound.createAsync({ uri: result.localUri });
```

### Preload Voice Intros

```typescript
import { preloadVoiceIntros } from './src/utils';

// Preload upcoming profiles
const count = await preloadVoiceIntros(['user1', 'user2', 'user3']);
console.log(`Preloaded ${count} voice intros`);
```

### Cache Management

```typescript
import { getCacheStats, clearAllCache } from './src/utils';

// View cache stats
const stats = await getCacheStats();
console.log(`Files: ${stats.totalFiles}, Size: ${stats.totalSize} bytes`);

// Clear cache
await clearAllCache();
```

## Cloud Storage API Reference

### Upload Functions

- `uploadVoiceRecording(options)` - Upload voice recording
- `uploadVoiceRecordingWithSignedUrl(options, signedUrlOptions)` - Upload with signed URL
- `deleteVoiceRecording(userId)` - Delete voice recording
- `getVoiceRecordingSignedUrl(userId, options)` - Get signed URL
- `voiceRecordingExists(userId)` - Check if recording exists
- `getVoiceRecordingMetadata(userId)` - Get file metadata

### Download Functions

- `downloadVoiceIntro(options)` - Download voice intro
- `downloadMultipleVoiceIntros(userIds, options)` - Batch download
- `preloadVoiceIntros(userIds)` - Preload voice intros
- `streamVoiceIntro(userId)` - Get streaming URL
- `isVoiceIntroCached(userId)` - Check if cached
- `getCachedVoiceIntroPath(userId)` - Get cached file path
- `removeCachedVoiceIntro(userId)` - Remove from cache

### Cache Functions

- `getCacheStats()` - Get cache statistics
- `clearAllCache()` - Clear all cached files
- `cleanupOldCachedFiles()` - Remove files older than 7 days

### Utility Functions

- `storageHealthCheck()` - Check storage service health
- `validateSignedUrl(url)` - Validate signed URL

## Error Handling

```typescript
import { StorageError, StorageErrorType } from './src/utils';

try {
  await uploadVoiceRecording(options);
} catch (error) {
  if (error instanceof StorageError) {
    switch (error.type) {
      case StorageErrorType.INVALID_FILE:
        alert('Invalid file. Please record again.');
        break;
      case StorageErrorType.NETWORK_ERROR:
        alert('Network error. Please check connection.');
        break;
      case StorageErrorType.RETRY_EXHAUSTED:
        alert('Upload failed after multiple attempts.');
        break;
      default:
        alert('Upload failed. Please try again.');
    }
  }
}
```

## React Component Integration

```tsx
import React, { useState } from 'react';
import { View, Button, Text } from 'react-native';
import { uploadVoiceRecording } from './utils';

function UploadScreen({ userId, recordingUri }) {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    setUploading(true);
    try {
      const result = await uploadVoiceRecording({
        userId,
        fileUri: recordingUri,
        onProgress: setProgress,
      });
      alert('Upload successful!');
    } catch (error) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View>
      <Button
        title={uploading ? 'Uploading...' : 'Upload'}
        onPress={handleUpload}
        disabled={uploading}
      />
      {uploading && <Text>Progress: {progress}%</Text>}
    </View>
  );
}
```

## Performance Tips

1. **Preload strategically** - Preload 3-5 upcoming profiles, not all
2. **Use caching** - Default to cached files when available
3. **Stream for previews** - Use streaming for quick audio previews
4. **Batch operations** - Download multiple files in parallel
5. **Monitor health** - Check circuit breaker state regularly

## Testing (Mock Mode)

The current implementation uses mock Firebase for demonstration:

```typescript
// Test upload with mock data
const result = await uploadVoiceRecording({
  userId: 'test-user',
  fileUri: 'file:///mock/recording.m4a',
});
console.log('Mock result:', result);

// All operations are simulated with realistic delays
// Random failures can occur to test retry logic
```

## Production Deployment Checklist

- [ ] Set up Firebase project
- [ ] Configure Firebase Storage
- [ ] Set up security rules
- [ ] Replace mock implementation with real Firebase
- [ ] Test with real audio files
- [ ] Configure storage bucket CORS
- [ ] Set up monitoring and logging
- [ ] Test retry logic with poor network
- [ ] Verify signed URLs work correctly

## License

MIT

## Credits

Built for VoiceFirst dating app concept - encouraging meaningful connections through conversation.
