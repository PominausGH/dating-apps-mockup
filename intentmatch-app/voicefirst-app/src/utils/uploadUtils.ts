/**
 * Upload Utility Functions for Voice Recordings
 *
 * Handles uploading voice recordings to Firebase Storage with:
 * - Progress tracking
 * - Retry logic with exponential backoff
 * - File validation
 * - Signed URL generation
 *
 * DEPENDENCIES:
 * - expo-file-system for file operations
 * - Firebase Storage SDK (mocked in this demo)
 */

import {
  UploadOptions,
  UploadResult,
  SignedUrlOptions,
  StorageError,
  StorageErrorType,
  UploadTask,
} from './types';
import { getStorageRef, generateSignedUrl, isSignedUrlValid } from './firebaseMock';
import { withRetry, storageCircuitBreaker } from './retryLogic';

/**
 * Storage path template for voice intros
 */
const VOICE_INTRO_PATH_TEMPLATE = 'voice-intros/{userId}/intro.m4a';

/**
 * Maximum file size (10MB)
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Allowed content types
 */
const ALLOWED_CONTENT_TYPES = [
  'audio/m4a',
  'audio/mp4',
  'audio/x-m4a',
  'audio/aac',
  'audio/mpeg',
];

/**
 * Active upload tasks
 */
const activeUploads: Map<string, UploadTask> = new Map();

/**
 * Get the storage path for a user's voice intro
 */
function getVoiceIntroPath(userId: string): string {
  return VOICE_INTRO_PATH_TEMPLATE.replace('{userId}', userId);
}

/**
 * Validate file before upload
 *
 * @param fileUri - Local file URI
 * @param contentType - File content type
 * @throws StorageError if validation fails
 */
async function validateFile(fileUri: string, contentType?: string): Promise<void> {
  // In production, use FileSystem.getInfoAsync from expo-file-system
  // to get actual file info
  console.log(`[Upload] Validating file: ${fileUri}`);

  // Mock file info - in production, get real file stats
  const mockFileInfo = {
    exists: true,
    size: 1024000, // 1MB
    uri: fileUri,
  };

  if (!mockFileInfo.exists) {
    throw new StorageError(
      StorageErrorType.FILE_NOT_FOUND,
      `File not found at ${fileUri}`
    );
  }

  // Validate file size
  if (mockFileInfo.size > MAX_FILE_SIZE) {
    throw new StorageError(
      StorageErrorType.INVALID_FILE,
      `File size (${mockFileInfo.size} bytes) exceeds maximum allowed size (${MAX_FILE_SIZE} bytes)`
    );
  }

  if (mockFileInfo.size === 0) {
    throw new StorageError(
      StorageErrorType.INVALID_FILE,
      'File is empty'
    );
  }

  // Validate content type
  if (contentType && !ALLOWED_CONTENT_TYPES.includes(contentType)) {
    throw new StorageError(
      StorageErrorType.INVALID_FILE,
      `Invalid content type: ${contentType}. Allowed types: ${ALLOWED_CONTENT_TYPES.join(', ')}`
    );
  }

  console.log('[Upload] File validation passed');
}

/**
 * Upload a voice recording to Firebase Storage
 *
 * @param options - Upload options
 * @returns Upload result with download URL and metadata
 *
 * @example
 * const result = await uploadVoiceRecording({
 *   userId: 'user123',
 *   fileUri: 'file:///path/to/recording.m4a',
 *   contentType: 'audio/m4a',
 *   onProgress: (progress) => console.log(`Upload: ${progress}%`),
 *   maxRetries: 3,
 * });
 */
export async function uploadVoiceRecording(
  options: UploadOptions
): Promise<UploadResult> {
  const {
    userId,
    fileUri,
    contentType = 'audio/m4a',
    onProgress,
    maxRetries = 3,
    metadata = {},
  } = options;

  console.log(`[Upload] Starting upload for user ${userId}`);

  // Validate input
  if (!userId || !fileUri) {
    throw new StorageError(
      StorageErrorType.INVALID_FILE,
      'userId and fileUri are required'
    );
  }

  // Validate file
  await validateFile(fileUri, contentType);

  // Create upload task
  const taskId = `${userId}_${Date.now()}`;
  const uploadTask: UploadTask = {
    id: taskId,
    userId,
    fileUri,
    progress: 0,
    status: 'pending',
    startedAt: new Date(),
  };

  activeUploads.set(taskId, uploadTask);

  try {
    // Update task status
    uploadTask.status = 'uploading';

    // Get storage reference
    const storagePath = getVoiceIntroPath(userId);
    const storageRef = getStorageRef(storagePath);

    console.log(`[Upload] Uploading to path: ${storagePath}`);

    // Upload with retry logic and circuit breaker
    const uploadResult = await withRetry(
      async () => {
        return await storageCircuitBreaker.execute(async () => {
          // Perform upload
          const result = await storageRef.putFile(
            fileUri,
            {
              contentType,
              customMetadata: {
                uploadedBy: userId,
                uploadedAt: new Date().toISOString(),
                ...metadata,
              },
            },
            (progress) => {
              uploadTask.progress = progress;
              if (onProgress) {
                onProgress(progress);
              }
            }
          );

          return result;
        });
      },
      { maxRetries },
      (attempt, error) => {
        console.log(`[Upload] Retry attempt ${attempt} for user ${userId}:`, error);
      }
    );

    // Get download URL
    const downloadUrl = await storageRef.getDownloadURL();

    // Mark task as completed
    uploadTask.status = 'completed';
    uploadTask.completedAt = new Date();
    uploadTask.progress = 100;

    console.log(`[Upload] Upload completed successfully: ${downloadUrl}`);

    const result: UploadResult = {
      url: downloadUrl,
      path: storagePath,
      size: uploadResult.metadata.size,
      contentType: uploadResult.metadata.contentType,
    };

    return result;
  } catch (error) {
    // Mark task as failed
    uploadTask.status = 'failed';
    uploadTask.error = error as StorageError;

    console.error('[Upload] Upload failed:', error);

    throw error;
  } finally {
    // Clean up task after some time
    setTimeout(() => {
      activeUploads.delete(taskId);
    }, 60000); // Keep task info for 1 minute
  }
}

