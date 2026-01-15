/**
 * Cloud Storage Utilities - Main Export File
 *
 * Provides a centralized export point for all cloud storage functionality
 * for the VoiceFirst app.
 *
 * QUICK START:
 *
 * 1. Import the utilities you need:
 *    import { uploadVoiceRecording, downloadVoiceIntro } from './utils';
 *
 * 2. Initialize cache manager on app startup:
 *    import { initializeCacheManager } from './utils';
 *    initializeCacheManager();
 *
 * 3. Upload a voice recording:
 *    const result = await uploadVoiceRecording({
 *      userId: 'user123',
 *      fileUri: 'file:///recording.m4a',
 *      onProgress: (progress) => console.log(progress),
 *    });
 *
 * 4. Download a voice intro:
 *    const download = await downloadVoiceIntro({
 *      userId: 'user456',
 *      onProgress: (progress) => console.log(progress),
 *    });
 */

// ============================================================================
// Types and Interfaces
// ============================================================================
export {
  UploadProgressCallback,
  UploadResult,
  DownloadResult,
  UploadOptions,
  DownloadOptions,
  SignedUrlOptions,
  CacheEntry,
  CacheStats,
  StorageErrorType,
  StorageError,
  RetryConfig,
  UploadTask,
} from './types';

// ============================================================================
// Upload Utilities
// ============================================================================
export {
  uploadVoiceRecording,
  uploadVoiceRecordingWithSignedUrl,
  deleteVoiceRecording,
  getVoiceRecordingSignedUrl,
  voiceRecordingExists,
  getVoiceRecordingMetadata,
  getActiveUploads,
  getUploadTask,
  cancelUpload,
  validateSignedUrl,
} from './uploadUtils';

// ============================================================================
// Download Utilities
// ============================================================================
export {
  downloadVoiceIntro,
  downloadMultipleVoiceIntros,
  preloadVoiceIntros,
  isVoiceIntroCached,
  getCachedVoiceIntroPath,
  removeCachedVoiceIntro,
  removeCachedVoiceIntros,
  streamVoiceIntro,
  getDownloadProgress,
  prefetchByPriority,
} from './downloadUtils';

// ============================================================================
// Cache Management
// ============================================================================
export {
  cacheManager,
  CacheManager,
  initializeCacheManager,
} from './cacheManager';

// ============================================================================
// Retry Logic
// ============================================================================
export {
  withRetry,
  createRetryWrapper,
  withRetryProgress,
  CircuitBreaker,
  storageCircuitBreaker,
} from './retryLogic';

// ============================================================================
// Firebase Mock (for demo purposes)
// ============================================================================
export {
  storage,
  getStorageRef,
  generateSignedUrl,
  isSignedUrlValid,
} from './firebaseMock';

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Initialize all storage utilities
 * Call this once on app startup
 */
export function initializeStorageUtils(): void {
  console.log('[Storage] Initializing cloud storage utilities...');
  initializeCacheManager();
  console.log('[Storage] Cloud storage utilities initialized');
}

/**
 * Get cache statistics
 * Useful for displaying cache info in settings
 */
export async function getCacheStats() {
  return await cacheManager.getCacheStats();
}

/**
 * Clear all cached files
 * Useful for "Clear Cache" button in settings
 */
export async function clearAllCache(): Promise<void> {
  console.log('[Storage] Clearing all cached files...');
  await cacheManager.clearCache();
  console.log('[Storage] All cached files cleared');
}

/**
 * Clean up old cached files (7+ days old)
 * This runs automatically, but can be called manually
 */
export async function cleanupOldCachedFiles(): Promise<number> {
  console.log('[Storage] Running manual cache cleanup...');
  const removedCount = await cacheManager.cleanupOldFiles();
  console.log(`[Storage] Removed ${removedCount} old files`);
  return removedCount;
}

/**
 * Health check for storage services
 * Returns status of storage connectivity
 */
export async function storageHealthCheck(): Promise<{
  status: 'healthy' | 'degraded' | 'unavailable';
  circuitBreakerState: 'closed' | 'open' | 'half-open';
  details: string;
}> {
  const circuitState = storageCircuitBreaker.getState();

  if (circuitState === 'open') {
    return {
      status: 'unavailable',
      circuitBreakerState: circuitState,
      details: 'Circuit breaker is open - storage service temporarily unavailable',
    };
  }

  if (circuitState === 'half-open') {
    return {
      status: 'degraded',
      circuitBreakerState: circuitState,
      details: 'Circuit breaker is half-open - attempting recovery',
    };
  }

  return {
    status: 'healthy',
    circuitBreakerState: circuitState,
    details: 'Storage service is operating normally',
  };
}
