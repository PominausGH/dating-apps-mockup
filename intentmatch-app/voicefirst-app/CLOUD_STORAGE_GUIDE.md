# Cloud Storage Quick Reference Guide

A quick reference for using the VoiceFirst cloud storage infrastructure.

## Quick Start

```typescript
import { initializeStorageUtils } from './src/utils';

// Initialize on app startup
initializeStorageUtils();
```

## Common Operations

### Upload a Recording

```typescript
import { uploadVoiceRecording } from './src/utils';

const result = await uploadVoiceRecording({
  userId: 'user123',
  fileUri: 'file:///path/to/recording.m4a',
  onProgress: (progress) => console.log(`${progress}%`),
});
```

### Download a Voice Intro

```typescript
import { downloadVoiceIntro } from './src/utils';

const result = await downloadVoiceIntro({
  userId: 'user456',
  onProgress: (progress) => console.log(`${progress}%`),
});

// Play the audio
// Audio.Sound.createAsync({ uri: result.localUri });
```

### Preload Upcoming Profiles

```typescript
import { preloadVoiceIntros } from './src/utils';

await preloadVoiceIntros(['user1', 'user2', 'user3']);
```

### Check Cache Stats

```typescript
import { getCacheStats } from './src/utils';

const stats = await getCacheStats();
console.log(`${stats.totalFiles} files, ${stats.totalSize} bytes`);
```

### Clear Cache

```typescript
import { clearAllCache } from './src/utils';

await clearAllCache();
```

## Error Handling Pattern

```typescript
import { uploadVoiceRecording, StorageError, StorageErrorType } from './src/utils';

try {
  await uploadVoiceRecording(options);
} catch (error) {
  if (error instanceof StorageError) {
    switch (error.type) {
      case StorageErrorType.INVALID_FILE:
        // Handle invalid file
        break;
      case StorageErrorType.NETWORK_ERROR:
        // Handle network error
        break;
      case StorageErrorType.RETRY_EXHAUSTED:
        // All retries failed
        break;
    }
  }
}
```

## React Component Pattern

```tsx
function UploadComponent({ userId, recordingUri }) {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    setUploading(true);
    try {
      await uploadVoiceRecording({
        userId,
        fileUri: recordingUri,
        onProgress: setProgress,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View>
      <Button onPress={handleUpload} disabled={uploading} />
      {uploading && <Text>Progress: {progress}%</Text>}
    </View>
  );
}
```

## File Structure

```
voice-intros/
└── {userId}/
    └── intro.m4a
```

## Key Features

- **Automatic Retry**: Failed uploads/downloads retry with exponential backoff (max 3 attempts)
- **Caching**: Downloaded files cached for 7 days (100MB limit)
- **Progress Tracking**: Real-time progress callbacks (0-100%)
- **Signed URLs**: Generate URLs with expiration (default 60 minutes)
- **Circuit Breaker**: Prevents cascading failures during outages
- **Mock Mode**: Works without Firebase for testing

## File Limits

- **Max File Size**: 10MB
- **Allowed Types**: audio/m4a, audio/mp4, audio/x-m4a, audio/aac, audio/mpeg
- **Cache Retention**: 7 days
- **Max Cache Size**: 100MB

## Advanced Features

### Priority-Based Preloading

```typescript
import { prefetchByPriority } from './src/utils/downloadUtils';

const priorityMap = new Map([
  ['visibleUser1', 100],
  ['visibleUser2', 100],
  ['upcomingUser1', 50],
]);

await prefetchByPriority(priorityMap);
```

### Streaming (No Cache)

```typescript
import { streamVoiceIntro } from './src/utils';

const streamUrl = await streamVoiceIntro('user123');
// Use streamUrl for immediate playback
```

### Signed URLs

```typescript
import { getVoiceRecordingSignedUrl } from './src/utils';

const { url, expiresAt } = await getVoiceRecordingSignedUrl('user123', {
  expirationMinutes: 120, // 2 hours
});
```

### Health Check

```typescript
import { storageHealthCheck } from './src/utils';

const health = await storageHealthCheck();
console.log(health.status); // 'healthy' | 'degraded' | 'unavailable'
```

## Production Setup

1. Install dependencies:
   ```bash
   npm install firebase @react-native-firebase/app @react-native-firebase/storage
   npx expo install expo-file-system
   ```

2. Configure Firebase (create `firebaseConfig.ts`):
   ```typescript
   import { initializeApp } from 'firebase/app';
   import { getStorage } from 'firebase/storage';

   const firebaseConfig = { /* your config */ };
   const app = initializeApp(firebaseConfig);
   export const storage = getStorage(app);
   ```

3. Set up Firebase Storage security rules (see README.md)

4. Replace mock imports in `uploadUtils.ts` and `downloadUtils.ts`

## Troubleshooting

### Upload Fails
- Check file size (max 10MB)
- Verify file type is audio
- Check network connection

### Download Fails
- Try force refresh: `forceRefresh: true`
- Check storage health: `storageHealthCheck()`
- Clear cache if corrupted: `clearAllCache()`

### Cache Issues
- View stats: `getCacheStats()`
- Manual cleanup: `cleanupOldCachedFiles()`
- Clear all: `clearAllCache()`

## API Reference

### Upload
- `uploadVoiceRecording(options)` - Upload voice recording
- `uploadVoiceRecordingWithSignedUrl(options, signedUrlOptions)` - Upload + signed URL
- `deleteVoiceRecording(userId)` - Delete recording
- `voiceRecordingExists(userId)` - Check if exists
- `getVoiceRecordingMetadata(userId)` - Get metadata

### Download
- `downloadVoiceIntro(options)` - Download voice intro
- `downloadMultipleVoiceIntros(userIds, options)` - Batch download
- `preloadVoiceIntros(userIds)` - Preload intros
- `streamVoiceIntro(userId)` - Get streaming URL
- `isVoiceIntroCached(userId)` - Check cache
- `getCachedVoiceIntroPath(userId)` - Get cached path

### Cache
- `getCacheStats()` - Cache statistics
- `clearAllCache()` - Clear all
- `cleanupOldCachedFiles()` - Remove old files (7+ days)

### Utilities
- `storageHealthCheck()` - Health status
- `validateSignedUrl(url)` - Validate URL
- `initializeStorageUtils()` - Initialize (call on startup)

## Performance Tips

1. Preload 3-5 upcoming profiles, not all
2. Use cache by default (don't force refresh unnecessarily)
3. Use streaming for quick previews
4. Download in parallel when loading feeds
5. Monitor circuit breaker state

## Examples

See [`examples.ts`](/home/andrew/Documents/Projects/AndroidProjects/dating-apps-mockup/intentmatch-app/voicefirst-app/src/utils/examples.ts) for 19 comprehensive examples including:
- Basic upload/download
- Progress tracking
- Batch operations
- Error handling
- React integration
- And more!

---

**Need more details?** See the full [README.md](/home/andrew/Documents/Projects/AndroidProjects/dating-apps-mockup/intentmatch-app/voicefirst-app/README.md)
