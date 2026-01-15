/**
 * Cloud Storage Examples and Usage Guide
 *
 * This file demonstrates how to use the cloud storage utilities
 * for the VoiceFirst app in various scenarios.
 *
 * These are examples and should not be imported directly into your app.
 * Copy the patterns you need into your actual components.
 */

import {
  uploadVoiceRecording,
  uploadVoiceRecordingWithSignedUrl,
  downloadVoiceIntro,
  preloadVoiceIntros,
  deleteVoiceRecording,
  getCacheStats,
  clearAllCache,
  initializeStorageUtils,
  storageHealthCheck,
  UploadResult,
  DownloadResult,
  StorageError,
} from './index';

// ============================================================================
// INITIALIZATION - Call this on app startup
// ============================================================================

/**
 * Initialize storage utilities when app starts
 * Place this in your App.tsx or main entry point
 */
export function initializeAppStorage() {
  console.log('Initializing app storage...');
  initializeStorageUtils();
}

// ============================================================================
// UPLOAD EXAMPLES
// ============================================================================

/**
 * Example 1: Basic voice recording upload
 */
export async function exampleBasicUpload(
  userId: string,
  recordingUri: string
): Promise<void> {
  try {
    console.log('Starting basic upload...');

    const result: UploadResult = await uploadVoiceRecording({
      userId,
      fileUri: recordingUri,
      contentType: 'audio/m4a',
    });

    console.log('Upload successful!');
    console.log('Download URL:', result.url);
    console.log('File size:', result.size);
  } catch (error) {
    console.error('Upload failed:', error);

    if (error instanceof StorageError) {
      console.error('Error type:', error.type);
      console.error('Error message:', error.message);
    }
  }
}

/**
 * Example 2: Upload with progress tracking
 */
export async function exampleUploadWithProgress(
  userId: string,
  recordingUri: string,
  setProgress: (progress: number) => void
): Promise<void> {
  try {
    const result = await uploadVoiceRecording({
      userId,
      fileUri: recordingUri,
      onProgress: (progress) => {
        console.log(`Upload progress: ${progress}%`);
        setProgress(progress);
      },
    });

    console.log('Upload complete:', result.url);
  } catch (error) {
    console.error('Upload failed:', error);
    setProgress(0); // Reset progress on error
  }
}

/**
 * Example 3: Upload with signed URL generation
 */
export async function exampleUploadWithSignedUrl(
  userId: string,
  recordingUri: string
): Promise<void> {
  try {
    const result = await uploadVoiceRecordingWithSignedUrl(
      {
        userId,
        fileUri: recordingUri,
      },
      {
        expirationMinutes: 120, // 2 hours
      }
    );

    console.log('Upload complete with signed URL!');
    console.log('Signed URL:', result.signedUrl);
    console.log('Expires at:', result.expiresAt);

    // Use the signed URL to share with other users
    // This URL will expire after 2 hours
  } catch (error) {
    console.error('Upload failed:', error);
  }
}

/**
 * Example 4: Upload with retry configuration
 */
export async function exampleUploadWithCustomRetry(
  userId: string,
  recordingUri: string
): Promise<void> {
  try {
    const result = await uploadVoiceRecording({
      userId,
      fileUri: recordingUri,
      maxRetries: 5, // Retry up to 5 times on failure
      onProgress: (progress) => {
        console.log(`Upload progress: ${progress}%`);
      },
    });

    console.log('Upload successful after possible retries:', result.url);
  } catch (error) {
    console.error('Upload failed after all retries:', error);
  }
}

/**
 * Example 5: Upload with metadata
 */
export async function exampleUploadWithMetadata(
  userId: string,
  recordingUri: string
): Promise<void> {
  try {
    const result = await uploadVoiceRecording({
      userId,
      fileUri: recordingUri,
      metadata: {
        platform: 'ios',
        appVersion: '1.0.0',
        recordedAt: new Date().toISOString(),
        duration: '30',
      },
    });

    console.log('Upload with metadata successful:', result.url);
  } catch (error) {
    console.error('Upload failed:', error);
  }
}

// ============================================================================
// DOWNLOAD EXAMPLES
// ============================================================================

/**
 * Example 6: Basic voice intro download
 */
export async function exampleBasicDownload(userId: string): Promise<void> {
  try {
    console.log('Downloading voice intro...');

    const result: DownloadResult = await downloadVoiceIntro({
      userId,
    });

    console.log('Download successful!');
    console.log('Local file:', result.localUri);
    console.log('File size:', result.size);
    console.log('Cached at:', result.cachedAt);

    // Use result.localUri to play the audio
    // For example: Audio.Sound.createAsync({ uri: result.localUri })
  } catch (error) {
    console.error('Download failed:', error);
  }
}

