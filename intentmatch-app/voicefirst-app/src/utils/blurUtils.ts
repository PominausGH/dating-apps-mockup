/**
 * Calculate blur intensity based on message count
 * Progressive photo reveal system for VoiceFirst dating app
 *
 * Blur levels:
 * - 0 messages: intensity=100 (completely blurred)
 * - 1-2 messages: intensity=80
 * - 3-4 messages: intensity=50
 * - 5-7 messages: intensity=20
 * - 8+ messages: intensity=0 (fully revealed)
 */
export function calculateBlurIntensity(messageCount: number): number {
  if (messageCount === 0) {
    return 100;
  } else if (messageCount >= 1 && messageCount <= 2) {
    return 80;
  } else if (messageCount >= 3 && messageCount <= 4) {
    return 50;
  } else if (messageCount >= 5 && messageCount <= 7) {
    return 20;
  } else {
    // 8+ messages
    return 0;
  }
}

/**
 * Get unlock progress as a percentage (0-100)
 */
export function getUnlockProgress(messageCount: number): number {
  const maxMessages = 8;
  const progress = Math.min(messageCount, maxMessages) / maxMessages;
  return Math.round(progress * 100);
}

/**
 * Check if photo is fully unlocked
 */
export function isPhotoUnlocked(messageCount: number): boolean {
  return messageCount >= 8;
}

/**
 * Get next unlock milestone
 */
export function getNextMilestone(messageCount: number): { count: number; label: string } | null {
  if (messageCount < 1) {
    return { count: 1, label: 'Send 1 message to start revealing' };
  } else if (messageCount < 3) {
    return { count: 3, label: 'Send 3 messages to reveal more' };
  } else if (messageCount < 5) {
    return { count: 5, label: 'Send 5 messages to reveal more' };
  } else if (messageCount < 8) {
    return { count: 8, label: 'Send 8 messages to fully unlock' };
  }
  return null;
}
