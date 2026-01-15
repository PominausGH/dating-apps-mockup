# Testing Cloud Storage Infrastructure

Quick guide to test the cloud storage utilities in demo mode.

## Prerequisites

The cloud storage utilities are currently in **mock mode** and work without any external dependencies. No Firebase setup is required for testing.

## Test Upload

```typescript
import { uploadVoiceRecording } from './src/utils';

async function testUpload() {
  console.log('Testing upload...');

  try {
    const result = await uploadVoiceRecording({
      userId: 'test-user-123',
      fileUri: 'file:///mock/recording.m4a',
      contentType: 'audio/m4a',
      onProgress: (progress) => {
        console.log(`Upload progress: ${progress}%`);
      },
      maxRetries: 3,
    });

    console.log('Upload successful!');
    console.log('URL:', result.url);
    console.log('Path:', result.path);
    console.log('Size:', result.size);
    console.log('Content Type:', result.contentType);
  } catch (error) {
    console.error('Upload failed:', error);
  }
}

testUpload();
```

**Expected Output:**
```
Testing upload...
[MOCK] Uploading file from file:///mock/recording.m4a to voice-intros/test-user-123/intro.m4a
Upload progress: 10%
Upload progress: 20%
...
Upload progress: 100%
[MOCK] Upload completed: https://storage.googleapis.com/mock-bucket/voice-intros/test-user-123/intro.m4a
Upload successful!
URL: https://storage.googleapis.com/mock-bucket/voice-intros/test-user-123/intro.m4a?token=mock-token-1234567890
Path: voice-intros/test-user-123/intro.m4a
Size: 1024000
Content Type: audio/m4a
```

## Test Download

```typescript
import { downloadVoiceIntro } from './src/utils';

async function testDownload() {
  console.log('Testing download...');

  try {
    const result = await downloadVoiceIntro({
      userId: 'test-user-456',
      onProgress: (progress) => {
        console.log(`Download progress: ${progress}%`);
      },
    });

    console.log('Download successful!');
    console.log('Local URI:', result.localUri);
    console.log('Size:', result.size);
    console.log('Cached at:', result.cachedAt);
  } catch (error) {
    console.error('Download failed:', error);
  }
}

testDownload();
```

**Expected Output:**
```
Testing download...
[Download] Starting download for user test-user-456
[Download] Downloading from path: voice-intros/test-user-456/intro.m4a
[MOCK] Getting download URL for voice-intros/test-user-456/intro.m4a
Download progress: 15%
Download progress: 30%
...
Download progress: 100%
[Download] Download completed and cached
Download successful!
Local URI: voice-cache/test-user-456_intro.m4a
Size: 1024000
Cached at: 2026-01-10T23:40:00.000Z
```

## Test Retry Logic

```typescript
import { uploadVoiceRecording } from './src/utils';

async function testRetry() {
  console.log('Testing retry logic...');

  // The mock has a 10% chance of random failure
  // Run this multiple times to see retry in action
  for (let i = 0; i < 5; i++) {
    try {
      console.log(`\nAttempt ${i + 1}:`);
      await uploadVoiceRecording({
        userId: `test-user-${i}`,
        fileUri: `file:///mock/recording-${i}.m4a`,
        maxRetries: 3,
      });
      console.log('Success!');
    } catch (error) {
      console.error('Failed after all retries');
    }
  }
}

testRetry();
```

**Possible Output:**
```
Testing retry logic...

Attempt 1:
[Retry] Attempt 1/4
Success!

Attempt 2:
[Retry] Attempt 1/4
[Retry] Attempt 1 failed: Mock network error during upload
[Retry] Waiting 1000ms before retry...
[Retry] Attempt 2/4
Success!

Attempt 3:
[Retry] Attempt 1/4
Success!
```

## Test Cache Management

```typescript
import { getCacheStats, cleanupOldCachedFiles, clearAllCache } from './src/utils';

async function testCache() {
  console.log('Testing cache management...');

  // Get cache stats
  const stats = await getCacheStats();
  console.log('\nCache Stats:');
  console.log(`- Files: ${stats.totalFiles}`);
  console.log(`- Size: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`);

  // Cleanup old files
  const removed = await cleanupOldCachedFiles();
  console.log(`\nRemoved ${removed} old files`);

  // Clear all cache
  await clearAllCache();
  console.log('\nCache cleared!');

  // Verify
  const newStats = await getCacheStats();
  console.log(`Files after clear: ${newStats.totalFiles}`);
}

testCache();
```

**Expected Output:**
```
Testing cache management...
[Cache] Initialized with directory: voice-cache/

Cache Stats:
- Files: 3
- Size: 2.93 MB

[Cache] Starting cleanup of old files...
[Cache] Cleanup complete. Removed 0 old files.
Removed 0 old files

[Cache] Clearing all cached files...
[Cache] Cache cleared successfully
Cache cleared!

Files after clear: 0
```

## Test Preloading

```typescript
import { preloadVoiceIntros } from './src/utils';

async function testPreload() {
  console.log('Testing preload...');

  const userIds = ['user1', 'user2', 'user3', 'user4', 'user5'];

  const count = await preloadVoiceIntros(userIds);

  console.log(`Preloaded ${count}/${userIds.length} voice intros`);
}

testPreload();
```

**Expected Output:**
```
Testing preload...
[Download] Preloading voice intros for 5 users
[Download] Starting batch download for 5 users
[Download] Starting download for user user1
[Download] Starting download for user user2
[Download] Starting download for user user3
[Download] Starting download for user user4
[Download] Starting download for user user5
[Download] Batch download completed: 5/5 successful
[Download] Preloaded 5 voice intros
Preloaded 5/5 voice intros
```

## Test Error Handling

```typescript
import { uploadVoiceRecording, StorageError, StorageErrorType } from './src/utils';