/**
 * Upload voice recording with signed URL generation
 *
 * @param options - Upload options
 * @param signedUrlOptions - Signed URL options
 * @returns Upload result with signed URL
 */
export async function uploadVoiceRecordingWithSignedUrl(
  options: UploadOptions,
  signedUrlOptions: SignedUrlOptions = {}
): Promise<UploadResult> {
  const result = await uploadVoiceRecording(options);

  // Generate signed URL
  const expirationMinutes = signedUrlOptions.expirationMinutes || 60;
  const signedUrl = generateSignedUrl(result.url, expirationMinutes);
  const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

  console.log(`[Upload] Generated signed URL (expires: ${expiresAt.toISOString()})`);

  return {
    ...result,
    signedUrl,
    expiresAt,
  };
}

/**
 * Delete a user's voice recording
 *
 * @param userId - The user ID
 */
export async function deleteVoiceRecording(userId: string): Promise<void> {
  console.log(`[Upload] Deleting voice recording for user ${userId}`);

  const storagePath = getVoiceIntroPath(userId);
  const storageRef = getStorageRef(storagePath);

  try {
    await withRetry(async () => {
      await storageRef.delete();
    });

    console.log(`[Upload] Voice recording deleted successfully`);
  } catch (error) {
    console.error('[Upload] Failed to delete voice recording:', error);
    throw error;
  }
}

/**
 * Get a signed URL for an existing voice recording
 *
 * @param userId - The user ID
 * @param options - Signed URL options
 * @returns Signed URL with expiration
 */
export async function getVoiceRecordingSignedUrl(
  userId: string,
  options: SignedUrlOptions = {}
): Promise<{ url: string; expiresAt: Date }> {
  console.log(`[Upload] Getting signed URL for user ${userId}`);

  const storagePath = getVoiceIntroPath(userId);
  const storageRef = getStorageRef(storagePath);

  try {
    // Get download URL
    const downloadUrl = await storageRef.getDownloadURL();

    // Generate signed URL
    const expirationMinutes = options.expirationMinutes || 60;
    const signedUrl = generateSignedUrl(downloadUrl, expirationMinutes);
    const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

    console.log(`[Upload] Generated signed URL (expires: ${expiresAt.toISOString()})`);

    return {
      url: signedUrl,
      expiresAt,
    };
  } catch (error) {
    console.error('[Upload] Failed to get signed URL:', error);
    throw error;
  }
}

/**
 * Check if a voice recording exists for a user
 *
 * @param userId - The user ID
 * @returns True if recording exists
 */
export async function voiceRecordingExists(userId: string): Promise<boolean> {
  console.log(`[Upload] Checking if voice recording exists for user ${userId}`);

  const storagePath = getVoiceIntroPath(userId);
  const storageRef = getStorageRef(storagePath);

  try {
    await storageRef.getMetadata();
    console.log(`[Upload] Voice recording exists`);
    return true;
  } catch (error) {
    console.log(`[Upload] Voice recording does not exist`);
    return false;
  }
}

/**
 * Get metadata for a voice recording
 *
 * @param userId - The user ID
 * @returns File metadata
 */
export async function getVoiceRecordingMetadata(userId: string): Promise<{
  size: number;
  contentType: string;
  createdAt: Date;
  updatedAt: Date;
}> {
  console.log(`[Upload] Getting metadata for user ${userId}`);

  const storagePath = getVoiceIntroPath(userId);
  const storageRef = getStorageRef(storagePath);

  try {
    const metadata = await storageRef.getMetadata();

    return {
      size: metadata.size,
      contentType: metadata.contentType,
      createdAt: new Date(metadata.timeCreated),
      updatedAt: new Date(metadata.updated || metadata.timeCreated),
    };
  } catch (error) {
    console.error('[Upload] Failed to get metadata:', error);
    throw new StorageError(
      StorageErrorType.FILE_NOT_FOUND,
      `Voice recording not found for user ${userId}`,
      error as Error
    );
  }
}

/**
 * Get all active upload tasks
 *
 * @returns Array of active upload tasks
 */
export function getActiveUploads(): UploadTask[] {
  return Array.from(activeUploads.values());
}

/**
 * Get upload task by ID
 *
 * @param taskId - The task ID
 * @returns Upload task or undefined
 */
export function getUploadTask(taskId: string): UploadTask | undefined {
  return activeUploads.get(taskId);
}

/**
 * Cancel an active upload
 * Note: This is a placeholder - actual cancellation would need to be implemented
 * with the Firebase Storage upload task
 *
 * @param taskId - The task ID
 */
export function cancelUpload(taskId: string): void {
  const task = activeUploads.get(taskId);

  if (task && task.status === 'uploading') {
    console.log(`[Upload] Canceling upload task ${taskId}`);
    task.status = 'failed';
    task.error = new StorageError(
      StorageErrorType.UPLOAD_FAILED,
      'Upload canceled by user'
    );

    // In production, call .cancel() on the Firebase upload task
    // uploadTaskRef.cancel();
  }
}

/**
 * Validate a signed URL is still valid
 *
 * @param signedUrl - The signed URL to validate
 * @returns True if URL is still valid
 */
export function validateSignedUrl(signedUrl: string): boolean {
  return isSignedUrlValid(signedUrl);
}
