/**
 * Cloud Storage Types for VoiceFirst App
 *
 * This file contains all TypeScript types and interfaces for cloud storage operations.
 */

/**
 * Upload progress callback type
 */
export type UploadProgressCallback = (progress: number) => void;

/**
 * Upload result containing the file URL and metadata
 */
export interface UploadResult {
  url: string;
  path: string;
  signedUrl?: string;
  expiresAt?: Date;
  size: number;
  contentType: string;
}

/**
 * Download result containing the local file path and metadata
 */
export interface DownloadResult {
  localUri: string;
  size: number;
  contentType: string;
  cachedAt: Date;
}

/**
 * Upload options for voice recordings
 */
export interface UploadOptions {
  userId: string;
  fileUri: string;
  contentType?: string;
  onProgress?: UploadProgressCallback;
  maxRetries?: number;
  metadata?: Record<string, string>;
}

/**
 * Download options for voice intros
 */
export interface DownloadOptions {
  userId: string;
  forceRefresh?: boolean;
  onProgress?: UploadProgressCallback;
}

/**
 * Signed URL options
 */
export interface SignedUrlOptions {
  expirationMinutes?: number;
}

/**
 * Cache entry metadata
 */
export interface CacheEntry {
  userId: string;
  localUri: string;
  remoteUrl: string;
  cachedAt: Date;
  size: number;
  contentType: string;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  totalFiles: number;
  totalSize: number;
  oldestEntry?: Date;
  newestEntry?: Date;
}

/**
 * Storage error types
 */
export enum StorageErrorType {
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  DOWNLOAD_FAILED = 'DOWNLOAD_FAILED',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  INVALID_FILE = 'INVALID_FILE',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  RETRY_EXHAUSTED = 'RETRY_EXHAUSTED',
  CACHE_ERROR = 'CACHE_ERROR',
}

/**
 * Custom storage error class
 */
export class StorageError extends Error {
  constructor(
    public type: StorageErrorType,
    message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

/**
 * Upload task for tracking ongoing uploads
 */
export interface UploadTask {
  id: string;
  userId: string;
  fileUri: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  error?: StorageError;
  startedAt: Date;
  completedAt?: Date;
}