/**
 * Example 7: Download with progress tracking
 */
export async function exampleDownloadWithProgress(
  userId: string,
  setProgress: (progress: number) => void
): Promise<void> {
  try {
    const result = await downloadVoiceIntro({
      userId,
      onProgress: (progress) => {
        console.log(`Download progress: ${progress}%`);
        setProgress(progress);
      },
    });

    console.log('Download complete:', result.localUri);
    setProgress(100);
  } catch (error) {
    console.error('Download failed:', error);
    setProgress(0);
  }
}

/**
 * Example 8: Force refresh download (bypass cache)
 */
export async function exampleForceRefreshDownload(
  userId: string
): Promise<void> {
  try {
    const result = await downloadVoiceIntro({
      userId,
      forceRefresh: true, // Bypass cache and download fresh
    });

    console.log('Fresh download complete:', result.localUri);
  } catch (error) {
    console.error('Download failed:', error);
  }
}

/**
 * Example 9: Preload multiple voice intros
 * Useful when loading a feed of profiles
 */
export async function examplePreloadMultipleIntros(
  userIds: string[]
): Promise<void> {
  try {
    console.log(`Preloading ${userIds.length} voice intros...`);

    const count = await preloadVoiceIntros(userIds);

    console.log(`Successfully preloaded ${count}/${userIds.length} voice intros`);
  } catch (error) {
    console.error('Preload failed:', error);
  }
}

/**
 * Example 10: Download with priority
 * Download visible profiles first, then upcoming ones
 */
export async function examplePriorityDownload(
  visibleUserIds: string[],
  upcomingUserIds: string[]
): Promise<void> {
  try {
    // Create priority map
    const priorityMap = new Map<string, number>();

    // Visible profiles get high priority
    visibleUserIds.forEach(userId => {
      priorityMap.set(userId, 100);
    });

    // Upcoming profiles get medium priority
    upcomingUserIds.forEach(userId => {
      priorityMap.set(userId, 50);
    });

    const { prefetchByPriority } = await import('./downloadUtils');
    const count = await prefetchByPriority(priorityMap);

    console.log(`Prefetched ${count} voice intros by priority`);
  } catch (error) {
    console.error('Priority download failed:', error);
  }
}

// ============================================================================
// CACHE MANAGEMENT EXAMPLES
// ============================================================================

/**
 * Example 11: Display cache statistics
 */
export async function exampleShowCacheStats(): Promise<void> {
  try {
    const stats = await getCacheStats();

    console.log('Cache Statistics:');
    console.log(`- Total files: ${stats.totalFiles}`);
    console.log(`- Total size: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`);

    if (stats.oldestEntry) {
      console.log(`- Oldest entry: ${stats.oldestEntry.toLocaleDateString()}`);
    }

    if (stats.newestEntry) {
      console.log(`- Newest entry: ${stats.newestEntry.toLocaleDateString()}`);
    }
  } catch (error) {
    console.error('Failed to get cache stats:', error);
  }
}

/**
 * Example 12: Clear cache (for settings screen)
 */
export async function exampleClearCache(): Promise<void> {
  try {
    console.log('Clearing cache...');
    await clearAllCache();
    console.log('Cache cleared successfully');

    // Show success message to user
    alert('Cache cleared successfully!');
  } catch (error) {
    console.error('Failed to clear cache:', error);
    alert('Failed to clear cache');
  }
}

// ============================================================================
// COMPLETE WORKFLOW EXAMPLES
// ============================================================================

/**
 * Example 13: Complete recording and upload workflow
 */
export async function exampleRecordAndUpload(
  userId: string,
  setUploadProgress: (progress: number) => void
): Promise<string | null> {
  try {
    // Step 1: Record audio (this would be your actual recording logic)
    console.log('Recording audio...');
    const recordingUri = 'file:///path/to/recording.m4a'; // From audio recording

    // Step 2: Upload with progress
    console.log('Uploading recording...');
    const result = await uploadVoiceRecording({
      userId,
      fileUri: recordingUri,
      onProgress: setUploadProgress,
    });

    console.log('Recording uploaded successfully!');
    return result.url;
  } catch (error) {
    console.error('Record and upload failed:', error);
    return null;
  }
}

/**
 * Example 14: Complete profile viewing workflow
 */
