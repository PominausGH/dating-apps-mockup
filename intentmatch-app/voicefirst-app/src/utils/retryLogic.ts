/**
 * Retry Logic Utility for Cloud Storage Operations
 *
 * Implements exponential backoff retry logic for failed uploads/downloads.
 */

import { RetryConfig, StorageError, StorageErrorType } from './types';

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000, // Start with 1 second
  maxDelayMs: 30000, // Max 30 seconds
  backoffMultiplier: 2, // Double the delay each time
};

/**
 * Sleep utility function
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay
 */
function calculateBackoffDelay(
  attempt: number,
  config: RetryConfig
): number {
  const delay = config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt - 1);
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 0.3 * delay; // +/- 30% jitter
  return Math.min(delay + jitter, config.maxDelayMs);
}

/**
 * Determine if an error is retryable
 */
function isRetryableError(error: any): boolean {
  if (error instanceof StorageError) {
    // Don't retry permission or invalid file errors
    return ![
      StorageErrorType.PERMISSION_DENIED,
      StorageErrorType.INVALID_FILE,
      StorageErrorType.FILE_NOT_FOUND,
    ].includes(error.type);
  }

  // Retry on network errors
  return true;
}

/**
 * Execute a function with retry logic and exponential backoff
 *
 * @param fn - The async function to execute
 * @param config - Retry configuration
 * @param onRetry - Callback called before each retry attempt
 * @returns The result of the successful function execution
 * @throws StorageError if all retries are exhausted
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  onRetry?: (attempt: number, error: any) => void
): Promise<T> {
  const retryConfig: RetryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: any;
  let attempt = 0;

  while (attempt <= retryConfig.maxRetries) {
    try {
      attempt++;
      console.log(`[Retry] Attempt ${attempt}/${retryConfig.maxRetries + 1}`);

      const result = await fn();

      if (attempt > 1) {
        console.log(`[Retry] Operation succeeded on attempt ${attempt}`);
      }

      return result;
    } catch (error) {
      lastError = error;
      console.log(`[Retry] Attempt ${attempt} failed:`, error);

      // Check if we should retry
      if (!isRetryableError(error)) {
        console.log('[Retry] Error is not retryable, throwing immediately');
        throw error;
      }

      // Check if we've exhausted retries
      if (attempt > retryConfig.maxRetries) {
        console.log('[Retry] Max retries exhausted');
        break;
      }

      // Calculate backoff delay
      const delay = calculateBackoffDelay(attempt, retryConfig);
      console.log(`[Retry] Waiting ${Math.round(delay)}ms before retry...`);

      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(attempt, error);
      }

      // Wait before retrying
      await sleep(delay);
    }
  }

  // All retries exhausted, throw error
  throw new StorageError(
    StorageErrorType.RETRY_EXHAUSTED,
    `Operation failed after ${retryConfig.maxRetries + 1} attempts`,
    lastError
  );
}

/**
 * Create a retry wrapper for a function
 * Useful for wrapping functions that will be called multiple times
 *
 * @example
 * const uploadWithRetry = createRetryWrapper(uploadFile, { maxRetries: 5 });
 * await uploadWithRetry(file);
 */
export function createRetryWrapper<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  config: Partial<RetryConfig> = {}
): (...args: TArgs) => Promise<TReturn> {
  return async (...args: TArgs): Promise<TReturn> => {
    return withRetry(() => fn(...args), config);
  };
}

/**
 * Retry with progress tracking
 * Updates a progress callback after each failed attempt
 *
 * @param fn - The async function to execute
 * @param config - Retry configuration
 * @param onProgress - Progress callback (receives attempt number and total attempts)
 */
export async function withRetryProgress<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  onProgress?: (current: number, total: number) => void
): Promise<T> {
  const retryConfig: RetryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  const totalAttempts = retryConfig.maxRetries + 1;

  return withRetry(
    fn,
    config,
    (attempt) => {
      if (onProgress) {
        onProgress(attempt, totalAttempts);
      }
    }
  );
}

/**
 * Circuit breaker pattern for preventing cascading failures
 * Useful for preventing repeated calls to a failing service
 */
export class CircuitBreaker {
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000 // 1 minute
  ) {}

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit is open
    if (this.state === 'open') {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;

      if (timeSinceLastFailure < this.timeout) {
        throw new StorageError(
          StorageErrorType.NETWORK_ERROR,
          'Circuit breaker is open. Service temporarily unavailable.'
        );
      }

      // Try to close the circuit (half-open state)
      this.state = 'half-open';
      console.log('[CircuitBreaker] Attempting to close circuit (half-open)');
    }

    try {
      const result = await fn();

      // Success - reset circuit
      if (this.state === 'half-open' || this.failureCount > 0) {
        console.log('[CircuitBreaker] Circuit closed - service recovered');
        this.reset();
      }

      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  /**
   * Record a failure
   */
  private recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.threshold) {
      this.state = 'open';
      console.log('[CircuitBreaker] Circuit opened due to repeated failures');
    }
  }

  /**
   * Reset the circuit breaker
   */
  private reset(): void {
    this.failureCount = 0;
    this.state = 'closed';
    this.lastFailureTime = 0;
  }

  /**
   * Get current state
   */
  getState(): 'closed' | 'open' | 'half-open' {
    return this.state;
  }
}

// Export a singleton circuit breaker for storage operations
export const storageCircuitBreaker = new CircuitBreaker();
