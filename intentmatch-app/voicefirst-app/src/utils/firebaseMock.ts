/**
 * Firebase Mock Implementation for VoiceFirst App
 *
 * This file provides a mock implementation of Firebase Storage for demo purposes.
 * In production, replace this with actual Firebase SDK initialization.
 *
 * FIREBASE CONFIGURATION NEEDED:
 *
 * 1. Install Firebase packages:
 *    npm install firebase @react-native-firebase/app @react-native-firebase/storage
 *
 * 2. Initialize Firebase in your app:
 *    import { initializeApp } from 'firebase/app';
 *    import { getStorage } from 'firebase/storage';
 *
 *    const firebaseConfig = {
 *      apiKey: "YOUR_API_KEY",
 *      authDomain: "YOUR_AUTH_DOMAIN",
 *      projectId: "YOUR_PROJECT_ID",
 *      storageBucket: "YOUR_STORAGE_BUCKET",
 *      messagingSenderId: "YOUR_SENDER_ID",
 *      appId: "YOUR_APP_ID"
 *    };
 *
 *    const app = initializeApp(firebaseConfig);
 *    const storage = getStorage(app);
 *
 * 3. Set up Firebase Storage security rules:
 *    rules_version = '2';
 *    service firebase.storage {
 *      match /b/{bucket}/o {
 *        match /voice-intros/{userId}/{fileName} {
 *          allow read: if request.auth != null;
 *          allow write: if request.auth != null && request.auth.uid == userId;
 *        }
 *      }
 *    }
 */

import { StorageError, StorageErrorType } from './types';

/**
 * Mock Firebase Storage Reference
 */
class MockStorageReference {
  constructor(private path: string) {}

  /**
   * Get the full path of this reference
   */
  get fullPath(): string {
    return this.path;
  }

  /**
   * Get the name of the file/folder
   */
  get name(): string {
    const parts = this.path.split('/');
    return parts[parts.length - 1];
  }

  /**
   * Create a child reference
   */
  child(path: string): MockStorageReference {
    return new MockStorageReference(`${this.path}/${path}`);
  }

  /**
   * Mock upload from URI
   * In production, this would use:
   * import { uploadBytesResumable } from 'firebase/storage';
   */
  async putFile(
    localUri: string,
    metadata?: any,
    onProgress?: (progress: number) => void
  ): Promise<MockUploadResult> {
    console.log(`[MOCK] Uploading file from ${localUri} to ${this.path}`);

    // Simulate upload progress
    return new Promise((resolve, reject) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (onProgress) {
          onProgress(progress);
        }

        if (progress >= 100) {
          clearInterval(interval);

          // Simulate successful upload
          const mockUrl = `https://storage.googleapis.com/mock-bucket/${this.path}`;
          console.log(`[MOCK] Upload completed: ${mockUrl}`);

          resolve({
            ref: this,
            metadata: {
              fullPath: this.path,
              name: this.name,
              size: 1024000, // Mock 1MB file
              contentType: metadata?.contentType || 'audio/m4a',
              timeCreated: new Date().toISOString(),
            },
            url: mockUrl,
          });
        }
      }, 100);

      // Simulate random failures (10% chance)
      if (Math.random() < 0.1) {
        clearInterval(interval);
        reject(new StorageError(
          StorageErrorType.NETWORK_ERROR,
          'Mock network error during upload'
        ));
      }
    });
  }

  /**
   * Mock download URL generation
   * In production, this would use:
   * import { getDownloadURL } from 'firebase/storage';
   */
  async getDownloadURL(): Promise<string> {
    console.log(`[MOCK] Getting download URL for ${this.path}`);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    // Generate mock URL
    const mockUrl = `https://storage.googleapis.com/mock-bucket/${this.path}?token=mock-token-${Date.now()}`;
    return mockUrl;
  }

  /**
   * Mock delete operation
   * In production, this would use:
   * import { deleteObject } from 'firebase/storage';
   */
  async delete(): Promise<void> {
    console.log(`[MOCK] Deleting file at ${this.path}`);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    console.log(`[MOCK] File deleted successfully`);
  }

  /**
   * Mock get metadata
   * In production, this would use:
   * import { getMetadata } from 'firebase/storage';
   */
  async getMetadata(): Promise<MockFileMetadata> {
    console.log(`[MOCK] Getting metadata for ${this.path}`);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      fullPath: this.path,
      name: this.name,
      size: 1024000,
      contentType: 'audio/m4a',
      timeCreated: new Date().toISOString(),
      updated: new Date().toISOString(),
    };
  }
}

/**
 * Mock Firebase Storage
 */
class MockFirebaseStorage {
  private basePath: string = 'voice-intros';

  /**
   * Get a reference to a storage location
   * In production, this would use:
   * import { ref } from 'firebase/storage';
   */
  ref(path?: string): MockStorageReference {
    const fullPath = path || this.basePath;
    return new MockStorageReference(fullPath);
  }

  /**
   * Get the maximum upload size (100MB for demo)
   */
  get maxUploadSizeBytes(): number {
    return 100 * 1024 * 1024; // 100MB
  }
}

/**
 * Mock upload result interface
 */
interface MockUploadResult {
  ref: MockStorageReference;
  metadata: MockFileMetadata;
  url: string;
}

/**
 * Mock file metadata interface
 */
interface MockFileMetadata {
  fullPath: string;
  name: string;
  size: number;
  contentType: string;
  timeCreated: string;
  updated?: string;
}

/**
 * Mock storage instance
 *
 * In production, replace this with:
 * import { getStorage } from 'firebase/storage';
 * export const storage = getStorage();
 */
export const storage = new MockFirebaseStorage();

/**
 * Helper to get storage reference
 * This pattern matches Firebase SDK usage
 */
export function getStorageRef(path: string): MockStorageReference {
  return storage.ref(path);
}

/**
 * Generate a mock signed URL with expiration
 * In production, Firebase Storage URLs are already signed with tokens
 * For additional security, you might use Cloud Functions to generate custom signed URLs
 */
export function generateSignedUrl(url: string, expirationMinutes: number = 60): string {
  const expiresAt = Date.now() + (expirationMinutes * 60 * 1000);
  return `${url}&expires=${expiresAt}&signature=mock-signature-${Math.random().toString(36).substring(7)}`;
}

/**
 * Validate if a signed URL is still valid
 */
export function isSignedUrlValid(signedUrl: string): boolean {
  try {
    const url = new URL(signedUrl);
    const expires = url.searchParams.get('expires');

    if (!expires) {
      return true; // No expiration set
    }

    return Date.now() < parseInt(expires, 10);
  } catch {
    return false;
  }
}

export default storage;
