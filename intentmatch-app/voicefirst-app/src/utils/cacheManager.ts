/**
 * Cache Manager for Downloaded Audio Files
 *
 * Manages local cache of downloaded voice intros with automatic cleanup.
 * Implements 7-day retention policy and provides cache statistics.
 *
 * REACT NATIVE STORAGE:
 * This implementation uses React Native FileSystem.
 * Install with: expo install expo-file-system
 *
 * For production, also consider:
 * - AsyncStorage for metadata persistence
 * - expo-secure-store for sensitive cache metadata
 */

import { CacheEntry, CacheStats, StorageError, StorageErrorType } from './types';

/**
 * Cache configuration
 */
const CACHE_CONFIG = {
  retentionDays: 7,
  maxCacheSize: 100 * 1024 * 1024, // 100MB
  cacheDirectory: 'voice-cache',
};

/**
 * In-memory cache metadata store
 * In production, persist this to AsyncStorage
 */
class CacheMetadataStore {
  private cache: Map<string, CacheEntry> = new Map();

  /**
   * Add or update a cache entry
   */
  set(userId: string, entry: CacheEntry): void {
    this.cache.set(userId, entry);
    console.log(`[Cache] Added entry for user ${userId}`);
  }

  /**
   * Get a cache entry
   */
  get(userId: string): CacheEntry | undefined {
    return this.cache.get(userId);
  }

  /**
   * Remove a cache entry
   */
  delete(userId: string): boolean {
    const result = this.cache.delete(userId);
    if (result) {
      console.log(`[Cache] Removed entry for user ${userId}`);
    }
    return result;
  }

  /**
   * Get all cache entries
   */
  getAll(): CacheEntry[] {
    return Array.from(this.cache.values());
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    console.log('[Cache] Cleared all entries');
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }
}

/**
 * Cache Manager Class
 */
class CacheManager {
  private metadataStore: CacheMetadataStore;
  private cacheDir: string;

  constructor() {
    this.metadataStore = new CacheMetadataStore();
    // In production, use FileSystem.cacheDirectory from expo-file-system
    this.cacheDir = `${CACHE_CONFIG.cacheDirectory}/`;
    console.log(`[Cache] Initialized with directory: ${this.cacheDir}`);
  }

  /**
   * Get the full cache path for a user's audio file
   */
  private getCachePath(userId: string): string {
    return `${this.cacheDir}${userId}_intro.m4a`;
  }

  /**
   * Add a file to the cache
   *
   * @param userId - The user ID
   * @param localUri - Local file URI
   * @param remoteUrl - Remote URL the file was downloaded from
   * @param size - File size in bytes
   * @param contentType - Content type
   */
  async addToCache(
    userId: string,
    localUri: string,
    remoteUrl: string,
    size: number,
    contentType: string
  ): Promise<void> {
    try {
      const entry: CacheEntry = {
        userId,
        localUri,
        remoteUrl,
        cachedAt: new Date(),
        size,
        contentType,
      };

      this.metadataStore.set(userId, entry);
      console.log(`[Cache] Cached file for user ${userId}: ${size} bytes`);

      // Check if we need to clean up old files
      await this.cleanupIfNeeded();
    } catch (error) {
      console.error('[Cache] Failed to add to cache:', error);
      throw new StorageError(
        StorageErrorType.CACHE_ERROR,
        'Failed to add file to cache',
        error as Error
      );
    }
  }

  /**
   * Get a cached file if it exists and is not expired
   *
   * @param userId - The user ID
   * @param forceRefresh - Force a refresh even if cached
   * @returns The cache entry or undefined if not cached/expired
   */
  async getFromCache(
    userId: string,
    forceRefresh: boolean = false
  ): Promise<CacheEntry | undefined> {
    if (forceRefresh) {
      console.log(`[Cache] Force refresh requested for user ${userId}`);
      return undefined;
    }

    const entry = this.metadataStore.get(userId);

    if (!entry) {
      console.log(`[Cache] No cache entry found for user ${userId}`);
      return undefined;
    }

    // Check if entry is expired (older than retention period)
    const ageInDays = (Date.now() - entry.cachedAt.getTime()) / (1000 * 60 * 60 * 24);

    if (ageInDays > CACHE_CONFIG.retentionDays) {
      console.log(`[Cache] Entry expired for user ${userId} (${ageInDays.toFixed(1)} days old)`);
      await this.removeFromCache(userId);
      return undefined;
    }

    // In production, verify the file still exists using FileSystem.getInfoAsync
    // For now, assume it exists
    console.log(`[Cache] Cache hit for user ${userId}`);
    return entry;
  }