async function testErrorHandling() {
  console.log('Testing error handling...');

  try {
    // Test with invalid user ID
    await uploadVoiceRecording({
      userId: '',
      fileUri: 'file:///test.m4a',
    });
  } catch (error) {
    if (error instanceof StorageError) {
      console.log('\nCaught StorageError:');
      console.log('- Type:', error.type);
      console.log('- Message:', error.message);

      switch (error.type) {
        case StorageErrorType.INVALID_FILE:
          console.log('Action: Show file validation error to user');
          break;
        case StorageErrorType.NETWORK_ERROR:
          console.log('Action: Show network error and retry button');
          break;
        default:
          console.log('Action: Show generic error');
      }
    }
  }
}

testErrorHandling();
```

**Expected Output:**
```
Testing error handling...
[Upload] Starting upload for user

Caught StorageError:
- Type: INVALID_FILE
- Message: userId and fileUri are required
Action: Show file validation error to user
```

## Test Health Check

```typescript
import { storageHealthCheck } from './src/utils';

async function testHealthCheck() {
  console.log('Testing health check...');

  const health = await storageHealthCheck();

  console.log('\nStorage Health:');
  console.log('- Status:', health.status);
  console.log('- Circuit Breaker:', health.circuitBreakerState);
  console.log('- Details:', health.details);

  if (health.status === 'healthy') {
    console.log('\n✅ Storage service is operational');
  } else if (health.status === 'degraded') {
    console.log('\n⚠️  Storage service is degraded');
  } else {
    console.log('\n❌ Storage service is unavailable');
  }
}

testHealthCheck();
```

**Expected Output:**
```
Testing health check...

Storage Health:
- Status: healthy
- Circuit Breaker: closed
- Details: Storage service is operating normally

✅ Storage service is operational
```

## Complete Test Suite

Run all tests together:

```typescript
import {
  uploadVoiceRecording,
  downloadVoiceIntro,
  preloadVoiceIntros,
  getCacheStats,
  storageHealthCheck,
} from './src/utils';

async function runAllTests() {
  console.log('=== CLOUD STORAGE TEST SUITE ===\n');

  // Test 1: Health Check
  console.log('1. Health Check');
  const health = await storageHealthCheck();
  console.log(`   Status: ${health.status}\n`);

  // Test 2: Upload
  console.log('2. Upload Test');
  const uploadResult = await uploadVoiceRecording({
    userId: 'test-user',
    fileUri: 'file:///test.m4a',
    onProgress: (p) => process.stdout.write(`\r   Progress: ${p}%`),
  });
  console.log(`\n   URL: ${uploadResult.url}\n`);

  // Test 3: Download
  console.log('3. Download Test');
  const downloadResult = await downloadVoiceIntro({
    userId: 'test-user',
    onProgress: (p) => process.stdout.write(`\r   Progress: ${p}%`),
  });
  console.log(`\n   Local: ${downloadResult.localUri}\n`);

  // Test 4: Preload
  console.log('4. Preload Test');
  const count = await preloadVoiceIntros(['user1', 'user2', 'user3']);
  console.log(`   Preloaded: ${count} files\n`);

  // Test 5: Cache Stats
  console.log('5. Cache Stats');
  const stats = await getCacheStats();
  console.log(`   Files: ${stats.totalFiles}`);
  console.log(`   Size: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB\n`);

  console.log('=== ALL TESTS COMPLETED ===');
}

runAllTests().catch(console.error);
```

## Simulating Network Failures

The mock implementation has a built-in 10% random failure rate for uploads and 5% for downloads. To test retry logic:

1. Run upload/download operations multiple times
2. Watch for retry attempts in the console
3. Verify that operations succeed after retries
4. Test circuit breaker by causing multiple failures

## Integration with React Native

Example test component:

```tsx
import React, { useState } from 'react';
import { View, Button, Text } from 'react-native';
import { uploadVoiceRecording } from './src/utils';

function TestComponent() {
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);

  const runTest = async () => {
    setStatus('Uploading...');

    try {
      const result = await uploadVoiceRecording({
        userId: 'test-user',
        fileUri: 'file:///test.m4a',
        onProgress: setProgress,
      });

      setStatus(`Success! URL: ${result.url}`);
    } catch (error) {
      setStatus(`Failed: ${error.message}`);
    }
  };

  return (
    <View>
      <Button title="Run Test" onPress={runTest} />
      <Text>{status}</Text>
      {progress > 0 && <Text>Progress: {progress}%</Text>}
    </View>
  );
}
```

## Next Steps

After testing in mock mode:

1. Install Firebase dependencies
2. Configure Firebase Storage
3. Set up security rules
4. Replace mock imports with real Firebase
5. Test with real audio files
6. Deploy to production

## Troubleshooting

### No Output
- Check that you've imported from the correct path
- Verify TypeScript compilation is working
- Check console for errors

### Import Errors
- Ensure all files are in `src/utils/`
- Check that paths are correct
- Verify TypeScript configuration

### Mock Not Working
- The mock should work without any setup
- Check console for initialization messages
- Verify no Firebase errors (should be none in mock mode)

## Support

For more examples, see:
- `src/utils/examples.ts` - 19 comprehensive examples
- `README.md` - Full documentation
- `CLOUD_STORAGE_GUIDE.md` - Quick reference

---

**Happy Testing!** 🚀
