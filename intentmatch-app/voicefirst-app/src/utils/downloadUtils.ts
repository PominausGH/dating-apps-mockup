/**
 * Download Utility Functions for Voice Intros
 *
 * Handles downloading voice intros from Firebase Storage with:
 * - Caching mechanism
 * - Progress tracking
 * - Retry logic
 * - Automatic cache management
 *
 * DEPENDENCIES:
 * - expo-file-system for file operations
 * - Firebase Storage SDK (mocked in this demo)
 */

import {
  DownloadOptions,
  DownloadResult,
  StorageError,
  StorageErrorType,
} from './types';
import { getStorageRef } from './firebaseMock';
import { withRetry, storageCircuitBreaker } from './retryLogic';
import { cacheManager } from './cacheManager';

/**
 * Storage path template for voice intros
 */
const VOICE_INTRO_PATH_TEMPLATE = 'voice-intros/{userId}/intro.m4a';

/**
 * Default retry count for downloads
 */
const DEFAULT_MAX_RETRIES = 3;

/**
 * Get the storage path for a user's voice intro
 */
function getVoiceIntroPath(userId: string): string {
  return VOICE_INTRO_PATH_TEMPLATE.replace('{userId}', userId);
}

/**
 * Generate local cache path for downloaded file
 *
 * @param userId - The user ID
 * @returns Local file URI
 */
function getLocalCachePath(userId: string): string {
  // In production, use FileSystem.cacheDirectory from expo-file-system
  const cacheDir = cacheManager.getCacheDirectory();
  return `${cacheDir}${userId}_intro.m4a`;
}

/**
 * Download a file from URL to local storage
 * This is a mock implementation - in production, use FileSystem.downloadAsync
 *
 * @param url - Remote URL
 * @param localUri - Local destination URI
 * @param onProgress - Progress callback
 */
async function downloadFile(
  url: string,
  localUri: string,
  onProgress?: (progress: number) => void
): Promise<{ uri: string; size: number }> {
  console.log(`[Download] Downloading from ${url} to ${localUri}`);

  // Mock download with progress simulation
  return new Promise((resolve, reject) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 15;

      if (onProgress) {
        onProgress(progress);
      }

      if (progress >= 100) {
        clearInterval(interval);

        // Simulate successful download
        console.log(`[Download] Download completed: ${localUri}`);
        resolve({
          uri: localUri,
          size: 1024000, // Mock 1MB file
        });
      }
    }, 150);

    // Simulate random failures (5% chance)
    if (Math.random() < 0.05) {
      clearInterval(interval);
      reject(new StorageError(
        StorageErrorType.NETWORK_ERROR,
        'Mock network error during download'
      ));
    }
  });
}

/**
 * Download a voice intro from Firebase Storage
 *
 * @param options - Download options
 * @returns Download result with local file URI
 *
 * @example
 * const result = await downloadVoiceIntro({
 *   userId: 'user123',
 *   forceRefresh: false,
 *   onProgress: (progress) => console.log(`Download: ${progress}%`),
 * });
 * console.log(`Downloaded to: ${result.localUri}`);
 */
export async function downloadVoiceIntro(
  options: DownloadOptions
): Promise<DownloadResult> {
  const {
    userId,
    forceRefresh = false,
    onProgress,
  } = options;

  console.log(`[Download] Starting download for user ${userId}`);

  // Validate input
  if (!userId) {
    throw new StorageError(
      StorageErrorType.INVALID_FILE,
      'userId is required'
    );
  }

  try {
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedEntry = await cacheManager.getFromCache(userId, forceRefresh);

      if (cachedEntry) {
        console.log(`[Download] Using cached file: ${cachedEntry.localUri}`);

        // Verify cached file still exists
        // In production, use FileSystem.getInfoAsync
        const fileExists = true; // Mock - assume file exists

        if (fileExists) {
          return {
            localUri: cachedEntry.localUri,
            size: cachedEntry.size,
            contentType: cachedEntry.contentType,
            cachedAt: cachedEntry.cachedAt,
          };
        } else {
          console.log('[Download] Cached file missing, re-downloading...');
          await cacheManager.removeFromCache(userId);
        }
      }
    }

    // Get storage reference
    const storagePath = getVoiceIntroPath(userId);
    const storageRef = getStorageRef(storagePath);

    console.log(`[Download] Downloading from path: ${storagePath}`);

    // Get download URL with retry logic
    const downloadUrl = await withRetry(
      async () => {
        return await storageCircuitBreaker.execute(async () => {
          return await storageRef.getDownloadURL();
        });
      },
      { maxRetries: DEFAULT_MAX_RETRIES }
    );

    // Get metadata
    const metadata = await storageRef.getMetadata();

    // Download file to local cache
    const localUri = getLocalCachePath(userId);

    const { uri, size } = await withRetry(
      async () => {
        return await downloadFile(downloadUrl, localUri, onProgress);
      },
      { maxRetries: DEFAULT_MAX_RETRIES },
      (attempt, error) => {
        console.log(`[Download] Retry attempt ${attempt} for user ${userId}:`, error);
      }
    );

    // Add to cache
    await cacheManager.addToCache(
      userId,
      uri,
      downloadUrl,
      size,
      metadata.contentType
    );

    console.log(`[Download] Download completed and cached: ${uri}`);

    return {
      localUri: uri,
      size,
      contentType: metadata.contentType,
      cachedAt: new Date(),
    };
  } catch (error) {
    console.error('[Download] Download failed:', error);

    if (error instanceof StorageError) {
      throw error;
    }

    throw new StorageError(
      StorageErrorType.DOWNLOAD_FAILED,
      `Failed to download voice intro for user ${userId}`,
      error as Error
    );
  }
}