  /**
   * Remove a file from the cache
   *
   * @param userId - The user ID
   */
  async removeFromCache(userId: string): Promise<void> {
    const entry = this.metadataStore.get(userId);

    if (!entry) {
      console.log(`[Cache] No entry to remove for user ${userId}`);
      return;
    }

    try {
      // In production, delete the actual file using FileSystem.deleteAsync
      console.log(`[MOCK] Deleting cached file: ${entry.localUri}`);

      this.metadataStore.delete(userId);
      console.log(`[Cache] Removed cache entry for user ${userId}`);
    } catch (error) {
      console.error('[Cache] Failed to remove from cache:', error);
      throw new StorageError(
        StorageErrorType.CACHE_ERROR,
        'Failed to remove file from cache',
        error as Error
      );
    }
  }

  /**
   * Clean up old cached files (older than retention period)
   *
   * @returns Number of files removed
   */
  async cleanupOldFiles(): Promise<number> {
    console.log('[Cache] Starting cleanup of old files...');

    const entries = this.metadataStore.getAll();
    const now = Date.now();
    const retentionMs = CACHE_CONFIG.retentionDays * 24 * 60 * 60 * 1000;
    let removedCount = 0;

    for (const entry of entries) {
      const age = now - entry.cachedAt.getTime();

      if (age > retentionMs) {
        const ageInDays = age / (24 * 60 * 60 * 1000);
        console.log(
          `[Cache] Removing old file for user ${entry.userId} (${ageInDays.toFixed(1)} days old)`
        );

        await this.removeFromCache(entry.userId);
        removedCount++;
      }
    }

    console.log(`[Cache] Cleanup complete. Removed ${removedCount} old files.`);
    return removedCount;
  }

  /**
   * Clean up cache if it exceeds size limit
   * Removes oldest files first
   */
  async cleanupIfNeeded(): Promise<void> {
    const stats = await this.getCacheStats();

    if (stats.totalSize > CACHE_CONFIG.maxCacheSize) {
      console.log(
        `[Cache] Cache size (${stats.totalSize} bytes) exceeds limit (${CACHE_CONFIG.maxCacheSize} bytes)`
      );

      // Sort entries by age (oldest first)
      const entries = this.metadataStore
        .getAll()
        .sort((a, b) => a.cachedAt.getTime() - b.cachedAt.getTime());

      let currentSize = stats.totalSize;
      const targetSize = CACHE_CONFIG.maxCacheSize * 0.8; // Clean up to 80% of limit

      for (const entry of entries) {
        if (currentSize <= targetSize) {
          break;
        }

        console.log(`[Cache] Removing file for user ${entry.userId} to free space`);
        await this.removeFromCache(entry.userId);
        currentSize -= entry.size;
      }

      console.log(`[Cache] Cache size reduced to ${currentSize} bytes`);
    }
  }

  /**
   * Get cache statistics
   *
   * @returns Cache statistics
   */
  async getCacheStats(): Promise<CacheStats> {
    const entries = this.metadataStore.getAll();

    if (entries.length === 0) {
      return {
        totalFiles: 0,
        totalSize: 0,
      };
    }

    const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);
    const dates = entries.map(e => e.cachedAt);
    const oldestEntry = new Date(Math.min(...dates.map(d => d.getTime())));
    const newestEntry = new Date(Math.max(...dates.map(d => d.getTime())));

    return {
      totalFiles: entries.length,
      totalSize,
      oldestEntry,
      newestEntry,
    };
  }

  /**
   * Clear all cached files
   */
  async clearCache(): Promise<void> {
    console.log('[Cache] Clearing all cached files...');

    const entries = this.metadataStore.getAll();

    for (const entry of entries) {
      await this.removeFromCache(entry.userId);
    }

    this.metadataStore.clear();
    console.log('[Cache] Cache cleared successfully');
  }

  /**
   * Check if a file is cached
   *
   * @param userId - The user ID
   * @returns True if file is cached and not expired
   */
  async isCached(userId: string): Promise<boolean> {
    const entry = await this.getFromCache(userId);
    return entry !== undefined;
  }

  /**
   * Get cache directory path
   */
  getCacheDirectory(): string {
    return this.cacheDir;
  }

  /**
   * Set up periodic cleanup (call this on app startup)
   * Runs cleanup daily
   */
  setupPeriodicCleanup(): void {
    // Run cleanup immediately
    this.cleanupOldFiles().catch(error => {
      console.error('[Cache] Initial cleanup failed:', error);
    });

    // Set up daily cleanup
    const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

    setInterval(() => {
      this.cleanupOldFiles().catch(error => {
        console.error('[Cache] Periodic cleanup failed:', error);
      });
    }, CLEANUP_INTERVAL);

    console.log('[Cache] Periodic cleanup scheduled (daily)');
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();

// Export the class for testing purposes
export { CacheManager };

/**
 * Initialize cache manager (call this on app startup)
 */
export function initializeCacheManager(): void {
  console.log('[Cache] Initializing cache manager...');
  cacheManager.setupPeriodicCleanup();
}