export async function exampleViewProfileWithAudio(
  profileUserId: string,
  setDownloadProgress: (progress: number) => void,
  playAudio: (uri: string) => void
): Promise<void> {
  try {
    // Step 1: Download voice intro
    console.log('Loading voice intro...');
    const result = await downloadVoiceIntro({
      userId: profileUserId,
      onProgress: setDownloadProgress,
    });

    // Step 2: Play the audio
    console.log('Playing voice intro...');
    playAudio(result.localUri);
  } catch (error) {
    console.error('Failed to load voice intro:', error);
    alert('Failed to load voice intro');
  }
}

/**
 * Example 15: Profile feed with preloading
 */
export async function exampleProfileFeedWithPreload(
  currentProfileIndex: number,
  allProfileUserIds: string[]
): Promise<void> {
  try {
    // Get upcoming profile IDs (next 5 profiles)
    const upcomingProfiles = allProfileUserIds.slice(
      currentProfileIndex + 1,
      currentProfileIndex + 6
    );

    // Preload in background
    console.log('Preloading upcoming profiles...');
    preloadVoiceIntros(upcomingProfiles).catch(error => {
      console.error('Background preload failed:', error);
    });

    // Don't wait for preload to complete - it happens in background
  } catch (error) {
    console.error('Preload setup failed:', error);
  }
}

// ============================================================================
// ERROR HANDLING EXAMPLES
// ============================================================================

/**
 * Example 16: Comprehensive error handling
 */
export async function exampleErrorHandling(
  userId: string,
  recordingUri: string
): Promise<void> {
  try {
    const result = await uploadVoiceRecording({
      userId,
      fileUri: recordingUri,
    });

    console.log('Upload successful:', result.url);
  } catch (error) {
    if (error instanceof StorageError) {
      switch (error.type) {
        case 'INVALID_FILE':
          alert('Invalid file. Please record again.');
          break;

        case 'NETWORK_ERROR':
          alert('Network error. Please check your connection and try again.');
          break;

        case 'PERMISSION_DENIED':
          alert('Permission denied. Please check your account permissions.');
          break;

        case 'RETRY_EXHAUSTED':
          alert('Upload failed after multiple attempts. Please try again later.');
          break;

        default:
          alert('Upload failed. Please try again.');
      }
    } else {
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred.');
    }
  }
}

// ============================================================================
// MONITORING EXAMPLES
// ============================================================================

/**
 * Example 17: Monitor storage health
 */
export async function exampleMonitorStorageHealth(): Promise<void> {
  const health = await storageHealthCheck();

  console.log('Storage Health Check:');
  console.log(`- Status: ${health.status}`);
  console.log(`- Circuit Breaker: ${health.circuitBreakerState}`);
  console.log(`- Details: ${health.details}`);

  if (health.status === 'unavailable') {
    console.warn('Storage service is currently unavailable!');
    // Show warning to user or disable upload/download features temporarily
  }
}

/**
 * Example 18: Delete old recording
 */
export async function exampleDeleteRecording(userId: string): Promise<void> {
  try {
    console.log('Deleting old recording...');
    await deleteVoiceRecording(userId);
    console.log('Recording deleted successfully');
  } catch (error) {
    console.error('Failed to delete recording:', error);
  }
}

// ============================================================================
// REACT COMPONENT INTEGRATION EXAMPLE
// ============================================================================

/**
 * Example 19: React component integration pattern
 *
 * This shows how you would integrate the storage utilities
 * into a React Native component
 */
export const ReactComponentExample = `
import React, { useState } from 'react';
import { View, Button, Text, ProgressBar } from 'react-native';
import { uploadVoiceRecording } from './utils';

function UploadScreen({ userId, recordingUri }) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async () => {
    setUploading(true);
    setError(null);

    try {
      const result = await uploadVoiceRecording({
        userId,
        fileUri: recordingUri,
        onProgress: setUploadProgress,
      });

      console.log('Upload successful:', result.url);
      alert('Upload successful!');
    } catch (err) {
      setError(err.message);
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <View>
      <Button
        title={uploading ? 'Uploading...' : 'Upload Recording'}
        onPress={handleUpload}
        disabled={uploading}
      />

      {uploading && (
        <View>
          <Text>Uploading: {uploadProgress}%</Text>
          <ProgressBar progress={uploadProgress / 100} />
        </View>
      )}

      {error && <Text style={{ color: 'red' }}>{error}</Text>}
    </View>
  );
}
`;

console.log('Cloud Storage Examples loaded. See examples.ts for usage patterns.');