/**
 * Download multiple voice intros in parallel
 *
 * @param userIds - Array of user IDs
 * @param options - Download options (applied to all downloads)
 * @returns Array of download results (successful downloads only)
 *
 * @example
 * const results = await downloadMultipleVoiceIntros(
 *   ['user1', 'user2', 'user3'],
 *   { forceRefresh: false }
 * );
 */
export async function downloadMultipleVoiceIntros(
  userIds: string[],
  options: Omit<DownloadOptions, 'userId'> = {}
): Promise<DownloadResult[]> {
  console.log(`[Download] Starting batch download for ${userIds.length} users`);

  const downloadPromises = userIds.map(userId =>
    downloadVoiceIntro({ ...options, userId })
      .catch(error => {
        console.error(`[Download] Failed to download for user ${userId}:`, error);
        return null;
      })
  );

  const results = await Promise.all(downloadPromises);

  // Filter out failed downloads
  const successfulResults = results.filter((result): result is DownloadResult => result !== null);

  console.log(
    `[Download] Batch download completed: ${successfulResults.length}/${userIds.length} successful`
  );

  return successfulResults;
}

/**
 * Preload voice intros for a list of users
 * Useful for preloading profiles that will be shown soon
 *
 * @param userIds - Array of user IDs to preload
 * @returns Number of successfully preloaded files
 *
 * @example
 * // Preload voice intros for upcoming profiles
 * const preloadedCount = await preloadVoiceIntros(['user1', 'user2', 'user3']);
 * console.log(`Preloaded ${preloadedCount} voice intros`);
 */
export async function preloadVoiceIntros(userIds: string[]): Promise<number> {
  console.log(`[Download] Preloading voice intros for ${userIds.length} users`);

  const results = await downloadMultipleVoiceIntros(userIds, {
    forceRefresh: false,
  });

  console.log(`[Download] Preloaded ${results.length} voice intros`);

  return results.length;
}

/**
 * Check if a voice intro is cached locally
 *
 * @param userId - The user ID
 * @returns True if voice intro is cached
 */
export async function isVoiceIntroCached(userId: string): Promise<boolean> {
  return await cacheManager.isCached(userId);
}

/**
 * Get the local cache path for a user's voice intro (if cached)
 *
 * @param userId - The user ID
 * @returns Local file URI or null if not cached
 */
export async function getCachedVoiceIntroPath(
  userId: string
): Promise<string | null> {
  const cachedEntry = await cacheManager.getFromCache(userId, false);

  if (cachedEntry) {
    return cachedEntry.localUri;
  }

  return null;
}

/**
 * Remove a specific user's voice intro from cache
 *
 * @param userId - The user ID
 */
export async function removeCachedVoiceIntro(userId: string): Promise<void> {
  console.log(`[Download] Removing cached voice intro for user ${userId}`);
  await cacheManager.removeFromCache(userId);
}

/**
 * Remove multiple users' voice intros from cache
 *
 * @param userIds - Array of user IDs
 */
export async function removeCachedVoiceIntros(userIds: string[]): Promise<void> {
  console.log(`[Download] Removing ${userIds.length} cached voice intros`);

  await Promise.all(
    userIds.map(userId => cacheManager.removeFromCache(userId))
  );

  console.log(`[Download] Removed cached voice intros`);
}

/**
 * Stream audio from remote URL without downloading to cache
 * Useful for preview/playback without permanent caching
 *
 * @param userId - The user ID
 * @returns Remote audio URL for streaming
 */
export async function streamVoiceIntro(userId: string): Promise<string> {
  console.log(`[Download] Getting stream URL for user ${userId}`);

  const storagePath = getVoiceIntroPath(userId);
  const storageRef = getStorageRef(storagePath);

  try {
    const downloadUrl = await withRetry(
      async () => {
        return await storageRef.getDownloadURL();
      },
      { maxRetries: DEFAULT_MAX_RETRIES }
    );

    console.log(`[Download] Stream URL retrieved: ${downloadUrl}`);

    return downloadUrl;
  } catch (error) {
    console.error('[Download] Failed to get stream URL:', error);

    throw new StorageError(
      StorageErrorType.DOWNLOAD_FAILED,
      `Failed to get stream URL for user ${userId}`,
      error as Error
    );
  }
}

/**
 * Get download progress for active downloads
 * This would track active download tasks in a production implementation
 *
 * @param userId - The user ID
 * @returns Progress percentage (0-100) or null if no active download
 */
export function getDownloadProgress(userId: string): number | null {
  // In production, track active downloads and return progress
  // For now, return null (no active download)
  console.log(`[Download] No active download tracking for user ${userId}`);
  return null;
}

/**
 * Prefetch voice intros based on priority
 * Downloads high-priority intros first
 *
 * @param priorityMap - Map of userId to priority (higher number = higher priority)
 * @returns Number of successfully prefetched files
 */
export async function prefetchByPriority(
  priorityMap: Map<string, number>
): Promise<number> {
  // Sort users by priority (descending)
  const sortedUsers = Array.from(priorityMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([userId]) => userId);

  console.log(
    `[Download] Prefetching ${sortedUsers.length} voice intros by priority`
  );

  // Download in batches to avoid overwhelming the network
  const BATCH_SIZE = 5;
  let successCount = 0;

  for (let i = 0; i < sortedUsers.length; i += BATCH_SIZE) {
    const batch = sortedUsers.slice(i, i + BATCH_SIZE);
    const results = await downloadMultipleVoiceIntros(batch);
    successCount += results.length;

    // Small delay between batches
    if (i + BATCH_SIZE < sortedUsers.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log(`[Download] Prefetched ${successCount} voice intros`);

  return successCount;
}
